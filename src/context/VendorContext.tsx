import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  VendorRecord,
  VendorDetailData,
  VendorFilters,
  VendorSortField,
  SortDirection,
  VendorChangeHistoryEntry,
  EligibilityChangeLogEntry,
  SupportedService,
} from '../types/vendor';
import { MOCK_VENDOR_RECORDS } from '../data/mockVendorData';
import { MOCK_VENDOR_DETAILS_MAP } from '../data/mockVendorDetailData';

const INITIAL_ELIGIBILITY_AUDIT_LOG: EligibilityChangeLogEntry[] = [
  {
    id: 'ELIG-AUD-001',
    vendorId: 'TB-VND-ACS-008',
    vendorName: 'Access Bank',
    vendorLogo: '/assets/vendors/access.svg',
    service: 'Walk-In Transaction',
    previousStatus: 'Disabled',
    newStatus: 'Enabled',
    changedBy: 'Sililo Lubinda',
    dateTime: '10 Sep 2026, 14:20 CAT',
  },
  {
    id: 'ELIG-AUD-002',
    vendorId: 'TB-VND-IND-006',
    vendorName: 'INDO Zambia Bank',
    vendorLogo: '/assets/vendors/indo.svg',
    service: 'Cash Pickup',
    previousStatus: 'Disabled',
    newStatus: 'Enabled',
    changedBy: 'Sililo Lubinda',
    dateTime: '08 Sep 2026, 11:15 CAT',
  },
  {
    id: 'ELIG-AUD-003',
    vendorId: 'TB-VND-ZNC-004',
    vendorName: 'Zanaco',
    vendorLogo: '/assets/vendors/zanaco.svg',
    service: 'Walk-In Transaction',
    previousStatus: 'Disabled',
    newStatus: 'Enabled',
    changedBy: 'System Integration',
    dateTime: '04 Sep 2026, 09:30 CAT',
  },
  {
    id: 'ELIG-AUD-004',
    vendorId: 'TB-VND-ATL-002',
    vendorName: 'Airtel Money',
    vendorLogo: '/assets/vendors/airtel.svg',
    service: 'Wallet Funding',
    previousStatus: 'Disabled',
    newStatus: 'Enabled',
    changedBy: 'Sililo Lubinda',
    dateTime: '28 Aug 2026, 16:45 CAT',
  },
  {
    id: 'ELIG-AUD-005',
    vendorId: 'TB-VND-MTN-001',
    vendorName: 'MTN Mobile Money',
    vendorLogo: '/assets/vendors/mtn.svg',
    service: 'Customer Withdrawal',
    previousStatus: 'Disabled',
    newStatus: 'Enabled',
    changedBy: 'Sililo Lubinda',
    dateTime: '15 Aug 2026, 10:00 CAT',
  },
];

interface VendorContextType {
  // Vendor data
  vendors: VendorRecord[];
  getVendor: (idOrName: string) => VendorDetailData | undefined;
  updateVendor: (
    id: string,
    updates: Partial<VendorDetailData>,
    changeNote?:
      | { event: string; previousValue: string; newValue: string }
      | Array<{ event: string; previousValue: string; newValue: string }>
  ) => void;
  toggleVendorStatus: (id: string, targetStatus?: 'Active' | 'Inactive') => void;
  archiveVendor: (id: string) => void;
  deleteVendor: (id: string) => boolean;
  addNewVendor: (newVendor: VendorRecord) => void;

  // Eligibility audit log & batch updater
  eligibilityAuditLog: EligibilityChangeLogEntry[];
  saveEligibilityBatch: (
    updates: Array<{
      vendorId: string;
      services: SupportedService[];
      changeNotes: Array<{ event: string; previousValue: string; newValue: string }>;
    }>,
    auditEntries: EligibilityChangeLogEntry[]
  ) => void;

  // Preserved list state for Vendors page
  filters: VendorFilters;
  setFilters: React.Dispatch<React.SetStateAction<VendorFilters>>;
  sortField: VendorSortField;
  setSortField: React.Dispatch<React.SetStateAction<VendorSortField>>;
  sortDirection: SortDirection;
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  scrollPosition: number;
  setScrollPosition: (pos: number) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: VendorFilters = {
  search: '',
  type: 'All',
  status: 'All',
  service: 'All',
};

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<VendorRecord[]>(MOCK_VENDOR_RECORDS);
  const [vendorDetails, setVendorDetails] = useState<Record<string, VendorDetailData>>(
    MOCK_VENDOR_DETAILS_MAP
  );

