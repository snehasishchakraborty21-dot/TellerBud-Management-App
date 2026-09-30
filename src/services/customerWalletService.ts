import { CustomerWalletRecord, WalletAccountState } from '../types/customerWallet';
import { MOCK_CUSTOMER_WALLETS } from '../data/mockCustomerWalletData';

const STORAGE_KEY = 'tellerbud_customer_wallets_v1';

export interface WalletAuditEntry {
  id: string;
  walletId: string;
  customerId: string;
  customerName: string;
  action: 'SUSPEND' | 'REACTIVATE';
  actor: string;
  timestamp: string;
  reason?: string;
}

class CustomerWalletService {
  private wallets: CustomerWalletRecord[] = [];
  private auditLogs: WalletAuditEntry[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.wallets = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load customer wallets from storage:', e);
    }
    this.wallets = [...MOCK_CUSTOMER_WALLETS];
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.wallets));
    } catch (e) {
      console.warn('Failed to save customer wallets to storage:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  public getWallets(): CustomerWalletRecord[] {
    return [...this.wallets];
  }

  public getWalletById(walletId: string): CustomerWalletRecord | undefined {
    const clean = (walletId || '').trim().toUpperCase();
    return this.wallets.find(
      (w) => w.walletId.toUpperCase() === clean || w.customerId.toUpperCase() === clean
    );
  }

  public suspendWallet(
    walletId: string,
    reason: string,
    actingAdmin: string = 'Sililo Lubinda (Admin)'
  ): boolean {
    const index = this.wallets.findIndex(
      (w) => w.walletId === walletId || w.customerId === walletId
    );
    if (index === -1) return false;

    const wallet = this.wallets[index];
    const updatedWallet: CustomerWalletRecord = {
      ...wallet,
      walletState: 'Suspended',
      lastUpdated: 'Just now',
      lastUpdatedTimestamp: new Date().toISOString(),
      reviewReason: reason ? `Suspended by Admin: ${reason}` : wallet.reviewReason,
    };

    this.wallets[index] = updatedWallet;

    this.auditLogs.unshift({
      id: `AUD-WAL-${Date.now()}`,
      walletId: wallet.walletId,
      customerId: wallet.customerId,
      customerName: wallet.customerName,
      action: 'SUSPEND',
      actor: actingAdmin,
      timestamp: new Date().toLocaleString(),
      reason: reason.trim(),
    });

    this.notify();
    return true;
  }

  public reactivateWallet(
    walletId: string,
    actingAdmin: string = 'Sililo Lubinda (Admin)'
  ): boolean {
    const index = this.wallets.findIndex(
      (w) => w.walletId === walletId || w.customerId === walletId
    );
    if (index === -1) return false;

    const wallet = this.wallets[index];
    const updatedWallet: CustomerWalletRecord = {
      ...wallet,
      walletState: 'Active',
      lastUpdated: 'Just now',
      lastUpdatedTimestamp: new Date().toISOString(),
    };

    this.wallets[index] = updatedWallet;

    this.auditLogs.unshift({
      id: `AUD-WAL-${Date.now()}`,
      walletId: wallet.walletId,
      customerId: wallet.customerId,
      customerName: wallet.customerName,
      action: 'REACTIVATE',
      actor: actingAdmin,
      timestamp: new Date().toLocaleString(),
    });

    this.notify();
    return true;
  }
}

export const customerWalletService = new CustomerWalletService();
