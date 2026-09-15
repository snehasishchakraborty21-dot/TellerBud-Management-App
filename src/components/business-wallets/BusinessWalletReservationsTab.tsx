import React, { useState, useMemo } from 'react';
import {
  Lock,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Unlock,
} from 'lucide-react';
import { BusinessWalletReservation } from '../../types/businessWallet';
import { formatZMW } from '../../data/mockBusinessWalletData';

interface BusinessWalletReservationsTabProps {
  reservations: BusinessWalletReservation[];
}

export const BusinessWalletReservationsTab: React.FC<BusinessWalletReservationsTabProps> = ({
  reservations,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Released' | 'Completed'>('ALL');

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesSearch =
        searchTerm === '' ||
        r.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.allocatedTo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, statusFilter]);

  const totalActiveReserved = reservations
    .filter((r) => r.status === 'Active')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header Summary & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#102025] flex items-center gap-2">
            <Lock size={16} className="text-amber-600" />
            Wallet Reservations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active reservations hold funds from Available Balance until settlement or release.
          </p>
        </div>

        <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200/70 flex items-center gap-2 shrink-0">
          <span className="text-xs text-amber-800 font-medium">Currently Reserved:</span>
          <span className="text-sm font-bold font-mono text-amber-800">
            {formatZMW(totalActiveReserved)}
          </span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative w-full max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reservation reference, purpose..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter size={13} />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D93AA]"
          >
            <option value="ALL">All Statuses ({reservations.length})</option>
            <option value="Active">Active Holds</option>
            <option value="Released">Released</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="overflow-x-auto border border-gray-200/80 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-gray-200 text-slate-600 font-semibold">
              <th className="py-2.5 px-3.5 whitespace-nowrap">Reservation Reference</th>
              <th className="py-2.5 px-3.5">Purpose & Allocation</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Allocated Target</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap text-right">Reserved Amount</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Created Date</th>
              <th className="py-2.5 px-3.5 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No reservations found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredReservations.map((res) => {
                const isActive = res.status === 'Active';
                const isReleased = res.status === 'Released';
                const isCompleted = res.status === 'Completed';

                return (
                  <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {res.reference}
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-800">
                      {res.purpose}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      {res.allocatedTo}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap text-amber-700">
                      {formatZMW(res.amount)}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">
                      {res.createdAt}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isActive
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isReleased
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isActive && <Lock size={10} />}
                        {isReleased && <Unlock size={10} />}
                        {isCompleted && <CheckCircle2 size={10} />}
                        {res.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
