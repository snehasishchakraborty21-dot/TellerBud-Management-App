import React from 'react';
import { Lock } from 'lucide-react';

export const LockedBadge: React.FC<{ label?: string }> = ({ label = 'System Controlled' }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 shrink-0 select-none">
      <Lock className="w-3 h-3 text-gray-500" />
      <span>{label}</span>
    </span>
  );
};
