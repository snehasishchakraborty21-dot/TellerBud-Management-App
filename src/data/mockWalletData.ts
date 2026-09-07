import {
  BusinessWallet,
  BusinessWalletLedgerEntry,
  GlobalWalletActivity,
  GlobalWalletLedgerRecord,
} from '../types/admin';

export const MOCK_BUSINESS_WALLET: BusinessWallet = {
  businessId: 'BIZ-LUS-001',
  businessName: 'Lusaka Central Express Agency',
  currentBalance: 164350.0,
  availableBalance: 164350.0,
  totalBalance: 164350.0,
  currency: 'ZMW',
  walletStatus: 'Active',
  lastUpdated: 'Today, 11:20 AM',
  createdAt: '15 January 2026',
};

/**
 * 9 Approved Canonical Global Wallet Activities
 * Chronological order (descending - newest first):
 * 1. TB-FND-8091 — Today, 11:20 AM: MTN funding ZMW 25,000.00 credit → Balance After: ZMW 164,350.00
 * 2. TB-CMS-9040 — 01 Sep 2026, 04:30 PM: Business Commission ZMW 5,850.00 credit → Balance After: ZMW 139,350.00
 * 3. TB-CHG-9039 — 31 Aug 2026, 01:00 PM: Platform Fee ZMW 12,000.00 debit → Balance After: ZMW 133,500.00
 * 4. TB-CHG-3301 — 31 Aug 2026, 11:15 AM: Charge ZMW 15.00 debit → Balance After: ZMW 145,500.00
 * 5. TB-CHG-3302 — 31 Aug 2026, 11:05 AM: Charge ZMW 12.00 debit → Balance After: ZMW 145,515.00
 * 6. TB-CHG-2201 — 31 Aug 2026, 09:15 AM: Charge ZMW 25.00 debit → Balance After: ZMW 145,527.00
 * 7. TB-CMS-9033 — 24 Aug 2026, 02:00 PM: Commission ZMW 3,500.00 credit → Balance After: ZMW 145,552.00
 * 8. TB-FND-7712 — 20 Aug 2026, 10:00 AM: Airtel funding ZMW 50,000.00 credit → Balance After: ZMW 142,052.00
 * 9. TB-WDL-6019 — 18 Aug 2026, 03:30 PM: Paid withdrawal ZMW 15,000.00 debit → Balance After: ZMW 92,052.00
 *
 * Opening historical balance: ZMW 107,052.00
 */
