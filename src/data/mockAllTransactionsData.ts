export type TransactionSource =
  | 'Customer App'
  | 'Agent App'
  | 'Business Owner Portal'
  | 'TellerBud Admin'
  | 'Provider API';

export type TransactionService =
  | 'Cash Pickup'
  | 'Walk-In Transaction'
  | 'Agent-to-Agent Liquidity'
  | 'Wallet Funding'
  | 'Customer Withdrawal'
  | 'Business Wallet Transaction';

export type TransactionType =
  | 'Deposit'
  | 'Withdrawal'
  | 'Purchase'
  | 'Liquidity Transfer'
  | 'Wallet Funding'
  | 'Wallet Payout'
  | 'Reversal';

export type TransactionProvider =
  | 'MTN Mobile Money'
  | 'Airtel Money'
  | 'Zamtel'
  | 'Zanaco'
  | 'FNB'
  | 'INDO'
  | 'Stanbic'
  | 'Access'
  | 'TellerBud Ledger';

export type TransactionStatus =
  | 'Pending'
  | 'Pending Review'
  | 'Approved'
  | 'Finding an Agent'
  | 'Agent Confirmed'
  | 'Ready for Pickup'
  | 'Processing'
  | 'Pending Confirmation'
  | 'Completed'
  | 'Paid'
  | 'Failed'
  | 'Cancelled'
  | 'Rejected'
  | 'Reversed';

export interface AllTransactionRecord {
  id: string;
  reference: string;
  dateTime: string;
  rawDate: string;
  source: TransactionSource;
  
  // Customer info
  customerName: string;
  customerId: string;
  
  // Agent / Business info
  agentName: string;
  agentId?: string;
  businessName: string;
  businessId?: string;
  
  // Agent-to-Agent Liquidity specific
  sendingAgent?: string;
  sendingAgentId?: string;
  receivingAgent?: string;
  receivingAgentId?: string;
  
  // Service & Type
  service: TransactionService;
  transactionType: TransactionType;
  
  // Provider, Amount, Status
  provider: TransactionProvider;
  amount: number;
  status: TransactionStatus;
  
  // Linked ledger / description
  description?: string;
  relatedLedgerEntryId?: string;
  originalTransactionRef?: string;
}

