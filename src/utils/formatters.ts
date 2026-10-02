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
 * Formats an amount value for table listings across Admin and Business Owner portals.
 * Displays comma thousands separators and two decimals without the currency prefix (e.g. "8,000.00").
 * Returns "—" for null/undefined/empty/NaN values.
 */
export function formatZmwListingAmount(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-ZM", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Automatically formats Zambian NRC number progressively into canonical format:
 * ######/##/# (e.g. 123456/00/1)
 *
 * Progressive input:
 * - 1 -> 1
 * - 123456 -> 123456
 * - 1234560 -> 123456/0
 * - 12345600 -> 123456/00
 * - 123456001 -> 123456/00/1
 */
export function formatZambianNrc(input: string | null | undefined): string {
  if (!input) return '';
  const digits = String(input).replace(/\D/g, '').slice(0, 9);
  if (digits.length === 0) return '';
  if (digits.length <= 6) {
    return digits;
  }
  if (digits.length <= 8) {
    return `${digits.slice(0, 6)}/${digits.slice(6)}`;
  }
  return `${digits.slice(0, 6)}/${digits.slice(6, 8)}/${digits.slice(8, 9)}`;
}

/**
 * Strips all non-digit characters and returns up to 9 normalized digits (e.g. 123456001).
 */
export function normalizeNrcDigits(input: string | null | undefined): string {
  if (!input) return '';
  return String(input).replace(/\D/g, '').slice(0, 9);
}

/**
 * Validates whether the NRC has exactly 9 digits matching ######/##/#.
 */
export function isValidZambianNrc(input: string | null | undefined): boolean {
  if (!input) return false;
  const digits = normalizeNrcDigits(input);
  return digits.length === 9 && /^\d{6}\/\d{2}\/\d$/.test(input.trim());
}

/**
 * Masks an NRC number for general listings (e.g. 123*** / ** / 1).
 */
export function maskZambianNrc(input: string | null | undefined): string {
  if (!input) return '—';
  const formatted = formatZambianNrc(input);
  if (formatted.length < 11) return formatted;
  return `${formatted.slice(0, 3)}***/${formatted.slice(7, 9)}/${formatted.slice(10)}`;
}



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

/**
 * Formats a Zambian mobile number as "+260 XX XXX XXXX", e.g. "+260 96 123 9900"
 * Never masks, truncates, or replaces digits with asterisks.
 */
/**
 * Formats any Customer ID to the exact standard format: TB-CUS-000000 (6 digits with leading zeros).
 * e.g. "TB-CUS-1021" -> "TB-CUS-001021"
 * e.g. "TB-CUS-1040" -> "TB-CUS-001040"
 * e.g. "TB-CUS-1" -> "TB-CUS-000001"
 * e.g. 1021 -> "TB-CUS-001021"
 */
export function formatCustomerId(id: string | number | null | undefined, fallbackSeq?: number): string {
  if (!id && fallbackSeq !== undefined) {
    return `TB-CUS-${String(fallbackSeq).padStart(6, '0')}`;
  }
  if (!id) return fallbackSeq !== undefined ? `TB-CUS-${String(fallbackSeq).padStart(6, '0')}` : '';
  const strId = String(id).trim();
  if (!strId) return fallbackSeq !== undefined ? `TB-CUS-${String(fallbackSeq).padStart(6, '0')}` : '';

  const match = strId.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `TB-CUS-${String(num).padStart(6, '0')}`;
  }

  if (fallbackSeq !== undefined) {
    return `TB-CUS-${String(fallbackSeq).padStart(6, '0')}`;
  }
  return strId;
}

/**
 * Formats any Withdrawal reference/ID to the exact standard format: TB-WDL-000000 (6 digits with leading zeros).
 * e.g. "TB-WDR-8812" -> "TB-WDL-008812"
 * e.g. "TB-WDL-8812" -> "TB-WDL-008812"
 * e.g. "8812" -> "TB-WDL-008812"
 */
export function formatWithdrawalId(id: string | number | null | undefined, fallbackSeq?: number): string {
  if (!id && fallbackSeq !== undefined) {
    return `TB-WDL-${String(fallbackSeq).padStart(6, '0')}`;
  }
  if (!id) return fallbackSeq !== undefined ? `TB-WDL-${String(fallbackSeq).padStart(6, '0')}` : '';
  const strId = String(id).trim();
  if (!strId) return fallbackSeq !== undefined ? `TB-WDL-${String(fallbackSeq).padStart(6, '0')}` : '';

  const match = strId.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `TB-WDL-${String(num).padStart(6, '0')}`;
  }

  if (fallbackSeq !== undefined) {
    return `TB-WDL-${String(fallbackSeq).padStart(6, '0')}`;
  }
  return strId;
}

/**
 * Formats any Business Wallet ID to the exact standard format: TB-BWL-000000 (6 digits with leading zeros).
 * e.g. "TB-BWL-1002" -> "TB-BWL-000001" (Copperbelt Financial Services)
 * e.g. "TB-BWL-1007" -> "TB-BWL-000002" (Lusaka Central Express Agency)
 * e.g. "TB-BWL-1005" -> "TB-BWL-000003" (Kabwe Central Agency)
 * e.g. "TB-BWL-1004" -> "TB-BWL-000004" (Kabwata Market Agency)
 * e.g. "TB-BWL-1003" -> "TB-BWL-000005" (Copperbelt Liquidity Hub)
 * e.g. "TB-BWL-1008" -> "TB-BWL-000006" (Ndola Copperbelt Agency)
 * e.g. "TB-BWL-1006" -> "TB-BWL-000007" (Livingstone Tourist Kiosk Agency)
 * e.g. "TB-BWL-1001" -> "TB-BWL-000008" (Chipata Eastern Financial Agency)
 */
