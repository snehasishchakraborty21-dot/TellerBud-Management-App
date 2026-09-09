import {
  MobileMoneyTransaction,
  MobileMoneyFilters,
  MobileMoneySummary,
  MobileMoneySortField,
  MobileMoneySortDirection,
} from '../types/mobileMoney';
import { calculateMobileMoneyKPIs } from '../utils/financialUtils';
import { MOCK_WALK_IN_TRANSACTIONS } from './mockWalkInData';
import { MOCK_LIVE_PICKUP_OPERATIONS } from './mockAdminData';
import { getAllCustomerRequests } from './mockCustomerRequestsData';

// Map existing Walk-In transactions to MobileMoneyTransaction format
const mappedWalkInTransactions: MobileMoneyTransaction[] = MOCK_WALK_IN_TRANSACTIONS.map((w, idx) => {
  const isRegistered = idx % 3 === 0;
  const custName = isRegistered
    ? ['Lombe Kasonde', 'Musonda Chanda', 'Precious Mwale', 'Chisomo Banda', 'Sipho Daka', 'Choolwe Hamoonga'][idx % 6]
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

// Curated transactions for Today (2026-09-08) and Yesterday (2026-09-07)
const DATED_MOBILE_MONEY_TRANSACTIONS: MobileMoneyTransaction[] = [
  // --- TODAY: 2026-09-08 ---
  {
    id: 'MMT-TODAY-01',
    reference: 'TB-TXN-9081',
    sourceReference: 'TB-REQ-1052',
    sourceReferenceType: 'Customer Request',
    serviceChannel: 'Pickup',
    transactionType: 'Deposit',
    vendor: 'MTN',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-1052',
    customerName: 'Mwamba Mulenga',
    customerPhone: '+260 97 778 9012',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    agentPhone: '+260 97 234 5678',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    pickupLocation: 'Arcades Shopping Centre, Great East Rd, Lusaka',
    requestedServiceTime: 'Today, 02:30 PM',
    assignmentMethod: 'Automated Geospatial Dispatch',
    assignedTimestamp: '08 Sep 2026, 14:10',
    amount: 5000.0,
    reservationCharge: 25.0,
    otherCharges: 0,
    customerTotal: 5025.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-08T14:35:00+02:00',
    customerConfirmationMethod: 'In-App Customer Confirmation PIN',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-08T14:35:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent App Verification',
    status: 'Completed',
    postedAt: '2026-09-08T14:35:00+02:00',
    formattedDate: '08 Sep 2026, 14:35',
    timeline: [
      { id: 'TL-9081-1', eventName: 'Transaction Created', actor: 'Customer', timestamp: '2026-09-08T14:05:00+02:00', result: 'Pickup request created for Deposit of ZMW 5,000.00' },
      { id: 'TL-9081-2', eventName: 'Agent Dispatched', actor: 'Automated Dispatch', timestamp: '2026-09-08T14:10:00+02:00', result: 'Matched to Agent Kelvin Phiri (TB-AGT-1024)' },
      { id: 'TL-9081-3', eventName: 'Agent Confirmed Arrival', actor: 'Agent', timestamp: '2026-09-08T14:28:00+02:00', result: 'Agent arrived at Arcades Shopping Centre' },
      { id: 'TL-9081-4', eventName: 'Transaction Completed', actor: 'Agent & Customer', timestamp: '2026-09-08T14:35:00+02:00', result: 'Customer OTP verified and cash received. Total: ZMW 5,025.00' },
    ],
    recordSource: 'TellerBud Pickup Engine',
    lastUpdated: '08 Sep 2026, 14:35',
  },
  {
    id: 'MMT-TODAY-02',
    reference: 'TB-TXN-9082',
    sourceReference: 'TB-WLK-4401',
    sourceReferenceType: 'Walk-In',
    serviceChannel: 'Walk-In',
    transactionType: 'Deposit',
    vendor: 'MTN',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: false,
    customerName: 'Walk-In Customer',
    customerPhone: '+260 97 112 3456',
    customerAccountStatus: 'Unregistered Walk-In Customer',
    agentId: 'TB-AGT-1062',
    agentName: 'Natasha Zulu',
    agentPhone: '+260 97 556 7890',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    walkInLocation: 'Lusaka Central Express Agency - Counter 1',
    processingAgent: 'Natasha Zulu (TB-AGT-1062)',
    terminalId: 'POS-LUS-01',
    receiptNumber: 'REC-MTN-90820',
    initiationTimestamp: '2026-09-08T13:20:00+02:00',
    amount: 3200.0,
    reservationCharge: 20.0,
    otherCharges: 0,
    customerTotal: 3220.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-08T13:22:00+02:00',
    customerConfirmationMethod: 'Walk-In Physical Handover & SMS Verification',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-08T13:22:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent POS Terminal PIN',
    status: 'Completed',
    postedAt: '2026-09-08T13:22:00+02:00',
    formattedDate: '08 Sep 2026, 13:22',
    timeline: [
      { id: 'TL-9082-1', eventName: 'Transaction Created', actor: 'Agent', timestamp: '2026-09-08T13:20:00+02:00', result: 'Walk-In transaction initiated for ZMW 3,200.00' },
      { id: 'TL-9082-2', eventName: 'Vendor Processing', actor: 'System Switch', timestamp: '2026-09-08T13:21:15+02:00', result: 'MTN Mobile Money authorized the balance credit' },
      { id: 'TL-9082-3', eventName: 'Transaction Completed', actor: 'Agent', timestamp: '2026-09-08T13:22:00+02:00', result: 'Receipt issued: REC-MTN-90820' },
    ],
    recordSource: 'TellerBud Agent Terminal',
    lastUpdated: '08 Sep 2026, 13:22',
  },
  {
    id: 'MMT-TODAY-03',
    reference: 'TB-TXN-9083',
    sourceReference: 'TB-REQ-1048',
    sourceReferenceType: 'Customer Request',
    serviceChannel: 'Pickup',
    transactionType: 'Withdrawal',
    vendor: 'MTN',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-1048',
    customerName: 'Ruth Banda',
    customerPhone: '+260 97 654 3210',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    agentPhone: '+260 97 234 5678',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    pickupLocation: 'Woodlands Shopping Mall, Lusaka',
    requestedServiceTime: 'Now',
    assignmentMethod: 'Automated Geospatial Dispatch',
    assignedTimestamp: '08 Sep 2026, 11:42',
    amount: 2500.0,
    reservationCharge: 15.0,
    otherCharges: 0,
    customerTotal: 2515.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-08T12:05:00+02:00',
    customerConfirmationMethod: 'In-App Customer Confirmation PIN',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-08T12:05:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent App Verification',
    status: 'Completed',
    postedAt: '2026-09-08T12:05:00+02:00',
    formattedDate: '08 Sep 2026, 12:05',
    timeline: [
      { id: 'TL-9083-1', eventName: 'Transaction Created', actor: 'Customer', timestamp: '2026-09-08T11:42:00+02:00', result: 'Pickup request created for Withdrawal of ZMW 2,500.00' },
      { id: 'TL-9083-2', eventName: 'Agent Dispatched', actor: 'Automated Dispatch', timestamp: '2026-09-08T11:43:00+02:00', result: 'Dispatched to Kelvin Phiri (TB-AGT-1024)' },
      { id: 'TL-9083-3', eventName: 'Transaction Completed', actor: 'Agent & Customer', timestamp: '2026-09-08T12:05:00+02:00', result: 'Cash handed to customer. Settlement total: ZMW 2,515.00' },
    ],
    recordSource: 'TellerBud Pickup Engine',
    lastUpdated: '08 Sep 2026, 12:05',
  },
  {
    id: 'MMT-TODAY-04',
    reference: 'TB-TXN-9084',
    sourceReference: 'TB-WLK-4402',
    sourceReferenceType: 'Walk-In',
    serviceChannel: 'Walk-In',
    transactionType: 'Withdrawal',
    vendor: 'Airtel',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-2012',
    customerName: 'Precious Mwale',
    customerPhone: '+260 97 445 6789',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    agentPhone: '+260 97 234 5678',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    walkInLocation: 'Lusaka Central Express Agency - Counter 2',
    processingAgent: 'Kelvin Phiri (TB-AGT-1024)',
    terminalId: 'POS-LUS-02',
    receiptNumber: 'REC-AIR-90841',
    initiationTimestamp: '2026-09-08T11:15:00+02:00',
    amount: 1800.0,
    reservationCharge: 15.0,
    otherCharges: 0,
    customerTotal: 1815.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-08T11:18:00+02:00',
    customerConfirmationMethod: 'Walk-In Physical Handover & SMS Verification',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-08T11:18:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent POS Terminal PIN',
    status: 'Completed',
    postedAt: '2026-09-08T11:18:00+02:00',
    formattedDate: '08 Sep 2026, 11:18',
    timeline: [
      { id: 'TL-9084-1', eventName: 'Transaction Created', actor: 'Agent', timestamp: '2026-09-08T11:15:00+02:00', result: 'Customer requested counter withdrawal of ZMW 1,800.00' },
      { id: 'TL-9084-2', eventName: 'Transaction Completed', actor: 'Agent', timestamp: '2026-09-08T11:18:00+02:00', result: 'Funds debited via Airtel Money and cash handed to customer' },
    ],
    recordSource: 'TellerBud Agent Terminal',
    lastUpdated: '08 Sep 2026, 11:18',
  },
  {
    id: 'MMT-TODAY-05',
    reference: 'TB-TXN-9085',
    sourceReference: 'TB-REQ-1050',
    sourceReferenceType: 'Customer Request',
    serviceChannel: 'Pickup',
    transactionType: 'Purchase',
    vendor: 'Zanaco',
    vendorType: 'Bank API',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-1050',
    customerName: 'Grace Tembo',
    customerPhone: '+260 97 345 1050',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-1062',
    agentName: 'Natasha Zulu',
    agentPhone: '+260 97 556 7890',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    pickupLocation: 'Manda Hill Mall, Lusaka',
    requestedServiceTime: 'Now',
    assignmentMethod: 'Automated Geospatial Dispatch',
    assignedTimestamp: '08 Sep 2026, 10:35',
    amount: 3750.0,
    reservationCharge: 25.0,
    otherCharges: 0,
    customerTotal: 3775.0,
    principalProcessingMethod: 'Bank Core API Integration',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-08T10:58:00+02:00',
    customerConfirmationMethod: 'In-App Customer Confirmation PIN',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-08T10:58:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent App Verification',
    status: 'Completed',
    postedAt: '2026-09-08T10:58:00+02:00',
    formattedDate: '08 Sep 2026, 10:58',
    timeline: [
      { id: 'TL-9085-1', eventName: 'Transaction Created', actor: 'Customer', timestamp: '2026-09-08T10:35:00+02:00', result: 'Service purchase requested via Zanaco bank voucher' },
      { id: 'TL-9085-2', eventName: 'Transaction Completed', actor: 'Agent & Customer', timestamp: '2026-09-08T10:58:00+02:00', result: 'Voucher settled. Total: ZMW 3,765.00' },
    ],
    recordSource: 'TellerBud Pickup Engine',
    lastUpdated: '08 Sep 2026, 10:58',
  },
  {
    id: 'MMT-TODAY-06',
    reference: 'TB-TXN-9086',
    sourceReference: 'TB-WLK-4403',
    sourceReferenceType: 'Walk-In',
    serviceChannel: 'Walk-In',
    transactionType: 'Deposit',
    vendor: 'Airtel',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-1049',
    customerName: 'Chileshe Mumba',
    customerPhone: '+260 95 334 5678',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-1062',
    agentName: 'Natasha Zulu',
    agentPhone: '+260 97 556 7890',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    walkInLocation: 'Lusaka Central Express Agency - Counter 1',
    processingAgent: 'Natasha Zulu (TB-AGT-1062)',
    terminalId: 'POS-LUS-01',
    receiptNumber: 'REC-AIR-90862',
    initiationTimestamp: '2026-09-08T10:15:00+02:00',
    amount: 1200.0,
    reservationCharge: 0,
    otherCharges: 0,
    customerTotal: 1200.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Pending',
    agentConfirmationStatus: 'In Progress',
    agentConfirmationTimestamp: '2026-09-08T10:15:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent POS Terminal PIN',
    status: 'Pending Confirmation',
    postedAt: '2026-09-08T10:15:00+02:00',
    formattedDate: '08 Sep 2026, 10:15',
    timeline: [
      { id: 'TL-9086-1', eventName: 'Transaction Created', actor: 'Agent', timestamp: '2026-09-08T10:15:00+02:00', result: 'Deposit initiated, awaiting MNO switch confirmation' },
    ],
    recordSource: 'TellerBud Agent Terminal',
    lastUpdated: '08 Sep 2026, 10:15',
  },
  {
    id: 'MMT-TODAY-07',
    reference: 'TB-TXN-9087',
    sourceReference: 'TB-REQ-1046',
    sourceReferenceType: 'Customer Request',
    serviceChannel: 'Pickup',
    transactionType: 'Withdrawal',
    vendor: 'Airtel',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-1046',
    customerName: 'Lombe Kasonde',
    customerPhone: '+260 96 612 9901',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-1088',
    agentName: 'Brian Chanda',
    agentPhone: '+260 96 112 3344',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    pickupLocation: 'Kabulonga Centro Mall, Lusaka',
    requestedServiceTime: 'Now',
    assignmentMethod: 'Automated Geospatial Dispatch',
    assignedTimestamp: '08 Sep 2026, 09:30',
    amount: 4800.0,
    reservationCharge: 15.0,
    otherCharges: 0,
    customerTotal: 4815.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Pending',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-08T09:35:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent App Verification',
    status: 'Pending Confirmation',
    postedAt: '2026-09-08T09:35:00+02:00',
    formattedDate: '08 Sep 2026, 09:35',
    timeline: [
      { id: 'TL-9087-1', eventName: 'Transaction Created', actor: 'Customer', timestamp: '2026-09-08T09:30:00+02:00', result: 'Pickup withdrawal requested' },
      { id: 'TL-9087-2', eventName: 'Agent Dispatched', actor: 'Automated Dispatch', timestamp: '2026-09-08T09:32:00+02:00', result: 'Dispatched to Brian Chanda' },
    ],
    recordSource: 'TellerBud Pickup Engine',
    lastUpdated: '08 Sep 2026, 09:35',
  },
  {
    id: 'MMT-TODAY-08',
    reference: 'TB-TXN-9088',
    sourceReference: 'TB-WLK-4404',
    sourceReferenceType: 'Walk-In',
    serviceChannel: 'Walk-In',
    transactionType: 'Purchase',
    vendor: 'Zamtel',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: false,
    customerName: 'Walk-In Customer',
    customerPhone: '+260 95 889 0011',
    customerAccountStatus: 'Unregistered Walk-In Customer',
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    agentPhone: '+260 97 234 5678',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    walkInLocation: 'Lusaka Central Express Agency - Counter 2',
    processingAgent: 'Kelvin Phiri (TB-AGT-1024)',
    terminalId: 'POS-LUS-02',
    receiptNumber: 'REC-ZAM-90883',
    initiationTimestamp: '2026-09-08T09:10:00+02:00',
    amount: 950.0,
    reservationCharge: 0,
    otherCharges: 0,
    customerTotal: 950.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Failed',
    agentConfirmationStatus: 'In Progress',
    status: 'Failed',
    postedAt: '2026-09-08T09:12:00+02:00',
    formattedDate: '08 Sep 2026, 09:12',
    timeline: [
      { id: 'TL-9088-1', eventName: 'Transaction Created', actor: 'Agent', timestamp: '2026-09-08T09:10:00+02:00', result: 'Walk-In purchase initiated for ZMW 950.00' },
      { id: 'TL-9088-2', eventName: 'Transaction Failed', actor: 'System Switch', timestamp: '2026-09-08T09:12:00+02:00', result: 'Zamtel provider rail timed out. Transaction cancelled.' },
    ],
    recordSource: 'TellerBud Agent Terminal',
    lastUpdated: '08 Sep 2026, 09:12',
  },
  {
    id: 'MMT-TODAY-09',
    reference: 'TB-TXN-9089',
    sourceReference: 'TB-REQ-1055',
    sourceReferenceType: 'Customer Request',
    serviceChannel: 'Pickup',
    transactionType: 'Deposit',
    vendor: 'FNB',
    vendorType: 'Bank API',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-2015',
    customerName: 'Bwembya Musonda',
    customerPhone: '+260 97 334 1122',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    agentPhone: '+260 97 234 5678',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    pickupLocation: 'Pinnacle Mall, Woodlands, Lusaka',
    requestedServiceTime: 'Today, 08:30 AM',
    assignmentMethod: 'Automated Geospatial Dispatch',
    assignedTimestamp: '08 Sep 2026, 08:25',
    amount: 8000.0,
    reservationCharge: 25.0,
    otherCharges: 0,
    customerTotal: 8025.0,
    principalProcessingMethod: 'Bank Core API Integration',
    customerConfirmationStatus: 'Not Required',
    agentConfirmationStatus: 'Pending',
    status: 'Cancelled',
    postedAt: '2026-09-08T08:45:00+02:00',
    formattedDate: '08 Sep 2026, 08:45',
    timeline: [
      { id: 'TL-9089-1', eventName: 'Transaction Created', actor: 'Customer', timestamp: '2026-09-08T08:20:00+02:00', result: 'Pickup request created for ZMW 8,000.00' },
      { id: 'TL-9089-2', eventName: 'Transaction Cancelled', actor: 'Customer', timestamp: '2026-09-08T08:45:00+02:00', result: 'Customer cancelled service before agent departure' },
    ],
    recordSource: 'TellerBud Pickup Engine',
    lastUpdated: '08 Sep 2026, 08:45',
  },
  // Today records from OTHER businesses (visible to Super Admin, hidden from Business Owner):
  {
    id: 'MMT-TODAY-10',
    reference: 'TB-TXN-9090',
    sourceReference: 'TB-WLK-5501',
    sourceReferenceType: 'Walk-In',
    serviceChannel: 'Walk-In',
    transactionType: 'Deposit',
    vendor: 'MTN',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-3021',
    customerName: 'Sipho Daka',
    customerPhone: '+260 97 881 2233',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-2001',
    agentName: 'Mubanga Mwila',
    agentPhone: '+260 97 990 1122',
    businessId: 'BIZ-COP-002',
    businessName: 'Copperbelt Liquidity Hub',
    businessLocation: 'City Centre Agency Desk, Kitwe',
    walkInLocation: 'Copperbelt Liquidity Hub - Counter 1',
    processingAgent: 'Mubanga Mwila (TB-AGT-2001)',
    terminalId: 'POS-COP-01',
    receiptNumber: 'REC-MTN-90901',
    initiationTimestamp: '2026-09-08T12:45:00+02:00',
    amount: 6500.0,
    reservationCharge: 45.0,
    otherCharges: 0,
    customerTotal: 6545.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-08T12:48:00+02:00',
    customerConfirmationMethod: 'Walk-In Physical Handover & SMS Verification',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-08T12:48:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent POS Terminal PIN',
    status: 'Completed',
    postedAt: '2026-09-08T12:48:00+02:00',
    formattedDate: '08 Sep 2026, 12:48',
    timeline: [
      { id: 'TL-9090-1', eventName: 'Transaction Created', actor: 'Agent', timestamp: '2026-09-08T12:45:00+02:00', result: 'Walk-In deposit initiated for ZMW 6,500.00' },
      { id: 'TL-9090-2', eventName: 'Transaction Completed', actor: 'Agent', timestamp: '2026-09-08T12:48:00+02:00', result: 'Completed successfully' },
    ],
    recordSource: 'TellerBud Agent Terminal',
    lastUpdated: '08 Sep 2026, 12:48',
  },
  {
    id: 'MMT-TODAY-11',
    reference: 'TB-TXN-9091',
    sourceReference: 'TB-REQ-2011',
    sourceReferenceType: 'Customer Request',
    serviceChannel: 'Pickup',
    transactionType: 'Withdrawal',
    vendor: 'Airtel',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-3022',
    customerName: 'Choolwe Hamoonga',
    customerPhone: '+260 96 441 5566',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-2002',
    agentName: 'Kabaso Chola',
    agentPhone: '+260 96 332 1100',
    businessId: 'BIZ-COP-002',
    businessName: 'Copperbelt Liquidity Hub',
    businessLocation: 'City Centre Agency Desk, Kitwe',
    pickupLocation: 'Mukuba Mall, Kitwe',
    requestedServiceTime: 'Today, 11:30 AM',
    assignmentMethod: 'Automated Geospatial Dispatch',
    assignedTimestamp: '08 Sep 2026, 11:20',
    amount: 3000.0,
    reservationCharge: 25.0,
    otherCharges: 0,
    customerTotal: 3025.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-08T11:45:00+02:00',
    customerConfirmationMethod: 'In-App Customer Confirmation PIN',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-08T11:45:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent App Verification',
    status: 'Completed',
    postedAt: '2026-09-08T11:45:00+02:00',
    formattedDate: '08 Sep 2026, 11:45',
    timeline: [
      { id: 'TL-9091-1', eventName: 'Transaction Created', actor: 'Customer', timestamp: '2026-09-08T11:15:00+02:00', result: 'Pickup withdrawal requested' },
      { id: 'TL-9091-2', eventName: 'Transaction Completed', actor: 'Agent & Customer', timestamp: '2026-09-08T11:45:00+02:00', result: 'Completed successfully' },
    ],
    recordSource: 'TellerBud Pickup Engine',
    lastUpdated: '08 Sep 2026, 11:45',
  },
  {
    id: 'MMT-TODAY-12',
    reference: 'TB-TXN-9092',
    sourceReference: 'TB-WLK-6601',
    sourceReferenceType: 'Walk-In',
    serviceChannel: 'Walk-In',
    transactionType: 'Withdrawal',
    vendor: 'MTN',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: false,
    customerName: 'Walk-In Customer',
    customerPhone: '+260 97 331 4455',
    customerAccountStatus: 'Unregistered Walk-In Customer',
    agentId: 'TB-AGT-3001',
    agentName: 'Namakau Sitali',
    agentPhone: '+260 97 114 5566',
    businessId: 'BIZ-LIV-003',
    businessName: 'Livingstone Digital Agency',
    businessLocation: 'Mosi-oa-Tunya Rd, Livingstone',
    walkInLocation: 'Livingstone Digital Agency - Counter 1',
    processingAgent: 'Namakau Sitali (TB-AGT-3001)',
    terminalId: 'POS-LIV-01',
    receiptNumber: 'REC-MTN-90922',
    initiationTimestamp: '2026-09-08T10:40:00+02:00',
    amount: 2200.0,
    reservationCharge: 30.0,
    otherCharges: 0,
    customerTotal: 2230.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-08T10:44:00+02:00',
    customerConfirmationMethod: 'Walk-In Physical Handover & SMS Verification',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-08T10:44:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent POS Terminal PIN',
    status: 'Completed',
    postedAt: '2026-09-08T10:44:00+02:00',
    formattedDate: '08 Sep 2026, 10:44',
    timeline: [
      { id: 'TL-9092-1', eventName: 'Transaction Created', actor: 'Agent', timestamp: '2026-09-08T10:40:00+02:00', result: 'Walk-In withdrawal initiated' },
      { id: 'TL-9092-2', eventName: 'Transaction Completed', actor: 'Agent', timestamp: '2026-09-08T10:44:00+02:00', result: 'Completed' },
    ],
    recordSource: 'TellerBud Agent Terminal',
    lastUpdated: '08 Sep 2026, 10:44',
  },
  {
    id: 'MMT-YEST-04',
    reference: 'TB-TXN-9074',
    sourceReference: 'TB-REQ-4001',
    sourceReferenceType: 'Customer Request',
    serviceChannel: 'Pickup',
    transactionType: 'Deposit',
    vendor: 'Zanaco',
    vendorType: 'Bank API',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-4011',
    customerName: 'Brian Mwape',
    customerPhone: '+260 97 662 1144',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-4001',
    agentName: 'Chanda Bwalya',
    agentPhone: '+260 97 551 2233',
    businessId: 'BIZ-KAB-004',
    businessName: 'Kabwata Market Agency',
    businessLocation: 'Burma Road Commercial Square, Lusaka',
    pickupLocation: 'Kabwata Cultural Village, Lusaka',
    requestedServiceTime: '07 Sep 2026, 09:00 AM',
    assignmentMethod: 'Automated Geospatial Dispatch',
    assignedTimestamp: '07 Sep 2026, 08:50',
    amount: 4500.0,
    reservationCharge: 15.0,
    otherCharges: 0,
    customerTotal: 4515.0,
    principalProcessingMethod: 'Bank Core API Integration',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-07T09:20:00+02:00',
    customerConfirmationMethod: 'In-App Customer Confirmation PIN',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-07T09:20:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent App Verification',
    status: 'Completed',
    postedAt: '2026-09-07T09:20:00+02:00',
    formattedDate: '07 Sep 2026, 09:20',
    timeline: [
      { id: 'TL-9074-1', eventName: 'Transaction Created', actor: 'Customer', timestamp: '2026-09-07T08:45:00+02:00', result: 'Pickup deposit requested' },
      { id: 'TL-9074-2', eventName: 'Transaction Completed', actor: 'Agent & Customer', timestamp: '2026-09-07T09:20:00+02:00', result: 'Completed' },
    ],
    recordSource: 'TellerBud Pickup Engine',
    lastUpdated: '07 Sep 2026, 09:20',
  },
  {
    id: 'MMT-YEST-05',
    reference: 'TB-TXN-9075',
    sourceReference: 'TB-WLK-7701',
    sourceReferenceType: 'Walk-In',
    serviceChannel: 'Walk-In',
    transactionType: 'Deposit',
    vendor: 'MTN',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-5011',
    customerName: 'Musonda Chanda',
    customerPhone: '+260 97 771 8899',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-5001',
    agentName: 'Joseph Mutale',
    agentPhone: '+260 97 220 3344',
    businessId: 'BIZ-NDO-005',
    businessName: 'Ndola Commerce Express',
    businessLocation: 'Broadway Avenue, Ndola',
    walkInLocation: 'Ndola Commerce Express - Counter 1',
    processingAgent: 'Joseph Mutale (TB-AGT-5001)',
    terminalId: 'POS-NDO-01',
    receiptNumber: 'REC-MTN-90751',
    initiationTimestamp: '2026-09-07T08:10:00+02:00',
    amount: 1500.0,
    reservationCharge: 15.0,
    otherCharges: 0,
    customerTotal: 1515.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-07T08:14:00+02:00',
    customerConfirmationMethod: 'Walk-In Physical Handover & SMS Verification',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-07T08:14:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent POS Terminal PIN',
    status: 'Completed',
    postedAt: '2026-09-07T08:14:00+02:00',
    formattedDate: '07 Sep 2026, 08:14',
    timeline: [
      { id: 'TL-9075-1', eventName: 'Transaction Created', actor: 'Agent', timestamp: '2026-09-07T08:10:00+02:00', result: 'Walk-In deposit initiated' },
      { id: 'TL-9075-2', eventName: 'Transaction Completed', actor: 'Agent', timestamp: '2026-09-07T08:14:00+02:00', result: 'Completed' },
    ],
    recordSource: 'TellerBud Agent Terminal',
    lastUpdated: '07 Sep 2026, 08:14',
  },

  // --- YESTERDAY: 2026-09-07 ---
  {
    id: 'MMT-YEST-01',
    reference: 'TB-TXN-9071',
    sourceReference: 'TB-REQ-1040',
    sourceReferenceType: 'Customer Request',
    serviceChannel: 'Pickup',
    transactionType: 'Deposit',
    vendor: 'MTN',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-1048',
    customerName: 'Ruth Banda',
    customerPhone: '+260 97 654 3210',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    agentPhone: '+260 97 234 5678',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    pickupLocation: 'East Park Mall, Great East Rd, Lusaka',
    requestedServiceTime: '07 Sep 2026, 16:00',
    assignmentMethod: 'Automated Geospatial Dispatch',
    assignedTimestamp: '07 Sep 2026, 15:40',
    amount: 3500.0,
    reservationCharge: 15.0,
    otherCharges: 0,
    customerTotal: 3515.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-07T16:15:00+02:00',
    customerConfirmationMethod: 'In-App Customer Confirmation PIN',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-07T16:15:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent App Verification',
    status: 'Completed',
    postedAt: '2026-09-07T16:15:00+02:00',
    formattedDate: '07 Sep 2026, 16:15',
    timeline: [
      { id: 'TL-9071-1', eventName: 'Transaction Created', actor: 'Customer', timestamp: '2026-09-07T15:35:00+02:00', result: 'Pickup deposit requested' },
      { id: 'TL-9071-2', eventName: 'Transaction Completed', actor: 'Agent & Customer', timestamp: '2026-09-07T16:15:00+02:00', result: 'Completed' },
    ],
    recordSource: 'TellerBud Pickup Engine',
    lastUpdated: '07 Sep 2026, 16:15',
  },
  {
    id: 'MMT-YEST-02',
    reference: 'TB-TXN-9072',
    sourceReference: 'TB-WLK-4390',
    sourceReferenceType: 'Walk-In',
    serviceChannel: 'Walk-In',
    transactionType: 'Withdrawal',
    vendor: 'Airtel',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: false,
    customerName: 'Walk-In Customer',
    customerPhone: '+260 97 554 3322',
    customerAccountStatus: 'Unregistered Walk-In Customer',
    agentId: 'TB-AGT-1062',
    agentName: 'Natasha Zulu',
    agentPhone: '+260 97 556 7890',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    walkInLocation: 'Lusaka Central Express Agency - Counter 1',
    processingAgent: 'Natasha Zulu (TB-AGT-1062)',
    terminalId: 'POS-LUS-01',
    receiptNumber: 'REC-AIR-90721',
    initiationTimestamp: '2026-09-07T14:20:00+02:00',
    amount: 2100.0,
    reservationCharge: 0,
    otherCharges: 0,
    customerTotal: 2100.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-07T14:25:00+02:00',
    customerConfirmationMethod: 'Walk-In Physical Handover & SMS Verification',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-07T14:25:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent POS Terminal PIN',
    status: 'Completed',
    postedAt: '2026-09-07T14:25:00+02:00',
    formattedDate: '07 Sep 2026, 14:25',
    timeline: [
      { id: 'TL-9072-1', eventName: 'Transaction Created', actor: 'Agent', timestamp: '2026-09-07T14:20:00+02:00', result: 'Walk-In withdrawal initiated' },
      { id: 'TL-9072-2', eventName: 'Transaction Completed', actor: 'Agent', timestamp: '2026-09-07T14:25:00+02:00', result: 'Completed' },
    ],
    recordSource: 'TellerBud Agent Terminal',
    lastUpdated: '07 Sep 2026, 14:25',
  },
  {
    id: 'MMT-YEST-03',
    reference: 'TB-TXN-9073',
    sourceReference: 'TB-REQ-1039',
    sourceReferenceType: 'Customer Request',
    serviceChannel: 'Pickup',
    transactionType: 'Purchase',
    vendor: 'MTN',
    vendorType: 'MNO Mobile Money',
    isRegisteredCustomer: true,
    customerId: 'TB-CUS-1052',
    customerName: 'Mwamba Mulenga',
    customerPhone: '+260 97 778 9012',
    customerAccountStatus: 'Verified KYC Tier 2',
    agentId: 'TB-AGT-1024',
    agentName: 'Kelvin Phiri',
    agentPhone: '+260 97 234 5678',
    businessId: 'BIZ-LUS-001',
    businessName: 'Lusaka Central Express Agency',
    businessLocation: 'Cairo Road Commercial Suite, Lusaka',
    pickupLocation: 'Levy Junction Mall, Lusaka',
    requestedServiceTime: '07 Sep 2026, 11:00',
    assignmentMethod: 'Automated Geospatial Dispatch',
    assignedTimestamp: '07 Sep 2026, 10:45',
    amount: 1500.0,
    reservationCharge: 15.0,
    otherCharges: 0,
    customerTotal: 1515.0,
    principalProcessingMethod: 'Direct MNO Open API',
    customerConfirmationStatus: 'Confirmed',
    customerConfirmationTimestamp: '2026-09-07T11:12:00+02:00',
    customerConfirmationMethod: 'In-App Customer Confirmation PIN',
    agentConfirmationStatus: 'Confirmed',
    agentConfirmationTimestamp: '2026-09-07T11:12:00+02:00',
    agentConfirmationMethod: 'TellerBud Agent App Verification',
    status: 'Completed',
    postedAt: '2026-09-07T11:12:00+02:00',
    formattedDate: '07 Sep 2026, 11:12',
    timeline: [
      { id: 'TL-9073-1', eventName: 'Transaction Created', actor: 'Customer', timestamp: '2026-09-07T10:40:00+02:00', result: 'Pickup purchase requested' },
      { id: 'TL-9073-2', eventName: 'Transaction Completed', actor: 'Agent & Customer', timestamp: '2026-09-07T11:12:00+02:00', result: 'Completed' },
    ],
    recordSource: 'TellerBud Pickup Engine',
    lastUpdated: '07 Sep 2026, 11:12',
  },
];

// Unified list of all Mobile Money Transactions
const allTransactions = [
  ...DATED_MOBILE_MONEY_TRANSACTIONS,
  ...mappedPickupTransactions,
  ...mappedWalkInTransactions,
];

const seenTxnIds = new Set<string>();
export const MOCK_MOBILE_MONEY_TRANSACTIONS: MobileMoneyTransaction[] = allTransactions
  .filter((t) => {
    if (seenTxnIds.has(t.id)) {
      return false;
    }
    seenTxnIds.add(t.id);
    return true;
  })
  .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

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

  // 2. Strict Date isolation: filter exclusively by selectedDate
  if (filters.selectedDate) {
    result = result.filter((t) => t.postedAt.startsWith(filters.selectedDate!));
  } else if (filters.dateFrom || filters.dateTo) {
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      result = result.filter((t) => new Date(t.postedAt).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime() + 86400000;
      result = result.filter((t) => new Date(t.postedAt).getTime() <= to);
    }
  }

  // 3. Apply business filter (Admin portal dropdown)
  if (filters.business && filters.business !== 'ALL') {
    const bQuery = filters.business.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.businessName.toLowerCase().trim() === bQuery ||
        t.businessId.toLowerCase().trim() === bQuery
    );
  }

  // 4. Apply search query (reference, customer, agent)
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

  // 5. Apply transaction type filter
  if (filters.transactionType && filters.transactionType !== 'ALL') {
    result = result.filter((t) => t.transactionType === filters.transactionType);
  }

  // Baseline contextual items for secondary operational cards count
  const contextualItems = [...result];
  const secondarySummary = {
    total: contextualItems.length,
    pickup: contextualItems.filter((t) => t.serviceChannel === 'Pickup').length,
    walkIn: contextualItems.filter((t) => t.serviceChannel === 'Walk-In').length,
    completed: contextualItems.filter((t) => t.status === 'Completed').length,
    pendingConfirmation: contextualItems.filter(
      (t) =>
        t.status === 'Pending Confirmation' ||
        t.status === 'Agent Confirmed' ||
        t.status === 'Active Service'
    ).length,
    cancelledFailed: contextualItems.filter(
      (t) => t.status === 'Cancelled' || t.status === 'Failed'
    ).length,
  };

  // 6. Apply channel and status filters
  if (filters.serviceChannel && filters.serviceChannel !== 'ALL') {
    result = result.filter((t) => t.serviceChannel === filters.serviceChannel);
  }

  if (filters.status && filters.status !== 'ALL') {
    if (filters.status === 'Cancelled_Failed') {
      result = result.filter((t) => t.status === 'Cancelled' || t.status === 'Failed');
    } else {
      result = result.filter((t) => t.status === filters.status);
    }
  }

  // 7. Calculate Primary KPIs strictly from filtered transactions matching all active filters
  const kpis = calculateMobileMoneyKPIs(result);
  const summary: MobileMoneySummary = {
    totalTransactions: kpis.totalTransactions,
    totalAmount: kpis.totalAmount,
    serviceEarnings: kpis.serviceEarnings,
    ...secondarySummary,
  };

  // 8. Sort
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
