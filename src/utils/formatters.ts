/**
 * Formatting utilities for Zambia currency, dates, and phone numbers.
 */

export const formatZMW = (amount?: number | null): string => {
  const safeVal = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `ZMW ${safeVal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats an ISO date string in the Africa/Lusaka timezone (UTC+2) with 12-hour AM/PM.
 * e.g. "31 Aug 2026, 10:51 AM"
 */
export const formatWithdrawalDate = (isoStr: string): string => {
  try {
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return isoStr;

    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lusaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const parts = formatter.formatToParts(date);
    let day = '', month = '', year = '', hour = '', minute = '', dayPeriod = '';
    for (const p of parts) {
      if (p.type === 'day') day = p.value;
      if (p.type === 'month') month = p.value;
      if (p.type === 'year') year = p.value;
      if (p.type === 'hour') hour = p.value;
      if (p.type === 'minute') minute = p.value;
      if (p.type === 'dayPeriod') dayPeriod = p.value.toUpperCase();
    }

    if (!dayPeriod) {
      const hoursNum = parseInt(hour, 10);
      dayPeriod = hoursNum >= 12 ? 'PM' : 'AM';
    }

    return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
  } catch {
    return isoStr;
  }
};

/**
 * Extracts separate date and time parts formatted in Africa/Lusaka timezone with uppercase AM/PM.
 * e.g. datePart: "31 Aug 2026", timePart: "10:51 AM"
 */
export const getWithdrawalDateParts = (isoStr: string): { datePart: string; timePart: string } => {
  try {
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return { datePart: isoStr, timePart: '' };

    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lusaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const parts = formatter.formatToParts(date);
    let day = '', month = '', year = '', hour = '', minute = '', dayPeriod = '';
    for (const p of parts) {
      if (p.type === 'day') day = p.value;
      if (p.type === 'month') month = p.value;
      if (p.type === 'year') year = p.value;
      if (p.type === 'hour') hour = p.value;
      if (p.type === 'minute') minute = p.value;
      if (p.type === 'dayPeriod') dayPeriod = p.value.toUpperCase();
    }

    if (!dayPeriod) {
      const hoursNum = parseInt(hour, 10);
      dayPeriod = hoursNum >= 12 ? 'PM' : 'AM';
    }

    return {
      datePart: `${day} ${month} ${year}`,
      timePart: `${hour}:${minute} ${dayPeriod}`,
    };
  } catch {
    return { datePart: isoStr, timePart: '' };
  }
};

