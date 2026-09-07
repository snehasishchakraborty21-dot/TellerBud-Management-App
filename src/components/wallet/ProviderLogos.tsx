import React from 'react';

export const MtnLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div
    className={`${className} rounded-lg bg-[#FFCC00] flex items-center justify-center font-black text-slate-900 shadow-xs select-none shrink-0 border border-amber-300/60`}
    title="MTN Mobile Money"
    aria-label="MTN Mobile Money"
  >
    <div className="text-center leading-none">
      <div className="w-6 h-3.5 rounded-full border-[1.5px] border-slate-900 flex items-center justify-center mx-auto">
        <span className="text-[7.5px] font-black tracking-tight text-slate-950 font-sans">MTN</span>
      </div>
      <span className="text-[6.5px] font-extrabold tracking-tight text-slate-900 block mt-0.5 font-sans">MoMo</span>
    </div>
  </div>
);

export const AirtelLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div
    className={`${className} rounded-lg bg-[#E60000] flex items-center justify-center font-black text-white shadow-xs select-none shrink-0 border border-red-700/60`}
    title="Airtel Money"
    aria-label="Airtel Money"
  >
    <div className="text-center leading-none">
      <span className="text-[10px] font-black lowercase tracking-tighter text-white font-sans block">airtel</span>
      <span className="text-[6.5px] font-bold uppercase tracking-wider text-red-100 block mt-0.5">money</span>
    </div>
  </div>
);
