import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Building2,
  Receipt,
  Store,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/mockAdminService';
import { WalkInTransaction } from '../types/admin';
import { VendorLogo } from '../components/walk-in/VendorLogo';
import { WalkInStatusBadge } from '../components/walk-in/WalkInStatusBadge';
import { WalkInTypeBadge } from '../components/walk-in/WalkInTypeBadge';
import { formatZMW } from '../config/appConfig';

export const WalkInDetailPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const businessScope =
    currentUser?.businessName || 'Lusaka Central Express Agency';

  const [transaction, setTransaction] = useState<WalkInTransaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!reference) return;

    setIsLoading(true);
    adminService
      .getWalkInTransactionByReference(reference)
      .then((tx) => {
        // Enforce business owner data scope check
        if (
          tx &&
          currentUser?.role === 'business_owner' &&
          tx.businessName.toLowerCase() !== businessScope.toLowerCase() &&
          tx.businessId.toLowerCase() !== (currentUser?.businessId || '').toLowerCase()
        ) {
          // Scoped away
          setTransaction(null);
        } else {
          setTransaction(tx);
        }
      })
      .catch((err) => {
        console.error('Failed to load transaction detail:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [reference, businessScope, currentUser]);

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const datePart = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return `${datePart}, ${timePart}`;
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-2xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#0D93AA] mb-4" />
        <p className="text-sm font-medium text-gray-500">
          Loading transaction details...
        </p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-gray-900">
          Transaction Not Found or Access Restricted
        </h2>
        <p className="text-xs text-gray-500">
          The requested Walk-In transaction reference could not be found or does not belong to your business center.
        </p>
        <button
          type="button"
          onClick={() => navigate('/business-owner/walk-in-transactions')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0b8296] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Walk-In Transactions</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/business-owner/walk-in-transactions"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#0D93AA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Walk-In Transactions</span>
        </Link>
        <div className="text-xs font-mono text-gray-400">
          Reference: <span className="font-bold text-gray-800">{transaction.reference}</span>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-gray-400 uppercase tracking-wider">
                {transaction.reference}
              </span>
              <WalkInTypeBadge type={transaction.transactionType} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 tracking-tight">
              {formatZMW(transaction.amount)}
            </h1>
            <div className="flex items-center gap-2 pt-1">
              <VendorLogo vendor={transaction.vendor} size="detail" showName={true} />
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              Current Status
            </span>
            <WalkInStatusBadge status={transaction.status} size="md" />
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono pt-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{formatDateTime(transaction.transactionTime)}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agent Information */}
          <div className="bg-gray-50/70 rounded-xl p-5 border border-gray-100 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60 font-bold text-xs text-gray-900">
              <User className="w-4 h-4 text-[#0D93AA]" />
              <span>Handling Agent Details</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Agent Name & ID
                </span>
                <div className="font-bold text-gray-900 text-sm">{transaction.agentName}</div>
                <div className="font-mono text-gray-500">{transaction.agentId}</div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Agent Phone
                </span>
                <div className="font-mono text-gray-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{transaction.agentPhone}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Business Agency
                </span>
                <div className="text-gray-900 font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{transaction.businessName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Technical Details */}
          <div className="bg-gray-50/70 rounded-xl p-5 border border-gray-100 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60 font-bold text-xs text-gray-900">
              <Store className="w-4 h-4 text-[#0D93AA]" />
              <span>Customer & Terminal Identifiers</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Customer Phone Number
                </span>
                <div className="font-mono font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#0D93AA]" />
                  <span>{transaction.customerPhone}</span>
                </div>
              </div>

              {transaction.terminalId && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Terminal / POS ID
                  </span>
                  <div className="font-mono text-gray-800">{transaction.terminalId}</div>
                </div>
              )}

              {transaction.receiptNumber && (
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                    Receipt Number
                  </span>
                  <div className="font-mono text-gray-800 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-gray-400" />
                    <span>{transaction.receiptNumber}</span>
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Logged Timestamp
                </span>
                <div className="font-mono text-gray-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{formatDateTime(transaction.transactionTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lifecycle Timeline */}
        <div className="pt-2 space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Lifecycle Timeline
          </h3>

          <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4 shadow-2xs">
            {transaction.timeline.map((event, index) => {
              const isLast = index === transaction.timeline.length - 1;

              return (
                <div key={event.id} className="relative flex items-start gap-3">
                  {!isLast && (
                    <div
                      className="absolute left-[11px] top-6 w-[2px] bg-gray-200"
                      style={{ height: 'calc(100% + 4px)' }}
                      aria-hidden="true"
                    />
                  )}

                  <div className="relative z-10 w-6 h-6 rounded-full bg-[#0D93AA] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold text-gray-900">
                        {event.status}
                      </span>
                      <span className="text-[11px] font-mono text-gray-500 whitespace-nowrap">
                        {formatDateTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
