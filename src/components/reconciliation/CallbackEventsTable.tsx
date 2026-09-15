import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Copy, Check, Filter } from 'lucide-react';
import { CallbackEvent } from '../../types/reconciliation';
import { MtnLogo, AirtelLogo } from '../wallet/ProviderLogos';

interface CallbackEventsTableProps {
  events: CallbackEvent[];
}

export const CallbackEventsTable: React.FC<CallbackEventsTableProps> = ({ events }) => {
  const [filterProvider, setFilterProvider] = useState<string>('ALL');
  const [filterDuplicatesOnly, setFilterDuplicatesOnly] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredEvents = events.filter((ev) => {
    if (filterProvider !== 'ALL' && ev.provider !== filterProvider) {
      return false;
    }
    if (filterDuplicatesOnly && ev.duplicateStatus !== 'Duplicate Discarded') {
      return false;
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl shadow-xs overflow-hidden space-y-0">
      {/* Mini toolbar */}
      <div className="p-3 sm:px-4 bg-slate-50/70 border-b border-gray-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-700">Filter Callbacks:</span>
          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white text-slate-800"
          >
            <option value="ALL">All Providers</option>
            <option value="MTN Mobile Money">MTN Mobile Money</option>
            <option value="Airtel Money">Airtel Money</option>
          </select>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterDuplicatesOnly}
            onChange={(e) => setFilterDuplicatesOnly(e.target.checked)}
            className="rounded border-gray-300 text-[#0D93AA] focus:ring-[#0D93AA]"
          />
          <span className="text-slate-600 font-medium">Show Discarded Duplicates Only</span>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-gray-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 whitespace-nowrap">Callback Event</th>
              <th className="py-3 px-4 whitespace-nowrap">Provider</th>
              <th className="py-3 px-4 whitespace-nowrap">Transaction Ref</th>
              <th className="py-3 px-4 whitespace-nowrap">Event Type</th>
              <th className="py-3 px-4 whitespace-nowrap">Received At</th>
              <th className="py-3 px-4 whitespace-nowrap text-center">Signature</th>
              <th className="py-3 px-4 whitespace-nowrap text-center">Duplicate Guard</th>
              <th className="py-3 px-4 whitespace-nowrap text-center">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  No callback events match selected filters.
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev) => (
                <tr
                  key={ev.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Event ID */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono font-medium text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{ev.id}</span>
                      <button
                        onClick={() => handleCopy(ev.id, ev.id)}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title="Copy Event ID"
                      >
                        {copiedId === ev.id ? (
                          <Check size={12} className="text-emerald-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Provider */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {ev.provider === 'MTN Mobile Money' ? (
                        <MtnLogo className="w-5 h-5 rounded shrink-0" />
                      ) : (
                        <AirtelLogo className="w-5 h-5 rounded shrink-0" />
                      )}
                      <span className="font-medium text-slate-700">{ev.provider}</span>
                    </div>
                  </td>

                  {/* Transaction Ref */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-700">
                    {ev.transactionRef}
                  </td>

                  {/* Event Type */}
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                    {ev.eventType}
                  </td>

                  {/* Received At */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                    {ev.receivedAt}
                  </td>

                  {/* Signature */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    {ev.signatureVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle size={11} />
                        Invalid
                      </span>
                    )}
                  </td>

                  {/* Duplicate Guard */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    {ev.duplicateStatus === 'Duplicate Discarded' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Duplicate Discarded
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Original
                      </span>
                    )}
                  </td>

                  {/* Result */}
                  <td className="py-3 px-4 whitespace-nowrap text-center font-medium">
                    {ev.processingResult === 'Processed' ? (
                      <span className="text-emerald-700 font-semibold">Processed</span>
                    ) : ev.processingResult === 'Discarded' ? (
                      <span className="text-amber-700 font-semibold">Discarded</span>
                    ) : (
                      <span className="text-slate-600">{ev.processingResult}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
