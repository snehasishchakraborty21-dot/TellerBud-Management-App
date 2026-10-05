/**
 * Revenue Split Configuration & Audit History Service.
 * Manages the distribution of Reservation Charges between TellerBud and Business Owners.
 */

export interface RevenueSplitConfig {
  id: string;
  version: string;
  tellerBudShare: number; // e.g., 20.00
  businessOwnerShare: number; // e.g., 80.00
  status: 'Active' | 'Scheduled' | 'Replaced' | 'Cancelled';
  effectiveFrom: string;
  effectiveFromDisplay: string;
  effectiveIso: string;
  changedBy: string;
  changedById: string;
  changedByName: string;
  reason: string;
  createdAt: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  applicableServices: string[];
}

const DEFAULT_SPLIT_HISTORY: RevenueSplitConfig[] = [
  {
    id: 'TB-REV-SPLIT-002',
    version: 'v2.0 (TB-REV-SPLIT-V2)',
    tellerBudShare: 20.0,
    businessOwnerShare: 80.0,
    status: 'Active',
    effectiveFrom: '2026-09-01T00:00:00+02:00',
    effectiveFromDisplay: '01 September 2026, 00:00 CAT',
    effectiveIso: '2026-09-01T00:00:00+02:00',
    changedBy: 'Sililo Lubinda (TB-EMP-000001)',
    changedById: 'TB-EMP-000001',
    changedByName: 'Sililo Lubinda',
    reason: 'Approved standard revenue split structure across Cash Pickup and Agent-to-Agent Liquidity services.',
    createdAt: '2026-08-25T14:30:00+02:00',
    applicableServices: ['Cash Pickup', 'Agent-to-Agent Liquidity'],
  },
  {
    id: 'TB-REV-SPLIT-001',
    version: 'v1.0 (TB-REV-SPLIT-V1)',
    tellerBudShare: 15.0,
    businessOwnerShare: 85.0,
    status: 'Replaced',
    effectiveFrom: '2026-06-01T00:00:00+02:00',
    effectiveFromDisplay: '01 June 2026, 00:00 CAT',
    effectiveIso: '2026-06-01T00:00:00+02:00',
    changedBy: 'Sililo Lubinda (TB-EMP-000001)',
    changedById: 'TB-EMP-000001',
    changedByName: 'Sililo Lubinda',
    reason: 'Initial platform rollout beta promotional revenue structure.',
    createdAt: '2026-05-20T10:00:00+02:00',
    applicableServices: ['Cash Pickup', 'Agent-to-Agent Liquidity'],
  },
];

class RevenueSplitService {
  private history: RevenueSplitConfig[] = [...DEFAULT_SPLIT_HISTORY];
  private listeners: (() => void)[] = [];

  public getHistory(): RevenueSplitConfig[] {
    return [...this.history];
  }

  public getActiveSplit(): RevenueSplitConfig {
    const active = this.history.find((s) => s.status === 'Active');
    return active || this.history[0];
  }

  public getScheduledSplit(): RevenueSplitConfig | undefined {
    return this.history.find((s) => s.status === 'Scheduled');
  }

  public applyNewSplit(params: {
    tellerBudShare: number;
    businessOwnerShare: number;
    reason: string;
    applyImmediately: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
    adminName: string;
    adminId: string;
  }): { success: boolean; message: string; config?: RevenueSplitConfig } {
    // 1. Validation
    const total = Math.round((params.tellerBudShare + params.businessOwnerShare) * 100) / 100;
    if (total !== 100) {
      return { success: false, message: 'TellerBud and Business Owner percentages must total 100%.' };
    }

    if (!params.reason || params.reason.trim().length < 10) {
      return { success: false, message: 'Enter a valid reason for the change (minimum 10 characters).' };
    }

    const now = new Date();
    const currentActive = this.getActiveSplit();
    const nextVersionNum = (this.history.length + 1).toFixed(1);
    const splitId = `TB-REV-SPLIT-${String(this.history.length + 1).padStart(3, '0')}`;
    const versionLabel = `v${nextVersionNum} (TB-REV-SPLIT-V${this.history.length + 1})`;

    if (params.applyImmediately) {
      // Mark current active as Replaced
      this.history = this.history.map((s) => (s.status === 'Active' ? { ...s, status: 'Replaced' as const } : s));

      const effectiveDateStr = now.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Lusaka',
      }) + ' CAT';

