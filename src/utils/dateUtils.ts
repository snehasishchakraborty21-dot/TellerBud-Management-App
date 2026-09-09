/**
 * Date utilities for TellerBud Mobile Money Transactions.
 * Standardizes Africa/Lusaka local time and formatting.
 */

/**
 * Returns today's date string in YYYY-MM-DD format for Africa/Lusaka.
 * Dynamically calculated from system time.
 */
export function getZambiaTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
