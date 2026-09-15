import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { BusinessGlobalWallet, BusinessWalletLedgerEntry } from '../../types/businessWallet';
import { formatZMW } from '../../data/mockBusinessWalletData';

interface FundBusinessWalletModalProps {
  wallet: BusinessGlobalWallet;
  onClose: () => void;
  onSuccess: (newEntry: BusinessWalletLedgerEntry, fundedAmount: number) => void;
}

export const FundBusinessWalletModal: React.FC<FundBusinessWalletModalProps> = ({
  wallet,
  onClose,
  onSuccess,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [fundingSource, setFundingSource] = useState<string>('Bank Transfer - Stanbic Bank');
  const [transactionRef, setTransactionRef] = useState<string>(
    `BNK-TXN-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-generated idempotency key to prevent double funding
  const [idempotencyKey] = useState<string>(
    () => `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  );

  const parsedAmount = parseFloat(amountStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (parsedAmount <= 0) {
      setError('Please enter a valid funding amount greater than ZMW 0.00');
      return;
    }

    if (!transactionRef.trim()) {
      setError('External transaction reference is required for audit reconciliation.');
      return;
    }

    if (!confirmed) {
      setError('You must confirm this funding authorization before proceeding.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newBalance = wallet.postedBalance + parsedAmount;
      const newEntry: BusinessWalletLedgerEntry = {
        id: `led-${Date.now()}`,
        reference: `TB-TXN-${Math.floor(4311 + Math.random() * 500)}`,
        type: 'Credit',
        date: 'Today, Just now',
        timestamp: new Date().toISOString(),
        amount: parsedAmount,
        resultingBalance: newBalance,
        description: `Admin Float Funding (${fundingSource}) • Ref #${transactionRef.trim()}`,
        counterparty: fundingSource,
        actor: 'Authorised Admin',
        actorId: 'ADM-SYS-01',
      };

      onSuccess(newEntry, parsedAmount);
      setIsSubmitting(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102025]">
                Fund Business Wallet
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {wallet.businessName} • {wallet.walletId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Read-only Ledger Position Notice */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start gap-2.5">
            <Lock size={15} className="text-slate-500 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600 space-y-0.5">
              <div className="font-semibold text-slate-800">
                Controlled Funding Protocol
              </div>
              <div className="text-[11px] text-slate-500">
                Direct balance editing is disabled. Funding generates an immutable ledger credit entry, updating Posted and Available balances.
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Balance & Resulting Balance Preview */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#0D93AA]/5 rounded-lg border border-[#0D93AA]/15">
            <div>
              <div className="text-[11px] text-slate-500 font-medium">
                Current Posted Balance
              </div>
              <div className="text-sm font-bold font-mono text-[#102025]">
                {formatZMW(wallet.postedBalance)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">
                Resulting Posted Balance
              </div>
              <div className="text-sm font-bold font-mono text-[#0D93AA]">
                {formatZMW(wallet.postedBalance + parsedAmount)}
              </div>
            </div>
          </div>

          {/* 1. Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Funding Amount (ZMW) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                ZMW
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="e.g. 25000.00"
                className="w-full pl-13 pr-3 py-2 text-sm font-mono bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
                autoFocus
              />
            </div>
          </div>

          {/* 2. Funding Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Funding Source Channel <span className="text-rose-500">*</span>
            </label>
            <select
              value={fundingSource}
              onChange={(e) => setFundingSource(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
            >
              <option value="Bank Transfer - Stanbic Bank">Bank Transfer - Stanbic Bank Zambia</option>
              <option value="Bank Transfer - ABSA Zambia">Bank Transfer - ABSA Zambia</option>
              <option value="Bank Wire - Zanaco">Bank Wire - Zanaco Commercial</option>
              <option value="Cash Settlement Float Deposit">Cash Settlement Float Deposit</option>
              <option value="Treasury Reserve Injection">Treasury Reserve Injection</option>
            </select>
          </div>

          {/* 3. Transaction Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              External Transaction Reference <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. STB-EFT-99412"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:border-[#0D93AA]"
            />
          </div>

          {/* Idempotency Key (System Managed) */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
            <span>Idempotency Key:</span>
            <span className="truncate max-w-[240px] text-slate-500">{idempotencyKey}</span>
          </div>

          {/* 4. Confirmation Checkbox */}
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-[#0D93AA] focus:ring-[#0D93AA] cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-tight">
                I confirm this funding authorization has been verified against external banking records and understand this creates an immutable ledger entry.
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !confirmed || parsedAmount <= 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <CheckCircle2 size={14} />
              <span>{isSubmitting ? 'Recording Ledger...' : 'Confirm & Fund Wallet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
