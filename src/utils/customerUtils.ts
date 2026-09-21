/**
 * Utility functions for Zambian phone masking and customer helpers.
 */

/**
 * Formats a Zambian phone number into standard international display format:
 * +260 XX XXX XXXX
 * Examples:
 * "+260971239012" -> "+260 97 123 9012"
 * "0971239012" -> "+260 97 123 9012"
 * "+260 97 123 9012" -> "+260 97 123 9012"
 */
export const formatZambianPhone = (phone?: string | null): string => {
  if (!phone || typeof phone !== 'string') return '—';
  const clean = phone.trim();
  if (!clean || clean === '—' || clean === '-') return '—';

  const digits = clean.replace(/\D/g, '');
  if (!digits) return '—';

  // Determine the 9-digit local subscriber number (without leading 0 or country code 260)
  let localDigits = '';
  if (digits.startsWith('260')) {
    localDigits = digits.slice(3);
  } else if (digits.startsWith('0')) {
    localDigits = digits.slice(1);
  } else {
    localDigits = digits;
  }

  // If localDigits has 9 or more digits (standard Zambian mobile length e.g. 97XXXXXXX)
  if (localDigits.length >= 9) {
    const subscriber = localDigits.slice(0, 9);
    const p1 = subscriber.slice(0, 2);
    const p2 = subscriber.slice(2, 5);
    const p3 = subscriber.slice(5, 9);
    return `+260 ${p1} ${p2} ${p3}`;
  }

  return clean.startsWith('+260') ? clean : `+260 ${clean.replace(/^0/, '')}`;
};

/**
 * Partially masks Zambian mobile numbers for table display.
 * Example: "+260 97 778 9012" -> "+260 97 *** 9012"
 */
export const maskZambianPhone = (phone?: string): string => {
  if (!phone) return '—';
  const clean = phone.trim();

  // Pattern: +260 XX XXX XXXX
  const parts = clean.split(/\s+/);
  if (parts.length >= 4 && parts[0].startsWith('+260')) {
    return `${parts[0]} ${parts[1]} *** ${parts[3]}`;
  }

  // General fallback by digits
  const digits = clean.replace(/\D/g, '');
  if (digits.length >= 9) {
    const last4 = digits.slice(-4);
    const prefix2 = digits.startsWith('260')
      ? digits.slice(3, 5)
      : digits.slice(0, 2);
    return `+260 ${prefix2} *** ${last4}`;
  }

  return clean;
};

/**
 * Generates consistent 2-letter initials from full name.
 */
export const getInitials = (name: string): string => {
  if (!name) return 'CU';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};
