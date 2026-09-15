import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Scale,
  ShieldCheck,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { MOCK_AUTHORITATIVE_LEDGER } from '../data/mockWalletLedgerData';
import { formatZMW } from '../data/mockBusinessWalletData';

export const LedgerEntryDetailPage: React.FC = () => {
  const { ledgerEntryId } = useParams<{ ledgerEntryId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState<string | null>(null);

  const entry = useMemo(() => {
    if (!ledgerEntryId) return null;
    return (
      MOCK_AUTHORITATIVE_LEDGER.find(
        (r) =>
          r.ledgerEntry.toLowerCase() === ledgerEntryId.toLowerCase() ||
          r.id.toLowerCase() === ledgerEntryId.toLowerCase()
      ) || {
        id: ledgerEntryId,
        ledgerEntry: ledgerEntryId,
        timestamp: 'Today, 11:20 AM',
        rawDate: '2026-09-10T11:20:00Z',
        holderName: 'Lusaka Central Express Agency',
        walletId: 'TB-BWL-1007',
        walletType: 'Business Global Wallet' as const,
        entryType: 'Transaction Credit' as const,
        direction: 'Credit' as const,
        sourceReference: 'TB-TXN-4310',
        debit: null,
        credit: 3500.0,
        balanceAfter: 164350.0,
        reconciliation: 'Matched' as const,
        actor: 'Mwansa Tembo',
        actorId: 'TB-AGT-1007-01',
        channel: 'Terminal Float Settlement',
      }
    );
  }, [ledgerEntryId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!entry) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-md mx-auto">
          <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
          <h2 className="text-base font-bold text-slate-800">Ledger Entry Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Could not find an authoritative ledger entry matching "{ledgerEntryId}".
          </p>
          <button
            type="button"
            onClick={() => navigate('/wallet-ledger')}
            className="px-4 py-2 bg-[#0D93AA] text-white text-xs font-semibold rounded-lg hover:bg-[#0b8296] transition-colors cursor-pointer"
          >
            Back to Wallet Ledger
          </button>
        </div>
      </div>
    );
  }

  // Financial impact values
  const isCredit = entry.direction === 'Credit';
  const isDebit = entry.direction === 'Debit';
  const isHold = entry.direction === 'Hold Memo';

  const amount = entry.credit ?? entry.debit ?? (isHold ? 2000 : 0);
  const balanceBefore = isCredit
    ? entry.balanceAfter - (entry.credit || 0)
    : isDebit
    ? entry.balanceAfter + (entry.debit || 0)
    : entry.balanceAfter;

  // Double-entry accounts
  const debitAccountName = isDebit
    ? `${entry.walletId} (${entry.holderName})`
    : `Clearing & Settlement Account (GL-1040-02)`;
  const debitAccountType = isDebit
    ? `${entry.walletType} Liability`
    : `Clearing & Settlement Asset`;

  const creditAccountName = isDebit
    ? `Disbursement Settlement Float (GL-2050-01)`
    : `${entry.walletId} (${entry.holderName})`;
  const creditAccountType = isDebit
    ? `Disbursement Asset / Clearing`
    : `${entry.walletType} Liability`;

  // Reconciliation data
  const recReference = `REC-${entry.sourceReference.replace('TB-', '')}-01`;
  const matchedAt = entry.timestamp;
  const reconciledBy =
    entry.actor && entry.actor.includes('Bot')
      ? entry.actor
      : 'Automated Clearing Engine (SYS-REC-01)';

  return (
    <div className="max-w-[1536px] mx-auto p-4 sm:p-5 space-y-4 pb-28">
      {/* Top navigation */}
      <div>
        <Link
          to="/wallet-ledger"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0D93AA] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Wallet Ledger</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold font-mono text-[#102025]">
                {entry.ledgerEntry}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  entry.reconciliation === 'Matched'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : entry.reconciliation === 'Pending'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {entry.reconciliation}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                Immutable Record
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>Timestamp: <strong className="text-slate-700">{entry.timestamp}</strong></span>
              <span>•</span>
              <span>Direction: <strong className="text-slate-700">{entry.direction}</strong></span>
              <span>•</span>
              <span>Type: <strong className="text-slate-700">{entry.entryType}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => copyToClipboard(entry.ledgerEntry, 'entry')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-gray-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            {copied === 'entry' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copied === 'entry' ? 'Copied' : 'Copy Reference'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8296] rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Export / Print Ledger Record"
          >
            <Printer size={13} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 1. BALANCE IMPACT CARDS (No supporting text) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Balance Before */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">
            Balance Before
          </div>
          <div className="text-xl font-bold font-mono text-slate-800 mt-1.5">
            {formatZMW(balanceBefore)}
          </div>
        </div>

        {/* Card 2: Amount (with direction badge) */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">
              Amount
            </div>
            <div className={`text-xl font-bold font-mono mt-1.5 ${
              isCredit ? 'text-emerald-700' : isDebit ? 'text-rose-700' : 'text-blue-700'
            }`}>
              {formatZMW(amount)}
            </div>
          </div>
          <div className="shrink-0">
            {isCredit && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ArrowDownLeft size={13} />
                <span>Credit Inflow</span>
              </span>
            )}
            {isDebit && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <ArrowUpRight size={13} />
                <span>Debit Outflow</span>
              </span>
            )}
            {isHold && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <span>Reservation Hold</span>
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Balance After */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500">
            Balance After
          </div>
          <div className="text-xl font-bold font-mono text-[#102025] mt-1.5">
            {formatZMW(entry.balanceAfter)}
          </div>
        </div>
      </div>

      {/* 2. DOUBLE-ENTRY POSTING (Full Width, Balanced Totals) */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-[#0D93AA]" />
            <h2 className="text-sm font-bold text-[#102025]">
              Double-Entry Posting
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Balanced Status: Yes
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            <span>Journal Ref: <strong className="font-mono text-slate-800">JRN-{entry.ledgerEntry.replace('TB-LED-', '')}</strong></span>
            <span>•</span>
            <span>Posting Type: <strong className="text-slate-800">Automated System Journal</strong></span>
          </div>
        </div>

        {/* Double-Entry Legs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Debit Leg */}
          <div className="p-3.5 bg-slate-50/80 rounded-lg border border-gray-200/80">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 mb-2.5">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Debit Leg</span>
              <span className="text-xs font-mono font-bold text-rose-700">{formatZMW(amount)}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account / Wallet:</span>
                <span className="font-semibold text-slate-800 text-right">{debitAccountName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account Type:</span>
                <span className="text-slate-700 text-right">{debitAccountType}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-200/40">
                <span className="text-slate-600 font-medium">Debit Amount:</span>
                <span className="font-mono font-bold text-rose-700">{formatZMW(amount)}</span>
              </div>
            </div>
          </div>

          {/* Credit Leg */}
          <div className="p-3.5 bg-slate-50/80 rounded-lg border border-gray-200/80">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 mb-2.5">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Credit Leg</span>
              <span className="text-xs font-mono font-bold text-emerald-700">{formatZMW(amount)}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account / Wallet:</span>
                <span className="font-semibold text-slate-800 text-right">{creditAccountName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account Type:</span>
                <span className="text-slate-700 text-right">{creditAccountType}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-200/40">
                <span className="text-slate-600 font-medium">Credit Amount:</span>
                <span className="font-mono font-bold text-emerald-700">{formatZMW(amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balanced Verification Footer */}
        <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span className="text-slate-600">
              Double-entry posting verified: <strong>Debit Total equals Credit Total</strong> (Net variance: ZMW 0.00)
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0 font-mono text-xs font-bold">
            <span className="text-rose-700">Debit Total: {formatZMW(amount)}</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700">Credit Total: {formatZMW(amount)}</span>
          </div>
        </div>
      </div>

      {/* 3. RECONCILIATION & AUDIT (Compact 4-Column Grid) */}
      <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-3.5">
          <ShieldCheck size={16} className="text-[#0D93AA]" />
          <h2 className="text-sm font-bold text-[#102025]">
            Reconciliation & Audit
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          {/* 1. Reconciliation Status */}
          <div className="p-3 bg-slate-50/70 rounded-lg border border-gray-100">
            <span className="text-slate-500 font-medium block">Reconciliation Status</span>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  entry.reconciliation === 'Matched'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : entry.reconciliation === 'Pending'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {entry.reconciliation === 'Matched' && <CheckCircle2 size={12} />}
                {entry.reconciliation === 'Pending' && <Clock size={12} />}
                {entry.reconciliation === 'Exception' && <AlertTriangle size={12} />}
                <span>{entry.reconciliation}</span>
              </span>
            </div>
            {entry.reconciliationNotes && (
              <p className="text-[11px] text-amber-800 mt-1.5 line-clamp-2">
                {entry.reconciliationNotes}
              </p>
            )}
          </div>

          {/* 2. Reconciliation Reference */}
          <div className="p-3 bg-slate-50/70 rounded-lg border border-gray-100">
            <span className="text-slate-500 font-medium block">Reconciliation Reference</span>
            <span className="font-mono font-bold text-slate-800 mt-1.5 block">
              {recReference}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block font-mono">
              Source: {entry.sourceReference}
            </span>
          </div>

          {/* 3. Matched At */}
          <div className="p-3 bg-slate-50/70 rounded-lg border border-gray-100">
            <span className="text-slate-500 font-medium block">Matched At</span>
            <span className="font-semibold text-slate-800 mt-1.5 block">
              {matchedAt}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Real-time Core Audit
            </span>
          </div>

          {/* 4. Reconciled By */}
          <div className="p-3 bg-slate-50/70 rounded-lg border border-gray-100">
            <span className="text-slate-500 font-medium block">Reconciled By</span>
            <span className="font-semibold text-slate-800 mt-1.5 block truncate" title={reconciledBy}>
              {reconciledBy}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Automated Integrity Protocol
            </span>
          </div>
        </div>
      </div>

      {/* 4. ACCOUNT & SOURCE LINEAGE (Full Width, Balanced 2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Reference & Lineage */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-3">
            <FileText size={16} className="text-[#0D93AA]" />
            <h2 className="text-sm font-bold text-[#102025]">
              Source Reference & Lineage
            </h2>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-slate-500 font-medium">Source Reference</dt>
              <dd className="font-mono font-bold text-slate-800 mt-0.5">
                {entry.sourceReference}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Entry Classification</dt>
              <dd className="font-semibold text-slate-800 mt-0.5">
                {entry.entryType}
              </dd>
            </div>

            {entry.originalLedgerReference && (
              <div>
                <dt className="text-slate-500 font-medium">Reversal Target Entry</dt>
                <dd className="font-mono font-bold text-rose-700 mt-0.5">
                  {entry.originalLedgerReference}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-slate-500 font-medium">Processing Channel</dt>
              <dd className="font-medium text-slate-700 mt-0.5">
                {entry.channel || 'Core Journal Pipeline'}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-slate-500 font-medium">Actor / Service Engine</dt>
              <dd className="font-medium text-slate-700 mt-0.5">
                {entry.actor || 'TellerBud Core'} ({entry.actorId || 'SYS-01'})
              </dd>
            </div>
          </dl>
        </div>

        {/* Account Holder Information */}
        <div className="bg-white border border-gray-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-[#0D93AA]" />
              <h2 className="text-sm font-bold text-[#102025]">
                Account Holder
              </h2>
            </div>
            {entry.walletType === 'Customer Wallet' ? (
              <Link
                to={`/super-admin/wallets/customers/${entry.walletId}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D93AA] hover:underline"
              >
                <span>View Customer Wallet</span>
                <ExternalLink size={12} />
              </Link>
            ) : (
              <Link
                to={`/business-global-wallets/${entry.walletId}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D93AA] hover:underline"
              >
                <span>View Business Wallet</span>
                <ExternalLink size={12} />
              </Link>
            )}
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-slate-500 font-medium">Holder Name</dt>
              <dd className="text-xs font-bold text-slate-900 mt-0.5">
                {entry.holderName}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500 font-medium">Wallet ID</dt>
              <dd className="font-mono font-bold text-[#0D93AA] mt-0.5">
                {entry.walletId}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-slate-500 font-medium">Wallet Classification</dt>
              <dd className="mt-1">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                    entry.walletType === 'Customer Wallet'
                      ? 'bg-sky-50 text-sky-700 border border-sky-100'
                      : 'bg-purple-50 text-purple-700 border border-purple-100'
                  }`}
                >
                  {entry.walletType}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};
