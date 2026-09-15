import React from 'react';
import { ExternalLink } from 'lucide-react';
import { TellerBudNotification } from '../../types/notificationsPage';
import { MOCK_CUSTOMER_WITHDRAWALS } from '../../data/mockWithdrawalData';

interface NotificationDetailsRelatedRecordCardProps {
  notification: TellerBudNotification;
  onNavigateToRelatedRecord: (route: string) => void;
  primaryActionLabel?: string;
}

interface SummaryField {
  label: string;
  value: string;
  isStatus?: boolean;
  statusVariant?: 'pending' | 'success' | 'warning' | 'neutral';
}

interface DynamicRelatedRecordConfig {
  sectionTitle: string;
  fields: SummaryField[];
  actionLabel: string;
  actionRoute: string;
}

export const NotificationDetailsRelatedRecordCard: React.FC<
  NotificationDetailsRelatedRecordCardProps
> = ({ notification, onNavigateToRelatedRecord, primaryActionLabel }) => {
  const getRecordConfig = (): DynamicRelatedRecordConfig => {
    const category = notification.category;
    const ref = notification.relatedRecord;

    switch (category) {
      case 'Withdrawal': {
        // Look up withdrawal data if exists
        const matched = MOCK_CUSTOMER_WITHDRAWALS.find(
          (w) => w.reference.toLowerCase() === ref.toLowerCase() || w.id.toLowerCase() === ref.toLowerCase()
        );

        const customerName = matched?.customerName || 'Lombe Kasonde';
        const customerId = matched?.customerId || 'TB-CUS-1046';
        const amount = matched?.amount ? `ZMW ${matched.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'ZMW 7,200.00';
        const provider = matched?.network || 'MTN Mobile Money';
        const phone = matched?.payoutNumber || '+260 96 612 9901';
        // Mask mobile: +260 96 *** 9901
        const maskedPhone = phone.length > 8
          ? `${phone.slice(0, 8)} *** ${phone.slice(-4)}`
          : '+260 96 *** 9901';
        const submittedTime = notification.dateTime || 'Today, 11:50 AM';
        const status = matched?.status || 'Pending Review';

        return {
          sectionTitle: 'Related Withdrawal Request',
          actionLabel: primaryActionLabel || 'Review Withdrawal',
          actionRoute: `/super-admin/wallets/customer-withdrawals/${ref}`,
          fields: [
            { label: 'Withdrawal Reference', value: ref },
            { label: 'Customer Name', value: customerName },
            { label: 'Customer ID', value: customerId },
            { label: 'Withdrawal Amount', value: amount },
            { label: 'Mobile Money Provider', value: provider },
            { label: 'Masked Mobile Number', value: maskedPhone },
            { label: 'Submitted Date and Time', value: submittedTime },
            {
              label: 'Withdrawal Status',
              value: status,
              isStatus: true,
              statusVariant: status === 'Pending Review' ? 'pending' : 'success',
            },
          ],
        };
      }

      case 'Transaction': {
        return {
          sectionTitle: 'Related Transaction Record',
          actionLabel: primaryActionLabel || 'View Transaction',
          actionRoute: '/super-admin/transactions/all',
          fields: [
            { label: 'Transaction Reference', value: ref },
            {
              label: 'Transaction Type',
              value: notification.title.includes('Liquidity')
                ? 'Agent-to-Agent Liquidity Request'
                : 'Walk-In Cash Withdrawal',
            },
            { label: 'Initiating Operator / Agent', value: 'Lusaka Central Agent Hub' },
            { label: 'Transaction Amount', value: 'ZMW 3,500.00' },
            { label: 'Settlement Channel', value: 'TellerBud Core Instant Settlement' },
            { label: 'Customer / Agent ID', value: 'OP-ZM-2041' },
            { label: 'Processed Date and Time', value: notification.dateTime },
            {
              label: 'Transaction Status',
              value: notification.status === 'Resolved' ? 'Completed' : 'Requires Review',
              isStatus: true,
              statusVariant: notification.status === 'Resolved' ? 'success' : 'pending',
            },
          ],
        };
      }

      case 'Provider/API': {
        const isAirtel = notification.title.toLowerCase().includes('airtel');
        const providerName = isAirtel ? 'Airtel Money Zambia' : 'MTN Mobile Money Zambia';
        return {
          sectionTitle: 'Related Provider Integration',
          actionLabel: primaryActionLabel || 'View Vendor',
          actionRoute: '/super-admin/configuration/vendors',
          fields: [
            { label: 'Provider Reference', value: ref },
            { label: 'Mobile Money Provider', value: providerName },
            { label: 'Service Endpoint', value: 'Production USSD & Webhook Gateway' },
            { label: 'Response Latency', value: '45ms (Operational)' },
            { label: 'Environment', value: 'Production (ZM-LUN-01)' },
            { label: 'Monitored Channel', value: 'Push-Payment & Callback Listener' },
            { label: 'Last Health Check', value: notification.dateTime },
            {
              label: 'Provider Health Status',
              value: 'Operational',
              isStatus: true,
              statusVariant: 'success',
            },
          ],
        };
      }

      case 'Reconciliation': {
        return {
          sectionTitle: 'Related Ledger Reconciliation',
          actionLabel: primaryActionLabel || 'View Reconciliation',
          actionRoute: `/super-admin/wallets/reconciliation`,
          fields: [
            { label: 'Reconciliation Reference', value: ref },
            { label: 'Ledger Balancing Cycle', value: 'Daily End-of-Day Float Balancing' },
            { label: 'Provider Escrow Account', value: 'MTN MoMo Settlement Escrow' },
            { label: 'Recorded Variance', value: 'ZMW 0.00 (Zero Variance)' },
            { label: 'System Ledger Balance', value: 'ZMW 485,200.00' },
            { label: 'Provider Reported Balance', value: 'ZMW 485,200.00' },
            { label: 'Audit Cycle Date/Time', value: notification.dateTime },
            {
              label: 'Reconciliation Status',
              value: notification.status === 'Resolved' ? 'Reconciled' : 'Pending Review',
              isStatus: true,
              statusVariant: notification.status === 'Resolved' ? 'success' : 'pending',
            },
          ],
        };
      }

      case 'Vendor Eligibility': {
        return {
          sectionTitle: 'Related Vendor Eligibility',
          actionLabel: primaryActionLabel || 'View Vendor Eligibility',
          actionRoute: '/super-admin/configuration/vendor-eligibility',
          fields: [
            { label: 'Vendor Reference', value: ref },
            { label: 'Financial Institution', value: 'Access Bank Zambia' },
            { label: 'Configured Service Mode', value: 'Cash Pickup & Bank Settlement' },
            { label: 'Minimum Float Threshold', value: 'ZMW 250,000.00' },
            { label: 'Settlement Tier', value: 'Commercial Tier 1' },
            { label: 'Approval Status', value: 'Verified & Approved' },
            { label: 'Updated Timestamp', value: notification.dateTime },
            {
              label: 'Eligibility Status',
              value: 'Active / Enabled',
              isStatus: true,
              statusVariant: 'success',
            },
          ],
        };
      }

      case 'System':
      default: {
        return {
          sectionTitle: 'Related System Setting',
          actionLabel: primaryActionLabel || 'View System Settings',
          actionRoute: '/super-admin/configuration/service-modes',
          fields: [
            { label: 'Configuration Reference', value: ref },
            { label: 'Configuration Module', value: 'Security & Admin Session Governance' },
            { label: 'Enforced Policy', value: 'Super Admin Inactivity Timeout (15m)' },
            { label: 'Target Scope', value: 'All TellerBud Zambia Super Admins' },
            { label: 'Enforcement Mode', value: 'Mandatory Policy' },
            { label: 'Supervised By', value: 'Security Policy Engine' },
            { label: 'Enacted Date and Time', value: notification.dateTime },
            {
              label: 'System Status',
              value: 'Enforced',
              isStatus: true,
              statusVariant: 'success',
            },
          ],
        };
      }
    }
  };

  const config = getRecordConfig();

  const renderStatusBadge = (value: string, variant?: 'pending' | 'success' | 'warning' | 'neutral') => {
    switch (variant) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            {value}
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            {value}
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            {value}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            {value}
          </span>
        );
    }
  };

  return (
    <div
      id="related-record-summary-card"
      className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 md:p-6 w-full"
    >
      <div className="border-b border-gray-100 pb-3 mb-4">
        <h2 className="text-base font-bold text-gray-900">{config.sectionTitle}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {config.fields.map((field, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg border border-gray-100 bg-gray-50/40 hover:bg-gray-50/80 transition-colors"
          >
            <p className="text-xs font-medium text-gray-500 mb-1">{field.label}</p>
            {field.isStatus ? (
              <div>{renderStatusBadge(field.value, field.statusVariant)}</div>
            ) : field.label.includes('Reference') ? (
              <button
                type="button"
                id={`btn-reference-${field.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onNavigateToRelatedRecord(config.actionRoute)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-cyan-50 hover:bg-cyan-100/90 text-[#0D93AA] hover:text-[#0B7F94] border border-cyan-200/80 transition-colors cursor-pointer group"
                title={`View ${field.value}`}
              >
                <span>{field.value}</span>
                <ExternalLink className="w-3 h-3 text-[#0D93AA] group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : field.label.includes('ID') ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-gray-200/70 text-gray-800">
                {field.value}
              </span>
            ) : (
              <p className="text-sm font-semibold text-gray-900">{field.value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
