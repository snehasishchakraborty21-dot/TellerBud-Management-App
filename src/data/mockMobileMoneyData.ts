import {
  MobileMoneyTransaction,
  MobileMoneyFilters,
  MobileMoneySummary,
  MobileMoneySortField,
  MobileMoneySortDirection,
} from '../types/mobileMoney';
import { MOCK_WALK_IN_TRANSACTIONS } from './mockWalkInData';
import { MOCK_LIVE_PICKUP_OPERATIONS } from './mockAdminData';
import { getAllCustomerRequests } from './mockCustomerRequestsData';

// Map existing Walk-In transactions to MobileMoneyTransaction format
const mappedWalkInTransactions: MobileMoneyTransaction[] = MOCK_WALK_IN_TRANSACTIONS.map((w, idx) => {
  const isRegistered = idx % 3 === 0;
  const custName = isRegistered
    ? ['Lombe Kasonde', 'Musonda Chanda', 'Precious Mwale', 'Bupe Chileshe', 'Sipho Daka', 'Choolwe Hamoonga'][idx % 6]
    : 'Walk-In Customer';
  const custId = isRegistered ? `TB-CUS-20${(idx + 10).toString()}` : undefined;

  let statusMapped: MobileMoneyTransaction['status'] = 'Completed';
  if (w.status === 'Processing') statusMapped = 'Active Service';
  else if (w.status === 'Pending') statusMapped = 'Pending Confirmation';
  else if (w.status === 'Failed') statusMapped = 'Failed';
  else if (w.status === 'Cancelled') statusMapped = 'Cancelled';
  else statusMapped = 'Completed';

  const dateObj = new Date(w.transactionTime);
  const formattedDate = dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ', ' + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Format primary reference as TB-TXN-xxxx deterministically
  const txnRef = w.reference.startsWith('TB-WLK-')
    ? w.reference.replace('TB-WLK-', 'TB-TXN-')
    : `TB-TXN-${w.reference}`;

  return {
    id: `MMT-WLK-${w.id}`,
    reference: txnRef,
    sourceReference: w.reference,
    sourceReferenceType: 'Walk-In',
    serviceChannel: 'Walk-In',
    transactionType: w.transactionType,
    vendor: w.vendor,
    vendorType: ['MTN', 'Airtel', 'Zamtel'].includes(w.vendor) ? 'MNO Mobile Money' : 'Bank API',
    
    isRegisteredCustomer: isRegistered,
    customerId: custId,
    customerName: custName,
    customerPhone: w.customerPhone,
    customerAccountStatus: isRegistered ? 'Verified KYC Tier 2' : 'Unregistered Walk-In Customer',

    agentId: w.agentId,
    agentName: w.agentName,
    agentPhone: w.agentPhone,
    businessId: w.businessId,
    businessName: w.businessName,
    businessLocation: 'Central Agency Counter, Lusaka',

    walkInLocation: `${w.businessName} - Desk ${(idx % 4) + 1}`,
    processingAgent: `${w.agentName} (${w.agentId})`,
    terminalId: w.terminalId || `POS-${w.businessId.slice(-3)}-0${(idx % 4) + 1}`,
    receiptNumber: w.receiptNumber || `REC-${w.vendor.slice(0, 2).toUpperCase()}-${88200 + idx}`,
    initiationTimestamp: w.transactionTime,

    amount: w.amount,
    reservationCharge: 0,
    otherCharges: 0,
    customerTotal: w.amount,

    principalProcessingMethod: ['MTN', 'Airtel', 'Zamtel'].includes(w.vendor)
      ? 'Direct MNO Open API'
      : 'Vendor Portal API Switch',
    customerConfirmationStatus: statusMapped === 'Completed' ? 'Confirmed' : statusMapped === 'Pending Confirmation' ? 'Pending' : 'Not Required',
    customerConfirmationTimestamp: statusMapped === 'Completed' ? w.transactionTime : undefined,
    customerConfirmationMethod: 'Walk-In Physical Handover & SMS Verification',
    agentConfirmationStatus: statusMapped === 'Completed' ? 'Confirmed' : 'In Progress',
    agentConfirmationTimestamp: statusMapped === 'Completed' ? w.transactionTime : undefined,
    agentConfirmationMethod: 'TellerBud Agent POS Terminal PIN',

    status: statusMapped,
    postedAt: w.transactionTime,
    formattedDate: formattedDate,

    timeline: [
      {
        id: `TL-${w.reference}-1`,
        eventName: 'Transaction Created',
        actor: 'Agent',
        timestamp: w.transactionTime,
        result: `Walk-In transaction initiated at counter for ZMW ${w.amount.toLocaleString()}.00`,
      },
      {
        id: `TL-${w.reference}-2`,
        eventName: 'Customer Verification',
        actor: 'Agent',
        timestamp: w.transactionTime,
        result: `Customer phone ${w.customerPhone} validated via terminal`,
      },
      {
        id: `TL-${w.reference}-3`,
        eventName: 'Vendor Processing',
        actor: 'System Switch',
        timestamp: w.transactionTime,
        result: `${w.vendor} payment rail authorized the balance transfer`,
      },
      {
        id: `TL-${w.reference}-4`,
        eventName: statusMapped === 'Completed' ? 'Transaction Completed' : statusMapped === 'Failed' ? 'Transaction Failed' : 'Service In Progress',
        actor: statusMapped === 'Completed' ? 'Agent & Customer' : 'System',
        timestamp: w.transactionTime,
        result: statusMapped === 'Completed'
          ? `Cash and digital confirmation finalized. Receipt: ${w.receiptNumber || 'REC-CONFIRMED'}`
          : statusMapped === 'Failed'
          ? 'Transaction failed due to vendor timeout. Reversal logged.'
          : 'Awaiting final confirmation',
      },
    ],

    recordSource: 'TellerBud Agent Terminal',
    lastUpdated: formattedDate,
  };
});

