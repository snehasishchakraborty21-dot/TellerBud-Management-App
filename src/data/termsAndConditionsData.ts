/**
 * TellerBud Business Owner Terms & Conditions
 * Version 1.0 Active Legal Document
 */

export interface TermsSection {
  id: number;
  title: string;
  paragraphs?: string[];
  bulletPoints?: string[];
  subparagraphs?: string[];
}

export interface TermsAndConditionsConfig {
  title: string;
  version: string;
  effectiveDate: string;
  intro: string;
  sections: TermsSection[];
  footerTitle: string;
  footerVersion: string;
  acceptanceStatement: string;
}

export interface TermsAcceptanceRecord {
  termsTitle: string;
  version: string;
  effectiveDate: string;
  acceptedAt: string; // ISO string
  acceptedAtFormattedLusaka: string; // Formatted date-time in Africa/Lusaka
  ownerFullName: string;
  ownerId: string;
  businessName: string;
  businessId: string;
  onboardingReference: string;
  executiveId: string;
  executiveName: string;
  timezone: string; // 'Africa/Lusaka'
  ipAddressOrDeviceId?: string;
  status: 'ACCEPTED';
}

export const ACTIVE_TERMS_CONFIG: TermsAndConditionsConfig = {
  title: 'TELLERBUD BUSINESS OWNER TERMS & CONDITIONS',
  version: '1.0',
  effectiveDate: 'To be configured by TellerBud Admin',
  intro:
    'These Terms explain the basic rules for using TellerBud. By registering and accepting these Terms, you agree to use TellerBud properly and responsibly.',
  sections: [
    {
      id: 1,
      title: '1. USING TELLERBUD',
      paragraphs: [
        'TellerBud makes running your mobile-money business easier. It gives you better visibility of your transactions, helps you manage cash and electronic-money float, improves access to liquidity, and helps keep your business services available when you need them.',
        'You agree to provide correct information and to use TellerBud only for lawful business activities.',
        'You are responsible for the activity carried out through your TellerBud account and by your authorised agents.',
      ],
    },
    {
      id: 2,
      title: '2. TELLERBUD FEES',
      paragraphs: ['The current TellerBud charges are:'],
      bulletPoints: [
        'Setup Fee: ZMW 250 once-off when your account is activated.',
        'Monthly Subscription: ZMW 100 per TellerBud device per month.',
        'Transaction Fee: ZMW 0.10 for each recorded transaction.',
        '14-Day Free Trial: The monthly subscription starts after the free trial period.',
        'Pickup & Delivery: Where applicable, a service fee will apply. TellerBud retains its agreed share of the service fee.',
      ],
      subparagraphs: [
        'Other charges may apply to additional TellerBud services and will be communicated before they apply.',
      ],
    },
    {
      id: 3,
      title: '3. TELLERBUD DEVICE',
      paragraphs: [
        'The TellerBud device is provided at ZMW 0 upfront as part of the TellerBud service.',
        'You must:',
      ],
      bulletPoints: [
        'Take good care of the device;',
        'Use it only for authorised TellerBud activities;',
        'Not sell, give away or tamper with the device;',
        'Keep it secure from unauthorised users; and',
        'Report loss, theft or damage as soon as possible.',
      ],
      subparagraphs: [
        'If the device is lost, stolen or damaged due to misuse or negligence, you may be required to pay the applicable device recovery or replacement cost. Where agreed, this amount may be paid over time.',
      ],
    },
    {
      id: 4,
      title: '4. YOUR AGENTS',
      paragraphs: [
        'You are responsible for the agents using TellerBud under your business.',
        'You must ensure that your agents:',
      ],
      bulletPoints: [
        'Use TellerBud correctly;',
        'Keep their access details safe;',
        'Do not share accounts with unauthorised people; and',
        'Report suspicious activity or problems immediately.',
      ],
      subparagraphs: [
        'You remain responsible for your business and agent activities.',
      ],
    },
    {
      id: 5,
      title: '5. TRANSACTIONS',
      paragraphs: [
        'TellerBud records and displays transaction information to help you manage and reconcile your business.',
        'You should regularly check your transactions and report any differences or problems.',
        'Where a transaction involves a mobile-money operator, bank or other third party, that provider’s records and rules may also apply.',
      ],
    },
    {
      id: 6,
      title: '6. CASH PICKUP, DELIVERY & LIQUIDITY',
      paragraphs: [
        'TellerBud may provide or facilitate services such as:',
      ],
      bulletPoints: [
        'Cash Pickup;',
        'Cash Delivery; and',
        'Agent-to-Agent liquidity support.',
      ],
      subparagraphs: [
        'These services may have separate fees and conditions.',
        'Availability is not guaranteed and may depend on location, agent availability, operating hours, security and other factors.',
      ],
    },
    {
      id: 7,
      title: '7. KEEP YOUR ACCOUNT SAFE',
      paragraphs: [
        'Keep your passwords, PINs and other access information private.',
        'Do not give your account or device to unauthorised people.',
        'TellerBud may temporarily block an account, device or transaction if we detect suspicious activity or a security risk.',
      ],
    },
    {
      id: 8,
      title: '8. YOUR INFORMATION',
      paragraphs: [
        'TellerBud may collect and use information needed to provide the service, manage your account, process transactions, provide support and protect the platform.',
        'Your information will be handled in accordance with the TellerBud Privacy Policy and applicable law.',
      ],
    },
    {
      id: 9,
      title: '9. WHEN TELLERBUD MAY SUSPEND YOUR ACCOUNT',
      paragraphs: [
        'TellerBud may suspend or restrict your account or device if:',
      ],
      bulletPoints: [
        'You do not pay applicable fees;',
        'You break these Terms;',
        'Fraud or suspicious activity is detected;',
        'The account or device is being misused;',
        'There is a security risk; or',
        'We are required to do so by law or a relevant authority.',
      ],
    },
    {
      id: 10,
      title: '10. SERVICE AVAILABILITY',
      paragraphs: [
        'TellerBud aims to keep the service available, but temporary interruptions may occur due to maintenance, network problems, power outages, third-party services, technical problems or other circumstances beyond our reasonable control.',
      ],
    },
    {
      id: 11,
      title: '11. ENDING YOUR TELLERBUD ACCOUNT',
      paragraphs: [
        'You may request to close your TellerBud account.',
        'If you close your account, you must still settle any outstanding fees or other amounts owed, including any applicable device recovery cost.',
        'TellerBud may also close or suspend an account where these Terms are seriously or repeatedly broken.',
      ],
    },
    {
      id: 12,
      title: '12. CHANGES TO TELLERBUD',
      paragraphs: [
        'TellerBud may improve, change or add services from time to time.',
        'We may also change our fees or these Terms. Where a significant change affects you, we will provide reasonable notice.',
      ],
    },
    {
      id: 13,
      title: '13. AGREEMENT',
      paragraphs: [
        'By selecting “I Agree”, you confirm that:',
      ],
      bulletPoints: [
        'You have read and understood these Terms;',
        'You agree to use TellerBud responsibly;',
        'You understand the applicable fees;',
        'You accept responsibility for your TellerBud account, agents and device; and',
        'You agree to follow these Terms.',
      ],
    },
  ],
  footerTitle: 'TellerBud Business Owner Terms & Conditions',
  footerVersion: '1.0',
  acceptanceStatement:
    'I confirm that I have read and understood the TellerBud Business Owner Terms & Conditions, including the applicable fees, device responsibilities and account obligations. I agree to be bound by Version 1.0 of these Terms.',
};

