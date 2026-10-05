import React from 'react';
import { TellerBudNotification } from '../../types/notificationsPage';
import { formatZMW } from '../../utils/formatters';

interface NotificationDetailsWithdrawalCardProps {
  notification: TellerBudNotification;
}

export const NotificationDetailsWithdrawalCard: React.FC<NotificationDetailsWithdrawalCardProps> = ({
  notification,
}) => {
  const isCustomer =
    notification.category === 'Customer Withdrawal' ||
    notification.withdrawalType === 'Customer Withdrawal' ||
    (!notification.category.includes('Business') && notification.relatedRecord.startsWith('TB-WDL'));

  const isBusiness =
    notification.category === 'Business Withdrawal' ||
    notification.withdrawalType === 'Business Withdrawal';

  // Withdrawal Details lookup or fallback
  const details = notification.withdrawalDetails;
  const withdrawalId = details?.withdrawalId || notification.relatedRecord;
  const amountVal = details?.amount || 7200.0;
  const amountFormatted = `ZMW ${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const vendor = details?.vendor || 'MTN Mobile Money';
  const rawPhone = details?.mobileMoneyNumber || '+260 96 612 9901';

  // Masked Mobile Money Number: +260 96 *** 9901
  const cleanDigits = rawPhone.replace(/\D/g, '');
  const prefix = cleanDigits.startsWith('260') ? cleanDigits.slice(3, 5) : cleanDigits.slice(0, 2);
  const suffix = cleanDigits.slice(-4);
  const maskedPhone = `+260 ${prefix || '96'} *** ${suffix || '9901'}`;

  const submittedTime = details?.submittedDateTime || notification.dateTime || 'Today, 11:52 AM';
  const status = details?.status || (notification.status === 'Resolved' ? 'Approved' : 'Pending Review');

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'Approved':
      case 'Completed':
      case 'Paid':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Rejected':
      case 'Failed':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Pending Review':
      case 'Pending':
        return 'text-[#0D93AA] bg-[#0D93AA]/10 border-[#0D93AA]/25';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  // If it's another category (e.g. Transaction, Reconciliation, System), show a clean generic Details card
  if (!isCustomer && !isBusiness && !notification.category.includes('Withdrawal')) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            {notification.category} Details
          </h2>
        </div>
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs">
          <div>
            <span className="text-gray-500 font-medium block">Reference Record</span>
            <span className="text-sm font-mono font-bold text-gray-900 mt-0.5 block">
              {notification.relatedRecord}
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Category</span>
            <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
              {notification.category}
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Date and Time</span>
            <span className="text-sm font-medium text-gray-800 mt-0.5 block">
              {notification.dateTime}
            </span>
          </div>
          <div>
            <span className="text-gray-500 font-medium block">Current Status</span>
            <span
              className={`inline-block px-2.5 py-0.5 mt-1 rounded-md text-xs font-bold border ${getStatusColor(
                notification.status
              )}`}
            >
              {notification.status}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="section-withdrawal-details"
      className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Withdrawal Details
        </h2>
        <span className="text-xs font-semibold text-gray-500 font-mono">
          {withdrawalId}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {/* Simple 2-column key-value layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          {/* 1. Withdrawal ID */}
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Withdrawal ID
            </span>
            <span className="text-base font-mono font-bold text-gray-900 mt-0.5 block">
              {withdrawalId}
            </span>
          </div>

          {/* 2. Request Type */}
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Request Type
            </span>
            <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
              {isCustomer ? 'Customer Withdrawal' : 'Business Withdrawal'}
            </span>
          </div>

          {/* Customer / Business specifics */}
          {isCustomer ? (
            <>
              {/* Customer Name (Visually Stronger) */}
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Customer Name
                </span>
                <span className="text-base font-bold text-gray-900 mt-0.5 block">
                  {details?.customerName || 'Lombe Kasonde'}
                </span>
              </div>

              {/* Customer ID */}
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Customer ID
                </span>
                <span className="text-sm font-mono font-semibold text-gray-800 mt-0.5 block">
                  {details?.customerId || 'TB-CUS-001046'}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Business Name (Visually Stronger) */}
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Business Name
                </span>
                <span className="text-base font-bold text-gray-900 mt-0.5 block">
                  {details?.businessName || 'Lusaka Central Express Agency'}
                </span>
              </div>

              {/* Business ID */}
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Business ID
                </span>
                <span className="text-sm font-mono font-semibold text-gray-800 mt-0.5 block">
                  {details?.businessId || 'TB-BIZ-000001'}
                </span>
              </div>

              {/* Business Owner Name */}
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Business Owner Name
                </span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                  {details?.businessOwnerName || 'Chileshe Mwamba'}
                </span>
              </div>
            </>
          )}

          {/* Withdrawal Amount (Visually Stronger) */}
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Withdrawal Amount
            </span>
            <span className="text-lg font-bold text-emerald-700 font-mono mt-0.5 block">
              {amountFormatted}
            </span>
          </div>

          {/* Vendor */}
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Vendor
            </span>
            <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
              {vendor}
            </span>
          </div>

          {/* Mobile Money Number (Masked) */}
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Mobile Money Number
            </span>
            <span className="text-sm font-mono font-semibold text-gray-800 mt-0.5 block">
              {maskedPhone}
            </span>
          </div>

          {/* Submitted Date and Time */}
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Submitted Date and Time
            </span>
            <span className="text-sm font-medium text-gray-800 mt-0.5 block">
              {submittedTime}
            </span>
          </div>

          {/* Current Status (Visually Stronger) */}
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Current Status
            </span>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border ${getStatusColor(
                  status
                )}`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