export const MOCK_GLOBAL_WALLET_ACTIVITIES: GlobalWalletActivity[] = [
  {
    id: 'GWA-001',
    reference: 'TB-FND-8091',
    dateTime: 'Today, 11:20 AM',
    rawDate: '2026-09-02',
    transactionType: 'Funding',
    subType: 'Verified MTN Mobile Money Funding',
    initiatedBy: {
      name: 'Chileshe Mwamba',
      role: 'Business Owner',
      avatarInitials: 'CM',
    },
    agent: null,
    description: 'Global Wallet funding through MTN Mobile Money.',
    debit: null,
    credit: 25000.0,
    balanceBefore: 139350.0,
    balanceAfter: 164350.0,
    status: 'Completed',
    externalProvider: 'MTN Mobile Money',
    providerReference: 'EXT-MTN-883912',
    mobileMoneyNumber: '+260 96 ••• ••84',
    createdTimestamp: 'Today, 11:18 AM',
    completedTimestamp: 'Today, 11:20 AM',
    lifecycleHistory: [
      {
        step: 'Funding Initiated',
        timestamp: 'Today, 11:18 AM',
        status: 'Completed',
        actor: 'Chileshe Mwamba — Business Owner',
        details: 'Funding request submitted.',
      },
      {
        step: 'Provider Confirmation Received',
        timestamp: 'Today, 11:19 AM',
        status: 'Completed',
        actor: 'MTN Mobile Money',
        details: 'Provider payment confirmation verified.',
      },
      {
        step: 'Global Wallet Credited',
        timestamp: 'Today, 11:20 AM',
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'ZMW 25,000.00 credited to the Global Wallet.',
      },
    ],
  },
  {
    id: 'GWA-002',
    reference: 'TB-CMS-9040',
    dateTime: '01 Sep 2026, 04:30 PM',
    rawDate: '2026-09-01',
    transactionType: 'Commission',
    subType: 'Business Commission',
    initiatedBy: {
      name: 'TellerBud Billing Service',
      role: 'System Source',
      avatarInitials: 'TB',
    },
    agent: null,
    description: 'Monthly agency performance tier commission credited directly to global wallet.',
    debit: null,
    credit: 5850.0,
    balanceBefore: 133500.0,
    balanceAfter: 139350.0,
    status: 'Completed',
    createdTimestamp: '01 Sep 2026, 04:20 PM',
    completedTimestamp: '01 Sep 2026, 04:30 PM',
    lifecycleHistory: [
      {
        step: 'Tier Assessment',
        timestamp: '01 Sep 2026, 04:20 PM',
        status: 'Completed',
        actor: 'TellerBud Billing Service',
        details: 'Monthly tier qualification thresholds verified.',
      },
      {
        step: 'Global Wallet Credited',
        timestamp: '01 Sep 2026, 04:30 PM',
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'ZMW 5,850.00 credited to Global Wallet.',
      },
    ],
  },
  {
    id: 'GWA-003',
    reference: 'TB-CHG-9039',
    dateTime: '31 Aug 2026, 01:00 PM',
    rawDate: '2026-08-31',
    transactionType: 'Charge',
    subType: 'Platform Fee',
    initiatedBy: {
      name: 'TellerBud Billing Service',
      role: 'System Source',
      avatarInitials: 'TB',
    },
    agent: null,
    description: 'Quarterly enterprise platform SLA and multi-agent compliance fee.',
    debit: 12000.0,
    credit: null,
    balanceBefore: 145500.0,
    balanceAfter: 133500.0,
    status: 'Completed',
    createdTimestamp: '31 Aug 2026, 12:45 PM',
    completedTimestamp: '31 Aug 2026, 01:00 PM',
    lifecycleHistory: [
      {
        step: 'Invoice Generated',
        timestamp: '31 Aug 2026, 12:45 PM',
        status: 'Completed',
        actor: 'Enterprise Billing',
        details: 'Quarterly compliance invoice calculated.',
      },
      {
        step: 'Global Wallet Debited',
        timestamp: '31 Aug 2026, 01:00 PM',
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'ZMW 12,000.00 debited from Global Wallet.',
      },
    ],
  },
  {
    id: 'GWA-004',
    reference: 'TB-CHG-3301',
    dateTime: '31 Aug 2026, 11:15 AM',
    rawDate: '2026-08-31',
    transactionType: 'Charge',
    subType: 'Transaction Fee',
    initiatedBy: {
      name: 'Natasha Zulu',
      role: 'Agent',
      avatarInitials: 'NZ',
    },
    agent: {
      id: 'TB-AGT-1062',
      name: 'Natasha Zulu',
      avatarInitials: 'NZ',
      isOperationalAttribution: true,
    },
    description: 'TellerBud transaction fee debited from global wallet for walk-in deposit TB-WLK-3301.',
    debit: 15.0,
    credit: null,
    balanceBefore: 145515.0,
    balanceAfter: 145500.0,
    status: 'Completed',
    createdTimestamp: '31 Aug 2026, 11:13 AM',
    completedTimestamp: '31 Aug 2026, 11:15 AM',
    lifecycleHistory: [
      {
        step: 'Charge Created',
        timestamp: '31 Aug 2026, 11:13 AM',
        status: 'Completed',
        actor: 'Natasha Zulu (Operational Attribution)',
        details: 'Fee generated from walk-in deposit TB-WLK-3301.',
      },
      {
        step: 'Global Wallet Debited',
        timestamp: '31 Aug 2026, 11:14 AM',
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'ZMW 15.00 debited from Global Wallet.',
      },
      {
        step: 'Charge Completed',
        timestamp: '31 Aug 2026, 11:15 AM',
        status: 'Completed',
        actor: 'Recorded by TellerBud',
        details: 'Settlement finalized in central ledger.',
      },
    ],
  },
  {
    id: 'GWA-005',
    reference: 'TB-CHG-3302',
    dateTime: '31 Aug 2026, 11:05 AM',
    rawDate: '2026-08-31',
    transactionType: 'Charge',
    subType: 'Transaction Fee',
    initiatedBy: {
      name: 'Kelvin Phiri',
      role: 'Agent',
      avatarInitials: 'KP',
    },
    agent: {
      id: 'TB-AGT-1024',
      name: 'Kelvin Phiri',
      avatarInitials: 'KP',
      isOperationalAttribution: true,
    },
    description: 'TellerBud transaction fee debited for walk-in withdrawal TB-WLK-3302.',
    debit: 12.0,
    credit: null,
    balanceBefore: 145527.0,
    balanceAfter: 145515.0,
    status: 'Completed',
    createdTimestamp: '31 Aug 2026, 11:03 AM',
    completedTimestamp: '31 Aug 2026, 11:05 AM',
    lifecycleHistory: [
      {
        step: 'Charge Created',
        timestamp: '31 Aug 2026, 11:03 AM',
        status: 'Completed',
        actor: 'Kelvin Phiri (Operational Attribution)',
        details: 'Fee generated from walk-in withdrawal TB-WLK-3302.',
      },
      {
        step: 'Global Wallet Debited',
        timestamp: '31 Aug 2026, 11:04 AM',
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'ZMW 12.00 debited from Global Wallet.',
      },
      {
        step: 'Charge Completed',
        timestamp: '31 Aug 2026, 11:05 AM',
        status: 'Completed',
        actor: 'Recorded by TellerBud',
        details: 'Settlement finalized.',
      },
    ],
  },
  {
    id: 'GWA-006',
    reference: 'TB-CHG-2201',
    dateTime: '31 Aug 2026, 09:15 AM',
    rawDate: '2026-08-31',
    transactionType: 'Charge',
    subType: 'Reservation Fee',
    initiatedBy: {
      name: 'Natasha Zulu',
      role: 'Agent',
      avatarInitials: 'NZ',
    },
    agent: {
      id: 'TB-AGT-1062',
      name: 'Natasha Zulu',
      avatarInitials: 'NZ',
      isOperationalAttribution: true,
    },
    description: 'Reservation fee deduction for verified customer cash pickup TB-PKP-2201.',
    debit: 25.0,
    credit: null,
    balanceBefore: 145552.0,
    balanceAfter: 145527.0,
    status: 'Completed',
    createdTimestamp: '31 Aug 2026, 09:12 AM',
    completedTimestamp: '31 Aug 2026, 09:15 AM',
    lifecycleHistory: [
      {
        step: 'Reservation Created',
        timestamp: '31 Aug 2026, 09:12 AM',
        status: 'Completed',
        actor: 'Natasha Zulu (Operational Attribution)',
        details: 'Cash reservation confirmed at counter.',
      },
      {
        step: 'Global Wallet Debited',
        timestamp: '31 Aug 2026, 09:14 AM',
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'ZMW 25.00 reservation fee debited from Global Wallet.',
      },
      {
        step: 'Charge Completed',
        timestamp: '31 Aug 2026, 09:15 AM',
        status: 'Completed',
        actor: 'Recorded by TellerBud',
        details: 'Fee settled.',
      },
    ],
  },
  {
    id: 'GWA-007',
    reference: 'TB-CMS-9033',
    dateTime: '24 Aug 2026, 02:00 PM',
    rawDate: '2026-08-24',
    transactionType: 'Commission',
    subType: 'Transaction Commission',
    initiatedBy: {
      name: 'TellerBud Billing Service',
      role: 'System Source',
      avatarInitials: 'TB',
    },
    agent: null,
    description: 'Aggregated agency bill pay and utility transaction volume commission payout.',
    debit: null,
    credit: 3500.0,
    balanceBefore: 142052.0,
    balanceAfter: 145552.0,
    status: 'Completed',
    createdTimestamp: '24 Aug 2026, 01:50 PM',
    completedTimestamp: '24 Aug 2026, 02:00 PM',
    lifecycleHistory: [
      {
        step: 'Commission Calculated',
        timestamp: '24 Aug 2026, 01:50 PM',
        status: 'Completed',
        actor: 'TellerBud Aggregator',
        details: 'Aggregated utility volume calculated.',
      },
      {
        step: 'Global Wallet Credited',
        timestamp: '24 Aug 2026, 02:00 PM',
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'ZMW 3,500.00 credited to Global Wallet.',
      },
    ],
  },
  {
    id: 'GWA-008',
    reference: 'TB-FND-7712',
    dateTime: '20 Aug 2026, 10:00 AM',
    rawDate: '2026-08-20',
    transactionType: 'Funding',
    subType: 'Verified Airtel Money Funding',
    initiatedBy: {
      name: 'Chileshe Mwamba',
      role: 'Business Owner',
      avatarInitials: 'CM',
    },
    agent: null,
    description: 'Global Wallet funding through Airtel Money.',
    debit: null,
    credit: 50000.0,
    balanceBefore: 92052.0,
    balanceAfter: 142052.0,
    status: 'Completed',
    externalProvider: 'Airtel Money',
    providerReference: 'EXT-AIR-449102',
    mobileMoneyNumber: '+260 97 ••• ••34',
    createdTimestamp: '20 Aug 2026, 09:55 AM',
    completedTimestamp: '20 Aug 2026, 10:00 AM',
    lifecycleHistory: [
      {
        step: 'Funding Initiated',
        timestamp: '20 Aug 2026, 09:55 AM',
        status: 'Completed',
        actor: 'Chileshe Mwamba — Business Owner',
        details: 'Funding request submitted.',
      },
      {
        step: 'Provider Confirmation Received',
        timestamp: '20 Aug 2026, 09:58 AM',
        status: 'Completed',
        actor: 'Airtel Money',
        details: 'Provider payment confirmation verified.',
      },
      {
        step: 'Global Wallet Credited',
        timestamp: '20 Aug 2026, 10:00 AM',
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'ZMW 50,000.00 credited to the Global Wallet.',
      },
    ],
  },
  {
    id: 'GWA-009',
    reference: 'TB-WDL-6019',
    dateTime: '18 Aug 2026, 03:30 PM',
    rawDate: '2026-08-18',
    transactionType: 'Withdrawal',
    subType: 'Paid Global Wallet Withdrawal',
    initiatedBy: {
      name: 'Chileshe Mwamba',
      role: 'Business Owner',
      avatarInitials: 'CM',
    },
    agent: null,
    description: 'Paid Global Wallet withdrawal payout to MTN Mobile Money.',
    debit: 15000.0,
    credit: null,
    balanceBefore: 107052.0,
    balanceAfter: 92052.0,
    status: 'Completed',
    externalProvider: 'MTN Mobile Money',
    providerReference: 'EXT-WDL-994120',
    mobileMoneyNumber: '+260 96 ••• ••84',
    createdTimestamp: '18 Aug 2026, 03:00 PM',
    completedTimestamp: '18 Aug 2026, 03:30 PM',
    lifecycleHistory: [
      {
        step: 'Withdrawal Requested',
        timestamp: '18 Aug 2026, 03:00 PM',
        status: 'Completed',
        actor: 'Chileshe Mwamba — Business Owner',
        details: 'ZMW 15,000.00 withdrawal requested through MTN Mobile Money.',
      },
      {
        step: 'TellerBud Admin Approved',
        timestamp: '18 Aug 2026, 03:10 PM',
        status: 'Completed',
        actor: 'TellerBud Admin',
        details: 'Withdrawal request reviewed and approved.',
      },
      {
        step: 'Withdrawal Processing',
        timestamp: '18 Aug 2026, 03:20 PM',
        status: 'Completed',
        actor: 'TellerBud Admin',
        details: 'Approved withdrawal sent for mobile-money payout.',
      },
      {
        step: 'Withdrawal Paid',
        timestamp: '18 Aug 2026, 03:30 PM',
        status: 'Completed',
        actor: 'TellerBud Admin',
        details: 'Mobile-money payout completed successfully.',
      },
      {
        step: 'Global Wallet Debited',
        timestamp: '18 Aug 2026, 03:30 PM',
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'ZMW 15,000.00 debited from the Global Wallet only after the withdrawal was marked Paid.',
      },
      {
        step: 'Ledger Posting Created',
        timestamp: '18 Aug 2026, 03:30 PM',
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'Immutable ledger entry posted to the central audit trail.',
      },
    ],
  },
];

