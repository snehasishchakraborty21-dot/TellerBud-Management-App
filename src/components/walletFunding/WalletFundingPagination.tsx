import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WalletFundingPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export const WalletFundingPagination: React.FC<WalletFundingPaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2 text-xs text-slate-700">
      {/* Summary text */}
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> funding attempts
        </span>

        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-slate-300">|</span>
          <label htmlFor="fundingPerPage" className="text-slate-600 font-medium">
            Per page:
          </label>
          <select
            id="fundingPerPage"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          title="Go to previous page"
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
                title={`Go to page ${page}`}
                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 transition-colors ${
                  currentPage === page
                    ? 'bg-[#0D93AA] text-white font-semibold'
                    : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA]'
                }`}
              >
                {page}
              </button>
            );
          }
          if (page === currentPage - 2 || page === currentPage + 2) {
            return (
              <span key={page} className="px-1 text-slate-500 font-bold" aria-hidden="true">
                •••
              </span>
            );
          }
          return null;
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          title="Go to next page"
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#0D93AA] focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};
