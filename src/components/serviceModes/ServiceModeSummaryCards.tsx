import React from 'react';
import { Users, Building2, Clock, Receipt, BookOpen } from 'lucide-react';
import { ServiceModeRecord } from '../../types/serviceMode';

interface ServiceModeSummaryCardsProps {
  service: ServiceModeRecord;
}

export const ServiceModeSummaryCards: React.FC<ServiceModeSummaryCardsProps> = ({ service }) => {
  // Format audience label cleanly - strictly 'Customer and Agent'
  const audienceLabel =
    service.audience === 'Customer and Agent' ? 'Customer and Agent' : service.audience;

  // Format eligible providers count / ledger representation
  const getProvidersDisplay = () => {
    if (service.isInternalLedger) {
      return {
        text: 'TellerBud Ledger',
        subtext: 'Core Internal Engine',
        isLedger: true,
      };
    }
    return {
      text: `${service.eligibleProvidersCount} Eligible Providers`,
      subtext: service.eligibleProvidersCount > 0 ? 'MNO & Banking Partners' : 'Phase 1 Unassigned',
      isLedger: false,
    };
  };

  const providersInfo = getProvidersDisplay();

  return (
    <section
      aria-label="Service Mode Summary Metrics"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
    >
      {/* 1. Audience */}
      <div
        id="card-summary-audience"
        className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Audience
          </span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-[#0D93AA]">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>
        <p className="text-base font-bold text-slate-900 mt-2 tracking-tight">
          {audienceLabel}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {service.audience === 'Customer and Agent'
            ? 'Customer and Agent'
            : service.audience === 'Customer App'
            ? 'Customer Application'
            : 'Agent Workflow Only'}
        </p>
      </div>

      {/* 2. Eligible Providers */}
      <div
        id="card-summary-providers"
        className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Eligible Providers
          </span>
          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            {providersInfo.isLedger ? (
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </div>
        </div>
        <p className="text-base font-bold text-slate-900 mt-2 tracking-tight">
          {providersInfo.text}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{providersInfo.subtext}</p>
      </div>

      {/* 3. Scheduling */}
      <div
        id="card-summary-scheduling"
        className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Scheduling
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>
        <p className="text-base font-bold text-slate-900 mt-2 tracking-tight">
          {service.scheduling}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {service.scheduling === 'Now or Later'
            ? 'Immediate or scheduled service'
            : service.scheduling === 'Immediate'
            ? 'On-Demand Execution'
            : 'Locked for Phase 1'}
        </p>
      </div>

      {/* 4. Reservation Charge */}
      <div
        id="card-summary-reservation"
        className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Reservation Charge
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Receipt className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </div>
        <p className="text-base font-bold text-slate-900 mt-2 tracking-tight">
          {service.reservationCharge}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {service.id === 'TB-SVC-CP-001'
            ? 'Customer-facing reservation fee'
            : 'Zero surcharge applied'}
        </p>
      </div>
    </section>
  );
};