/**
 * Helper to build canonical lifecycle timeline for wallet ledger entry
 */
const getLedgerLifecycleHistory = (act: GlobalWalletActivity): Array<{
  step: string;
  timestamp: string;
  status: string;
  actor?: string;
  details?: string;
}> => {
  if (act.transactionType === 'Funding' || act.transactionType === 'Business Wallet Funding') {
    return [
      {
        step: 'Funding Confirmed',
        timestamp: act.createdTimestamp || act.dateTime,
        status: 'Completed',
        actor: act.externalProvider || 'Mobile Money Switch',
        details: `Confirmed via ${act.externalProvider || 'Mobile Money Network'}.`,
      },
      {
        step: 'Global Wallet Credited',
        timestamp: act.dateTime,
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: `ZMW ${(act.credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} credited to Global Wallet.`,
      },
      {
        step: 'Ledger Posting Created',
        timestamp: act.dateTime,
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'Immutable ledger entry posted to central audit trail.',
      },
    ];
  }

  if (act.transactionType === 'Charge' || act.transactionType === 'TellerBud Charge') {
    const actor = act.agent ? `${act.agent.name} (Agent)` : 'TellerBud Billing Service';
    return [
      {
        step: 'Charge Created',
        timestamp: act.createdTimestamp || act.dateTime,
        status: 'Completed',
        actor,
        details: act.description,
      },
      {
        step: 'Global Wallet Debited',
        timestamp: act.dateTime,
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: `ZMW ${(act.debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} debited from Global Wallet.`,
      },
      {
        step: 'Ledger Posting Created',
        timestamp: act.dateTime,
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'Immutable ledger entry posted to central audit trail.',
      },
    ];
  }

  if (act.transactionType === 'Commission') {
    return [
      {
        step: 'Commission Created',
        timestamp: act.createdTimestamp || act.dateTime,
        status: 'Completed',
        actor: 'TellerBud Billing Service',
        details: act.description,
      },
      {
        step: 'Global Wallet Credited',
        timestamp: act.dateTime,
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: `ZMW ${(act.credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} credited to Global Wallet.`,
      },
      {
        step: 'Ledger Posting Created',
        timestamp: act.dateTime,
        status: 'Completed',
        actor: 'TellerBud Core Ledger',
        details: 'Immutable ledger entry posted to central audit trail.',
      },
    ];
  }

  // Withdrawal
  return [
    {
      step: 'Withdrawal Requested',
      timestamp: '18 Aug 2026, 03:00 PM',
      status: 'Completed',
      actor: 'Chileshe Mwamba — Business Owner',
      details: 'ZMW 15,000.00 withdrawal requested through MTN Mobile Money.',
    },
    {
      step: 'TellerBud Admin Approved',
      timestamp: '18 Aug 2026, 03:10 PM',
      status: 'Completed',
      actor: 'TellerBud Admin',
      details: 'Withdrawal request reviewed and approved.',
    },
    {
      step: 'Withdrawal Processing',
      timestamp: '18 Aug 2026, 03:20 PM',
      status: 'Completed',
      actor: 'TellerBud Admin',
      details: 'Approved withdrawal sent for mobile-money payout.',
    },
    {
      step: 'Withdrawal Paid',
      timestamp: '18 Aug 2026, 03:30 PM',
      status: 'Completed',
      actor: 'TellerBud Admin',
      details: 'Mobile-money payout completed successfully.',
    },
    {
      step: 'Global Wallet Debited',
      timestamp: '18 Aug 2026, 03:30 PM',
      status: 'Completed',
      actor: 'TellerBud Core Ledger',
      details: 'ZMW 15,000.00 debited from the Global Wallet only after the withdrawal was marked Paid.',
    },
    {
      step: 'Ledger Posting Created',
      timestamp: '18 Aug 2026, 03:30 PM',
      status: 'Completed',
      actor: 'TellerBud Core Ledger',
      details: 'Immutable ledger entry posted to the central audit trail.',
    },
  ];
};

