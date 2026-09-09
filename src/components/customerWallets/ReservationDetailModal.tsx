import React from 'react';
import { X, Lock, CheckCircle2, RotateCcw, Clock, ShieldCheck } from 'lucide-react';
import { CustomerWalletReservation } from '../../types/customerWallet';
import { formatZMW } from '../../data/mockCustomerWalletData';

interface ReservationDetailModalProps {
  reservation: CustomerWalletReservation | null;
  onClose: () => void;
}

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  reservation,
  onClose,
}) => {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#102025]">
                  Reservation Details
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    reservation.status === 'Active'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : reservation.status === 'Consumed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {reservation.status === 'Active' && <Lock size={10} />}
                  {reservation.status === 'Consumed' && <CheckCircle2 size={10} />}
                  {reservation.status === 'Released' && <RotateCcw size={10} />}
                  {reservation.status}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Ref: <span className="font-semibold text-slate-800">{reservation.reference}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Amount Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-gray-200/70">
              <span className="text-slate-400 block mb-1 font-medium">Original Amount</span>
              <span className="font-bold text-slate-900 text-base">
                {formatZMW(reservation.originalAmount)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
              <span className="text-amber-800 block mb-1 font-medium">Remaining Hold</span>
              <span className="font-bold text-amber-700 text-base">
                {formatZMW(reservation.remainingAmount)}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-slate-500 font-medium">Reservation Type</span>
              <span className="font-semibold text-slate-800">{reservation.reservationType}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-slate-500 font-medium">Related Reference</span>
              <span className="font-mono font-semibold text-slate-800">{reservation.relatedReference}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-slate-500 font-medium">Created Date & Time</span>
              <span className="font-mono text-slate-700">{reservation.createdAt}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-slate-500 font-medium">Released or Consumed At</span>
              <span className="font-mono text-slate-700">{reservation.releasedOrConsumedAt || '— (Still Active)'}</span>
            </div>
          </div>

          {/* Notes */}
          {reservation.notes && (
            <div className="p-3 rounded-xl bg-slate-50 border border-gray-100 space-y-1">
              <span className="text-slate-400 font-medium block">Pre-Authorization Context</span>
              <p className="text-slate-700 leading-relaxed">{reservation.notes}</p>
            </div>
          )}

          {/* Read only note */}
          <div className="p-3 rounded-lg bg-slate-100/70 border border-slate-200/60 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate-500 shrink-0" />
            <span>
              Reservations are managed atomically by customer order processing. Manual modification is restricted.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200/80 text-slate-700 hover:bg-slate-300/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
