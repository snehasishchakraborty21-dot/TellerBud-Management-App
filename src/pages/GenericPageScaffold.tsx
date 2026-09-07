import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GenericPageScaffoldProps {
  title: string;
}

export const GenericPageScaffold: React.FC<GenericPageScaffoldProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0D788B] transition-colors"
        >
          <ArrowLeft size={14} />
          Return to Dashboard
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 min-h-[360px] flex items-center justify-center shadow-sm">
        <h2 className="text-base font-medium text-gray-400 select-none">
          {title}
        </h2>
      </div>
    </div>
  );
};
