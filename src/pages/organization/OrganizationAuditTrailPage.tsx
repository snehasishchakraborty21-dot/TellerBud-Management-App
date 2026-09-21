import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  FileSpreadsheet,
  Building2,
  Calendar,
  ShieldCheck,
  UserCheck,
  Scale,
  Smartphone,
  Store,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { organizationService } from '../../services/organizationService';
import { OrganizationAuditLog } from '../../types/organization';

export const OrganizationAuditTrailPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [auditLogs, setAuditLogs] = useState<OrganizationAuditLog[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('All');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<'All' | 'Today' | '7Days' | '30Days'>('All');

  const loadData = () => {
    if (!currentUser) return;
    setAuditLogs(organizationService.getAuditLogs(currentUser));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = organizationService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Filtering
  const now = new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  const filteredLogs = auditLogs.filter((log) => {
    if (entityTypeFilter !== 'All' && log.entityType !== entityTypeFilter) return false;
    if (eventTypeFilter !== 'All' && log.eventType !== eventTypeFilter) return false;

    if (dateRangeFilter === 'Today') {
      const logDate = new Date(log.createdAt).setHours(0, 0, 0, 0);
      const todayDate = new Date().setHours(0, 0, 0, 0);
      if (logDate !== todayDate) return false;
    } else if (dateRangeFilter === '7Days') {
      const diff = now - new Date(log.createdAt).getTime();
      if (diff > 7 * oneDay) return false;
    } else if (dateRangeFilter === '30Days') {
      const diff = now - new Date(log.createdAt).getTime();
      if (diff > 30 * oneDay) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchActor = log.actorName.toLowerCase().includes(q);
      const matchEntity = log.entityType.toLowerCase().includes(q);
      const matchAction = (log.affectedName || log.eventType).toLowerCase().includes(q);
      const matchReason = (log.reason || '').toLowerCase().includes(q);
      const matchRef = (log.auditReference || '').toLowerCase().includes(q);
      const matchId = log.entityId.toLowerCase().includes(q);
      if (!matchActor && !matchEntity && !matchAction && !matchReason && !matchRef && !matchId) {
        return false;
      }
    }

    return true;
  });

  // Export to CSV
  const exportAuditCSV = () => {
    const headers = [
      'Audit Ref',
      'Timestamp',
      'Actor Name',
      'Actor Role',
      'Entity Type',
      'Event Type',
      'Affected ID',
      'Action Description',
      'Reason / Justification',
      'Store Context',
      'Booth Context',
    ];

    const rows = filteredLogs.map((l) => [
      l.auditReference,
      new Date(l.createdAt).toLocaleString(),
      `"${l.actorName}"`,
      l.actorRole,
      l.entityType,
      l.eventType,
      `"${l.entityId}"`,
      `"${(l.affectedName || l.eventType).replace(/"/g, '""')}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      `"${l.storeName || ''}"`,
      `"${l.boothName || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TellerBud_Organization_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'Store':
        return <Store className="w-4 h-4 text-emerald-600" />;
      case 'Booth':
        return <Layers className="w-4 h-4 text-teal-600" />;
      case 'StaffAssignment':
        return <UserCheck className="w-4 h-4 text-cyan-600" />;
      case 'User':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'Passcode':
        return <KeyRound className="w-4 h-4 text-amber-600" />;
      case 'BalanceAdjustment':
        return <Scale className="w-4 h-4 text-purple-600" />;
      case 'Device':
        return <Smartphone className="w-4 h-4 text-indigo-600" />;
      default:
        return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <History className="w-3.5 h-3.5" />
            <span>Organization Management</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Compliance & Forensics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Organization Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Immutable log of all administrative actions, staff assignments, hardware allocations, and float adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportAuditCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* Security & Immutability Badge */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="text-xs text-emerald-950">
            <span className="font-bold">Cryptographically Anchored Audit Log</span>
            <span className="text-emerald-800 ml-1.5">
              All management mutations are permanently recorded with authenticated actor metadata, previous vs new values, and mandatory reasons.
            </span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md font-semibold whitespace-nowrap">
          TENANT: BIZ-LUS-001
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-audit"
              type="text"
              placeholder="Search reference, actor, entity, reason, action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              id="select-entitytype-filter"
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Entities</option>
              <option value="Store">Store</option>
              <option value="Booth">Booth</option>
              <option value="StaffAssignment">Staff Assignment</option>
              <option value="User">User</option>
              <option value="Passcode">Passcode</option>
              <option value="BalanceAdjustment">Balance Adjustment</option>
              <option value="Device">Device</option>
            </select>

            <select
              id="select-eventtype-filter"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Events</option>
              <option value="Created">Created</option>
              <option value="Updated">Updated</option>
              <option value="Archived">Archived</option>
              <option value="Assigned">Assigned</option>
              <option value="Moved">Moved</option>
              <option value="Reset">Reset</option>
              <option value="Reversed">Reversed</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>

            <select
              id="select-daterange-filter"
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="7Days">Past 7 Days</option>
              <option value="30Days">Past 30 Days</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2.5">
          <span>Displaying {filteredLogs.length} verified audit events</span>
          <span className="text-slate-400">Chronological descending sequence</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Audit Ref</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Action & Mutation Details</th>
                <th className="py-3 px-4">Reason / Justification</th>
                <th className="py-3 px-4">Station Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium">No audit events match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">
                      {log.auditReference}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{log.actorName}</div>
                      <span
                        className={`inline-block px-1.5 py-0.2 text-[10px] font-semibold rounded ${
                          log.actorRole === 'business_owner'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {log.actorRole === 'business_owner' ? 'Business Owner' : 'Business Admin'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        {getEntityIcon(log.entityType)}
                        <span>{log.entityType}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {log.entityId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-medium text-slate-900 leading-snug">
                        {log.affectedName || log.eventType}
                      </div>

                      {/* Previous vs New Values */}
                      {(log.previousValue || log.newValue) && (
                        <div className="mt-1 p-2 bg-slate-50 rounded border border-slate-200 text-[10px] space-y-0.5">
                          {log.previousValue && (
                            <div className="flex items-start gap-1 text-slate-600">
                              <span className="font-semibold text-slate-700">Prev:</span>
                              <span className="text-rose-600 font-mono">
                                {log.previousValue}
                              </span>
                            </div>
                          )}
                          {log.newValue && (
                            <div className="flex items-start gap-1 text-slate-600">
                              <span className="font-semibold text-slate-700">New:</span>
                              <span className="text-emerald-700 font-bold font-mono">
                                {log.newValue}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {log.reason ? (
                        <span className="text-slate-700 text-[11px] leading-relaxed block italic">
                          "{log.reason}"
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No notes provided</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-600 whitespace-nowrap">
                      {log.storeName || log.boothName ? (
                        <div>
                          <div className="font-semibold text-slate-800">
                            {log.boothName || 'Store Level'}
                          </div>
                          <div className="text-slate-400">{log.storeName}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Global Agency</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