/**
 * Formats a Date or ISO timestamp in Africa/Lusaka timezone
 * e.g. "06 October 2026 at 14:35:12 CAT"
 */
export function formatLusakaDateTime(isoStringOrDate: string | Date = new Date()): string {
  const d = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lusaka',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d) + ' CAT';
}

/**
 * Creates a verified TermsAcceptanceRecord for an application
 */
export function createTermsAcceptanceRecord(params: {
  ownerFullName: string;
  ownerId: string;
  businessName: string;
  businessId: string;
  onboardingReference: string;
  executiveId: string;
  executiveName: string;
  timestamp?: string;
}): TermsAcceptanceRecord {
  const ts = params.timestamp || new Date().toISOString();
  return {
    termsTitle: ACTIVE_TERMS_CONFIG.footerTitle,
    version: ACTIVE_TERMS_CONFIG.version,
    effectiveDate: ACTIVE_TERMS_CONFIG.effectiveDate,
    acceptedAt: ts,
    acceptedAtFormattedLusaka: formatLusakaDateTime(ts),
    ownerFullName: params.ownerFullName,
    ownerId: params.ownerId,
    businessName: params.businessName,
    businessId: params.businessId,
    onboardingReference: params.onboardingReference,
    executiveId: params.executiveId,
    executiveName: params.executiveName,
    timezone: 'Africa/Lusaka',
    status: 'ACCEPTED',
  };
}
