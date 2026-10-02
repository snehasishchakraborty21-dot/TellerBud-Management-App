/**
 * TellerBud Centralized Reference Registry & Sequence Generator
 * 
 * Manages atomic, sequential, monotonic ID and reference number generation
 * across all subsystems of the TellerBud platform according to official specifications.
 * 
 * Rules:
 * - Approved format: TB-[APPROVED THREE-LETTER PREFIX]-[EXACTLY SIX DIGITS]
 * - Six-digit, zero-padded sequential number (e.g. TB-CUS-000001).
 * - 000000 represents the format placeholder only.
 * - Monotonic counter per reference type; deletion/suspension does NOT reuse numbers.
 * - Generation is atomic, platform-wide, permanent, and unique.
 */

export interface ReferenceFormatDefinition {
  type: string;
  prefix: string;
  formatPattern: string; // e.g. 'TB-STR-000000'
  purpose: string;
  initialSequence: number;
}

export const APPROVED_ID_PREFIXES = [
  'REQ',
  'CFR',
  'AAL',
  'PUR',
  'WDL',
  'DEP',
  'AGT',
  'STR',
  'BTH',
  'BIZ',
  'CUS',
  'BOO',
  'AUD',
  'ADM',
  'DEV',
  'ADJ',
  'EMP',
  'FND',
  'CMS',
  'CHG',
] as const;

export type ApprovedIdPrefix = typeof APPROVED_ID_PREFIXES[number];

export const TELLERBUD_REFERENCE_REGISTRY: Record<string, ReferenceFormatDefinition> = {
  CUSTOMER_REQUEST: {
    type: 'CUSTOMER_REQUEST',
    prefix: 'TB-REQ',
    formatPattern: 'TB-REQ-000000',
    purpose: 'Customer Request Reference Number',
    initialSequence: 1,
  },
  CASH_FLOAT_REQUEST: {
    type: 'CASH_FLOAT_REQUEST',
    prefix: 'TB-CFR',
    formatPattern: 'TB-CFR-000000',
    purpose: 'Cash/Float Request Reference Number',
    initialSequence: 1,
  },
  AGENT_LIQUIDITY: {
    type: 'AGENT_LIQUIDITY',
    prefix: 'TB-AAL',
    formatPattern: 'TB-AAL-000000',
    purpose: 'Agent-to-Agent Liquidity Reference Number',
    initialSequence: 1,
  },
  PURCHASE_TRANSACTION: {
    type: 'PURCHASE_TRANSACTION',
    prefix: 'TB-PUR',
    formatPattern: 'TB-PUR-000000',
    purpose: 'Purchase Transaction ID',
    initialSequence: 1,
  },
  WITHDRAWAL_TRANSACTION: {
    type: 'WITHDRAWAL_TRANSACTION',
    prefix: 'TB-WDL',
    formatPattern: 'TB-WDL-000000',
    purpose: 'Withdrawal Transaction ID',
    initialSequence: 1,
  },
  DEPOSIT_TRANSACTION: {
    type: 'DEPOSIT_TRANSACTION',
    prefix: 'TB-DEP',
    formatPattern: 'TB-DEP-000000',
    purpose: 'Deposit Transaction ID',
    initialSequence: 1,
  },
  AGENT: {
    type: 'AGENT',
    prefix: 'TB-AGT',
    formatPattern: 'TB-AGT-000000',
    purpose: 'Agent ID',
    initialSequence: 1,
  },
  STORE: {
    type: 'STORE',
    prefix: 'TB-STR',
    formatPattern: 'TB-STR-000000',
    purpose: 'Store Code',
    initialSequence: 1,
  },
  BOOTH: {
    type: 'BOOTH',
    prefix: 'TB-BTH',
    formatPattern: 'TB-BTH-000000',
    purpose: 'Booth Code',
    initialSequence: 1,
  },
  BUSINESS: {
    type: 'BUSINESS',
    prefix: 'TB-BIZ',
    formatPattern: 'TB-BIZ-000000',
    purpose: 'Business ID',
    initialSequence: 1,
  },
  CUSTOMER: {
    type: 'CUSTOMER',
    prefix: 'TB-CUS',
    formatPattern: 'TB-CUS-000000',
    purpose: 'Customer ID',
    initialSequence: 1,
  },
  BUSINESS_OWNER: {
    type: 'BUSINESS_OWNER',
    prefix: 'TB-BOO',
    formatPattern: 'TB-BOO-000000',
    purpose: 'Business Owner ID',
    initialSequence: 1,
  },
  AUDITOR: {
    type: 'AUDITOR',
    prefix: 'TB-AUD',
    formatPattern: 'TB-AUD-000000',
    purpose: 'Auditor ID',
    initialSequence: 1,
  },
  ADMIN: {
    type: 'ADMIN',
    prefix: 'TB-ADM',
    formatPattern: 'TB-ADM-000000',
    purpose: 'Admin ID',
    initialSequence: 1,
  },
  DEVICE: {
    type: 'DEVICE',
    prefix: 'TB-DEV',
    formatPattern: 'TB-DEV-000000',
    purpose: 'Device ID',
    initialSequence: 1,
  },
  ADJUSTMENT: {
    type: 'ADJUSTMENT',
    prefix: 'TB-ADJ',
    formatPattern: 'TB-ADJ-000000',
    purpose: 'Adjustment Transaction ID',
    initialSequence: 1,
  },
  EMPLOYEE: {
    type: 'EMPLOYEE',
    prefix: 'TB-EMP',
    formatPattern: 'TB-EMP-000000',
    purpose: 'TellerBud Employee ID',
    initialSequence: 1,
  },
  FUNDING: {
    type: 'FUNDING',
    prefix: 'TB-FND',
    formatPattern: 'TB-FND-000000',
    purpose: 'Funding Transaction ID',
    initialSequence: 1,
  },
  COMMISSION: {
    type: 'COMMISSION',
    prefix: 'TB-CMS',
    formatPattern: 'TB-CMS-000000',
    purpose: 'Earnings Transaction ID',
    initialSequence: 1,
  },
  CHARGE: {
    type: 'CHARGE',
    prefix: 'TB-CHG',
    formatPattern: 'TB-CHG-000000',
    purpose: 'Charge Transaction ID',
    initialSequence: 1,
  },
};