export function formatBusinessWalletId(id: string | number | null | undefined, fallbackSeq?: number): string {
  if (!id && fallbackSeq !== undefined) {
    return `TB-BWL-${String(fallbackSeq).padStart(6, '0')}`;
  }
  if (!id) return fallbackSeq !== undefined ? `TB-BWL-${String(fallbackSeq).padStart(6, '0')}` : '';
  const strId = String(id).trim();
  if (!strId) return fallbackSeq !== undefined ? `TB-BWL-${String(fallbackSeq).padStart(6, '0')}` : '';

  const OLD_TO_NEW_BWL_MAP: Record<string, string> = {
    'TB-BWL-1002': 'TB-BWL-000001',
    'TB-BWL-1007': 'TB-BWL-000002',
    'TB-BWL-1005': 'TB-BWL-000003',
    'TB-BWL-1004': 'TB-BWL-000004',
    'TB-BWL-1003': 'TB-BWL-000005',
    'TB-BWL-1008': 'TB-BWL-000006',
    'TB-BWL-1006': 'TB-BWL-000007',
    'TB-BWL-1001': 'TB-BWL-000008',
  };

  if (OLD_TO_NEW_BWL_MAP[strId]) {
    return OLD_TO_NEW_BWL_MAP[strId];
  }

  // If already matches TB-BWL-000000 with 6 digits
  if (/^TB-BWL-\d{6}$/.test(strId)) {
    return strId;
  }

  const match = strId.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `TB-BWL-${String(num).padStart(6, '0')}`;
  }

  if (fallbackSeq !== undefined) {
    return `TB-BWL-${String(fallbackSeq).padStart(6, '0')}`;
  }
  return strId;
}

/**
 * General helper to format any record ID with an approved 3-letter prefix into TB-[PREFIX]-000000.
 */
export function formatMasterId(
  id: string | number | null | undefined,
  prefix: string,
  fallbackSeq?: number
): string {
  if (!id && fallbackSeq !== undefined) {
    return `TB-${prefix}-${String(fallbackSeq).padStart(6, '0')}`;
  }
  if (!id) return fallbackSeq !== undefined ? `TB-${prefix}-${String(fallbackSeq).padStart(6, '0')}` : '';
  const strId = String(id).trim();
  if (!strId) return fallbackSeq !== undefined ? `TB-${prefix}-${String(fallbackSeq).padStart(6, '0')}` : '';

  // If already exactly matches TB-[PREFIX]-[6 digits]
  if (new RegExp(`^TB-${prefix}-\\d{6}$`).test(strId)) {
    return strId;
  }

  const match = strId.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `TB-${prefix}-${String(num).padStart(6, '0')}`;
  }

  if (fallbackSeq !== undefined) {
    return `TB-${prefix}-${String(fallbackSeq).padStart(6, '0')}`;
  }
  return strId;
}

export function formatBusinessId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'BIZ', fallbackSeq);
}

export function formatBusinessOwnerId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'BOO', fallbackSeq);
}

export function formatAgentId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'AGT', fallbackSeq);
}

export function formatStoreCode(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'STR', fallbackSeq);
}

export function formatBoothCode(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'BTH', fallbackSeq);
}

export function formatDeviceId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'DEV', fallbackSeq);
}

export function formatAdminId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'ADM', fallbackSeq);
}

export function formatAuditorId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'AUD', fallbackSeq);
}

export function formatEmployeeId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'EMP', fallbackSeq);
}

export function formatCustomerRequestId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'REQ', fallbackSeq);
}

export function formatCashFloatRequestId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'CFR', fallbackSeq);
}

export function formatAgentLiquidityId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'AAL', fallbackSeq);
}

export function formatPurchaseTransactionId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'PUR', fallbackSeq);
}

export function formatDepositTransactionId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'DEP', fallbackSeq);
}

export function formatFundingTransactionId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'FND', fallbackSeq);
}

export function formatCommissionTransactionId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'CMS', fallbackSeq);
}

export function formatChargeTransactionId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'CHG', fallbackSeq);
}

export function formatAdjustmentTransactionId(id: string | number | null | undefined, fallbackSeq?: number): string {
  return formatMasterId(id, 'ADJ', fallbackSeq);
}

export const formatZambianMobileNumber = (phone?: string | null): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  let nationalDigits = '';
  if (digits.startsWith('260') && digits.length >= 12) {
    nationalDigits = digits.slice(3, 12);
  } else if (digits.startsWith('0') && digits.length >= 10) {
    nationalDigits = digits.slice(1, 10);
  } else if (digits.length >= 9) {
    nationalDigits = digits.slice(0, 9);
  } else {
    return phone;
  }
  const op = nationalDigits.slice(0, 2);
  const part1 = nationalDigits.slice(2, 5);
  const part2 = nationalDigits.slice(5, 9);
  return `+260 ${op} ${part1} ${part2}`;
};

