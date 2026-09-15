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
 * Returns the fixed KPI period boundaries (Today, Week to Date Monday, Month to Date 1st, Year to Date 1 Jan)
 * calculated strictly in the Africa/Lusaka (CAT) time zone.
 */
export function getLusakaPeriodBoundaries(currentDate: Date = new Date()) {
  const todayLusaka = getLusakaDateString(currentDate);
  const [y, m, d] = todayLusaka.split('-').map(Number);

  // Day of week calculation: UTC representation of Lusaka date
  const todayUtc = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = todayUtc.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const mondayUtc = new Date(Date.UTC(y, m - 1, d - daysSinceMonday));
  const mondayLusaka = mondayUtc.toISOString().slice(0, 10);

  const monthStartLusaka = `${y}-${String(m).padStart(2, '0')}-01`;
  const yearStartLusaka = `${y}-01-01`;

  return {
    todayLusaka,
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
