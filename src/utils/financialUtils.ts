import { MobileMoneyTransaction, MobileMoneyKPIPeriods } from '../types/mobileMoney';
import { getLusakaDateString, getLusakaPeriodBoundaries } from './dateUtils';

/**
 * Format currency into Zambian Kwacha (ZMW) format with two decimal places.
 * Example: ZMW 27,950.00
 */
export function formatZMW(amount: number): string {
  const safeVal = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `ZMW ${safeVal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export { formatZmwListingAmount } from './formatters';


/**
 * Calculates the exact 80% / 20% split of an approved Service Fee.
 * Uses integer cents arithmetic to guarantee no floating-point precision issues.
 * The 80% and 20% portions will mathematically sum to exactly the complete Service Fee.
 */
export function calculateServiceFeeSplit(serviceFee: number): {
  serviceEarnings: number;
  tellerBudShare: number;
} {
  const feeCents = Math.round((serviceFee || 0) * 100);
  const earningsCents = Math.round(feeCents * 0.8);
  const shareCents = feeCents - earningsCents;

  return {
    serviceEarnings: earningsCents / 100,
    tellerBudShare: shareCents / 100,
  };
}

/**
 * Calculates the primary KPI values for a given set of Mobile Money transactions:
 * 1. Total Transactions: record count of eligible items matching filters.
 * 2. Total Amount: sum of principal Transaction Amount values for completed & financially valid transactions.
 * 3. Service Earnings: exactly 80% of approved Service Fees collected from completed transactions.
 *
 * Rules:
 * - Cancelled and failed records do not contribute financially.
 * - Pending transactions do not create realized earnings.
 * - Do not include Service Fees or Customer Total in Total Amount.
 * - Uses precise integer cents arithmetic.
 */
export function calculateMobileMoneyKPIs(transactions: MobileMoneyTransaction[]): {
  totalTransactions: number;
  totalAmount: number;
  serviceEarnings: number;
} {
  let principalCents = 0;
  let serviceEarningsCents = 0;

  for (const t of transactions) {
    // Only completed, financially valid transactions contribute to Total Amount and Service Earnings
    if (t.status === 'Completed') {
      const principal = Math.round((t.amount || 0) * 100);
      principalCents += principal;

      const feeCents = Math.round((t.reservationCharge || 0) * 100);
      serviceEarningsCents += Math.round(feeCents * 0.8);
    }
  }

  return {
    totalTransactions: transactions.length,
    totalAmount: principalCents / 100,
    serviceEarnings: serviceEarningsCents / 100,
  };
}

/**
 * Calculates the fixed 5-card Mobile Money KPI period transaction counts:
 * 1. Today's Transactions: Total transactions created today (Africa/Lusaka CAT).
 * 2. Week to Date: Total transactions from Monday through current day (CAT).
 * 3. Month to Date: Total transactions from 1st day of current month through today (CAT).
 * 4. Year to Date: Total transactions from 1 January through today (CAT).
 *
 * Scope:
 * - Platform-wide for TellerBud Admin (when businessScope is undefined or 'ALL')
 * - Strictly isolated to the business and linked agents for Business Owner.
 */
export function calculateMobileMoneyPeriodKPIs(
  transactions: MobileMoneyTransaction[],
  businessScope?: string,
  targetDate?: string
): MobileMoneyKPIPeriods {
  let scoped = transactions;

  if (businessScope && businessScope !== 'ALL') {
    const scopeLower = businessScope.toLowerCase().trim();
    scoped = transactions.filter(
      (t) =>
        t.businessName.toLowerCase().trim() === scopeLower ||
        t.businessId.toLowerCase().trim() === scopeLower
    );
  }

  const { todayLusaka, mondayLusaka, monthStartLusaka, yearStartLusaka } =
    getLusakaPeriodBoundaries(targetDate);

  let todayCount = 0;
  let weekToDateCount = 0;
  let monthToDateCount = 0;
  let yearToDateCount = 0;

  for (const t of scoped) {
    const tDate = getLusakaDateString(t.postedAt);
    if (!tDate) continue;

    // Today's / Selected Date's Transactions
    if (tDate === todayLusaka) {
      todayCount++;
    }

    // Week to Date: Monday through selected date
    if (tDate >= mondayLusaka && tDate <= todayLusaka) {
      weekToDateCount++;
    }

    // Month to Date: 1st day of month through selected date
    if (tDate >= monthStartLusaka && tDate <= todayLusaka) {
      monthToDateCount++;
    }

    // Year to Date: 1 January through selected date
    if (tDate >= yearStartLusaka && tDate <= todayLusaka) {
      yearToDateCount++;
    }
  }

  return {
    todayCount,
    weekToDateCount,
    monthToDateCount,
    yearToDateCount,
  };
}
