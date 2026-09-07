import React from 'react';
import { FinancialActivityRecord } from '../../types/admin';
import { formatZMW } from '../../config/appConfig';
import { StatusChip } from '../shared/StatusChip';
import { ArrowDownLeft, ArrowUpRight, PlusCircle, Building2 } from 'lucide-react';
import { formatWithdrawalDate } from '../../utils/formatters';

interface RecentFinancialActivityProps {
  records: FinancialActivityRecord[];
  onViewRecord?: (record: FinancialActivityRecord) => void;
}

export const RecentFinancialActivitySection: React.FC<RecentFinancialActivityProps> = ({
  records,
  onViewRecord,
}) => {
  const getTypeIcon = (type: string) => {
    if (type.includes('Add Funds')) {
      return <PlusCircle size={15} className="text-[#0D93AA]" />;
    }
    if (type.includes('Withdrawal')) {
      return <ArrowUpRight size={15} className="text-amber-600" />;
    }
    if (type.includes('Wallet Funding')) {
      return <Building2 size={15} className="text-sky-600" />;
    }
    return <ArrowDownLeft size={15} className="text-gray-400" />;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-base text-[#102025]">
          Recent Financial Activity
        </h2>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          RECENT ACTIVITY
        </span>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-50">
        {records.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewRecord?.(item)}
            className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          >
            {/* Left side: Reference & Details */}
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                {getTypeIcon(item.type)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-gray-900">
                    {item.reference}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                    {item.vendor}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                  <span className="font-medium text-gray-700">{item.relatedEntity}</span>
                  <span>({item.entityRole})</span>
                  <span>•</span>
                  <span className="font-mono">{formatWithdrawalDate(item.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Right side: Amount & Status */}
            <div className="flex items-center justify-between sm:justify-end gap-3.5 pl-11 sm:pl-0">
              <div className="text-left sm:text-right">
                <span className="font-mono text-sm font-semibold text-gray-900">
                  {formatZMW(item.amount)}
                </span>
              </div>
              <StatusChip status={item.status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
