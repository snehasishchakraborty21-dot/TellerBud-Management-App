import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CashFloatPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const CashFloatPagination: React.FC<CashFloatPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <span>
          Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
          <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span> requests
        </span>
        <div className="hidden sm:flex items-center gap-1.5 ml-4 pl-4 border-l border-gray-200">
          <label htmlFor="cash-float-page-size" className="text-gray-500 text-[11px]">
            Per page:
          </label>
          <select
            id="cash-float-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Items per page"
            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            aria-current={currentPage === pageNum ? 'page' : undefined}
            aria-label={`Page ${pageNum}`}
            className={`min-w-[30px] h-7 px-2 rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 cursor-pointer ${
              currentPage === pageNum
                ? 'bg-[#0D93AA] text-white'
                : 'hover:bg-gray-50 text-gray-700 border border-transparent'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
