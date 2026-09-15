export type WalletType = 'Customer Wallet' | 'Business Global Wallet';

export type LedgerEntryType =
  | 'Funding Credit'
  | 'Transaction Credit'
  | 'Withdrawal Debit'
  | 'Transaction Debit'
  | 'Reservation Created'
  | 'Reservation Released'
  | 'Transaction Charge'
  | 'Reversal';

export type LedgerDirection = 'Credit' | 'Debit' | 'Hold Memo';

export type ReconciliationState = 'Matched' | 'Pending' | 'Exception';

export interface AuthoritativeLedgerRecord {
  id: string;
  ledgerEntry: string;          // e.g. TB-LED-1052-01
  timestamp: string;            // e.g. 14 Jan 2025, 10:00 AM
  rawDate: string;              // ISO string for accurate sorting
  holderName: string;           // Customer or Business name
  walletId: string;             // e.g. TB-WAL-1052 or TB-BWL-1007
  walletType: WalletType;
  entryType: LedgerEntryType;
  direction: LedgerDirection;
  sourceReference: string;      // e.g. TB-FND-1052-01
  originalLedgerReference?: string; // For reversals e.g. TB-LED-BWL-1005-03
  debit: number | null;
  credit: number | null;
  balanceAfter: number;
  reconciliation: ReconciliationState;
  reconciliationNotes?: string;
  actor?: string;
  actorId?: string;
  channel?: string;
}

export interface LedgerSummaryKPIs {
  totalLedgerEntries: number;     // 1,248
  totalWalletBalances: number;    // ZMW 888,570.00
  customerWalletsBalance: number; // ZMW 381,220.00
  businessWalletsBalance: number; // ZMW 507,350.00
  creditsToday: number;           // ZMW 42,500.00
  debitsToday: number;            // ZMW 18,250.00
  reconciliationExceptions: number; // 2
}