// 10 Exact Sample Transactions Required by Specification
export const CORE_SAMPLE_TRANSACTIONS: AllTransactionRecord[] = [
  {
    id: 'TB-TXN-4310',
    reference: 'TB-TXN-4310',
    dateTime: 'Today, 11:20 AM',
    rawDate: '2026-09-11',
    source: 'Agent App',
    customerName: 'Mutale Mwape',
    customerId: 'TB-CUS-1041',
    agentName: 'Mwansa Tembo',
    agentId: 'TB-AGT-1007-01',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    service: 'Walk-In Transaction',
    transactionType: 'Deposit',
    provider: 'MTN Mobile Money',
    amount: 3500.0,
    status: 'Completed',
    relatedLedgerEntryId: 'BWL-LUS-4310',
    description: 'Walk-in cash deposit processed into MTN Mobile Money wallet.',
  },
  {
    id: 'TB-TXN-4309',
    reference: 'TB-TXN-4309',
    dateTime: 'Today, 10:48 AM',
    rawDate: '2026-09-11',
    source: 'Agent App',
    customerName: 'Walk-In Customer',
    customerId: '—',
    agentName: 'Ruth Phiri',
    agentId: 'TB-AGT-1007-02',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    service: 'Walk-In Transaction',
    transactionType: 'Withdrawal',
    provider: 'Airtel Money',
    amount: 1200.0,
    status: 'Completed',
    relatedLedgerEntryId: 'BWL-LUS-4309',
    description: 'Walk-in Airtel Money cash withdrawal at agency counter.',
  },
  {
    id: 'TB-TXN-9089',
    reference: 'TB-TXN-9089',
    dateTime: 'Today, 10:15 AM',
    rawDate: '2026-09-11',
    source: 'Customer App',
    customerName: 'Mwamba Mulenga',
    customerId: 'TB-CUS-1052',
    agentName: 'Kelvin Banda',
    agentId: 'TB-AGT-1007-03',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    service: 'Cash Pickup',
    transactionType: 'Deposit',
    provider: 'Airtel Money',
    amount: 8000.0,
    status: 'Ready for Pickup',
    description: 'Customer pickup order confirmed, agent ready for customer counter handover.',
  },
  {
    id: 'TB-TXN-9090',
    reference: 'TB-TXN-9090',
    dateTime: 'Today, 9:55 AM',
    rawDate: '2026-09-11',
    source: 'Customer App',
    customerName: 'Bupe Chileshe',
    customerId: 'TB-CUS-1021',
    agentName: 'Chanda Musonda',
    agentId: 'TB-AGT-1003-02',
    businessName: 'Copperbelt Liquidity Hub',
    businessId: 'BIZ-NDL-003',
    service: 'Cash Pickup',
    transactionType: 'Purchase',
    provider: 'MTN Mobile Money',
    amount: 1400.0,
    status: 'Agent Confirmed',
    description: 'Customer order accepted by designated Copperbelt hub agent.',
  },
  {
    id: 'TB-TXN-9091',
    reference: 'TB-TXN-9091',
    dateTime: 'Today, 9:30 AM',
    rawDate: '2026-09-11',
    source: 'Customer App',
    customerName: 'Lombe Kasonde',
    customerId: 'TB-CUS-1046',
    agentName: '—',
    businessName: '—',
    service: 'Cash Pickup',
    transactionType: 'Withdrawal',
    provider: 'Zanaco',
    amount: 5000.0,
    status: 'Finding an Agent',
    description: 'Customer initiated cash pickup, system matching available agent.',
  },
  {
    id: 'TB-FND-1041-02',
    reference: 'TB-FND-1041-02',
    dateTime: 'Today, 9:10 AM',
    rawDate: '2026-09-11',
    source: 'Provider API',
    customerName: 'Mutale Mwape',
    customerId: 'TB-CUS-1041',
    agentName: 'Automated Provider API',
    businessName: '—',
    service: 'Wallet Funding',
    transactionType: 'Wallet Funding',
    provider: 'MTN Mobile Money',
    amount: 2200.0,
    status: 'Processing',
    description: 'Automated wallet funding webhook pending provider clearance.',
  },
  {
    id: 'TB-WDR-8812',
    reference: 'TB-WDR-8812',
    dateTime: 'Today, 8:50 AM',
    rawDate: '2026-09-11',
    source: 'Customer App',
    customerName: 'Lombe Kasonde',
    customerId: 'TB-CUS-1046',
    agentName: '—',
    businessName: '—',
    service: 'Customer Withdrawal',
    transactionType: 'Wallet Payout',
    provider: 'MTN Mobile Money',
    amount: 7200.0,
    status: 'Pending Review',
    description: 'Customer wallet payout request submitted for administrative review.',
  },
  {
    id: 'TB-LIQ-3304',
    reference: 'TB-LIQ-3304',
    dateTime: 'Today, 8:20 AM',
    rawDate: '2026-09-11',
    source: 'Agent App',
    customerName: '—',
    customerId: '—',
    agentName: 'Taonga Banda',
    sendingAgent: 'Taonga Banda',
    sendingAgentId: 'TB-AGT-1012-01',
    receivingAgent: 'Ruth Phiri',
    receivingAgentId: 'TB-AGT-1007-02',
    businessName: 'Kabwata Market Agency',
    businessId: 'BIZ-KBW-002',
    service: 'Agent-to-Agent Liquidity',
    transactionType: 'Liquidity Transfer',
    provider: 'TellerBud Ledger',
    amount: 6000.0,
    status: 'Completed',
    relatedLedgerEntryId: 'BWL-KBW-3304',
    description: 'Inter-agent float balance balancing transfer via internal ledger settlement.',
  },
  {
    id: 'TB-TXN-4306',
    reference: 'TB-TXN-4306',
    dateTime: 'Today, 7:55 AM',
    rawDate: '2026-09-11',
    source: 'Agent App',
    customerName: 'Walk-In Customer',
    customerId: '—',
    agentName: 'Mwansa Tembo',
    agentId: 'TB-AGT-1007-01',
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    service: 'Walk-In Transaction',
    transactionType: 'Purchase',
    provider: 'Stanbic',
    amount: 3450.0,
    status: 'Pending Confirmation',
    description: 'Bank account deposit awaiting Stanbic switch authorization response.',
  },
  {
    id: 'TB-FND-1038-02',
    reference: 'TB-FND-1038-02',
    dateTime: 'Today, 7:30 AM',
    rawDate: '2026-09-11',
    source: 'Provider API',
    customerName: 'Chilufya Bwalya',
    customerId: 'TB-CUS-1038',
    agentName: 'Automated Provider API',
    businessName: '—',
    service: 'Wallet Funding',
    transactionType: 'Wallet Funding',
    provider: 'MTN Mobile Money',
    amount: 1800.0,
    status: 'Failed',
    description: 'Automated MoMo push request rejected: Subscriber Insufficient Funds.',
  },
];

