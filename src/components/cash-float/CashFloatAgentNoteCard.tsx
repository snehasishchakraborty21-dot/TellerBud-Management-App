import React from 'react';
import { MessageSquareText } from 'lucide-react';

interface CashFloatAgentNoteCardProps {
  note?: string;
}

export const CashFloatAgentNoteCard: React.FC<CashFloatAgentNoteCardProps> = ({ note }) => {
  if (!note) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <MessageSquareText className="w-4 h-4 text-[#0D93AA]" />
        <h2 className="text-sm font-bold text-[#102025]">Agent Note</h2>
      </div>

      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed bg-gray-50/70 p-3.5 rounded-lg border border-gray-100">
        {note}
      </p>
    </div>
  );
};
