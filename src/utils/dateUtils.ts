/**
 * Date utilities for TellerBud Mobile Money Transactions.
 * Standardizes Africa/Lusaka local time and formatting.
 */

/**
 * Returns a date string in YYYY-MM-DD format for Africa/Lusaka (CAT, UTC+2) time zone.
 */
export function getLusakaDateString(date: Date | string | number = new Date()): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lusaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Returns today's date string in YYYY-MM-DD format for Africa/Lusaka.
 * Dynamically calculated from system time.
 */
export function getZambiaTodayString(): string {
  return getLusakaDateString(new Date());
}

/**
 * Returns the KPI period boundaries (Selected Date / Today, Week to Date Monday, Month to Date 1st, Year to Date 1 Jan)
 * calculated strictly in the Africa/Lusaka (CAT) time zone.
 * If targetDate is provided, that date is used as the reference end date.
 */
export function getLusakaPeriodBoundaries(targetDate: Date | string = new Date()) {
  let targetIso = '';
  if (typeof targetDate === 'string') {
    targetIso = isValidDateString(targetDate) ? targetDate : getZambiaTodayString();
  } else {
    targetIso = getLusakaDateString(targetDate);
  }

  const [y, m, d] = targetIso.split('-').map(Number);

  // Day of week calculation: UTC representation of Lusaka date
  const targetUtc = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = targetUtc.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const mondayUtc = new Date(Date.UTC(y, m - 1, d - daysSinceMonday));
  const mondayLusaka = mondayUtc.toISOString().slice(0, 10);

  const monthStartLusaka = `${y}-${String(m).padStart(2, '0')}-01`;
  const yearStartLusaka = `${y}-01-01`;

  return {
    todayLusaka: targetIso,
    mondayLusaka,
    monthStartLusaka,
    yearStartLusaka,
  };
}

/**
 * Validates if a date string is in YYYY-MM-DD format, is a real calendar date,
 * and does not represent a future date.
 */
export function isValidDateString(dateStr: string | null | undefined): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(Date.UTC(year, month - 1, day));
  if (
    dateObj.getUTCFullYear() !== year ||
    dateObj.getUTCMonth() !== month - 1 ||
    dateObj.getUTCDate() !== day
  ) {
    return false;
  }

  // Reject future dates
  const todayStr = getZambiaTodayString();
  if (dateStr > todayStr) {
    return false;
  }

  return true;
}

/**
 * Safely sanitizes a date string or URL query parameter.
 * Returns the valid date or defaults to today's date.
 */
export function sanitizeDateParam(param: string | null | undefined): string {
  if (isValidDateString(param)) {
    return param!;
  }
  return getZambiaTodayString();
}

/**
 * Formats a YYYY-MM-DD date string for display.
 * When today is selected: "Today, DD Month YYYY" (e.g. "Today, 08 September 2026")
 * When historical date is selected: "DD Month YYYY" (e.g. "07 September 2026")
 */
export function formatHeaderDate(dateStr: string): string {
  const todayStr = getZambiaTodayString();
  const isToday = dateStr === todayStr;

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));

  const day = String(d).padStart(2, '0');
  const month = dateObj.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
  const year = y;

  const formatted = `${day} ${month} ${year}`;
  return isToday ? `Today, ${formatted}` : formatted;
}

/**
 * Checks if a given date string is today.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getZambiaTodayString();
}

/**
 * Converts a YYYY-MM-DD ISO string to DD-MM-YYYY display format.
 */
export function toDisplayDate(isoStr?: string | null): string {
  if (!isoStr) return '';
  const match = isoStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/**
 * Converts a DD-MM-YYYY display string to YYYY-MM-DD ISO format.
 */
export function toISODate(displayStr?: string | null): string {
  if (!displayStr) return '';
  const clean = displayStr.trim();
  const match = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (!match) return '';
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3];
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string for the Business Owner interactive top header.
 * - When today is selected: "Today, 15 September 2026"
 * - When a historical date is selected: "Tuesday, 08 September 2026" (weekday name + DD Month YYYY)
 */
export function formatBusinessOwnerHeaderDate(dateStr: string): string {
  if (!dateStr || !isValidDateString(dateStr)) {
    dateStr = getZambiaTodayString();
  }
  const todayStr = getZambiaTodayString();
  const isToday = dateStr === todayStr;

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));

  const day = String(d).padStart(2, '0');
  const month = dateObj.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
  const year = y;
  const weekday = dateObj.toLocaleString('en-GB', { weekday: 'long', timeZone: 'UTC' });

  if (isToday) {
    return `Today, ${day} ${month} ${year}`;
  }
  return `${weekday}, ${day} ${month} ${year}`;
}

/**
 * Determines whether the Business Owner top header should display the interactive date selector
 * on the current route.
 * Excluded: Agents, Business Profile, Notifications, configuration, and detailed record views.
 * Included: Dashboard, Live Operations, Cash/Float Requests, Agent Liquidity, Mobile Money Transactions,
 * Attendance & End-of-Day, Global Wallet, Wallet Ledger, All Transactions, Charges & Commissions, etc.
 */
export function isBusinessOwnerDatePage(pathname: string): boolean {
  if (!pathname.includes('/business-owner')) {
    return false;
  }

  // Explicitly excluded pages
  const excludedPatterns = [
    '/agents',
    '/people/agents',
    '/business-profile',
    '/people/business-profile',
    '/profile',
    '/notifications',
    '/communication/notifications',
    '/communication/chat-report',
    '/chat-report',
    '/settings',
    '/configuration',
  ];

  for (const pattern of excludedPatterns) {
    if (pathname.includes(pattern)) {
      return false;
    }
  }

  // Exclude single-record detail routes where picking a date is not applicable
  if (
    pathname.match(/\/mobile-money-transactions\/[^/]+$/) ||
    pathname.match(/\/cash-float-requests\/[^/]+$/) ||
    pathname.match(/\/agent-to-agent-liquidity\/[^/]+$/) ||
    pathname.match(/\/attendance-end-of-day\/[^/]+\/[^/]+/) ||
    pathname.match(/\/people\/attendance\/[^/]+\/[^/]+/) ||
    pathname.match(/\/transactions\/all\/[^/]+$/) ||
    pathname.match(/\/transactions\/commissions\/[^/]+$/) ||
    pathname.match(/\/charges-commissions\/[^/]+$/)
  ) {
    return false;
  }

  // Date-dependent operational pages
  const includedPatterns = [
    '/business-owner/dashboard',
    '/business-owner/operations/live',
    '/business-owner/live',
    '/business-owner/operations/cash-float-requests',
    '/business-owner/cash-float-requests',
    '/business-owner/operations/agent-to-agent-liquidity',
    '/business-owner/agent-to-agent-liquidity',
    '/business-owner/mobile-money-transactions',
    '/business-owner/attendance-end-of-day',
    '/business-owner/people/attendance',
    '/business-owner/wallets/global-wallet',
    '/business-owner/global-wallet',
    '/business-owner/wallets/ledger',
    '/business-owner/ledger',
    '/business-owner/transactions/all',
    '/business-owner/transactions',
    '/business-owner/transactions/commissions',
    '/business-owner/charges-commissions',
    '/business-owner/charges-revenue',
    '/business-owner/transactions/charges-revenue',
  ];

  // Also include exact root '/business-owner'
  if (pathname === '/business-owner' || pathname === '/business-owner/') {
    return true;
  }

  return includedPatterns.some((pattern) => pathname.startsWith(pattern));
}
