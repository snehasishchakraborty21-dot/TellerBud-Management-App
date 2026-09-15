import React, { useState } from 'react';
import {
  Banknote,
  Truck,
  Store,
  ArrowLeftRight,
  BookOpen,
  Clock,
  Receipt,
  Smartphone,
  Users,
  Layers,
  Eye,
} from 'lucide-react';
import { ServiceModeRecord } from '../../types/serviceMode';

interface ServiceModesTableProps {
  serviceModes: ServiceModeRecord[];
  onViewDetails: (service: ServiceModeRecord) => void;
}

export const ServiceModesTable: React.FC<ServiceModesTableProps> = ({
  serviceModes,
  onViewDetails,
}) => {
  // State for popovers on "+1" transaction type tags
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);

  // Icon mapper for service modes
  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'TB-SVC-CP-001':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Banknote className="w-4 h-4" />
          </div>
        );
      case 'TB-SVC-CD-002':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Truck className="w-4 h-4" />
          </div>
        );
      case 'TB-SVC-WI-003':
        return (
          <div className="w-8 h-8 rounded-lg bg-cyan-50 text-[#0D93AA] flex items-center justify-center shrink-0 border border-cyan-100">
            <Store className="w-4 h-4" />
          </div>
        );
      case 'TB-SVC-A2A-004':
        return (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
            <Layers className="w-4 h-4" />
          </div>
        );
    }
  };

  // Availability badge renderer: Single clean badge
  const renderAvailabilityBadge = (service: ServiceModeRecord) => {
    if (service.availability === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active</span>
        </span>
      );
    }
    if (service.availability === 'Coming Soon') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs whitespace-nowrap">
          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
          <span>Coming Soon</span>
          {service.displayLabel && (
            <span className="ml-0.5 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 rounded">
              {service.displayLabel}
            </span>
          )}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>Inactive</span>
      </span>
    );
  };

  // Compact audience renderer: "Customer and Agent", "Customer App", "Agent App"
  const renderAudience = (audience: string) => {
    if (audience === 'Customer and Agent' || audience === 'Customer & Agent') {
      return (
        <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium whitespace-nowrap">
          <div className="flex items-center -space-x-1">
            <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600" title="Customer App">
              <Smartphone className="w-3 h-3" />
            </span>
            <span className="w-5 h-5 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0D93AA]" title="Agent App">
              <Users className="w-3 h-3" />
            </span>
          </div>
          <span>Customer and Agent</span>
        </div>
      );
    }
    if (audience === 'Customer App') {
      return (
        <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium whitespace-nowrap">
          <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Smartphone className="w-3 h-3" />
          </span>
          <span>Customer App</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium whitespace-nowrap">
        <span className="w-5 h-5 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0D93AA]">
          <Users className="w-3 h-3" />
        </span>
        <span>Agent App</span>
      </div>
    );
  };

  // Compact providers renderer
  const renderProviders = (service: ServiceModeRecord) => {
    if (service.isInternalLedger) {
      return (
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 whitespace-nowrap"
          title="TellerBud Ledger core internal balance"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>TellerBud Ledger</span>
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">
        {service.eligibleProvidersCount} Providers
      </span>
    );
  };

  // Compact scheduling renderer
  const renderScheduling = (scheduling: string) => {
    if (scheduling === 'Unavailable') {
      return (
        <span className="text-xs text-slate-400 italic whitespace-nowrap">
          Unavailable
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 whitespace-nowrap">
        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
        <span>{scheduling}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs box-border w-full overflow-hidden">
      {/* 
        ========================================================================
        DESKTOP TABLE (Hidden on screens < 1024px, converting to stacked cards)
        Exact column widths:
        - Service Mode: 20%
        - Audience: 15%
        - Availability: 13%
        - Transaction Types: 16%
        - Eligible Providers: 14%
        - Scheduling: 11%
        - Action: 11%
        Total: 100% of available width. No horizontal scrollbar. Right border fully visible.
        ========================================================================
      */}
      <div className="hidden lg:block w-full box-border">
        <table className="w-full text-left border-collapse table-fixed box-border">
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
          </colgroup>

          {/* Exact Headings:
              - Service Mode
              - Audience
              - Availability
              - Transaction Types
              - Eligible Providers
              - Scheduling
              - Action
          */}
          <thead className="bg-slate-50/90 border-b border-slate-200">
            <tr className="text-[11.5px] font-semibold text-slate-600 uppercase tracking-wider select-none">
              <th className="py-3 px-3">
                Service Mode
              </th>
              <th className="py-3 px-2 whitespace-nowrap">
                Audience
              </th>
              <th className="py-3 px-2 whitespace-nowrap">
                Availability
              </th>
              <th className="py-3 px-2">
                Transaction Types
              </th>
              <th className="py-3 px-2 whitespace-nowrap">
                Eligible Providers
              </th>
              <th className="py-3 px-2 whitespace-nowrap">
                Scheduling
              </th>
              <th className="py-3 px-3 text-right whitespace-nowrap">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {serviceModes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <p className="text-sm font-medium text-slate-700">No service modes found</p>
                    <p className="text-xs text-slate-400">
                      No modes matched your search or filter criteria. Try clearing filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              serviceModes.map((service) => {
                const isComingSoon = service.availability === 'Coming Soon';
                const hasReservationCharge = Boolean(
                  service.reservationCharge && service.reservationCharge !== 'Not Applicable'
                );

                // Transaction type tags: Deposit, Withdrawal, +1 (Purchase)
                const hasMoreThanTwo = service.transactionTypes.length > 2;
                const visibleTags = hasMoreThanTwo
                  ? service.transactionTypes.slice(0, 2)
                  : service.transactionTypes;
                const hiddenTags = hasMoreThanTwo
                  ? service.transactionTypes.slice(2)
                  : [];
                const isPopoverOpen = activePopoverId === service.id;

                return (
                  <tr
                    key={service.id}
                    id={`service-row-${service.id}`}
                    className={`transition-colors duration-150 ${
                      isComingSoon ? 'bg-slate-50/40 hover:bg-slate-50/70' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* 1. Service Mode (20%) */}
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-2.5">
                        {getServiceIcon(service.id)}
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight block truncate" title={service.name}>
                            {service.name}
                          </span>
                          
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-mono text-slate-500 font-medium tracking-tight whitespace-nowrap">
                              {service.id}
                            </span>

                            {hasReservationCharge && (
                              <span
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 whitespace-nowrap"
                                title="Reservation Charge: ZMW 50.00 (Applies only to Cash Pickup to secure teller float)"
                              >
                                <Receipt className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span>Res. Charge: {service.reservationCharge}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Audience (15%) */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      {renderAudience(service.audience)}
                    </td>

                    {/* 3. Availability (13%) */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      {renderAvailabilityBadge(service)}
                    </td>

                    {/* 4. Transaction Types (16%) */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 relative">
                        {visibleTags.map((type) => (
                          <span
                            key={type}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70 whitespace-nowrap"
                          >
                            {type}
                          </span>
                        ))}

                        {/* +1 Tag with hover/click revealing Purchase */}
                        {hasMoreThanTwo && (
                          <div
                            className="relative inline-block"
                            onMouseEnter={() => setActivePopoverId(service.id)}
                            onMouseLeave={() => setActivePopoverId(null)}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePopoverId(isPopoverOpen ? null : service.id);
                              }}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/20 hover:bg-[#0D93AA]/20 transition-colors cursor-pointer whitespace-nowrap"
                              title="Click or hover to reveal Purchase"
                              aria-expanded={isPopoverOpen}
                            >
                              +{hiddenTags.length}
                            </button>

                            {isPopoverOpen && (
                              <div
                                className="absolute left-0 bottom-full mb-1.5 z-30 min-w-[120px] p-2 bg-slate-900 text-white rounded-lg shadow-lg text-xs"
                                role="tooltip"
                              >
                                <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider mb-1">
                                  Additional Types:
                                </p>
                                <div className="space-y-1">
                                  {hiddenTags.map((tag) => (
                                    <div key={tag} className="flex items-center gap-1.5 text-[11px] text-white">
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                      <span>{tag}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="absolute top-full left-3 -mt-1 border-4 border-transparent border-t-slate-900" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 5. Eligible Providers (14%) */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      {renderProviders(service)}
                    </td>

                    {/* 6. Scheduling (11%) */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      {renderScheduling(service.scheduling)}
                    </td>

                    {/* 7. Action (11%) - Fully visible View Details button with Eye icon */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        id={`btn-view-details-${service.id}`}
                        onClick={() => onViewDetails(service)}
                        aria-label={`View Details for ${service.name}`}
                        className="inline-flex items-center justify-center gap-1.5 min-w-[100px] px-2.5 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white border border-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                        title={`View Details for ${service.name}`}
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 
        ========================================================================
        SMALLER SCREEN BEHAVIOUR (< 1024px)
        Convert service records into responsive stacked cards instead of creating horizontal scrolling.
        Each responsive card shows all attributes and a full View Details button.
        ========================================================================
      */}
      <div className="block lg:hidden divide-y divide-slate-200">
        {serviceModes.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p className="text-sm font-medium text-slate-700">No service modes found</p>
            <p className="text-xs text-slate-400 mt-1">
              No modes matched your search or filter criteria. Try clearing filters.
            </p>
          </div>
        ) : (
          serviceModes.map((service) => {
            const hasReservationCharge = Boolean(
              service.reservationCharge && service.reservationCharge !== 'Not Applicable'
            );
            const hasMoreThanTwo = service.transactionTypes.length > 2;
            const visibleTags = hasMoreThanTwo
              ? service.transactionTypes.slice(0, 2)
              : service.transactionTypes;
            const hiddenTags = hasMoreThanTwo
              ? service.transactionTypes.slice(2)
              : [];
            const isPopoverOpen = activePopoverId === `mobile-${service.id}`;

            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                className="p-4 sm:p-5 space-y-3.5 hover:bg-slate-50/50 transition-colors"
              >
                {/* Header: Icon, Name, ID, Availability */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {getServiceIcon(service.id)}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                        {service.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-mono text-slate-500 font-medium">
                          {service.id}
                        </span>
                        {hasReservationCharge && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                            <Receipt className="w-2.5 h-2.5 text-amber-600" />
                            <span>Res. Charge: {service.reservationCharge}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>{renderAvailabilityBadge(service)}</div>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10.5px] font-medium text-slate-400 block mb-0.5 uppercase tracking-wider">
                      Audience
                    </span>
                    {renderAudience(service.audience)}
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10.5px] font-medium text-slate-400 block mb-0.5 uppercase tracking-wider">
                      Providers
                    </span>
                    {renderProviders(service)}
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-[10.5px] font-medium text-slate-400 block mb-0.5 uppercase tracking-wider">
                      Scheduling
                    </span>
                    {renderScheduling(service.scheduling)}
                  </div>
                </div>

                {/* Transaction Types & Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1 relative">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Types:</span>
                    {visibleTags.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70"
                      >
                        {type}
                      </span>
                    ))}

                    {hasMoreThanTwo && (
                      <div
                        className="relative inline-block"
                        onMouseEnter={() => setActivePopoverId(`mobile-${service.id}`)}
                        onMouseLeave={() => setActivePopoverId(null)}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePopoverId(isPopoverOpen ? null : `mobile-${service.id}`);
                          }}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-[#0D93AA]/10 text-[#0D93AA] border border-[#0D93AA]/20"
                          aria-expanded={isPopoverOpen}
                        >
                          +{hiddenTags.length}
                        </button>

                        {isPopoverOpen && (
                          <div
                            className="absolute left-0 bottom-full mb-1.5 z-30 min-w-[120px] p-2 bg-slate-900 text-white rounded-lg shadow-lg text-xs"
                            role="tooltip"
                          >
                            <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider mb-1">
                              Additional Types:
                            </p>
                            <div className="space-y-1">
                              {hiddenTags.map((tag) => (
                                <div key={tag} className="flex items-center gap-1.5 text-[11px] text-white">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                  <span>{tag}</span>
                                </div>
                              ))}
                            </div>
                            <div className="absolute top-full left-3 -mt-1 border-4 border-transparent border-t-slate-900" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    id={`btn-mobile-view-details-${service.id}`}
                    onClick={() => onViewDetails(service)}
                    aria-label={`View Details for ${service.name}`}
                    className="inline-flex items-center justify-center gap-1.5 min-w-[100px] px-3 py-1.5 text-xs font-semibold text-[#0D93AA] bg-[#0D93AA]/10 hover:bg-[#0D93AA] hover:text-white border border-[#0D93AA]/20 rounded-lg transition-colors cursor-pointer shadow-2xs whitespace-nowrap ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