// Map Pickup transactions from active and historical records
// (Excluding reservation-only records like 'Finding an Agent', 'Matching', 'No Agent Available')
const rawPickupRequests = getAllCustomerRequests(MOCK_LIVE_PICKUP_OPERATIONS);

const mappedPickupTransactions: MobileMoneyTransaction[] = rawPickupRequests
  .filter((p) => {
    // Only include confirmed transactions (not reservation-only / unassigned matching requests)
    return (
      p.status !== 'Finding an Agent' &&
      p.status !== 'Matching' &&
      p.status !== 'No Agent Available' &&
      p.status !== 'Ready for Pickup' &&
      !!p.agentName
    );
  })
  .map((p, idx) => {
    let statusMapped: MobileMoneyTransaction['status'] = 'Completed';
    if (p.status === 'Agent Confirmed') statusMapped = 'Agent Confirmed';
    else if (p.status === 'Active Service') statusMapped = 'Active Service';
    else if (p.status === 'Pending Confirmation') statusMapped = 'Pending Confirmation';
    else if (p.status === 'Cancelled') statusMapped = 'Cancelled';
    else statusMapped = 'Completed';

    const resCharge = (p.amount > 5000 ? 25.0 : 15.0);
    const totalAmount = p.amount + resCharge;

    const baseDate = p.timestamp ? new Date(p.timestamp) : new Date(Date.now() - (idx + 1) * 3600000 * 4);
    const postedAt = baseDate.toISOString();
    const formattedDate = baseDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ', ' + baseDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Format primary reference as TB-TXN-xxxx deterministically
    const txnRef = p.id.startsWith('TB-REQ-')
      ? p.id.replace('TB-REQ-', 'TB-TXN-')
      : `TB-TXN-${p.id}`;

    return {
      id: `MMT-PCK-${p.id}`,
      reference: txnRef,
      sourceReference: p.id,
      sourceReferenceType: 'Customer Request',
      serviceChannel: 'Pickup',
      transactionType: p.type,
      vendor: p.vendor,
      vendorType: ['MTN', 'Airtel', 'Zamtel'].includes(p.vendor) ? 'MNO Mobile Money' : 'Bank API',

      isRegisteredCustomer: true,
      customerId: p.customerId || `TB-CUS-10${(idx + 20).toString()}`,
      customerName: p.customerName,
      customerPhone: p.customerPhone,
      customerAccountStatus: 'Verified KYC Tier 2',

      agentId: p.agentId || 'TB-AGT-1024',
      agentName: p.agentName || 'Kelvin Phiri',
      agentPhone: p.agentPhone || '+260 97 234 5678',
      businessId: p.businessId || 'BIZ-LUS-001',
      businessName: p.businessName || 'Lusaka Central Express Agency',
      businessLocation: 'Cairo Road Commercial Suite, Lusaka',

      pickupLocation: p.pickupLocation || 'Crossroads Shopping Mall, Leopard Hill Road, Lusaka',
      requestedServiceTime: p.serviceTime || 'Now',
      assignmentMethod: 'Automated Geospatial Dispatch',
      assignedTimestamp: formattedDate,

      amount: p.amount,
      reservationCharge: resCharge,
      otherCharges: 0,
      customerTotal: totalAmount,

      principalProcessingMethod: ['MTN', 'Airtel', 'Zamtel'].includes(p.vendor)
        ? 'Direct MNO Open API'
        : 'Bank Core API Integration',
      customerConfirmationStatus: statusMapped === 'Completed' ? 'Confirmed' : 'Pending',
      customerConfirmationTimestamp: statusMapped === 'Completed' ? postedAt : undefined,
      customerConfirmationMethod: 'In-App Customer Confirmation PIN',
      agentConfirmationStatus: statusMapped === 'Completed' || statusMapped === 'Agent Confirmed' ? 'Confirmed' : 'Pending',
      agentConfirmationTimestamp: postedAt,
      agentConfirmationMethod: 'TellerBud Agent App Verification',

      status: statusMapped,
      postedAt: postedAt,
      formattedDate: formattedDate,

      timeline: [
        {
          id: `TL-${p.id}-1`,
          eventName: 'Transaction Created',
          actor: 'Customer',
          timestamp: postedAt,
          result: `Pickup request created for ${p.type} of ZMW ${p.amount.toLocaleString()}.00 via ${p.vendor}`,
        },
        {
          id: `TL-${p.id}-2`,
          eventName: 'Agent Assigned',
          actor: 'Automated Dispatch',
          timestamp: postedAt,
          result: `Matched and dispatched to Agent ${p.agentName} (${p.agentId || 'TB-AGT-1024'})`,
        },
        {
          id: `TL-${p.id}-3`,
          eventName: 'Agent Confirmed',
          actor: 'Agent',
          timestamp: postedAt,
          result: `Agent accepted service request and arrived at ${p.pickupLocation || 'Pickup Location'}`,
        },
        {
          id: `TL-${p.id}-4`,
          eventName: statusMapped === 'Completed' ? 'Transaction Completed' : statusMapped === 'Cancelled' ? 'Transaction Cancelled' : 'Service In Progress',
          actor: statusMapped === 'Completed' ? 'Agent & Customer' : 'System',
          timestamp: postedAt,
          result: statusMapped === 'Completed'
            ? `Customer OTP confirmed and funds settled. Total collected: ZMW ${totalAmount.toFixed(2)}`
            : statusMapped === 'Cancelled'
            ? 'Transaction cancelled before completion.'
            : 'Service verification in progress.',
        },
      ],

      recordSource: 'TellerBud Pickup Engine',
      lastUpdated: formattedDate,
    };
  });