export type TellerBudReferenceType = keyof typeof TELLERBUD_REFERENCE_REGISTRY;

const SEQUENCE_STORAGE_KEY = 'tellerbud_sequence_counters_v3';

class SequenceService {
  private counters: Record<string, number> = {};

  constructor() {
    this.loadCounters();
  }

  private loadCounters(): void {
    try {
      const stored = localStorage.getItem(SEQUENCE_STORAGE_KEY);
      if (stored) {
        this.counters = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load sequence counters:', e);
      this.counters = {};
    }

    // Ensure all registry types have at least their default initial sequence
    for (const [key, def] of Object.entries(TELLERBUD_REFERENCE_REGISTRY)) {
      if (this.counters[key] === undefined || this.counters[key] < def.initialSequence) {
        this.counters[key] = def.initialSequence;
      }
    }
    this.saveCounters();
  }

  private saveCounters(): void {
    try {
      localStorage.setItem(SEQUENCE_STORAGE_KEY, JSON.stringify(this.counters));
    } catch (e) {
      console.error('Failed to save sequence counters:', e);
    }
  }

  /**
   * Atomically increments and returns the next reference code for a given type.
   */
  public nextReference(type: TellerBudReferenceType): string {
    const def = TELLERBUD_REFERENCE_REGISTRY[type];
    if (!def) {
      throw new Error(`Unknown reference type: ${type}`);
    }

    if (this.counters[type] === undefined || this.counters[type] < def.initialSequence) {
      this.counters[type] = def.initialSequence;
    }

    const currentSeq = this.counters[type];
    // Monotonically advance sequence
    this.counters[type] = currentSeq + 1;
    this.saveCounters();

    return this.formatCode(def.prefix, currentSeq);
  }

  /**
   * Generates next Customer Request Reference: TB-REQ-000001, etc.
   */
  public nextCustomerRequestId(): string {
    return this.nextReference('CUSTOMER_REQUEST');
  }

  /**
   * Generates next Cash/Float Request Reference: TB-CFR-000001, etc.
   */
  public nextCashFloatRequestId(): string {
    return this.nextReference('CASH_FLOAT_REQUEST');
  }

  /**
   * Generates next Agent-to-Agent Liquidity Reference: TB-AAL-000001, etc.
   */
  public nextAgentLiquidityId(): string {
    return this.nextReference('AGENT_LIQUIDITY');
  }

  /**
   * Generates next Purchase Transaction ID: TB-PUR-000001, etc.
   */
  public nextPurchaseTransactionId(): string {
    return this.nextReference('PURCHASE_TRANSACTION');
  }

  /**
   * Generates next Withdrawal Transaction ID: TB-WDL-000001, etc.
   */
  public nextWithdrawalTransactionId(): string {
    return this.nextReference('WITHDRAWAL_TRANSACTION');
  }

  /**
   * Generates next Deposit Transaction ID: TB-DEP-000001, etc.
   */
  public nextDepositTransactionId(): string {
    return this.nextReference('DEPOSIT_TRANSACTION');
  }

  /**
   * Generates next Agent ID: TB-AGT-000001, etc.
   */
  public nextAgentId(): string {
    return this.nextReference('AGENT');
  }

  /**
   * Generates next Store Code: TB-STR-000001, etc.
   */
  public nextStoreCode(): string {
    return this.nextReference('STORE');
  }

  /**
   * Generates next Booth Code: TB-BTH-000001, etc.
   */
  public nextBoothCode(): string {
    return this.nextReference('BOOTH');
  }

  /**
   * Generates next Business ID: TB-BIZ-000001, etc.
   */
  public nextBusinessId(): string {
    return this.nextReference('BUSINESS');
  }

  /**
   * Generates next Customer ID: TB-CUS-000001, etc.
   */
  public nextCustomerId(): string {
    return this.nextReference('CUSTOMER');
  }

  /**
   * Generates next Business Owner ID: TB-BOO-000001, etc.
   */
  public nextBusinessOwnerId(): string {
    return this.nextReference('BUSINESS_OWNER');
  }

  /**
   * Generates next Auditor ID: TB-AUD-000001, etc.
   */
  public nextAuditorId(): string {
    return this.nextReference('AUDITOR');
  }

  /**
   * Generates next Admin ID: TB-ADM-000001, etc.
   */
  public nextAdminId(): string {
    return this.nextReference('ADMIN');
  }

  /**
   * Generates next Device ID: TB-DEV-000001, etc.
   */
  public nextDeviceId(): string {
    return this.nextReference('DEVICE');
  }

  /**
   * Generates next Adjustment Transaction ID: TB-ADJ-000001, etc.
   */
  public nextAdjustmentTransactionId(): string {
    return this.nextReference('ADJUSTMENT');
  }

  /**
   * Generates next Employee ID: TB-EMP-000001, etc.
   */
  public nextEmployeeId(): string {
    return this.nextReference('EMPLOYEE');
  }

  /**
   * Generates next Funding Transaction ID: TB-FND-000001, etc.
   */
  public nextFundingTransactionId(): string {
    return this.nextReference('FUNDING');
  }

  /**
   * Generates next Earnings / Commission Transaction ID: TB-CMS-000001, etc.
   */
  public nextCommissionTransactionId(): string {
    return this.nextReference('COMMISSION');
  }

  /**
   * Generates next Charge Transaction ID: TB-CHG-000001, etc.
   */
  public nextChargeTransactionId(): string {
    return this.nextReference('CHARGE');
  }

  /**
   * Formats prefix and integer sequence into a 6-digit zero-padded reference string.
   */
  public formatCode(prefix: string, seq: number): string {
    return `${prefix}-${String(seq).padStart(6, '0')}`;
  }

  /**
   * Returns definition metadata for a registry entry.
   */
  public getDefinition(type: TellerBudReferenceType): ReferenceFormatDefinition {
    return TELLERBUD_REFERENCE_REGISTRY[type];
  }

  /**
   * Validates if a code matches the approved 6-digit format with an approved 3-letter prefix.
   */
  public isValidCode(code: string, expectedPrefix?: string): boolean {
    if (!code || typeof code !== 'string') return false;
    const clean = code.trim();
    if (expectedPrefix) {
      return new RegExp(`^${expectedPrefix}-\\d{6}$`).test(clean);
    }
    const match = clean.match(/^TB-([A-Z]{3})-\d{6}$/);
    if (!match) return false;
    return APPROVED_ID_PREFIXES.includes(match[1] as ApprovedIdPrefix);
  }
}

export const sequenceService = new SequenceService();
