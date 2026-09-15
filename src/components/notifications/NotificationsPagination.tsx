import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NotificationsPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const NotificationsPagination: React.FC<NotificationsPaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      id="notifications-pagination"
      className="bg-white rounded-xl border border-gray-200/80 px-4 py-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 select-none"
    >
      {/* Showing count */}
      <div className="font-medium text-gray-700">
        Showing{' '}
        <span className="font-semibold text-gray-900">
          {startItem} to {endItem}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-gray-900">{totalItems}</span> notifications
      </div>

      {/* Rows per page, Page info, Previous & Next on one aligned row */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-1.5 text-gray-500">
          <span>Rows per page:</span>
          <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/80">
            {pageSize}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-500">
            Page <strong className="font-semibold text-gray-800">{currentPage}</strong> of{' '}
            <strong className="font-semibold text-gray-800">{totalPages}</strong>
          </span>

          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              id="btn-pagination-prev"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed border border-gray-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              id="btn-pagination-next"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed border border-gray-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