// Unified list of all Mobile Money Transactions
export const MOCK_MOBILE_MONEY_TRANSACTIONS: MobileMoneyTransaction[] = [
  ...mappedPickupTransactions,
  ...mappedWalkInTransactions,
].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

/**
 * Filter and query mobile money transactions
 */
export function queryMobileMoneyTransactions(
  transactions: MobileMoneyTransaction[],
  filters: Partial<MobileMoneyFilters> = {},
  sort: { field: MobileMoneySortField; direction: MobileMoneySortDirection } = {
    field: 'postedAt',
    direction: 'desc',
  },
  businessScope?: string // if provided (e.g. for Business Owner), strict business isolation
): { items: MobileMoneyTransaction[]; total: number; summary: MobileMoneySummary } {
  let result = [...transactions];

  // 1. Strict Business Owner isolation if scoped
  if (businessScope && businessScope !== 'ALL') {
    const scopeLower = businessScope.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.businessName.toLowerCase().trim() === scopeLower ||
        t.businessId.toLowerCase().trim() === scopeLower
    );
  }

  // 2. Derive Summary based on the portal-scoped data
  const summary: MobileMoneySummary = {
    total: result.length,
    pickup: result.filter((t) => t.serviceChannel === 'Pickup').length,
    walkIn: result.filter((t) => t.serviceChannel === 'Walk-In').length,
    completed: result.filter((t) => t.status === 'Completed').length,
    pendingConfirmation: result.filter(
      (t) => t.status === 'Pending Confirmation' || t.status === 'Agent Confirmed' || t.status === 'Active Service'
    ).length,
    cancelledFailed: result.filter(
      (t) => t.status === 'Cancelled' || t.status === 'Failed'
    ).length,
  };

  // 3. Apply Filters
  if (filters.search && filters.search.trim() !== '') {
    const query = filters.search.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.reference.toLowerCase().includes(query) ||
        (t.sourceReference && t.sourceReference.toLowerCase().includes(query)) ||
        t.customerName.toLowerCase().includes(query) ||
        (t.customerId && t.customerId.toLowerCase().includes(query)) ||
        t.customerPhone.toLowerCase().includes(query) ||
        t.agentName.toLowerCase().includes(query) ||
        t.agentId.toLowerCase().includes(query) ||
        t.businessName.toLowerCase().includes(query)
    );
  }

  if (filters.serviceChannel && filters.serviceChannel !== 'ALL') {
    result = result.filter((t) => t.serviceChannel === filters.serviceChannel);
  }

  if (filters.transactionType && filters.transactionType !== 'ALL') {
    result = result.filter((t) => t.transactionType === filters.transactionType);
  }

  if (filters.vendor && filters.vendor !== 'ALL') {
    result = result.filter((t) => t.vendor === filters.vendor);
  }

  if (filters.status && filters.status !== 'ALL') {
    if (filters.status === 'Cancelled_Failed') {
      result = result.filter((t) => t.status === 'Cancelled' || t.status === 'Failed');
    } else {
      result = result.filter((t) => t.status === filters.status);
    }
  }

  if (filters.business && filters.business !== 'ALL') {
    const bQuery = filters.business.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.businessName.toLowerCase().trim() === bQuery ||
        t.businessId.toLowerCase().trim() === bQuery
    );
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    result = result.filter((t) => new Date(t.postedAt).getTime() >= from);
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime() + 86400000; // End of day
    result = result.filter((t) => new Date(t.postedAt).getTime() <= to);
  }

  // 4. Sort
  result.sort((a, b) => {
    let comparison = 0;
    if (sort.field === 'postedAt') {
      comparison = new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
    } else if (sort.field === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sort.field === 'status') {
      comparison = a.status.localeCompare(b.status);
    } else if (sort.field === 'reference') {
      comparison = a.reference.localeCompare(b.reference);
    }
    return sort.direction === 'asc' ? comparison : -comparison;
  });

  return {
    items: result,
    total: result.length,
    summary,
  };
}
