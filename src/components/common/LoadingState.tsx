import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Verifying authentication...',
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 select-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-[#0D93AA]/20 border-t-[#0D93AA] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {message}
        </span>
      </div>
    </div>
  );
};
