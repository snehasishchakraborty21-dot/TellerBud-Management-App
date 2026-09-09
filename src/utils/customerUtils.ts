/**
 * Utility functions for Zambian phone masking and customer helpers.
 */

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
