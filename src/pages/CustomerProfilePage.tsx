import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { CustomerProfileTab, CustomerAuditEvent } from '../types/customerProfile';
import { PickupRequest } from '../types/admin';
import { MobileMoneyTransaction } from '../types/mobileMoney';
import {
  getCustomerProfileData,
  getCustomerRequestsList,
  getCustomerTransactionsList,
  logCustomerAuditEvent,
  MOCK_PROFILE_AUDIT_LOG,
} from '../data/mockCustomerProfileData';
import { CustomerProfileHeader } from '../components/customers/profile/CustomerProfileHeader';
import { CustomerOverviewTab } from '../components/customers/profile/CustomerOverviewTab';
import { CustomerRequestsTab } from '../components/customers/profile/CustomerRequestsTab';
import { CustomerTransactionsTab } from '../components/customers/profile/CustomerTransactionsTab';
import { CustomerWalletTab } from '../components/customers/profile/CustomerWalletTab';
import { CustomerLocationsTab } from '../components/customers/profile/CustomerLocationsTab';
import { CustomerSecurityTab } from '../components/customers/profile/CustomerSecurityTab';
import { ProtectedIdentityModal } from '../components/customers/profile/ProtectedIdentityModal';
import { RecoverySupportModal } from '../components/customers/profile/RecoverySupportModal';
import { AccountActionModal, AccountActionType } from '../components/customers/profile/AccountActionModal';
import { LiveRequestDetailsDrawer } from '../components/admin/LiveRequestDetailsDrawer';
import { MobileMoneyDetailsDrawer } from '../components/mobile-money/MobileMoneyDetailsDrawer';

