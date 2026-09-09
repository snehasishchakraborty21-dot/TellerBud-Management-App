import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomerWalletPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export const CustomerWalletPagination: React.FC<CustomerWalletPaginationProps> = ({
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2 text-xs text-slate-600">
      {/* Summary text */}
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-semibold text-[#102025]">{startItem}</span> to{' '}
          <span className="font-semibold text-[#102025]">{endItem}</span> of{' '}
          <span className="font-semibold text-[#102025]">{totalItems}</span> customer wallets
        </span>

        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-slate-400">|</span>
          <label htmlFor="walletsPerPage" className="text-slate-500">
            Per page:
          </label>
          <select
            id="walletsPerPage"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Display current, first, last, and immediate neighbors
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
                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-[#0D93AA] text-white font-semibold'
                    : 'bg-white border border-gray-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            );
          }
          if (page === currentPage - 2 || page === currentPage + 2) {
            return (
              <span key={page} className="px-1 text-slate-400">
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
          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};
