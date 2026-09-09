import { CustomerRecord } from '../types/customer';
import { getCustomerById } from './mockCustomerData';
import {
  CustomerProfileData,
  CustomerFinancialSummary,
  CustomerSavedLocation,
  CustomerWalletActivity,
  CustomerSecurityState,
  CustomerAuditEvent,
} from '../types/customerProfile';
import { PickupRequest } from '../types/admin';
import { MobileMoneyTransaction } from '../types/mobileMoney';
import { getAllCustomerRequests } from './mockCustomerRequestsData';
import { MOCK_MOBILE_MONEY_TRANSACTIONS } from './mockMobileMoneyData';

// In-memory audit log for admin profile actions
export const MOCK_PROFILE_AUDIT_LOG: CustomerAuditEvent[] = [];

export function logCustomerAuditEvent(event: Omit<CustomerAuditEvent, 'id' | 'timestamp'>): CustomerAuditEvent {
  const newEvent: CustomerAuditEvent = {
    ...event,
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  MOCK_PROFILE_AUDIT_LOG.unshift(newEvent);
  return newEvent;
}

/**
 * Builds complete profile data for a specific customer ID
 */
export function getCustomerProfileData(customerId: string): CustomerProfileData | null {
  const customer = getCustomerById(customerId);
  if (!customer) return null;

  const idNum = parseInt(customerId.replace(/\D/g, ''), 10) || 1052;

  // Financial consistency: Available Balance + Reserved Funds = Wallet Balance
  const walletBalance = customer.walletBalance;
  const hasActive = customer.activeRequestsCount > 0;
  
  // Calculate reserved funds: strictly bounded by wallet balance
  const reservedFunds = hasActive
    ? Math.min(2500.0, Math.round(walletBalance * 0.15 * 100) / 100)
    : 0.0;
  const availableBalance = Math.round((walletBalance - reservedFunds) * 100) / 100;

  const pendingWithdrawalAmount = customer.pendingWithdrawalsCount > 0
    ? (idNum % 2 === 0 ? 7200.0 : 4500.0)
    : 0.0;

  const totalFundsAdded = Math.round((walletBalance + 36500.0) * 100) / 100;
  const totalFundsWithdrawn = 36500.0;

  const financials: CustomerFinancialSummary = {
    walletBalance,
    availableBalance,
    reservedFunds,
    pendingWithdrawalAmount,
    pendingWithdrawalsCount: customer.pendingWithdrawalsCount,
    activeRequestsCount: customer.activeRequestsCount,
    totalFundsAdded,
    totalFundsWithdrawn,
  };

  // Zambian NRC calculation (6 digits / 2 digits / 1 digit)
  const nrcPrefix = (180000 + (idNum * 231) % 700000).toString();
  const nrcFull = `${nrcPrefix}/11/1`;
  const nrcMasked = `${nrcPrefix.slice(0, 2)}••••/11/1`;

  // Locations
  const locations: CustomerSavedLocation[] = [
    {
      id: `LOC-${customerId}-1`,
      name: 'Home',
      street: idNum % 2 === 0 ? 'Plot 4928, Leopard Hill Road, Woodlands' : 'House 14, Cedar Road, Kabulonga',
      city: customer.city || 'Lusaka',
      province: 'Lusaka Province',
      country: 'Zambia',
      source: 'Customer App GPS',
      dateAdded: '15 Jan 2025',
      lastUsed: customer.lastActivity || 'Today, 11:52 AM',
      isDefault: true,
      coordinates: {
        lat: -15.4167,
        lng: 28.2833,
      },
    },
    {
      id: `LOC-${customerId}-2`,
      name: 'Work / Office',
      street: 'Stand 1024, Great East Road, Rhodes Park',
      city: customer.city || 'Lusaka',
      province: 'Lusaka Province',
      country: 'Zambia',
      source: 'Customer Saved Address',
      dateAdded: '22 Jan 2025',
      lastUsed: '02 Sep 2026, 09:15 AM',
      isDefault: false,
      coordinates: {
        lat: -15.4050,
        lng: 28.3050,
      },
    },
    {
      id: `LOC-${customerId}-3`,
      name: 'Manda Hill Shopping Centre',
      street: 'Corner of Great East Rd & Manchinchi Rd',
      city: 'Lusaka',
      province: 'Lusaka Province',
      country: 'Zambia',
      source: 'Frequent Pickup Destination',
      dateAdded: '05 Feb 2025',
      lastUsed: 'Yesterday, 04:30 PM',
      isDefault: false,
      coordinates: {
        lat: -15.3925,
        lng: 28.3015,
      },
    },
  ];

  // Wallet activities
  const walletActivities: CustomerWalletActivity[] = [
    {
      id: `WAL-${customerId}-1`,
      reference: `TB-WAL-${idNum}-01`,
      dateTime: 'Today, 10:15 AM',
      activityType: 'Funding',
      description: 'Customer Mobile Money Wallet Funding (MTN MoMo)',
      credit: 5000.0,
      debit: null,
      resultingBalance: walletBalance,
      status: 'Posted',
      relatedReference: `TB-TXN-${idNum + 10}`,
    },
    {
      id: `WAL-${customerId}-2`,
      reference: `TB-WAL-${idNum}-02`,
      dateTime: '03 Sep 2026, 02:40 PM',
      activityType: 'Service Fee',
      description: 'TellerBud Service Reservation Charge',
      credit: null,
      debit: 25.0,
      resultingBalance: walletBalance - 5000.0 + 25.0,
      status: 'Posted',
      relatedReference: `TB-TXN-${idNum + 9}`,
    },
    {
      id: `WAL-${customerId}-3`,
      reference: `TB-WAL-${idNum}-03`,
      dateTime: '01 Sep 2026, 11:10 AM',
      activityType: 'Withdrawal',
      description: 'Cash Withdrawal to Agent Point',
      credit: null,
      debit: 3500.0,
      resultingBalance: walletBalance - 5000.0 + 3525.0,
      status: 'Posted',
      relatedReference: `TB-TXN-${idNum + 8}`,
    },
    {
      id: `WAL-${customerId}-4`,
      reference: `TB-WAL-${idNum}-04`,
      dateTime: '28 Aug 2026, 04:15 PM',
      activityType: 'Funding',
      description: 'Wallet Credit from Bank Transfer (Zanaco Express)',
      credit: 10000.0,
      debit: null,
      resultingBalance: walletBalance - 5000.0 + 7025.0,
      status: 'Posted',
      relatedReference: `TB-TXN-${idNum + 7}`,
    },
    {
      id: `WAL-${customerId}-5`,
      reference: `TB-WAL-${idNum}-05`,
      dateTime: '20 Aug 2026, 09:30 AM',
      activityType: 'Pickup Reservation',
      description: 'Pre-authorization for Scheduled Cash Pickup',
      credit: null,
      debit: 1500.0,
      resultingBalance: walletBalance - 15000.0 + 7025.0,
      status: 'Posted',
      relatedReference: `TB-REQ-${idNum + 6}`,
    },
  ];

  // Security state
  const security: CustomerSecurityState = {
    phoneVerificationStatus: 'Verified (SMS OTP via registered mobile)',
    passcodeConfigured: true,
    securityQuestionsSummary: '3 of 3 security questions configured',
    lastPasscodeChange: '15 Jan 2025, 08:30 AM',
    hasActiveRecoveryCase: customer.hasRecoverySupport,
    recoveryCaseId: customer.hasRecoverySupport ? `CASE-REC-${idNum}` : undefined,
    recoveryStatusText: customer.hasRecoverySupport
      ? `Active Support Case (${customer.recoveryCaseTitle || 'Passcode Reset Request'})`
      : 'No active recovery case',
    lastRecoveryActivity: customer.hasRecoverySupport
      ? 'Recovery support ticket opened by customer on 08 Sep 2026'
      : 'Phone OTP re-verification completed on registration',
    failedAttemptsText: '0 failed attempts in the last 24 hours (Normal)',
  };

  return {
    customer,
    financials,
    nrcMasked,
    nrcFull,
    identityVerificationStatus:
      customer.accountStatus === 'Pending'
        ? 'Pending Review'
        : customer.accountStatus === 'Suspended'
        ? 'Suspended'
        : 'Verified',
    lastSignIn: `${customer.lastActivity} • Android App (Lusaka)`,
    locations,
    walletActivities,
    security,
  };
}

/**
 * Returns customer requests (Pickup Requests only - no Delivery)
 */
export function getCustomerRequestsList(customer: CustomerRecord): PickupRequest[] {
  // Return dedicated stable records for the primary customer
  if (customer.id === 'TB-CUS-1021') {
    return [
      {
        id: 'TB-REQ-1021',
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        type: 'Purchase',
        vendor: 'Access',
        amount: 1400.0,
        status: 'Agent Confirmed',
        agentName: 'Brian Chanda',
        agentId: 'TB-AGT-1088',
        agentPhone: '+260 96 112 3344',
        businessName: 'Lusaka Central Express Agency',
        businessId: 'BIZ-LUS-001',
        serviceTime: 'Now',
        isScheduled: false,
        pickupLocation: 'Embassy Mall, Chawama Rd, Lusaka',
        createdAt: 'Today, 09:55 AM',
        timestamp: '2026-09-08T09:55:00Z',
        notes: 'Customer scheduled purchase pickup awaiting agent confirmation.',
      },
      {
        id: 'TB-REQ-1015',
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        type: 'Withdrawal',
        vendor: 'MTN',
        amount: 2500.0,
        status: 'Completed',
        agentName: 'Kelvin Phiri',
        agentId: 'TB-AGT-1024',
        agentPhone: '+260 97 234 5678',
        businessName: 'Lusaka Central Express Agency',
        businessId: 'BIZ-LUS-001',
        serviceTime: '04 Sep 2026, 02:30 PM',
        isScheduled: false,
        pickupLocation: 'Manda Hill Shopping Mall, Great East Rd, Lusaka',
        createdAt: '04 Sep 2026, 02:15 PM',
        timestamp: '2026-09-04T14:15:00Z',
        notes: 'Completed cash withdrawal.',
      },
      {
        id: 'TB-REQ-1008',
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        type: 'Deposit',
        vendor: 'Airtel',
        amount: 1800.0,
        status: 'Completed',
        agentName: 'Natasha Zulu',
        agentId: 'TB-AGT-1062',
        agentPhone: '+260 97 556 7890',
        businessName: 'Lusaka Central Express Agency',
        businessId: 'BIZ-LUS-001',
        serviceTime: '28 Aug 2026, 03:15 PM',
        isScheduled: true,
        pickupLocation: 'Woodlands Shopping Mall, Lusaka',
        createdAt: '28 Aug 2026, 02:45 PM',
        timestamp: '2026-08-28T14:45:00Z',
        notes: 'Scheduled cash deposit completed successfully.',
      },
      {
        id: 'TB-REQ-0994',
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        type: 'Withdrawal',
        vendor: 'Zanaco',
        amount: 1500.0,
        status: 'Completed',
        agentName: 'Brian Chanda',
        agentId: 'TB-AGT-1088',
        agentPhone: '+260 96 112 3344',
        businessName: 'Lusaka Central Express Agency',
        businessId: 'BIZ-LUS-001',
        serviceTime: '14 Aug 2026, 10:00 AM',
        isScheduled: false,
        pickupLocation: 'Levy Junction Mall, Church Rd, Lusaka',
        createdAt: '14 Aug 2026, 09:30 AM',
        timestamp: '2026-08-14T09:30:00Z',
        notes: 'Completed withdrawal request. Bank voucher verified.',
      },
      {
        id: 'TB-REQ-0982',
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        type: 'Deposit',
        vendor: 'MTN',
        amount: 3500.0,
        status: 'Completed',
        agentName: 'Kelvin Phiri',
        agentId: 'TB-AGT-1024',
        agentPhone: '+260 97 234 5678',
        businessName: 'Lusaka Central Express Agency',
        businessId: 'BIZ-LUS-001',
        serviceTime: '02 Aug 2026, 01:20 PM',
        isScheduled: false,
        pickupLocation: 'East Park Mall, Great East Rd, Lusaka',
        createdAt: '02 Aug 2026, 12:50 PM',
        timestamp: '2026-08-02T12:50:00Z',
        notes: 'Completed cash deposit.',
      },
      {
        id: 'TB-REQ-0970',
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        type: 'Withdrawal',
        vendor: 'Airtel',
        amount: 2000.0,
        status: 'Completed',
        agentName: 'Faith Mwewa',
        agentId: 'TB-AGT-1050',
        agentPhone: '+260 97 456 7890',
        businessName: 'Lusaka Central Express Agency',
        businessId: 'BIZ-LUS-001',
        serviceTime: '20 Jul 2026, 11:00 AM',
        isScheduled: false,
        pickupLocation: 'Arcades Shopping Mall, Lusaka',
        createdAt: '20 Jul 2026, 10:20 AM',
        timestamp: '2026-07-20T10:20:00Z',
        notes: 'Cash withdrawal verified and completed.',
      },
    ];
  }

  const all = getAllCustomerRequests();
  const matched = all.filter(
    (r) =>
      r.customerId === customer.id ||
      r.customerName.toLowerCase() === customer.name.toLowerCase() ||
      r.customerPhone === customer.phone
  );

  const seenMatchedIds = new Set<string>();
  const uniqueMatched = matched.filter((r) => {
    if (seenMatchedIds.has(r.id)) return false;
    seenMatchedIds.add(r.id);
    return true;
  });

  if (uniqueMatched.length >= 3) {
    return uniqueMatched;
  }

  // Generate deterministic requests for this customer so the tab is never empty
  const idNum = parseInt(customer.id.replace(/\D/g, ''), 10) || 1052;
  const supplemental: PickupRequest[] = [
    {
      id: `TB-REQ-${idNum + 400}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      type: 'Withdrawal',
      vendor: 'MTN',
      amount: 2500.0,
      status: customer.activeRequestsCount > 0 ? 'Active Service' : 'Completed',
      agentName: 'Kelvin Phiri',
      agentId: 'TB-AGT-1024',
      agentPhone: '+260 97 234 5678',
      businessName: 'Lusaka Central Express Agency',
      businessId: 'BIZ-LUS-001',
      serviceTime: customer.activeRequestsCount > 0 ? 'Now' : '02 Sep 2026, 11:30 AM',
      isScheduled: false,
      pickupLocation: 'Manda Hill Shopping Mall, Great East Rd, Lusaka',
      createdAt: customer.lastActivity || 'Today, 11:42 AM',
      timestamp: '2026-09-08T11:42:00Z',
      notes: 'Customer cash withdrawal request fulfilled via nearest eligible agent.',
    },
    {
      id: `TB-REQ-${idNum + 399}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      type: 'Deposit',
      vendor: 'Airtel',
      amount: 4000.0,
      status: 'Completed',
      agentName: 'Natasha Zulu',
      agentId: 'TB-AGT-1062',
      agentPhone: '+260 97 556 7890',
      businessName: 'Lusaka Central Express Agency',
      businessId: 'BIZ-LUS-001',
      serviceTime: '28 Aug 2026, 03:15 PM',
      isScheduled: true,
      pickupLocation: 'Woodlands Shopping Mall, Lusaka',
      createdAt: '28 Aug 2026, 02:45 PM',
      timestamp: '2026-08-28T14:45:00Z',
      notes: 'Scheduled cash deposit completed successfully.',
    },
    {
      id: `TB-REQ-${idNum + 398}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      type: 'Withdrawal',
      vendor: 'Zanaco',
      amount: 1500.0,
      status: 'Completed',
      agentName: 'Brian Chanda',
      agentId: 'TB-AGT-1088',
      agentPhone: '+260 96 112 3344',
      businessName: 'Lusaka Central Express Agency',
      businessId: 'BIZ-LUS-001',
      serviceTime: '14 Aug 2026, 10:00 AM',
      isScheduled: false,
      pickupLocation: 'Levy Junction Mall, Church Rd, Lusaka',
      createdAt: '14 Aug 2026, 09:30 AM',
      timestamp: '2026-08-14T09:30:00Z',
      notes: 'Completed withdrawal request. Bank voucher verified.',
    },
    {
      id: `TB-REQ-${idNum + 397}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      type: 'Deposit',
      vendor: 'MTN',
      amount: 6000.0,
      status: 'Completed',
      agentName: 'Kelvin Phiri',
      agentId: 'TB-AGT-1024',
      agentPhone: '+260 97 234 5678',
      businessName: 'Lusaka Central Express Agency',
      businessId: 'BIZ-LUS-001',
      serviceTime: '02 Aug 2026, 01:20 PM',
      isScheduled: false,
      pickupLocation: 'East Park Mall, Great East Rd, Lusaka',
      createdAt: '02 Aug 2026, 12:50 PM',
      timestamp: '2026-08-02T12:50:00Z',
      notes: 'Completed cash deposit.',
    },
    {
      id: `TB-REQ-${idNum + 396}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      type: 'Withdrawal',
      vendor: 'Airtel',
      amount: 3000.0,
      status: 'Completed',
      agentName: 'Faith Mwewa',
      agentId: 'TB-AGT-1050',
      agentPhone: '+260 97 456 7890',
      businessName: 'Lusaka Central Express Agency',
      businessId: 'BIZ-LUS-001',
      serviceTime: '20 Jul 2026, 11:00 AM',
      isScheduled: false,
      pickupLocation: 'Arcades Shopping Mall, Lusaka',
      createdAt: '20 Jul 2026, 10:20 AM',
      timestamp: '2026-07-20T10:20:00Z',
      notes: 'Cash withdrawal verified and completed.',
    },
  ];

  // Merge any matched with supplemental (avoiding duplicate IDs)
  const existingIds = new Set(uniqueMatched.map((m) => m.id));
  const combined = [...uniqueMatched];
  for (const s of supplemental) {
    if (!existingIds.has(s.id)) {
      existingIds.add(s.id);
      combined.push(s);
    }
  }

  return combined;
}

/**
 * Returns customer unified Mobile Money transactions (Pickup and Walk-In only, no Delivery)
 * All references start with TB-TXN-
 */
export function getCustomerTransactionsList(customer: CustomerRecord): MobileMoneyTransaction[] {
  // Return dedicated stable records for the primary customer
  if (customer.id === 'TB-CUS-1021') {
    return [
      {
        id: 'MMT-PCK-TB-REQ-1021',
        reference: 'TB-TXN-1021',
        sourceReference: 'TB-REQ-1021',
        sourceReferenceType: 'Customer Request',
        serviceChannel: 'Pickup',
        transactionType: 'Purchase',
        vendor: 'Access',
        vendorType: 'Bank API',
        isRegisteredCustomer: true,
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        customerAccountStatus: 'Pending',
        agentId: 'TB-AGT-1088',
        agentName: 'Brian Chanda',
        agentPhone: '+260 96 112 3344',
        businessId: 'BIZ-LUS-001',
        businessName: 'Lusaka Central Express Agency',
        businessLocation: 'Cairo Road Commercial Suite, Lusaka',
        pickupLocation: 'Embassy Mall, Chawama Rd, Lusaka',
        requestedServiceTime: 'Now',
        assignmentMethod: 'Automated Nearby Match',
        assignedTimestamp: '2026-09-08T09:50:00Z',
        amount: 1400.0,
        reservationCharge: 20.0,
        otherCharges: 5.0,
        customerTotal: 1425.0,
        principalProcessingMethod: 'Access Bank Merchant Pay',
        customerConfirmationStatus: 'Confirmed',
        customerConfirmationTimestamp: '2026-09-08T09:52:00Z',
        agentConfirmationStatus: 'Confirmed',
        agentConfirmationTimestamp: '2026-09-08T09:55:00Z',
        status: 'Agent Confirmed',
        postedAt: '2026-09-08T09:55:00Z',
        formattedDate: 'Today, 09:55 AM',
        timeline: [
          {
            id: 'TL-1021-1',
            eventName: 'Customer Pickup Request Initiated',
            actor: 'Bupe Chileshe',
            timestamp: 'Today, 09:48 AM',
            result: 'Submitted',
          },
          {
            id: 'TL-1021-2',
            eventName: 'Agent Assigned',
            actor: 'Automated Nearby Match',
            timestamp: 'Today, 09:50 AM',
            result: 'Assigned to Brian Chanda',
          },
          {
            id: 'TL-1021-3',
            eventName: 'Agent Arrival at Embassy Mall',
            actor: 'Brian Chanda',
            timestamp: 'Today, 09:55 AM',
            result: 'Processing in Progress',
          },
        ],
        recordSource: 'TellerBud Pickup Engine',
        lastUpdated: 'Today, 09:55 AM',
      },
      {
        id: 'MMT-PCK-TB-REQ-1015',
        reference: 'TB-TXN-3142',
        sourceReference: 'TB-REQ-1015',
        sourceReferenceType: 'Customer Request',
        serviceChannel: 'Pickup',
        transactionType: 'Withdrawal',
        vendor: 'MTN',
        vendorType: 'MNO Mobile Money',
        isRegisteredCustomer: true,
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        customerAccountStatus: 'Pending',
        agentId: 'TB-AGT-1024',
        agentName: 'Kelvin Phiri',
        agentPhone: '+260 97 234 5678',
        businessId: 'BIZ-LUS-001',
        businessName: 'Lusaka Central Express Agency',
        businessLocation: 'Cairo Road Commercial Suite, Lusaka',
        pickupLocation: 'Manda Hill Shopping Mall, Great East Rd, Lusaka',
        requestedServiceTime: '04 Sep 2026, 02:30 PM',
        assignmentMethod: 'Automated Geospatial Dispatch',
        assignedTimestamp: '2026-09-04T14:10:00Z',
        amount: 2500.0,
        reservationCharge: 25.0,
        otherCharges: 10.0,
        customerTotal: 2535.0,
        principalProcessingMethod: 'MTN Mobile Money USSD Push',
        customerConfirmationStatus: 'Confirmed',
        customerConfirmationTimestamp: '2026-09-04T14:28:00Z',
        agentConfirmationStatus: 'Confirmed',
        agentConfirmationTimestamp: '2026-09-04T14:30:00Z',
        status: 'Completed',
        postedAt: '2026-09-04T14:30:00Z',
        formattedDate: '04 Sep 2026, 02:30 PM',
        timeline: [
          {
            id: 'TL-1015-1',
            eventName: 'Customer Request Logged',
            actor: 'Bupe Chileshe',
            timestamp: '04 Sep 2026, 02:15 PM',
            result: 'Submitted',
          },
          {
            id: 'TL-1015-2',
            eventName: 'Agent Dispatch',
            actor: 'Automated Dispatch',
            timestamp: '04 Sep 2026, 02:18 PM',
            result: 'Kelvin Phiri Dispatched',
          },
          {
            id: 'TL-1015-3',
            eventName: 'Cash Dispensed & Verified',
            actor: 'Kelvin Phiri',
            timestamp: '04 Sep 2026, 02:30 PM',
            result: 'Signed & Completed',
          },
        ],
        recordSource: 'TellerBud Pickup Engine',
        lastUpdated: '04 Sep 2026, 02:30 PM',
      },
      {
        id: 'MMT-WLK-TB-WLK-3304',
        reference: 'TB-TXN-3304',
        sourceReference: 'TB-WLK-3304',
        sourceReferenceType: 'Walk-In',
        serviceChannel: 'Walk-In',
        transactionType: 'Deposit',
        vendor: 'Airtel',
        vendorType: 'MNO Mobile Money',
        isRegisteredCustomer: true,
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        customerAccountStatus: 'Pending',
        agentId: 'TB-AGT-1062',
        agentName: 'Natasha Zulu',
        agentPhone: '+260 97 556 7890',
        businessId: 'BIZ-LUS-001',
        businessName: 'Lusaka Central Express Agency',
        businessLocation: 'Lusaka Central',
        walkInLocation: 'Lusaka Central Agency Booth #2',
        processingAgent: 'Natasha Zulu',
        terminalId: 'TRM-LUS-02',
        receiptNumber: 'RCP-1021-02',
        amount: 3000.0,
        reservationCharge: 0.0,
        otherCharges: 0.0,
        customerTotal: 3000.0,
        principalProcessingMethod: 'Airtel Money Agent SIM Push',
        customerConfirmationStatus: 'Confirmed',
        agentConfirmationStatus: 'Confirmed',
        status: 'Completed',
        postedAt: '2026-08-30T11:15:00Z',
        formattedDate: '30 Aug 2026, 11:15 AM',
        timeline: [
          {
            id: 'TL-3304-1',
            eventName: 'Walk-In Deposit Initiated',
            actor: 'Natasha Zulu',
            timestamp: '30 Aug 2026, 11:12 AM',
            result: 'Cash Received at Counter',
          },
          {
            id: 'TL-3304-2',
            eventName: 'Agent Push Executed',
            actor: 'Natasha Zulu',
            timestamp: '30 Aug 2026, 11:15 AM',
            result: 'Deposit Confirmed & Receipt Issued',
          },
        ],
        recordSource: 'Walk-In POS Terminal',
        lastUpdated: '30 Aug 2026, 11:15 AM',
      },
      {
        id: 'MMT-PCK-TB-REQ-1008',
        reference: 'TB-TXN-3088',
        sourceReference: 'TB-REQ-1008',
        sourceReferenceType: 'Customer Request',
        serviceChannel: 'Pickup',
        transactionType: 'Deposit',
        vendor: 'Zanaco',
        vendorType: 'Bank API',
        isRegisteredCustomer: true,
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        customerAccountStatus: 'Pending',
        agentId: 'TB-AGT-1088',
        agentName: 'Brian Chanda',
        agentPhone: '+260 96 112 3344',
        businessId: 'BIZ-LUS-001',
        businessName: 'Lusaka Central Express Agency',
        businessLocation: 'Cairo Road Commercial Suite, Lusaka',
        pickupLocation: 'Levy Junction Mall, Church Rd, Lusaka',
        requestedServiceTime: '22 Aug 2026, 04:40 PM',
        assignmentMethod: 'Automated Geospatial Dispatch',
        amount: 1800.0,
        reservationCharge: 20.0,
        otherCharges: 15.0,
        customerTotal: 1835.0,
        principalProcessingMethod: 'Zanaco Xpress Agency Portal',
        customerConfirmationStatus: 'Confirmed',
        agentConfirmationStatus: 'Confirmed',
        status: 'Completed',
        postedAt: '2026-08-22T16:40:00Z',
        formattedDate: '22 Aug 2026, 04:40 PM',
        timeline: [
          {
            id: 'TL-1008-1',
            eventName: 'Agency Portal Deposit',
            actor: 'Brian Chanda',
            timestamp: '22 Aug 2026, 04:40 PM',
            result: 'Bank slip generated',
          },
        ],
        recordSource: 'TellerBud Pickup Engine',
        lastUpdated: '22 Aug 2026, 04:40 PM',
      },
      {
        id: 'MMT-WLK-TB-WLK-3310',
        reference: 'TB-TXN-3310',
        sourceReference: 'TB-WLK-3310',
        sourceReferenceType: 'Walk-In',
        serviceChannel: 'Walk-In',
        transactionType: 'Withdrawal',
        vendor: 'MTN',
        vendorType: 'MNO Mobile Money',
        isRegisteredCustomer: true,
        customerId: 'TB-CUS-1021',
        customerName: 'Bupe Chileshe',
        customerPhone: '+260 96 223 5588',
        customerAccountStatus: 'Pending',
        agentId: 'TB-AGT-1024',
        agentName: 'Kelvin Phiri',
        agentPhone: '+260 97 234 5678',
        businessId: 'BIZ-LUS-001',
        businessName: 'Lusaka Central Express Agency',
        businessLocation: 'Lusaka Central',
        walkInLocation: 'Lusaka Central Agency Booth #1',
        processingAgent: 'Kelvin Phiri',
        terminalId: 'TRM-LUS-01',
        receiptNumber: 'RCP-1021-01',
        amount: 1000.0,
        reservationCharge: 0.0,
        otherCharges: 0.0,
        customerTotal: 1000.0,
        principalProcessingMethod: 'MTN Merchant Pay',
        customerConfirmationStatus: 'Confirmed',
        agentConfirmationStatus: 'Confirmed',
        status: 'Completed',
        postedAt: '2026-08-15T09:20:00Z',
        formattedDate: '15 Aug 2026, 09:20 AM',
        timeline: [
          {
            id: 'TL-3310-1',
            eventName: 'Walk-In Cash Withdrawal',
            actor: 'Kelvin Phiri',
            timestamp: '15 Aug 2026, 09:20 AM',
            result: 'Cash Dispensed & Signed',
          },
        ],
        recordSource: 'Walk-In POS Terminal',
        lastUpdated: '15 Aug 2026, 09:20 AM',
      },
    ];
  }

  const matched = MOCK_MOBILE_MONEY_TRANSACTIONS.filter(
    (t) =>
      t.customerId === customer.id ||
      t.customerName.toLowerCase() === customer.name.toLowerCase() ||
      t.customerPhone === customer.phone
  );

  const seenMatchedIds = new Set<string>();
  const uniqueMatched = matched.filter((t) => {
    if (seenMatchedIds.has(t.id)) return false;
    seenMatchedIds.add(t.id);
    return true;
  });

  if (uniqueMatched.length >= 4) {
    return uniqueMatched;
  }

  // Generate deterministic unified transactions for this customer
  const idNum = parseInt(customer.id.replace(/\D/g, ''), 10) || 1052;
  const supplemental: MobileMoneyTransaction[] = [
    {
      id: `MMT-TXN-${idNum}-1`,
      reference: `TB-TXN-${idNum + 200}`,
      sourceReference: `TB-REQ-${idNum + 400}`,
      sourceReferenceType: 'Customer Request',
      serviceChannel: 'Pickup',
      transactionType: 'Withdrawal',
      vendor: 'MTN',
      vendorType: 'MNO Mobile Money',
      isRegisteredCustomer: true,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAccountStatus: 'Active',
      agentId: 'TB-AGT-1024',
      agentName: 'Kelvin Phiri',
      agentPhone: '+260 97 234 5678',
      businessId: 'BIZ-LUS-001',
      businessName: 'Lusaka Central Express Agency',
      businessLocation: 'Woodlands Shopping Mall, Lusaka',
      pickupLocation: 'Manda Hill Shopping Mall, Great East Rd, Lusaka',
      requestedServiceTime: 'Now',
      assignmentMethod: 'Automated Nearby Match',
      assignedTimestamp: '2026-09-08T11:43:00Z',
      amount: 2500.0,
      reservationCharge: 25.0,
      otherCharges: 10.0,
      customerTotal: 2535.0,
      principalProcessingMethod: 'MTN Mobile Money USSD Push',
      customerConfirmationStatus: 'Confirmed',
      customerConfirmationTimestamp: '2026-09-08T11:44:00Z',
      agentConfirmationStatus: 'Confirmed',
      agentConfirmationTimestamp: '2026-09-08T11:45:00Z',
      status: 'Completed',
      postedAt: '2026-09-08T11:45:00Z',
      formattedDate: 'Today, 11:45 AM',
      timeline: [
        {
          id: 'TL-1',
          eventName: 'Request Initiated',
          actor: customer.name,
          timestamp: 'Today, 11:42 AM',
          result: 'Submitted',
        },
        {
          id: 'TL-2',
          eventName: 'Agent Assigned',
          actor: 'Automated Matching',
          timestamp: 'Today, 11:43 AM',
          result: 'Matched with Kelvin Phiri',
        },
        {
          id: 'TL-3',
          eventName: 'Service Completed',
          actor: 'Kelvin Phiri',
          timestamp: 'Today, 11:45 AM',
          result: 'Cash Dispensed & Signed',
        },
      ],
      recordSource: 'Mobile Money Service Engine',
      lastUpdated: 'Today, 11:45 AM',
    },
    {
      id: `MMT-TXN-${idNum}-2`,
      reference: `TB-TXN-${idNum + 201}`,
      sourceReference: `TB-WLK-${idNum + 150}`,
      sourceReferenceType: 'Walk-In',
      serviceChannel: 'Walk-In',
      transactionType: 'Deposit',
      vendor: 'Airtel',
      vendorType: 'MNO Mobile Money',
      isRegisteredCustomer: true,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAccountStatus: 'Active',
      agentId: 'TB-AGT-1062',
      agentName: 'Natasha Zulu',
      agentPhone: '+260 97 556 7890',
      businessId: 'BIZ-LUS-001',
      businessName: 'Lusaka Central Express Agency',
      businessLocation: 'Lusaka Central',
      walkInLocation: 'Lusaka Central Agency Booth #2',
      processingAgent: 'Natasha Zulu',
      terminalId: 'TRM-LUS-02',
      receiptNumber: `RCP-${idNum}-02`,
      amount: 1500.0,
      reservationCharge: 0.0,
      otherCharges: 0.0,
      customerTotal: 1500.0,
      principalProcessingMethod: 'Airtel Money Agent SIM Push',
      customerConfirmationStatus: 'Confirmed',
      agentConfirmationStatus: 'Confirmed',
      status: 'Completed',
      postedAt: '2026-09-03T15:22:00Z',
      formattedDate: '03 Sep 2026, 03:22 PM',
      timeline: [
        {
          id: 'TL-W1',
          eventName: 'Counter Cash Received',
          actor: 'Natasha Zulu',
          timestamp: '03 Sep 2026, 03:20 PM',
          result: 'ZMW 1,500.00 Verified',
        },
        {
          id: 'TL-W2',
          eventName: 'Transfer Dispatched',
          actor: 'Natasha Zulu',
          timestamp: '03 Sep 2026, 03:22 PM',
          result: 'SMS Confirmation Sent',
        },
      ],
      recordSource: 'Walk-In POS Terminal',
      lastUpdated: '03 Sep 2026, 03:22 PM',
    },
    {
      id: `MMT-TXN-${idNum}-3`,
      reference: `TB-TXN-${idNum + 202}`,
      sourceReference: `TB-REQ-${idNum + 398}`,
      sourceReferenceType: 'Customer Request',
      serviceChannel: 'Pickup',
      transactionType: 'Deposit',
      vendor: 'Zanaco',
      vendorType: 'Bank API',
      isRegisteredCustomer: true,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAccountStatus: 'Active',
      agentId: 'TB-AGT-1088',
      agentName: 'Brian Chanda',
      agentPhone: '+260 96 112 3344',
      businessId: 'BIZ-LUS-001',
      businessName: 'Lusaka Central Express Agency',
      businessLocation: 'Lusaka Central',
      pickupLocation: 'Levy Junction Mall, Church Rd, Lusaka',
      requestedServiceTime: 'Scheduled',
      assignmentMethod: 'Automated Nearby Match',
      amount: 3500.0,
      reservationCharge: 20.0,
      otherCharges: 15.0,
      customerTotal: 3535.0,
      principalProcessingMethod: 'Zanaco Xpress Agency Portal',
      customerConfirmationStatus: 'Confirmed',
      agentConfirmationStatus: 'Confirmed',
      status: 'Completed',
      postedAt: '2026-08-28T14:50:00Z',
      formattedDate: '28 Aug 2026, 02:50 PM',
      timeline: [
        {
          id: 'TL-Z1',
          eventName: 'Scheduled Deposit Fulfilled',
          actor: 'Brian Chanda',
          timestamp: '28 Aug 2026, 02:50 PM',
          result: 'Bank slip issued',
        },
      ],
      recordSource: 'Mobile Money Service Engine',
      lastUpdated: '28 Aug 2026, 02:50 PM',
    },
    {
      id: `MMT-TXN-${idNum}-4`,
      reference: `TB-TXN-${idNum + 203}`,
      sourceReference: `TB-WLK-${idNum + 151}`,
      sourceReferenceType: 'Walk-In',
      serviceChannel: 'Walk-In',
      transactionType: 'Purchase',
      vendor: 'MTN',
      vendorType: 'MNO Mobile Money',
      isRegisteredCustomer: true,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAccountStatus: 'Active',
      agentId: 'TB-AGT-1024',
      agentName: 'Kelvin Phiri',
      agentPhone: '+260 97 234 5678',
      businessId: 'BIZ-LUS-001',
      businessName: 'Lusaka Central Express Agency',
      businessLocation: 'Lusaka Central',
      walkInLocation: 'Lusaka Central Agency Booth #1',
      processingAgent: 'Kelvin Phiri',
      terminalId: 'TRM-LUS-01',
      receiptNumber: `RCP-${idNum}-01`,
      amount: 1200.0,
      reservationCharge: 0.0,
      otherCharges: 0.0,
      customerTotal: 1200.0,
      principalProcessingMethod: 'MTN Merchant Pay',
      customerConfirmationStatus: 'Confirmed',
      agentConfirmationStatus: 'Confirmed',
      status: 'Completed',
      postedAt: '2026-08-20T10:15:00Z',
      formattedDate: '20 Aug 2026, 10:15 AM',
      timeline: [
        {
          id: 'TL-M1',
          eventName: 'Utility Purchase',
          actor: customer.name,
          timestamp: '20 Aug 2026, 10:15 AM',
          result: 'Voucher generated',
        },
      ],
      recordSource: 'Walk-In POS Terminal',
      lastUpdated: '20 Aug 2026, 10:15 AM',
    },
    {
      id: `MMT-TXN-${idNum}-5`,
      reference: `TB-TXN-${idNum + 204}`,
      sourceReference: `TB-REQ-${idNum + 396}`,
      sourceReferenceType: 'Customer Request',
      serviceChannel: 'Pickup',
      transactionType: 'Withdrawal',
      vendor: 'Airtel',
      vendorType: 'MNO Mobile Money',
      isRegisteredCustomer: true,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAccountStatus: 'Active',
      agentId: 'TB-AGT-1050',
      agentName: 'Faith Mwewa',
      agentPhone: '+260 97 456 7890',
      businessId: 'BIZ-LUS-001',
      businessName: 'Lusaka Central Express Agency',
      pickupLocation: 'East Park Mall, Great East Rd, Lusaka',
      amount: 5000.0,
      reservationCharge: 30.0,
      otherCharges: 10.0,
      customerTotal: 5040.0,
      principalProcessingMethod: 'Airtel Money Agent PIN',
      customerConfirmationStatus: 'Confirmed',
      agentConfirmationStatus: 'Confirmed',
      status: 'Completed',
      postedAt: '2026-08-10T16:20:00Z',
      formattedDate: '10 Aug 2026, 04:20 PM',
      timeline: [
        {
          id: 'TL-A1',
          eventName: 'Pickup Withdrawal',
          actor: 'Faith Mwewa',
          timestamp: '10 Aug 2026, 04:20 PM',
          result: 'Cash Dispensed',
        },
      ],
      recordSource: 'Mobile Money Service Engine',
      lastUpdated: '10 Aug 2026, 04:20 PM',
    },
  ];

  const existingIds = new Set(uniqueMatched.map((m) => m.id));
  const combined = [...uniqueMatched];
  for (const s of supplemental) {
    if (!existingIds.has(s.id)) {
      existingIds.add(s.id);
      combined.push(s);
    }
  }

  return combined;
}