export const CustomerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<CustomerProfileTab>('overview');

  // Protected Identity State (NRC & Biometric Selfie unmasking)
  const [isIdentityRevealed, setIsIdentityRevealed] = useState<boolean>(false);
  const [isProtectedIdentityModalOpen, setIsProtectedIdentityModalOpen] = useState<boolean>(false);

  // Recovery Support Modal State
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState<boolean>(false);

  // Sensitive Account Action Modal State
  const [accountActionType, setAccountActionType] = useState<AccountActionType | null>(null);

  // Drawers for Requests & Mobile Money Details
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<MobileMoneyTransaction | null>(null);

  // Notification Toast State
  const [notification, setNotification] = useState<{
    id: number;
    message: string;
    type: 'success' | 'info';
  } | null>(null);

  // Customer Profile Base Data
  const profileData = useMemo(() => {
    return id ? getCustomerProfileData(id) : null;
  }, [id]);

  // Local mutable state for customer account status and recovery indicators
  const [customerOverride, setCustomerOverride] = useState<Partial<typeof profileData.customer> | null>(null);

  // Audit Events state (session-aware)
  const [auditEvents, setAuditEvents] = useState<CustomerAuditEvent[]>(() => {
    return MOCK_PROFILE_AUDIT_LOG.filter(
      (e) => profileData && (e.customerId === profileData.customer.id)
    );
  });

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Customer Not Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            The requested customer profile ({id || 'Unknown'}) could not be located in the system.
          </p>
          <button
            type="button"
            onClick={() => navigate('/super-admin/people/customers')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0b8296] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  // Active customer object with local updates applied
  const currentCustomer = {
    ...profileData.customer,
    ...customerOverride,
  };

  // Associated Requests & Unified Transactions for this customer
  const customerRequests = useMemo(() => {
    return getCustomerRequestsList(currentCustomer);
  }, [currentCustomer]);

  const customerTransactions = useMemo(() => {
    return getCustomerTransactionsList(currentCustomer);
  }, [currentCustomer]);

  // Notification trigger helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({
      id: Date.now(),
      message,
      type,
    });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // 1. Protected Identity Access Confirmed
  const handleConfirmIdentityAccess = (reason: string) => {
    const event = logCustomerAuditEvent({
      action: 'Protected Identity Unmasked (NRC & Biometric Selfie)',
      actor: 'Super Admin (Compliance Officer)',
      reason,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
    });

    setAuditEvents((prev) => [event, ...prev]);
    setIsIdentityRevealed(true);
    showToast(
      `Protected identity unmasked for ${currentCustomer.name}. Audit entry ${event.id} registered.`,
      'success'
    );
  };

  // 2. Hide Protected Identity
  const handleHideIdentity = () => {
    setIsIdentityRevealed(false);
    showToast('Customer protected identity masked.', 'info');
  };

  // 3. Initiate Recovery Support Confirmed
  const handleConfirmRecoverySupport = (reason: string) => {
    const event = logCustomerAuditEvent({
      action: 'Customer Recovery Support Initiated',
      actor: 'Super Admin (Security Operations)',
      reason,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
    });

    setAuditEvents((prev) => [event, ...prev]);
    setCustomerOverride((prev) => ({
      ...prev,
      hasRecoverySupport: true,
      recoveryCaseTitle: 'Admin-Assisted Passcode Reset Ticket',
    }));

    showToast(
      `Recovery support initiated for ${currentCustomer.name}. Encrypted SMS challenge sent to customer device.`,
      'success'
    );
  };

  // 4. Account Action Confirmed (Suspend / Reactivate / Flag KYC / Approve KYC)
  const handleConfirmAccountAction = (actionType: AccountActionType, reason: string) => {
    let actionLabel = '';
    if (actionType === 'suspend') {
      setCustomerOverride((prev) => ({ ...prev, accountStatus: 'Suspended' }));
      actionLabel = 'Customer Account Suspended';
    } else if (actionType === 'reactivate') {
      setCustomerOverride((prev) => ({ ...prev, accountStatus: 'Active' }));
      actionLabel = 'Customer Account Reactivated';
    } else if (actionType === 'flag-kyc') {
      setCustomerOverride((prev) => ({ ...prev, accountStatus: 'Pending' }));
      actionLabel = 'Customer Identity Flagged for Re-verification';
    } else if (actionType === 'approve-kyc') {
      setCustomerOverride((prev) => ({ ...prev, accountStatus: 'Active' }));
      actionLabel = 'Customer Identity Tier Approved';
    }

    const event = logCustomerAuditEvent({
      action: actionLabel,
      actor: 'Super Admin (Operations Lead)',
      reason,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
    });

    setAuditEvents((prev) => [event, ...prev]);
    showToast(`${actionLabel} completed for ${currentCustomer.name}.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                : 'bg-gray-900 text-gray-100 border-gray-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Profile Header Card with Tabs */}
      <CustomerProfileHeader
        customer={currentCustomer}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onBack={() => navigate('/super-admin/people/customers')}
        onOpenAccountAction={(type) => setAccountActionType(type)}
        onOpenRecoverySupport={() => setIsRecoveryModalOpen(true)}
        requestsCount={customerRequests.length}
        transactionsCount={customerTransactions.length}
        locationsCount={profileData.locations.length}
      />

      {/* Main Tab Content */}
      <div className="pt-1">
        {activeTab === 'overview' && (
          <CustomerOverviewTab
            data={{
              ...profileData,
              customer: currentCustomer,
            }}
            isIdentityRevealed={isIdentityRevealed}
            onOpenProtectedIdentityModal={() => setIsProtectedIdentityModalOpen(true)}
            onHideProtectedIdentity={handleHideIdentity}
            recentRequests={customerRequests}
            recentTransactions={customerTransactions}
            onSelectTab={setActiveTab}
            onViewRequest={(req) => setSelectedRequest(req)}
            onViewTransaction={(txn) => setSelectedTransaction(txn)}
          />
        )}

        {activeTab === 'requests' && (
          <CustomerRequestsTab
            requests={customerRequests}
            onViewRequest={(req) => setSelectedRequest(req)}
          />
        )}

        {activeTab === 'transactions' && (
          <CustomerTransactionsTab
            transactions={customerTransactions}
            onViewTransaction={(txn) => setSelectedTransaction(txn)}
          />
        )}

        {activeTab === 'wallet' && (
          <CustomerWalletTab
            customer={currentCustomer}
            financials={profileData.financials}
            activities={profileData.walletActivities}
          />
        )}

        {activeTab === 'locations' && (
          <CustomerLocationsTab locations={profileData.locations} />
        )}

        {activeTab === 'security' && (
          <CustomerSecurityTab
            customer={currentCustomer}
            security={{
              ...profileData.security,
              hasActiveRecoveryCase: currentCustomer.hasRecoverySupport,
              recoveryStatusText: currentCustomer.hasRecoverySupport
                ? `Active Support Case (${currentCustomer.recoveryCaseTitle || 'Passcode Reset Ticket'})`
                : 'No active recovery case',
            }}
            auditEvents={auditEvents}
            onInitiateRecovery={() => setIsRecoveryModalOpen(true)}
          />
        )}
      </div>

      {/* Protected Identity Confirmation Dialog */}
      <ProtectedIdentityModal
        isOpen={isProtectedIdentityModalOpen}
        onClose={() => setIsProtectedIdentityModalOpen(false)}
        customer={currentCustomer}
        onConfirm={handleConfirmIdentityAccess}
      />

      {/* Recovery Support Initiation Dialog */}
      <RecoverySupportModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        customer={currentCustomer}
        onConfirm={handleConfirmRecoverySupport}
      />

      {/* Account Sensitive Action Dialog (Suspend, Reactivate, KYC) */}
      <AccountActionModal
        isOpen={accountActionType !== null}
        actionType={accountActionType}
        onClose={() => setAccountActionType(null)}
        customer={currentCustomer}
        onConfirm={handleConfirmAccountAction}
      />

      {/* Live Request Details Drawer */}
      <LiveRequestDetailsDrawer
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />

      {/* Mobile Money Details Drawer */}
      <MobileMoneyDetailsDrawer
        transaction={selectedTransaction}
        isOpen={selectedTransaction !== null}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};