/**
 * Shared Global Wallet Ledger Records
 * Exactly matched to the 9 canonical records and calculations
 */
export const MOCK_GLOBAL_WALLET_LEDGER_RECORDS: GlobalWalletLedgerRecord[] = MOCK_GLOBAL_WALLET_ACTIVITIES.map((act) => {
  const isCredit = act.credit !== null && act.credit > 0;
  const numSuffix = act.reference.split('-')[2] || '0000';
  const ledgerReference = `BWL-${numSuffix}`;

  const entryType: 'Funding' | 'Charge' | 'Commission' | 'Withdrawal' =
    act.transactionType === 'Funding' || act.transactionType === 'Business Wallet Funding'
      ? 'Funding'
      : act.transactionType === 'Commission'
      ? 'Commission'
      : act.transactionType === 'Charge' || act.transactionType === 'TellerBud Charge'
      ? 'Charge'
      : 'Withdrawal';

  const initiatedByAttribution =
    act.agent
      ? `${act.agent.name} — Agent`
      : act.initiatedBy?.role === 'Business Owner'
      ? `${act.initiatedBy.name} — Business Owner`
      : 'TellerBud Billing Service';

  const amountVal = (isCredit ? act.credit : act.debit) || 0;
  const formattedBefore = `ZMW ${act.balanceBefore.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formattedAmount = `ZMW ${amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formattedAfter = `ZMW ${act.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const calculation = isCredit
    ? `${formattedBefore} + ${formattedAmount} = ${formattedAfter}`
    : `${formattedBefore} − ${formattedAmount} = ${formattedAfter}`;

  return {
    id: ledgerReference,
    ledgerEntry: ledgerReference,
    reference: act.reference,
    dateTime: act.dateTime,
    rawDate: act.rawDate || '2026-09-01',
    transactionType: entryType,
    entryType,
    feeType: act.subType,
    initiatedByAttribution,
    calculation,
    agent: act.agent ? { id: act.agent.id, name: act.agent.name } : null,
    direction: isCredit ? 'Credit' : 'Debit',
    amount: amountVal,
    debit: act.debit,
    credit: act.credit,
    balanceBefore: act.balanceBefore,
    balanceAfter: act.balanceAfter,
    status: 'Posted',
    description: act.description,
    relatedReference: act.reference,
    businessName: 'Lusaka Central Express Agency',
    businessId: 'BIZ-LUS-001',
    lifecycleHistory: getLedgerLifecycleHistory(act),
  };
});

export const MOCK_BUSINESS_WALLET_LEDGER: BusinessWalletLedgerEntry[] = MOCK_GLOBAL_WALLET_LEDGER_RECORDS.map((rec) => ({
  id: rec.id,
  reference: rec.reference,
  timestamp: rec.dateTime,
  type: rec.transactionType,
  description: rec.description,
  direction: rec.direction,
  amount: rec.amount,
  balanceAfter: rec.balanceAfter,
  category: rec.transactionType === 'Business Wallet Funding'
    ? 'Float Funding'
    : rec.transactionType === 'Commission'
    ? 'Fee Commission'
    : rec.transactionType === 'TellerBud Charge'
    ? 'Platform Fee'
    : 'Agent Liquidity',
  ledgerEntry: rec.ledgerEntry,
  debit: rec.debit,
  credit: rec.credit,
  balanceBefore: rec.balanceBefore,
  agent: rec.agent,
  status: rec.status,
  rawDate: rec.rawDate,
  relatedReference: rec.relatedReference,
  relatedPath: rec.relatedPath,
  businessName: rec.businessName,
  businessId: rec.businessId,
  lifecycleHistory: rec.lifecycleHistory,
}));
