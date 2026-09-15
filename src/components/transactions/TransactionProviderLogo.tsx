import React from 'react';
import { TransactionProvider } from '../../data/mockAllTransactionsData';
import { BookOpen } from 'lucide-react';

interface TransactionProviderLogoProps {
  provider: TransactionProvider;
  size?: 'sm' | 'table' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const TransactionProviderLogo: React.FC<TransactionProviderLogoProps> = ({
  provider,
  size = 'table',
  showName = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    table: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-9 h-9',
  }[size];

  const renderLogo = () => {
    switch (provider) {
      case 'MTN Mobile Money':
        return (
          <div
            className={`${sizeClasses} rounded-md bg-[#FFCC00] flex items-center justify-center font-black text-slate-900 shadow-2xs select-none shrink-0 border border-amber-300/80`}
            title="MTN Mobile Money"
          >
            <div className="text-center leading-none">
              <div className="w-5 h-2.5 rounded-full border border-slate-900 flex items-center justify-center mx-auto">
                <span className="text-[6.5px] font-black tracking-tight text-slate-950 font-sans">MTN</span>
              </div>
              <span className="text-[5.5px] font-extrabold tracking-tight text-slate-900 block mt-0.5 font-sans">MoMo</span>
            </div>
          </div>
        );

      case 'Airtel Money':
        return (
          <div
            className={`${sizeClasses} rounded-md bg-[#E60000] flex items-center justify-center font-black text-white shadow-2xs select-none shrink-0 border border-red-700/60`}
            title="Airtel Money"
          >
            <div className="text-center leading-none">
              <span className="text-[7.5px] font-black lowercase tracking-tighter text-white font-sans block">airtel</span>
              <span className="text-[5px] font-bold uppercase tracking-wider text-red-100 block mt-0.5">money</span>
            </div>
          </div>
        );

      case 'TellerBud Ledger':
        return (
          <div
            className={`${sizeClasses} rounded-md bg-[#0D93AA]/10 border border-[#0D93AA]/30 flex items-center justify-center text-[#0D93AA] shrink-0 shadow-2xs`}
            title="TellerBud Internal Ledger"
          >
            <BookOpen size={14} className="stroke-[2.5]" />
          </div>
        );

      case 'Zanaco':
        return (
          <div className={`${sizeClasses} rounded-md bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 shadow-2xs`}>
            <img src="/assets/vendors/zanaco.svg" alt="Zanaco" className="w-full h-full object-contain" />
          </div>
        );

      case 'Zamtel':
        return (
          <div className={`${sizeClasses} rounded-md bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 shadow-2xs`}>
            <img src="/assets/vendors/zamtel.svg" alt="Zamtel" className="w-full h-full object-contain" />
          </div>
        );

      case 'FNB':
        return (
          <div className={`${sizeClasses} rounded-md bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 shadow-2xs`}>
            <img src="/assets/vendors/fnb.svg" alt="FNB" className="w-full h-full object-contain" />
          </div>
        );

      case 'Stanbic':
        return (
          <div className={`${sizeClasses} rounded-md bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 shadow-2xs`}>
            <img src="/assets/vendors/stanbic.svg" alt="Stanbic" className="w-full h-full object-contain" />
          </div>
        );

      case 'INDO':
        return (
          <div className={`${sizeClasses} rounded-md bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 shadow-2xs`}>
            <img src="/assets/vendors/indo.svg" alt="INDO" className="w-full h-full object-contain" />
          </div>
        );

      case 'Access':
        return (
          <div className={`${sizeClasses} rounded-md bg-white border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0 shadow-2xs`}>
            <img src="/assets/vendors/access.svg" alt="Access" className="w-full h-full object-contain" />
          </div>
        );

      default:
        return (
          <div className={`${sizeClasses} rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] shrink-0`}>
            {String(provider).slice(0, 3).toUpperCase()}
          </div>
        );
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {renderLogo()}
      {showName && (
        <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">
          {provider}
        </span>
      )}
    </div>
  );
};