  // Preserved state for VendorsPage
  const [filters, setFilters] = useState<VendorFilters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<VendorSortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  const getVendor = useCallback(
    (idOrName: string): VendorDetailData | undefined => {
      if (!idOrName) return undefined;
      const cleanId = idOrName.trim().toLowerCase();

      // Check direct ID or case-insensitive match
      const directMatch = Object.values(vendorDetails).find(
        (v) =>
          v.id.toLowerCase() === cleanId ||
          v.name.toLowerCase() === cleanId
      );
      if (directMatch) return directMatch;

      // Check in base vendors list as fallback
      const baseMatch = vendors.find(
        (v) =>
          v.id.toLowerCase() === cleanId ||
          v.name.toLowerCase() === cleanId
      );
      if (baseMatch) {
        // Build fallback detail from base match if not in map
        return {
          ...baseMatch,
          country: 'Zambia',
          currency: 'ZMW',
          addedDate: '10 Jan 2024',
          updatedBy: 'System Administrator',
          serviceEligibilities: baseMatch.services.map((s) => ({
            name: s,
            enabled: true,
          })),
          isApiConnected: baseMatch.type === 'Mobile Money',
          connectionStatus: baseMatch.status === 'Active' ? 'Operational' : 'Offline',
          minTransactionAmount: 20.0,
          maxTransactionAmount: 25000.0,
          reservationChargeEligibility:
            'Eligible for Cash Pickup only (ZMW 50.00 standard reservation fee)',
          settlementMethod: 'Real-Time Gross Settlement (RTGS)',
          reconciliationEnabled: true,
          reconciliationSchedule: 'Daily automated ledger matching at 23:59 CAT',
          automaticCallbackVerification: true,
          configurationStatus: 'Verified & Active',
          recentActivities: [],
          changeHistory: [],
        };
      }

      return undefined;
    },
    [vendorDetails, vendors]
  );

