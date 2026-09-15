import React from 'react';
import {
  Server,
  CheckCircle2,
  Clock,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';

interface ReconciliationSummaryCardsProps {
  providerApis?: number;
  operationalApis?: number;
  pendingResponses?: number;
  reconciledToday?: number;
  reconciliationExceptions?: number;
}

export const ReconciliationSummaryCards: React.FC<ReconciliationSummaryCardsProps> = ({
  providerApis = 2,
  operationalApis = 2,
  pendingResponses = 4,
  reconciledToday = 26,
  reconciliationExceptions = 2,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Provider APIs */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Provider APIs</span>
          <div className="w-7 h-7 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
            <Server size={15} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-[#102025]">
            {providerApis}
          </div>
        </div>
      </div>

      {/* 2. Operational APIs */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Operational APIs</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={15} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-emerald-600">
            {operationalApis}
          </div>
        </div>
      </div>

      {/* 3. Pending Provider Responses */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Pending Provider Responses</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock size={15} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-amber-600">
            {pendingResponses}
          </div>
        </div>
      </div>

      {/* 4. Reconciled Today */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Reconciled Today</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <CheckCheck size={15} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-[#102025]">
            {reconciledToday}
          </div>
        </div>
      </div>

      {/* 5. Reconciliation Exceptions */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Reconciliation Exceptions</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={15} />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xl font-bold font-mono text-rose-600">
            {reconciliationExceptions}
          </div>
        </div>
      </div>
    </div>
  );
};
