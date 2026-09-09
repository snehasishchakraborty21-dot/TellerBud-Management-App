import React from 'react';
import {
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  MapPin,
  Store,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { MobileMoneySummary, ServiceChannel, MobileMoneyStatus } from '../../types/mobileMoney';
import { formatZMW } from '../../utils/financialUtils';

interface MobileMoneySummaryCardsProps {
  summary: MobileMoneySummary;
  selectedChannel: ServiceChannel | 'ALL';
  selectedStatus: MobileMoneyStatus | 'ALL' | 'Cancelled_Failed';
  onSelectFilter: (
    channel: ServiceChannel | 'ALL',
    status: MobileMoneyStatus | 'ALL' | 'Cancelled_Failed'
  ) => void;
}

export const MobileMoneySummaryCards: React.FC<MobileMoneySummaryCardsProps> = ({
  summary,
  selectedChannel,
  selectedStatus,
  onSelectFilter,
}) => {
  // Determine active operational card based on selected channel and status
  const getActiveCardId = (): string => {
    if (selectedChannel === 'Pickup' && selectedStatus === 'ALL') return 'pickup';
    if (selectedChannel === 'Walk-In' && selectedStatus === 'ALL') return 'walk-in';
    if (selectedStatus === 'Completed' && selectedChannel === 'ALL') return 'completed';
    if (selectedStatus === 'Pending Confirmation' && selectedChannel === 'ALL') return 'pending';
    if (selectedStatus === 'Cancelled_Failed' && selectedChannel === 'ALL')
      return 'cancelled-failed';
    return '';
  };

  const activeCardId = getActiveCardId();

  // Secondary operational metrics
  const operationalCards = [
    {
      id: 'pickup',
      label: 'Pickup',
      count: summary.pickup,
      icon: MapPin,
      colorClasses: {
        active: 'border-[#0D93AA] ring-2 ring-[#0D93AA]/20 bg-cyan-50/40 text-gray-900',
        iconActive: 'bg-[#0D93AA] text-white',
        iconInactive: 'bg-cyan-50 text-[#0D93AA]',
      },
      onClick: () => {
        if (activeCardId === 'pickup') {
          onSelectFilter('ALL', 'ALL');
        } else {
          onSelectFilter('Pickup', 'ALL');
        }
      },
    },
    {
      id: 'walk-in',
      label: 'Walk-In',
      count: summary.walkIn,
      icon: Store,
      colorClasses: {
        active: 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/40 text-gray-900',
        iconActive: 'bg-indigo-600 text-white',
        iconInactive: 'bg-indigo-50 text-indigo-600',
      },
      onClick: () => {
        if (activeCardId === 'walk-in') {
          onSelectFilter('ALL', 'ALL');
        } else {
          onSelectFilter('Walk-In', 'ALL');
        }
      },
    },
    {
      id: 'completed',
      label: 'Completed',
      count: summary.completed,
      icon: CheckCircle2,
      colorClasses: {
        active: 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/40 text-gray-900',
        iconActive: 'bg-emerald-600 text-white',
        iconInactive: 'bg-emerald-50 text-emerald-600',
      },
      onClick: () => {
        if (activeCardId === 'completed') {
          onSelectFilter('ALL', 'ALL');
        } else {
          onSelectFilter('ALL', 'Completed');
        }
      },
    },
    {
      id: 'pending',
      label: 'Pending Confirmation',
      count: summary.pendingConfirmation,
      icon: Clock,
      colorClasses: {
        active: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 text-gray-900',
        iconActive: 'bg-amber-500 text-white',
        iconInactive: 'bg-amber-50 text-amber-600',
      },
      onClick: () => {
        if (activeCardId === 'pending') {
          onSelectFilter('ALL', 'ALL');
        } else {
          onSelectFilter('ALL', 'Pending Confirmation');
        }
      },
    },
    {
      id: 'cancelled-failed',
      label: 'Cancelled / Failed',
      count: summary.cancelledFailed,
      icon: XCircle,
      colorClasses: {
        active: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 text-gray-900',
        iconActive: 'bg-rose-500 text-white',
        iconInactive: 'bg-rose-50 text-rose-600',
      },
      onClick: () => {
        if (activeCardId === 'cancelled-failed') {
          onSelectFilter('ALL', 'ALL');
        } else {
          onSelectFilter('ALL', 'Cancelled_Failed');
        }
      },
    },
  ];

  return (
    <div className="space-y-3">
      {/* ROW 1: PRIMARY KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* 1. TOTAL TRANSACTIONS */}
        <div
          id="primary-kpi-total-transactions"
          onClick={() => {
            if (activeCardId !== '') {
              onSelectFilter('ALL', 'ALL');
            }
          }}
          className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all duration-150 ${
            activeCardId !== '' ? 'cursor-pointer hover:border-teal-400 hover:bg-teal-50/10' : ''
          } border-gray-200/90`}
          title={activeCardId !== '' ? 'Click to reset filter and show all transactions' : undefined}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Transactions
            </span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0D93AA] flex items-center justify-center shrink-0">
              <ArrowLeftRight size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-gray-900">
              {(summary?.totalTransactions ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">
              Pickup and Walk-In records
            </div>
          </div>
        </div>

        {/* 2. TOTAL AMOUNT */}
        <div
          id="primary-kpi-total-amount"
          className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Amount
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-gray-900">
              {formatZMW(summary?.totalAmount ?? 0)}
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">
              Completed transaction turnover
            </div>
          </div>
        </div>

        {/* 3. SERVICE EARNINGS */}
        <div
          id="primary-kpi-service-earnings"
          className="bg-white rounded-xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Service Earnings
            </span>
            <div className="w-9 h-9 rounded-lg bg-cyan-50 text-[#0D93AA] flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0D93AA]">
              {formatZMW(summary?.serviceEarnings ?? 0)}
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">
              80% of collected service fees
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: SECONDARY OPERATIONAL CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {operationalCards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeCardId === card.id;

          return (
            <button
              key={card.id}
              type="button"
              id={`operational-card-${card.id}`}
              onClick={card.onClick}
              className={`flex flex-col justify-between p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? card.colorClasses.active
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60 text-gray-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-600 leading-tight">
                  {card.label}
                </span>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? card.colorClasses.iconActive
                      : card.colorClasses.iconInactive
                  }`}
                >
                  <Icon size={14} />
                </div>
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 font-mono tracking-tight">
                {(card.count ?? 0).toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