      const newConfig: RevenueSplitConfig = {
        id: splitId,
        version: versionLabel,
        tellerBudShare: params.tellerBudShare,
        businessOwnerShare: params.businessOwnerShare,
        status: 'Active',
        effectiveFrom: now.toISOString(),
        effectiveFromDisplay: effectiveDateStr,
        effectiveIso: now.toISOString(),
        changedBy: `${params.adminName} (${params.adminId})`,
        changedById: params.adminId,
        changedByName: params.adminName,
        reason: params.reason.trim(),
        createdAt: now.toISOString(),
        applicableServices: ['Cash Pickup', 'Agent-to-Agent Liquidity'],
      };

      this.history.unshift(newConfig);
      this.notify();
      return { success: true, message: 'Revenue split updated successfully.', config: newConfig };
    } else {
      // Schedule for later
      if (!params.scheduledDate || !params.scheduledTime) {
        return { success: false, message: 'Select a valid scheduled date and time.' };
      }

      const scheduledIso = `${params.scheduledDate}T${params.scheduledTime}:00`;
      const scheduledDateObj = new Date(scheduledIso);
      if (isNaN(scheduledDateObj.getTime()) || scheduledDateObj.getTime() <= now.getTime()) {
        return { success: false, message: 'The effective date and time cannot be in the past.' };
      }

      // Check if existing scheduled split exists and replace it
      this.history = this.history.filter((s) => s.status !== 'Scheduled');

      const [y, m, d] = params.scheduledDate.split('-').map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d));
      const formattedDate = dateObj.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
      const displayStr = `${formattedDate}, ${params.scheduledTime} CAT`;

      const scheduledConfig: RevenueSplitConfig = {
        id: splitId,
        version: versionLabel,
        tellerBudShare: params.tellerBudShare,
        businessOwnerShare: params.businessOwnerShare,
        status: 'Scheduled',
        effectiveFrom: scheduledIso,
        effectiveFromDisplay: displayStr,
        effectiveIso: scheduledIso,
        changedBy: `${params.adminName} (${params.adminId})`,
        changedById: params.adminId,
        changedByName: params.adminName,
        reason: params.reason.trim(),
        createdAt: now.toISOString(),
        applicableServices: ['Cash Pickup', 'Agent-to-Agent Liquidity'],
      };

      this.history.unshift(scheduledConfig);
      this.notify();
      return { success: true, message: 'Revenue split scheduled successfully.', config: scheduledConfig };
    }
  }

  public cancelScheduledSplit(params: {
    splitId: string;
    reason: string;
    adminName: string;
    adminId: string;
  }): { success: boolean; message: string } {
    if (!params.reason || params.reason.trim().length < 10) {
      return { success: false, message: 'Enter a valid cancellation reason (minimum 10 characters).' };
    }

    const target = this.history.find((s) => s.id === params.splitId && s.status === 'Scheduled');
    if (!target) {
      return { success: false, message: 'Scheduled revenue split not found or already processed.' };
    }

    target.status = 'Cancelled';
    target.cancellationReason = params.reason.trim();
    target.cancelledBy = `${params.adminName} (${params.adminId})`;
    target.cancelledAt = new Date().toISOString();

    this.notify();
    return { success: true, message: 'Scheduled revenue split cancelled successfully.' };
  }

  /**
   * Deterministically calculates revenue split allocation for a given reservation fee.
   * Handles rounding to two decimal places and guarantees exact conservation of amount.
   */
  public calculateSplit(reservationFee: number, split?: RevenueSplitConfig): {
    tellerBudAmount: number;
    businessOwnerAmount: number;
    tellerBudPercentage: number;
    businessOwnerPercentage: number;
    version: string;
  } {
    const active = split || this.getActiveSplit();
    const tbPercent = active.tellerBudShare;
    const boPercent = active.businessOwnerShare;

    const tellerBudAmount = Math.round((reservationFee * (tbPercent / 100)) * 100) / 100;
    const businessOwnerAmount = Math.round((reservationFee - tellerBudAmount) * 100) / 100;

    return {
      tellerBudAmount,
      businessOwnerAmount,
      tellerBudPercentage: tbPercent,
      businessOwnerPercentage: boPercent,
      version: active.version,
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const revenueSplitService = new RevenueSplitService();
