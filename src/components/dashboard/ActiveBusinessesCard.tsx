import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface BusinessSummaryData {
  total: number;
  active: number;
  pending: number;
  suspended: number;
}

interface ActiveBusinessesCardProps {
  data: BusinessSummaryData;
  onSelectStatus?: (status: string) => void;
}

export const ActiveBusinessesCard: React.FC<ActiveBusinessesCardProps> = ({
  data,
  onSelectStatus,
}) => {
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Total Businesses',
      value: data.total,
      color: 'text-[#102025]',
      status: 'ALL',
      route: '/super-admin/businesses',
    },
    {
      label: 'Active Businesses',
      value: data.active,
      color: 'text-[#0D93AA]',
      status: 'Active',
      route: '/super-admin/businesses',
    },
    {
      label: 'Pending Approval',
      value: data.pending,
      color: 'text-amber-600',
      status: 'Pending',
      route: '/super-admin/businesses',
    },
    {
      label: 'Suspended Businesses',
      value: data.suspended,
      color: 'text-red-600',
      status: 'Suspended',
      route: '/super-admin/businesses',
    },
  ];

  const handleClick = (stat: (typeof stats)[0]) => {
    if (onSelectStatus) {
      onSelectStatus(stat.status);
    } else {
      navigate(stat.route);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-base text-[#102025]">
          Active Businesses
        </h2>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
          {data.total} Total Businesses
        </span>
      </div>

      {/* 2x2 Grid Display */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={() => handleClick(stat)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(stat);
              }
            }}
            className="p-3 bg-gray-50/70 border border-gray-100 rounded-lg hover:bg-white hover:border-[#0D93AA]/30 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-h-[64px]"
          >
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 group-hover:text-[#0D93AA] transition-colors truncate">
              {stat.label}
            </div>
            <div className={`text-xl font-bold font-mono ${stat.color} tracking-tight leading-none`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