  const updateVendor = useCallback(
    (
      id: string,
      updates: Partial<VendorDetailData>,
      changeNote?:
        | { event: string; previousValue: string; newValue: string }
        | Array<{ event: string; previousValue: string; newValue: string }>
    ) => {
      const nowFormatted = 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Update detail map
      setVendorDetails((prev) => {
        const existing = prev[id];
        if (!existing) return prev;

        const newChangeHistory: VendorChangeHistoryEntry[] = [...existing.changeHistory];
        if (changeNote) {
          const notesArray = Array.isArray(changeNote) ? changeNote : [changeNote];
          notesArray.forEach((note, idx) => {
            newChangeHistory.unshift({
              id: `CHG-${Date.now()}-${idx}`,
              event: note.event,
              previousValue: note.previousValue,
              newValue: note.newValue,
              changedBy: 'Super Admin (Current User)',
              dateTime: nowFormatted,
            });
          });
        }

        const updated: VendorDetailData = {
          ...existing,
          ...updates,
          lastUpdated: nowFormatted,
          lastUpdatedTimestamp: Date.now(),
          changeHistory: newChangeHistory,
        };

        return {
          ...prev,
          [id]: updated,
        };
      });

      // Also update base vendor record in table list
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id === id) {
            return {
              ...v,
              name: updates.name ?? v.name,
              type: updates.type ?? v.type,
              services: updates.services ?? v.services,
              integrationMode: updates.integrationMode ?? v.integrationMode,
              status: updates.status ?? v.status,
              lastUpdated: nowFormatted,
              lastUpdatedTimestamp: Date.now(),
            };
          }
          return v;
        })
      );
    },
    []
  );

  const toggleVendorStatus = useCallback(
    (id: string, targetStatus?: 'Active' | 'Inactive') => {
      setVendorDetails((prev) => {
        const existing = prev[id];
        if (!existing) return prev;

        const newStatus = targetStatus ?? (existing.status === 'Active' ? 'Inactive' : 'Active');
        const nowFormatted = 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const historyEntry: VendorChangeHistoryEntry = {
          id: `CHG-STAT-${Date.now()}`,
          event: newStatus === 'Active' ? 'Vendor activated' : 'Vendor deactivated',
          previousValue: `Status: ${existing.status}`,
          newValue: `Status: ${newStatus}`,
          changedBy: 'Super Admin (Current User)',
          dateTime: nowFormatted,
        };

        const updated: VendorDetailData = {
          ...existing,
          status: newStatus,
          connectionStatus: newStatus === 'Active' ? 'Operational' : 'Offline',
          lastUpdated: nowFormatted,
          lastUpdatedTimestamp: Date.now(),
          changeHistory: [historyEntry, ...existing.changeHistory],
        };

        return {
          ...prev,
          [id]: updated,
        };
      });

      // Update in vendors array
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id === id) {
            const nextStatus = targetStatus ?? (v.status === 'Active' ? 'Inactive' : 'Active');
            return {
              ...v,
              status: nextStatus,
              lastUpdated: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              lastUpdatedTimestamp: Date.now(),
            };
          }
          return v;
        })
      );
    },
    []
  );

  const archiveVendor = useCallback((id: string) => {
    const nowFormatted = 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setVendorDetails((prev) => {
      const existing = prev[id];
      if (!existing) return prev;

      const historyEntry: VendorChangeHistoryEntry = {
        id: `CHG-ARCH-${Date.now()}`,
        event: 'Vendor archived',
        previousValue: `Status: ${existing.status}`,
        newValue: 'Status: Archived',
        changedBy: 'Super Admin (Current User)',
        dateTime: nowFormatted,
      };

      return {
        ...prev,
        [id]: {
          ...existing,
          status: 'Archived',
          connectionStatus: 'Offline',
          lastUpdated: nowFormatted,
          lastUpdatedTimestamp: Date.now(),
          changeHistory: [historyEntry, ...existing.changeHistory],
        },
      };
    });

    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            status: 'Archived',
            lastUpdated: nowFormatted,
            lastUpdatedTimestamp: Date.now(),
          };
        }
        return v;
      })
    );
  }, []);

  const deleteVendor = useCallback((id: string): boolean => {
    setVendorDetails((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setVendors((prev) => prev.filter((v) => v.id !== id));
    return true;
  }, []);

  const addNewVendor = useCallback((newVendor: VendorRecord) => {
    setVendors((prev) => [newVendor, ...prev]);
    // Also add to vendorDetails map
    setVendorDetails((prev) => ({
      ...prev,
      [newVendor.id]: {
        ...newVendor,
        country: 'Zambia',
        currency: 'ZMW',
        addedDate: 'Today',
        updatedBy: 'Super Admin (Current User)',
        serviceEligibilities: newVendor.services.map((s) => ({
          name: s,
          enabled: true,
          notes: 'Configured during initial setup',
        })),
        isApiConnected: newVendor.type === 'Mobile Money',
        connectionStatus: newVendor.status === 'Active' ? 'Operational' : 'Offline',
        minTransactionAmount: 20.0,
        maxTransactionAmount: 25000.0,
        reservationChargeEligibility:
          'Eligible for Cash Pickup only (ZMW 50.00 standard reservation fee)',
        settlementMethod: 'Real-Time Gross Settlement (RTGS)',
        reconciliationEnabled: true,
        reconciliationSchedule: 'Daily automated ledger matching at 23:59 CAT',
        automaticCallbackVerification: true,
        configurationStatus: 'Verified & Active',
        recentActivities: [
          {
            id: `ACT-NEW-${Date.now()}`,
            event: 'Vendor Initial Setup Completed',
            service: 'System Governance',
            reference: `REG-${newVendor.id}`,
            status: 'Completed',
            dateTime: 'Today, Just now',
          },
        ],
        changeHistory: [
          {
            id: `CHG-NEW-${Date.now()}`,
            event: 'Vendor Created',
            previousValue: 'None',
            newValue: `Status: ${newVendor.status}`,
            changedBy: 'Super Admin (Current User)',
            dateTime: 'Today, Just now',
          },
        ],
      },
    }));
  }, []);

  const [eligibilityAuditLog, setEligibilityAuditLog] = useState<EligibilityChangeLogEntry[]>(
    INITIAL_ELIGIBILITY_AUDIT_LOG
  );

  const saveEligibilityBatch = useCallback(
    (
      updates: Array<{
        vendorId: string;
        services: SupportedService[];
        changeNotes: Array<{ event: string; previousValue: string; newValue: string }>;
      }>,
      auditEntries: EligibilityChangeLogEntry[]
    ) => {
      const nowFormatted = 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // 1. Update vendor details map
      setVendorDetails((prev) => {
        const next = { ...prev };
        updates.forEach((u) => {
          const existing = next[u.vendorId];
          if (!existing) return;

          const updatedEligibilities = existing.serviceEligibilities.map((se) => ({
            ...se,
            enabled: u.services.includes(se.name as SupportedService),
          }));

          const newChangeHistory: VendorChangeHistoryEntry[] = [...existing.changeHistory];
          u.changeNotes.forEach((note, idx) => {
            newChangeHistory.unshift({
              id: `CHG-ELIG-${Date.now()}-${idx}-${u.vendorId}`,
              event: note.event,
              previousValue: note.previousValue,
              newValue: note.newValue,
              changedBy: 'Super Admin (Current User)',
              dateTime: nowFormatted,
            });
          });

          next[u.vendorId] = {
            ...existing,
            services: u.services,
            serviceEligibilities: updatedEligibilities,
            lastUpdated: nowFormatted,
            lastUpdatedTimestamp: Date.now(),
            changeHistory: newChangeHistory,
          };
        });
        return next;
      });

      // 2. Update base vendors table list
      setVendors((prev) =>
        prev.map((v) => {
          const match = updates.find((u) => u.vendorId === v.id);
          if (match) {
            return {
              ...v,
              services: match.services,
              lastUpdated: nowFormatted,
              lastUpdatedTimestamp: Date.now(),
            };
          }
          return v;
        })
      );

      // 3. Prepend audit log entries
      if (auditEntries.length > 0) {
        setEligibilityAuditLog((prev) => [...auditEntries, ...prev]);
      }
    },
    []
  );

  return (
    <VendorContext.Provider
      value={{
        vendors,
        getVendor,
        updateVendor,
        toggleVendorStatus,
        archiveVendor,
        deleteVendor,
        addNewVendor,
        eligibilityAuditLog,
        saveEligibilityBatch,
        filters,
        setFilters,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        currentPage,
        setCurrentPage,
        scrollPosition,
        setScrollPosition,
        resetFilters,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};

export const useVendor = (): VendorContextType => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
};
