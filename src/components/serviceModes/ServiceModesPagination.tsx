import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ServiceModesPaginationProps {
  totalCount: number;
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  rowsPerPage?: number;
}

export const ServiceModesPagination: React.FC<ServiceModesPaginationProps> = ({
  totalCount,
  filteredCount,
  currentPage,
  totalPages,
  rowsPerPage = 10,
}) => {
  const startItem = filteredCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, filteredCount);

  return (
    <div
      id="service-modes-pagination"
      className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none"
    >
      {/* Showing count */}
      <div className="font-medium text-slate-700">
        Showing{' '}
        <span className="font-semibold text-slate-900">
          {startItem} to {endItem}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-slate-900">
          {filteredCount}
        </span>{' '}
        service modes
        {filteredCount !== totalCount && (
          <span className="text-slate-400 ml-1">
            (filtered from {totalCount} total)
          </span>
        )}
      </div>

      {/* Rows per page & Page info */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Rows per page:</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
            {rowsPerPage}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">
            Page <strong className="font-semibold text-slate-800">{currentPage}</strong> of{' '}
            <strong className="font-semibold text-slate-800">{totalPages}</strong>
          </span>

          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50/50 p-0.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
