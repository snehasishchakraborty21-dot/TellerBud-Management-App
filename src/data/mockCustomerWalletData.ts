import {
  CustomerWalletRecord,
  CustomerWalletSummary,
  CustomerWalletFilters,
  CustomerWalletSortField,
  CustomerWalletSortDirection,
} from '../types/customerWallet';
import { MOCK_REGISTERED_CUSTOMERS } from './mockCustomerData';
import { MOCK_CUSTOMER_WITHDRAWALS } from './mockWithdrawalData';

/**
 * Maps raw Zambian phone into masked format: e.g. "+260 96 223 5588" -> "+260 96 ••• 5588"
 */
function maskZambianPhone(phone: string): string {
  const parts = phone.trim().split(/\s+/);
  if (parts.length >= 4) {
    return `${parts[0]} ${parts[1]} ••• ${parts[3]}`;
  }
  // Fallback regex masking
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ••• ${digits.slice(-4)}`;
  }
  return phone;
}

/**
 * Builds the canonical list of Customer Wallets
 * Reuses existing TellerBud customer records and withdrawals, strictly enforcing the Reservation Rule:
 *
 * RESERVATION RULE:
 * For every Customer withdrawal in:
 * - Pending Review
 * - Approved
 * - Processing
 * There must be an active reservation equal to the complete withdrawal amount.
 *
 * If the wallet also has Customer-request holds:
 * Total Reserved Funds = Withdrawal Reservations + Customer Request Reservations + Other Valid Active Reservations
 *
 * Therefore:
 * - Reserved Funds must never be lower than the total active pending withdrawal amount.
 * - Available Balance = Posted Ledger Balance − Total Reserved Funds.
 * - Available Balance must never be negative.
 * - Total Reserved Funds must never exceed Posted Ledger Balance.
 */
function buildCustomerWallets(): CustomerWalletRecord[] {
  return MOCK_REGISTERED_CUSTOMERS.map((customer) => {
    const idNum = parseInt(customer.id.replace(/\D/g, ''), 10) || 1000;
    const walletId = `TB-WAL-${idNum}`;
    const walletBalance = customer.walletBalance;

    // 1. Look up all active pending withdrawals for this customer
    // Active withdrawal statuses: 'Pending Review', 'Approved', 'Processing'
    const activeWithdrawals = MOCK_CUSTOMER_WITHDRAWALS.filter(
      (w) =>
        w.customerName.toLowerCase() === customer.name.toLowerCase() &&
        (w.status === 'Pending Review' || w.status === 'Approved' || w.status === 'Processing')
    );

    const pendingWithdrawalAmount =
      activeWithdrawals.length > 0
        ? activeWithdrawals.reduce((sum, w) => sum + w.amount, 0)
        : null;
    const pendingWithdrawalReference =
      activeWithdrawals.length > 0 ? activeWithdrawals[0].reference : undefined;

    // 2. Derive Withdrawal Reservation:
    // For every active withdrawal, there must be an active reservation equal to the complete withdrawal amount
    const withdrawalReservation = pendingWithdrawalAmount || 0;

    // 3. Derive Customer-Request Holds (Customer Pickup Request pre-authorizations):
    let customerRequestReservation = 0;
    if (customer.id === 'TB-CUS-1052') {
      // Mwamba Mulenga: approved values
      // Posted Ledger Balance: ZMW 18,450.00
      // Available Balance: ZMW 15,950.00
      // Reserved Funds: ZMW 2,500.00
      // Active pending withdrawal is ZMW 2,250.00 (TB-WDR-8807), remaining ZMW 250.00 is Customer Pickup Request TB-REQ-1052
      customerRequestReservation = 250.0;
    } else if (customer.id === 'TB-CUS-1021') {
      // Bupe Chileshe: approved values
      // Posted Ledger Balance: ZMW 4,300.00
      // Available Balance: ZMW 3,655.00
      // Reserved Funds: ZMW 645.00 (Customer Pickup Request TB-REQ-1021 hold)
      // Pending withdrawal: None
      customerRequestReservation = 645.0;
    } else if (customer.activeRequestsCount > 0 && withdrawalReservation === 0) {
      // Other customer pickup requests (never exceeding wallet balance)
      customerRequestReservation = Math.min(2500.0, Math.round(walletBalance * 0.10 * 100) / 100);
    }

    // 4. Total Reserved Funds = Withdrawal Reservations + Customer Request Reservations + Other Valid Active Reservations
    // Must never exceed Posted Ledger Balance
    const calculatedReserved = withdrawalReservation + customerRequestReservation;
    const reservedFunds = Math.min(walletBalance, Math.round(calculatedReserved * 100) / 100);

    // 5. Available Balance = Posted Ledger Balance − Total Reserved Funds (never negative)
    const availableBalance = Math.max(0, Math.round((walletBalance - reservedFunds) * 100) / 100);

    // 6. Derive Wallet Health:
    // If an existing inconsistency remains or unsettled callback exists, classify as 'Review Required'.
    // Do NOT label an inconsistent wallet 'Funds Reserved'.
    let walletHealth: CustomerWalletRecord['walletHealth'] = 'Healthy';
    let reviewReason: string | undefined = undefined;

    const isReservedLowerThanWithdrawal =
      pendingWithdrawalAmount !== null && reservedFunds < pendingWithdrawalAmount;

    if (customer.id === 'TB-CUS-1015') {
      // Brian Lungu: provider switch callback discrepancy
      walletHealth = 'Review Required';
      reviewReason =
        'Unsettled provider callback: MTN MoMo payment gateway timed out during settlement check.';
    } else if (isReservedLowerThanWithdrawal) {
      walletHealth = 'Review Required';
      reviewReason = `Reservation inconsistency: active pending withdrawal exceeds reserved funds.`;
    } else if (reservedFunds > 0) {
      walletHealth = 'Funds Reserved';
    } else {
      walletHealth = 'Healthy';
    }

    return {
      walletId,
      customerId: customer.id,
      customerName: customer.name,
      customerInitials: customer.avatarInitials,
      customerPhone: customer.phone,
      customerPhoneMasked: maskZambianPhone(customer.phone),
      walletBalance,
      availableBalance,
      reservedFunds,
      pendingWithdrawalAmount,
      pendingWithdrawalReference,
      walletHealth,
      walletState: customer.accountStatus,
      hasActiveReservation: reservedFunds > 0,
      lastUpdated: customer.lastActivity,
      lastUpdatedTimestamp: customer.lastActivityTimestamp,
      reviewReason,
      city: customer.city,
    };
  });
}

export const MOCK_CUSTOMER_WALLETS: CustomerWalletRecord[] = buildCustomerWallets();

/**
 * Calculates compact KPI metrics derived from the same wallet dataset
 * Guaranteed: Total Available Balance + Total Reserved Funds === Total Wallet Balance
 */
export function calculateCustomerWalletSummary(
  wallets: CustomerWalletRecord[]
): CustomerWalletSummary {
  const totalWallets = wallets.length;
  let totalWalletBalance = 0;
  let totalAvailableBalance = 0;
  let totalReservedFunds = 0;
  let walletsNeedingReview = 0;

  for (const w of wallets) {
    totalWalletBalance += w.walletBalance;
    totalAvailableBalance += w.availableBalance;
    totalReservedFunds += w.reservedFunds;
    if (w.walletHealth === 'Review Required') {
      walletsNeedingReview += 1;
    }
  }

  return {
    totalWallets,
    totalWalletBalance: Math.round(totalWalletBalance * 100) / 100,
    totalAvailableBalance: Math.round(totalAvailableBalance * 100) / 100,
    totalReservedFunds: Math.round(totalReservedFunds * 100) / 100,
    walletsNeedingReview,
  };
}

/**
 * Formats monetary amounts in standard Zambian Kwacha: ZMW 4,300.00
 */
export function formatZMW(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '—';
  }
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `ZMW ${formatted}`;
}

/**
 * Filters and sorts customer wallets
 */
export function filterAndSortCustomerWallets(
  wallets: CustomerWalletRecord[],
  filters: CustomerWalletFilters,
  sort: { field: CustomerWalletSortField; direction: CustomerWalletSortDirection }
): CustomerWalletRecord[] {
  let result = [...wallets];

  // 1. KPI Filter
  if (filters.kpiFilter === 'RESERVED') {
    result = result.filter((w) => w.reservedFunds > 0);
  } else if (filters.kpiFilter === 'REVIEW') {
    result = result.filter((w) => w.walletHealth === 'Review Required');
  } else if (filters.kpiFilter === 'AVAILABLE') {
    result = result.filter((w) => w.availableBalance > 0);
  }

  // 2. Search
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    const qClean = q.replace(/[\s+•-]/g, '');

    result = result.filter((w) => {
      const matchName = w.customerName.toLowerCase().includes(q);
      const matchCusId = w.customerId.toLowerCase().includes(q);
      const matchWalletId = w.walletId.toLowerCase().includes(q);
      const phoneClean = w.customerPhone.replace(/[\s+•-]/g, '');
      const maskedClean = w.customerPhoneMasked.replace(/[\s+•-]/g, '');
      const matchPhone =
        (qClean.length > 2 && (phoneClean.includes(qClean) || maskedClean.includes(qClean))) ||
        w.customerPhone.toLowerCase().includes(q) ||
        w.customerPhoneMasked.toLowerCase().includes(q);

      return matchName || matchCusId || matchWalletId || matchPhone;
    });
  }

  // 3. Wallet State
  if (filters.walletState && filters.walletState !== 'ALL') {
    result = result.filter((w) => w.walletState === filters.walletState);
  }

  // 4. Reservation State
  if (filters.reservationState === 'RESERVED') {
    result = result.filter((w) => w.reservedFunds > 0);
  } else if (filters.reservationState === 'NONE') {
    result = result.filter((w) => w.reservedFunds === 0);
  }

  // 5. Balance Range
  if (filters.balanceRange && filters.balanceRange !== 'ALL') {
    switch (filters.balanceRange) {
      case 'UNDER_5K':
        result = result.filter((w) => w.walletBalance < 5000);
        break;
      case '5K_15K':
        result = result.filter((w) => w.walletBalance >= 5000 && w.walletBalance <= 15000);
        break;
      case '15K_30K':
        result = result.filter((w) => w.walletBalance > 15000 && w.walletBalance <= 30000);
        break;
      case 'OVER_30K':
        result = result.filter((w) => w.walletBalance > 30000);
        break;
    }
  }

  // 6. Updated From date (YYYY-MM-DD)
  if (filters.updatedFrom) {
    const fromDate = new Date(filters.updatedFrom).getTime();
    result = result.filter((w) => {
      const itemDate = new Date(w.lastUpdatedTimestamp).getTime();
      return !isNaN(fromDate) && !isNaN(itemDate) && itemDate >= fromDate;
    });
  }

  // 7. Updated To date (YYYY-MM-DD)
  if (filters.updatedTo) {
    const toDate = new Date(`${filters.updatedTo}T23:59:59.999Z`).getTime();
    result = result.filter((w) => {
      const itemDate = new Date(w.lastUpdatedTimestamp).getTime();
      return !isNaN(toDate) && !isNaN(itemDate) && itemDate <= toDate;
    });
  }

  // Sorting
  result.sort((a, b) => {
    let comparison = 0;
    switch (sort.field) {
      case 'customer':
        comparison = a.customerName.localeCompare(b.customerName);
        break;
      case 'walletBalance':
        comparison = a.walletBalance - b.walletBalance;
        break;
      case 'availableBalance':
        comparison = a.availableBalance - b.availableBalance;
        break;
      case 'reservedFunds':
        comparison = a.reservedFunds - b.reservedFunds;
        break;
      case 'pendingWithdrawal':
        comparison = (a.pendingWithdrawalAmount || 0) - (b.pendingWithdrawalAmount || 0);
        break;
      case 'lastUpdated':
        comparison =
          new Date(a.lastUpdatedTimestamp).getTime() - new Date(b.lastUpdatedTimestamp).getTime();
        break;
      default:
        comparison = 0;
    }
    return sort.direction === 'asc' ? comparison : -comparison;
  });

  return result;
}

/**
 * Retrieves a customer wallet by wallet ID or customer ID
 */
export function getCustomerWalletById(idOrWalletId: string): CustomerWalletRecord | undefined {
  const clean = idOrWalletId.trim().toUpperCase();
  return MOCK_CUSTOMER_WALLETS.find(
    (w) => w.walletId.toUpperCase() === clean || w.customerId.toUpperCase() === clean
  );
}
