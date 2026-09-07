import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { adminService } from '../services/mockAdminService';
import { CustomerWithdrawal, CustomerWalletPosition, WithdrawalStatus } from '../types/admin';
import { StatusChip } from '../components/shared/StatusChip';
import { formatZMW, formatWithdrawalDate } from '../utils/formatters';
import { WithdrawalDetailInfo } from '../components/withdrawals/WithdrawalDetailInfo';
import { WithdrawalCustomerInfo } from '../components/withdrawals/WithdrawalCustomerInfo';
import { WithdrawalWalletPositionSection } from '../components/withdrawals/WithdrawalWalletPosition';
import { WithdrawalStatusHistory } from '../components/withdrawals/WithdrawalStatusHistory';
import { WithdrawalActionPanel } from '../components/withdrawals/WithdrawalActionPanel';
import {
  WithdrawalConfirmationModal,
  ActionModalType,
} from '../components/withdrawals/WithdrawalConfirmationModal';
import { ToastNotification } from '../components/shared/ToastNotification';
import { SUPER_ADMIN_PROFILE } from '../config/appConfig';

export const CustomerWithdrawalDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();

  const [withdrawal, setWithdrawal] = useState<CustomerWithdrawal | null>(null);
  const [walletPosition, setWalletPosition] = useState<CustomerWalletPosition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  // Modal & Action state
  const [activeModal, setActiveModal] = useState<ActionModalType | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadWithdrawalData = useCallback(async () => {
    if (!reference) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      const data = await adminService.getCustomerWithdrawalByReference(reference);
      if (!data) {
        setNotFound(true);
        setWithdrawal(null);
        setWalletPosition(null);
      } else {
        setNotFound(false);
        setWithdrawal(data);
        const wallet = await adminService.getWithdrawalWalletPosition(reference);
        setWalletPosition(wallet);
      }
    } catch (err) {
      console.error('Failed to load withdrawal details:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    loadWithdrawalData();
    const unsubscribe = adminService.subscribe(loadWithdrawalData);
    return () => unsubscribe();
  }, [loadWithdrawalData]);

  // Handle Back Navigation preserving history and filters
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/wallets/customer-withdrawals');
    }
  };

  // Open Modal handler
  const handleInitiateAction = (action: ActionModalType) => {
    setModalError(null);
    setActiveModal(action);
  };

  // Submit Modal Action handler
  const handleConfirmAction = async (reason?: string) => {
    if (!withdrawal || !activeModal || isProcessing) return;

    setIsProcessing(true);
    setModalError(null);

    let targetStatus: WithdrawalStatus;
    let successToastText: string;

    switch (activeModal) {
      case 'Approve':
        targetStatus = 'Approved';
        successToastText = 'Withdrawal Approved';
        break;
      case 'Mark Processing':
        targetStatus = 'Processing';
        successToastText = 'Withdrawal Marked as Processing';
        break;
      case 'Mark Paid':
        targetStatus = 'Paid';
        successToastText = 'Withdrawal Marked as Paid';
        break;
      case 'Reject':
        targetStatus = 'Rejected';
        successToastText = 'Withdrawal Rejected';
        break;
    }

    try {
      const response = await adminService.updateWithdrawalStatus(
        withdrawal.reference,
        targetStatus,
        SUPER_ADMIN_PROFILE.name,
        withdrawal.status,
        reason
      );

      if (response.success) {
        setWithdrawal(response.withdrawal);
        const updatedWallet = await adminService.getWithdrawalWalletPosition(withdrawal.reference);
        setWalletPosition(updatedWallet);
        setActiveModal(null);
        setToastMessage(successToastText);
      } else {
        setModalError(response.error || 'Unable to update withdrawal. Try again.');
      }
    } catch (err) {
      console.error('Error executing status update:', err);
      setModalError('Unable to update withdrawal. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-36 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound || !withdrawal || !walletPosition) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-10">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded-md px-1 py-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Customer Withdrawals</span>
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center shadow-sm max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#102025] mb-2">
            Withdrawal request not found.
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            {reference ? `The reference "${reference}" does not exist in the system.` : 'No withdrawal reference was provided.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/wallets/customer-withdrawals')}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#0D93AA] text-white text-sm font-semibold rounded-lg hover:bg-[#0b8296] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30"
          >
            Back to Customer Withdrawals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Back Action */}
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 rounded-md px-1 py-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Withdrawals</span>
        </button>
      </div>

      {/* 2. Top Withdrawal Identification Row */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Reference
              </span>
              <span className="font-mono text-base font-bold text-[#102025]">
                {withdrawal.reference}
              </span>
            </div>

            <div className="h-7 w-px bg-gray-200 hidden sm:block mx-1" />

            <div>
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Status
              </span>
              <StatusChip status={withdrawal.status} size="sm" />
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Funds
              </span>
              <StatusChip status={withdrawal.fundsState} size="sm" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-left sm:text-right">
                Amount
              </span>
              <span className="font-bold text-[#102025] text-lg block text-left sm:text-right">
                {formatZMW(withdrawal.amount)}
              </span>
            </div>

            <div className="hidden sm:block h-7 w-px bg-gray-200" />

            <div>
              <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-left sm:text-right">
                Requested
              </span>
              <span className="text-xs font-mono text-gray-700 block text-left sm:text-right">
                {formatWithdrawalDate(withdrawal.requestedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Area: Left Details Column & Right Actions Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (approx 68%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Withdrawal Information */}
          <WithdrawalDetailInfo withdrawal={withdrawal} />

          {/* Section 2: Customer */}
          <WithdrawalCustomerInfo withdrawal={withdrawal} />

          {/* Section 3: Wallet Position */}
          <WithdrawalWalletPositionSection walletPosition={walletPosition} />

          {/* Section 4: Status History */}
          <WithdrawalStatusHistory history={withdrawal.history || []} />
        </div>

        {/* Right Column (approx 32%) */}
        <div className="lg:col-span-4 sticky top-20">
          <WithdrawalActionPanel
            status={withdrawal.status}
            onInitiateAction={handleInitiateAction}
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <WithdrawalConfirmationModal
        actionType={activeModal}
        withdrawal={withdrawal}
        isOpen={Boolean(activeModal)}
        isProcessing={isProcessing}
        errorMessage={modalError}
        onClose={() => {
          if (!isProcessing) {
            setActiveModal(null);
            setModalError(null);
          }
        }}
        onConfirm={handleConfirmAction}
      />

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
