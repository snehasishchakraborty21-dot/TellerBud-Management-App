import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  Clock,
  Percent,
  Lock,
  Eye,
  Info,
  ArrowRight,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { ServiceModeRecord } from '../../types/serviceMode';
import {
  calculateReservationFee,
  formatZMWAmount,
  RESERVATION_FEE_CONFIG,
} from '../../utils/reservationFeeUtils';

interface ReservationFeeConfigSectionProps {
  service: ServiceModeRecord;
}

export const ReservationFeeConfigSection: React.FC<ReservationFeeConfigSectionProps> = ({
  service,
}) => {
  // Test Calculator State (pre-populated with user prompt's reference example)
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [calcMinutes, setCalcMinutes] = useState<number>(30);

  const isEligible =
    service.id === 'TB-SVC-CP-001' ||
    service.id === 'TB-SVC-A2A-004' ||
    service.hasReservationFee;

  if (!isEligible) {
    return null;
  }

  const breakdown = calculateReservationFee(calcAmount, calcMinutes);

  const configRows = [
    {
      component: 'Percentage Rate',
      value: '1.2% of Reservation Amount',
      description: 'Calculated as Reservation Amount × 0.012',
      icon: Percent,
      iconColor: 'text-sky-600 bg-sky-50',
    },
    {
      component: 'Time Rate',
      value: 'ZMW 0.10 per minute',
      description: 'Calculated as Number of Minutes × ZMW 0.10',
      icon: Clock,
      iconColor: 'text-amber-600 bg-amber-50',
    },
    {
      component: 'Penalty Reserve',
      value: 'ZMW 20.00',
      description: 'Fixed component held separately with default status Held',
      icon: Lock,
      iconColor: 'text-indigo-600 bg-indigo-50',
    },
    {
      component: 'Customer/Requester Visibility',
      value: '100%',
      description:
        service.id === 'TB-SVC-CP-001'
          ? 'Customer sees 100% of the calculated Reservation Fee'
          : 'Requesting Agent sees 100% of the calculated Reservation Fee',
      icon: Eye,
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      component: 'Fulfilling Agent Visibility',
      value: '80%',
      description: 'Assigned / Fulfilling Agent sees 80% of Full Reservation Fee (Fee × 0.80)',
      icon: ShieldCheck,
      iconColor: 'text-cyan-600 bg-cyan-50',
    },
  ];

  return (
    <section
      id="reservation-fee-configuration-section"
      aria-labelledby="reservation-fee-config-heading"
      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden"
    >
      {/* Section Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-50/50 via-white to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Receipt className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3
              id="reservation-fee-config-heading"
              className="text-sm font-bold text-slate-900 tracking-tight"
            >
              Reservation Fee Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Approved dynamic fee model for {service.name} ({service.id})
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Dynamic Fee Active</span>
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Formula Display Box */}
        <div className="p-4 bg-slate-900 rounded-xl text-white shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Approved Reservation Fee Formula
            </span>
            <span className="text-[10px] text-slate-400 font-mono">System Dynamic Engine</span>
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-cyan-300 py-1 tracking-tight">
            (Reservation Amount × 1.2%) + (Minutes × ZMW 0.10) + ZMW 20.00
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            All three components are computed on the backend using system-recorded reservation timestamps and stored with an immutable calculation snapshot.
          </p>
        </div>

        {/* 5 Component Table */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-4">Fee Component</th>
                <th className="py-2.5 px-4 text-right">Configured Value</th>
                <th className="py-2.5 px-4">Description & Rules</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {configRows.map((row) => {
                const Icon = row.icon;
                return (
                  <tr key={row.component} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-md ${row.iconColor} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span>{row.component}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row.value}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{row.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Live Calculation Simulator */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[#0D93AA]" />
              Live Reservation Fee Calculator
            </span>
            <button
              type="button"
              onClick={() => {
                setCalcAmount(1000);
                setCalcMinutes(30);
              }}
              className="text-[11px] text-[#0D93AA] hover:text-[#0b7e92] font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to 1,000 ZMW / 30 min
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sim-calc-amount"
                className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1"
              >
                Reservation Amount (ZMW)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">
                  ZMW
                </span>
                <input
                  id="sim-calc-amount"
                  type="number"
                  min="10"
                  step="50"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-12 pr-3 py-1.5 text-xs font-mono font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="sim-calc-minutes"
                className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1"
              >
                Duration (Minutes)
              </label>
              <div className="relative">
                <input
                  id="sim-calc-minutes"
                  type="number"
                  min="1"
                  max="1440"
                  value={calcMinutes}
                  onChange={(e) => setCalcMinutes(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-xs font-mono font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0D93AA] focus:border-transparent outline-none"
                />
                <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">
                  mins
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">
                Percentage (1.2%)
              </span>
              <span className="font-mono font-bold text-slate-800 block text-sm">
                {formatZMWAmount(breakdown.percentageComponent)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                {calcAmount} × 0.012
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">
                Time (ZMW 0.10/min)
              </span>
              <span className="font-mono font-bold text-slate-800 block text-sm">
                {formatZMWAmount(breakdown.timeComponent)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                {calcMinutes} mins × 0.10
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">
                Penalty Reserve (Fixed)
              </span>
              <span className="font-mono font-bold text-amber-700 block text-sm">
                {formatZMWAmount(breakdown.penaltyReserve)}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">
                Held Separately
              </span>
            </div>
          </div>

          {/* Customer 100% vs Agent 80% Output Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {service.id === 'TB-SVC-CP-001'
                    ? 'Customer-Visible Fee (100%)'
                    : 'Requesting Agent Fee (100%)'}
                </span>
                <span className="text-xs text-emerald-600 mt-0.5 block">
                  Full Reservation Fee
                </span>
              </div>
              <span className="text-lg font-mono font-extrabold text-emerald-950">
                {formatZMWAmount(breakdown.fullReservationFee)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-bold text-[#0D93AA] uppercase tracking-wider block">
                  Fulfilling Agent Fee (80%)
                </span>
                <span className="text-xs text-cyan-700 mt-0.5 block">
                  80% × Full Reservation Fee
                </span>
              </div>
              <span className="text-lg font-mono font-extrabold text-cyan-950">
                {formatZMWAmount(breakdown.agentVisibleFee)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