// Helper to deterministically build the remaining 318 records to total exactly 328 records,
// with exact status counts:
// Completed: 276
// Pending or Processing: 40
// Failed or Cancelled: 12
// Total: 328
// and exact Total Transaction Value: ZMW 1,248,600.00
function buildAllTransactions(): AllTransactionRecord[] {
  const result: AllTransactionRecord[] = [...CORE_SAMPLE_TRANSACTIONS];

  // Current sample statuses (10 records):
  // Completed: 3 (TB-TXN-4310, TB-TXN-4309, TB-LIQ-3304)
  // Pending or Processing: 6 (TB-TXN-9089, TB-TXN-9090, TB-TXN-9091, TB-FND-1041-02, TB-WDR-8812, TB-TXN-4306)
  // Failed or Cancelled: 1 (TB-FND-1038-02)
  //
  // Remaining to generate out of 318 records:
  // Completed: 276 - 3 = 273
  // Pending or Processing: 40 - 6 = 34
  // Failed or Cancelled: 12 - 1 = 11
  // Total to generate = 273 + 34 + 11 = 318

  const TARGET_TOTAL_VALUE = 1248600.0;
  const initialSum = CORE_SAMPLE_TRANSACTIONS.reduce((acc, tx) => acc + tx.amount, 0);
  const remainingValueTarget = TARGET_TOTAL_VALUE - initialSum; // 1,208,850.00

  const registeredCustomers = [
    { name: 'Faith Zulu', id: 'TB-CUS-1025' },
    { name: 'Mutale Mwape', id: 'TB-CUS-1041' },
    { name: 'Mwamba Mulenga', id: 'TB-CUS-1052' },
    { name: 'Bupe Chileshe', id: 'TB-CUS-1021' },
    { name: 'Lombe Kasonde', id: 'TB-CUS-1046' },
    { name: 'Chilufya Bwalya', id: 'TB-CUS-1038' },
    { name: 'Gift Mwanza', id: 'TB-CUS-1014' },
    { name: 'Sipho Zulu', id: 'TB-CUS-1065' },
    { name: 'Kondwani Banda', id: 'TB-CUS-1077' },
    { name: 'Natasha Phiri', id: 'TB-CUS-1082' },
  ];

  const generalCustomers = [
    ...registeredCustomers,
    { name: 'Walk-In Customer', id: '—' },
  ];

  const agents = [
    { name: 'Mwansa Tembo', id: 'TB-AGT-1007-01', biz: 'Lusaka Central Express Agency', bizId: 'BIZ-LUS-001' },
    { name: 'Ruth Phiri', id: 'TB-AGT-1007-02', biz: 'Lusaka Central Express Agency', bizId: 'BIZ-LUS-001' },
    { name: 'Kelvin Banda', id: 'TB-AGT-1007-03', biz: 'Lusaka Central Express Agency', bizId: 'BIZ-LUS-001' },
    { name: 'Chanda Musonda', id: 'TB-AGT-1003-02', biz: 'Copperbelt Liquidity Hub', bizId: 'BIZ-NDL-003' },
    { name: 'Taonga Banda', id: 'TB-AGT-1012-01', biz: 'Kabwata Market Agency', bizId: 'BIZ-KBW-002' },
    { name: 'Joseph Kaunda', id: 'TB-AGT-1004-01', biz: 'Livingstone Tourism Agency', bizId: 'BIZ-LVT-004' },
    { name: 'Brian Chanda', id: 'TB-AGT-1008-01', biz: 'Woodlands Super Kiosk', bizId: 'BIZ-WDL-005' },
  ];

  const providers: TransactionProvider[] = [
    'MTN Mobile Money',
    'Airtel Money',
    'Zanaco',
    'Zamtel',
    'FNB',
    'Stanbic',
    'INDO',
    'Access',
    'TellerBud Ledger',
  ];

  const pendingOrProcessingStatuses: TransactionStatus[] = [
    'Finding an Agent',
    'Agent Confirmed',
    'Ready for Pickup',
    'Processing',
    'Pending Confirmation',
    'Pending Review',
    'Approved',
    'Pending',
  ];

  const failedCancelledStatuses: TransactionStatus[] = [
    'Failed',
    'Cancelled',
    'Rejected',
  ];

  // Bucket assignments:
  // 273 completed items, 34 pending or processing items, 11 failed or cancelled items
  const bucketAssignment: ('completed' | 'pending' | 'failed')[] = [];
  for (let i = 0; i < 273; i++) {
    bucketAssignment.push('completed');
  }
  for (let i = 0; i < 34; i++) {
    bucketAssignment.push('pending');
  }
  for (let i = 0; i < 11; i++) {
    bucketAssignment.push('failed');
  }

  // Shuffle bucket assignments with deterministic seed
  const seededBuckets = bucketAssignment.sort((a, b) => {
    const hashA = (a.length * 41 + a.charCodeAt(0) * 17) % 100;
    const hashB = (b.length * 41 + b.charCodeAt(0) * 17) % 100;
    return hashA - hashB;
  });

  const baseAmounts = [
    1500.0, 2400.0, 3200.0, 4800.0, 1200.0, 5000.0, 8500.0, 2100.0, 6400.0, 3900.0,
    1800.0, 7500.0, 4200.0, 2600.0, 1100.0, 9000.0, 3100.0, 5400.0, 2900.0, 3750.0,
  ];

  let currentSum = 0;

  for (let i = 0; i < 318; i++) {
    const seq = 4305 - i;
    const ref = `TB-TXN-${seq}`;
    const bucket = seededBuckets[i] || 'completed';

    // Dates distributed from Sep 10 down to Aug 24
    const dayOffset = Math.floor(i / 20);
    const dateNum = Math.max(1, 10 - dayOffset);
    const dateStr = dateNum < 10 ? `0${dateNum}` : `${dateNum}`;
    const rawDate = `2026-09-${dateStr}`;
    const hour = 8 + (i % 9);
    const min = ((i * 7) % 60);
    const minStr = min < 10 ? `0${min}` : `${min}`;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    const dateTime = `${dateNum} Sep 2026, ${displayHour}:${minStr} ${ampm}`;

    const agt = agents[i % agents.length];
    const prov = providers[i % providers.length];

    // Determine service & type
    let service: TransactionService = 'Walk-In Transaction';
    let type: TransactionType = 'Deposit';
    let source: TransactionSource = 'Agent App';

    const categoryMod = i % 6;
    if (categoryMod === 0) {
      service = 'Walk-In Transaction';
      type = (i % 2 === 0) ? 'Deposit' : 'Withdrawal';
      source = 'Agent App';
    } else if (categoryMod === 1) {
      service = 'Cash Pickup';
      type = (i % 3 === 0) ? 'Purchase' : (i % 3 === 1 ? 'Withdrawal' : 'Deposit');
      source = 'Customer App';
    } else if (categoryMod === 2) {
      service = 'Agent-to-Agent Liquidity';
      type = 'Liquidity Transfer';
      source = 'Agent App';
    } else if (categoryMod === 3) {
      service = 'Wallet Funding';
      type = 'Wallet Funding';
      source = 'Provider API';
    } else if (categoryMod === 4) {
      service = 'Customer Withdrawal';
      type = 'Wallet Payout';
      source = 'Customer App';
    } else {
      service = 'Business Wallet Transaction';
      type = (i % 2 === 0) ? 'Deposit' : 'Withdrawal';
      source = (i % 2 === 0) ? 'Business Owner Portal' : 'TellerBud Admin';
    }

    // Resolve status based on bucket & service rules:
    // Rule: For Customer Withdrawal, completed payout is 'Paid' (never 'Completed')
    // Rule: Customer Withdrawal uses 'Pending Review' | 'Approved' | 'Processing' | 'Paid' | 'Rejected' | 'Cancelled'
    let status: TransactionStatus = 'Completed';
    if (bucket === 'completed') {
      status = (service === 'Customer Withdrawal') ? 'Paid' : 'Completed';
    } else if (bucket === 'pending') {
      if (service === 'Customer Withdrawal') {
        const withdrawalPendingStatuses: TransactionStatus[] = ['Pending Review', 'Approved', 'Processing'];
        status = withdrawalPendingStatuses[i % withdrawalPendingStatuses.length];
      } else {
        status = pendingOrProcessingStatuses[i % pendingOrProcessingStatuses.length];
      }
    } else {
      // failed / cancelled
      if (service === 'Customer Withdrawal') {
        status = (i % 2 === 0) ? 'Rejected' : 'Cancelled';
      } else {
        status = failedCancelledStatuses[i % failedCancelledStatuses.length];
      }
    }

    // Provider resolution
    // Rule 9: Customer Wallet Funding uses ONLY MTN Mobile Money or Airtel Money APIs
    let resolvedProvider: TransactionProvider = prov;
    if (service === 'Wallet Funding') {
      resolvedProvider = (i % 2 === 0) ? 'MTN Mobile Money' : 'Airtel Money';
    } else if (service === 'Customer Withdrawal') {
      resolvedProvider = (i % 2 === 0) ? 'MTN Mobile Money' : 'Airtel Money';
    } else if (service === 'Business Wallet Transaction' || service === 'Agent-to-Agent Liquidity') {
      if (i % 2 === 0) {
        resolvedProvider = 'TellerBud Ledger';
      }
    }

    // Customer / Agent resolution
    let finalCustName = '—';
    let finalCustId = '—';
    let finalAgtName = agt.name;
    let finalAgtId: string | undefined = agt.id;
    let finalBizName = agt.biz;
    let finalBizId: string | undefined = agt.bizId;
    let sender: string | undefined;
    let receiver: string | undefined;
    let desc = `${service} (${type}) executed through ${resolvedProvider}.`;

    if (service === 'Agent-to-Agent Liquidity') {
      // Rule: Customer is —. Displays both sender and receiver.
      finalCustName = '—';
      finalCustId = '—';
      sender = agt.name;
      const receiverAgt = agents[(i + 1) % agents.length];
      receiver = receiverAgt.name;
      desc = `Inter-agent float transfer from ${sender} to ${receiver}.`;
    } else if (service === 'Wallet Funding') {
      // Rule 6: ALL Wallet Funding records must be linked to a registered Customer, Customer ID,
      // and Agent / Business is Automated Provider API with business —. NEVER Walk-In Customer!
      const regCust = registeredCustomers[i % registeredCustomers.length];
      finalCustName = regCust.name;
      finalCustId = regCust.id;
      finalAgtName = 'Automated Provider API';
      finalAgtId = undefined;
      finalBizName = '—';
      finalBizId = undefined;
      desc = `Automated wallet funding via ${resolvedProvider} API for ${finalCustName}.`;
    } else if (service === 'Business Wallet Transaction') {
      // Rule 7: Does not involve customer. Display Customer: —, Customer ID: —.
      // Display Business Owner or Admin initiator inside Agent / Business. Keep business visible.
      finalCustName = '—';
      finalCustId = '—';
      finalAgtName = (source === 'Business Owner Portal')
        ? 'Chileshe Mwape (Owner)'
        : 'Operations Admin';
      finalAgtId = undefined;
      finalBizName = agt.biz;
      finalBizId = agt.bizId;
      desc = `Business global wallet ${type.toLowerCase()} initiated by ${finalAgtName}.`;
    } else if (service === 'Customer Withdrawal') {
      // Customer withdrawal must be linked to registered customer
      const regCust = registeredCustomers[i % registeredCustomers.length];
      finalCustName = regCust.name;
      finalCustId = regCust.id;
      if (status === 'Pending Review' || status === 'Pending') {
        finalAgtName = '—';
        finalAgtId = undefined;
        finalBizName = '—';
        finalBizId = undefined;
      }
      desc = `Customer wallet withdrawal payout to ${resolvedProvider} for ${finalCustName}.`;
    } else if (service === 'Cash Pickup') {
      const regCust = registeredCustomers[i % registeredCustomers.length];
      finalCustName = regCust.name;
      finalCustId = regCust.id;
      if (status === 'Finding an Agent') {
        finalAgtName = '—';
        finalAgtId = undefined;
        finalBizName = '—';
        finalBizId = undefined;
      }
    } else {
      // Walk-In Transaction
      const genCust = generalCustomers[i % generalCustomers.length];
      finalCustName = genCust.name;
      finalCustId = genCust.id;
    }

    // Specific Override for TB-TXN-4296 (Requirement 6):
    if (ref === 'TB-TXN-4296') {
      finalCustName = 'Faith Zulu';
      finalCustId = 'TB-CUS-1025';
      finalAgtName = 'Automated Provider API';
      finalAgtId = undefined;
      finalBizName = '—';
      finalBizId = undefined;
      service = 'Wallet Funding';
      type = 'Wallet Funding';
      resolvedProvider = 'Airtel Money';
      status = 'Completed';
      desc = 'Automated wallet funding via Airtel Money API for Faith Zulu.';
    }

    // Amount allocation
    let amount = baseAmounts[i % baseAmounts.length];
    if (ref === 'TB-TXN-4296') {
      amount = 3900.0;
    }

    if (i === 317) {
      // Last item exact balance calibration to guarantee exact 1,248,600.00
      amount = Math.round((remainingValueTarget - currentSum) * 100) / 100;
    }
    currentSum += amount;

    result.push({
      id: ref,
      reference: ref,
      dateTime,
      rawDate,
      source,
      customerName: finalCustName,
      customerId: finalCustId,
      agentName: finalAgtName,
      agentId: finalAgtId,
      businessName: finalBizName,
      businessId: finalBizId,
      sendingAgent: sender,
      receivingAgent: receiver,
      service,
      transactionType: type,
      provider: resolvedProvider,
      amount,
      status,
      relatedLedgerEntryId: status === 'Completed' || status === 'Paid' ? `BWL-AUTO-${seq}` : undefined,
      description: desc,
    });
  }

  return result;
}

export const MOCK_ALL_TRANSACTIONS = buildAllTransactions();

export interface AllTransactionsSummary {
  total: number;
  completed: number;
  pendingOrProcessing: number;
  failedOrCancelled: number;
  totalValue: number;
}

export const ALL_TRANSACTIONS_SUMMARY: AllTransactionsSummary = {
  total: 328,
  completed: 276,
  pendingOrProcessing: 40,
  failedOrCancelled: 12,
  totalValue: 1248600.0,
};

