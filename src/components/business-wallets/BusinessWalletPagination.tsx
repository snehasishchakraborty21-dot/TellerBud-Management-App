import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BusinessWalletPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (newSize: number) => void;
}

export const BusinessWalletPagination: React.FC<BusinessWalletPaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3 bg-white border border-gray-200/90 rounded-xl mt-3 text-xs text-slate-600 shadow-xs">
      {/* Left: Showing counter */}
      <div className="flex items-center gap-2">
        <span>
          Showing{' '}
          <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> business wallets
        </span>
      </div>

      {/* Right: Items per page + Navigation */}
      <div className="flex items-center gap-4">
        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 bg-slate-50 border border-gray-200 rounded text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1 rounded border border-gray-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="px-2 font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1 rounded border border-gray-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
