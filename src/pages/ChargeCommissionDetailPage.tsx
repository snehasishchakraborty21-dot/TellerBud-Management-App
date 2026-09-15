import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  User,
  Percent,
  Coins,
  Copy,
  Check,
  Printer,
  Calendar,
  Clock,
  Wallet,
  Phone,
  Layers,
} from 'lucide-react';
import {
  MOCK_CHARGE_RECORDS,
  MOCK_COMMISSION_RECORDS,
} from '../data/mockChargesCommissionsData';
import {
  ChargeRecord,
  CommissionRecord,
  ChargeStatus,
  CommissionSettlementStatus,
} from '../types/chargesCommissions';

function formatZMW(amount: number): string {
  return `ZMW ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const ChargeCommissionDetailPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Find record in charge records or commission records
  const chargeRecord = useMemo(() => {
    if (!recordId) return MOCK_CHARGE_RECORDS[0];
    const found = MOCK_CHARGE_RECORDS.find(
      (r) =>
        r.id.toLowerCase() === recordId.toLowerCase() ||
        r.reference.toLowerCase() === recordId.toLowerCase()
    );
    if (found) return found;

    // If ID looks like a charge record but wasn't in array, fallback to default charge
    if (recordId.toUpperCase().includes('CHG')) {
      return MOCK_CHARGE_RECORDS[0];
    }
    return undefined;
  }, [recordId]);

  const commissionRecord = useMemo(() => {
    if (!recordId) return undefined;
    return MOCK_COMMISSION_RECORDS.find(
      (r) =>
        r.id.toLowerCase() === recordId.toLowerCase() ||
        r.reference.toLowerCase() === recordId.toLowerCase()
    );
  }, [recordId]);

  const isCommission = Boolean(commissionRecord && !chargeRecord);

  // Dynamic document title update
  useEffect(() => {
    if (isCommission && commissionRecord) {
      document.title = `Commission Details - ${commissionRecord.reference} | TellerBud Admin`;
    } else if (chargeRecord) {
      document.title = `Charge Details - ${chargeRecord.reference} | TellerBud Admin`;
    }
  }, [isCommission, commissionRecord, chargeRecord]);

  const handleBack = () => {
    navigate('/super-admin/transactions/commissions');
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderChargeStatus = (status: ChargeStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
      case 'Posted':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Posted
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Refunded
          </span>
        );
      case 'Reversed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Reversed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const renderCommissionStatus = (status: CommissionSettlementStatus) => {
    switch (status) {
      case 'Accrued':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Accrued
          </span>
        );
      case 'Pending Settlement':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pending Settlement
          </span>
        );
      case 'Settled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Settled
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
      case 'Reversed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Reversed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Not found fallback
  if (!chargeRecord && !commissionRecord) {
    return (
      <div id="detail-not-found" className="w-full max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Record Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          No charge or commission record exists with identifier &ldquo;{recordId}&rdquo;.
        </p>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D93AA] text-white text-sm font-medium rounded-lg shadow-sm hover:bg-[#0b8094] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Return to Charges &amp; Commissions</span>
        </button>
      </div>
    );
  }

  // =========================================================================
  // 1. RENDER CHARGE DETAIL PAGE
  // =========================================================================
  if (chargeRecord) {
    // Normalise fields to user requested values for TB-CHG-9089-01
    const isCurrent9089 = chargeRecord.reference === 'TB-CHG-9089-01' || chargeRecord.id === 'TB-CHG-9089-01';
    const chargeRef = isCurrent9089 ? 'TB-CHG-9089-01' : chargeRecord.reference;
    const originalTxn = isCurrent9089 ? 'TB-TXN-9089' : chargeRecord.transactionReference;
    const resCharge = isCurrent9089 ? 50.0 : chargeRecord.reservationCharge;
    const origTxnAmount = isCurrent9089 ? 8000.0 : chargeRecord.transactionAmount;
    const serviceName = isCurrent9089 ? 'Cash Pickup' : chargeRecord.service;
    const providerName = isCurrent9089 ? 'Airtel Money' : chargeRecord.provider;
    const customerName = isCurrent9089 ? 'Mwamba Mulenga' : chargeRecord.customerName;
    const customerId = isCurrent9089 ? 'TB-CUS-1052' : chargeRecord.customerId;
    const customerWalletId = isCurrent9089 ? 'TB-WAL-1052' : (chargeRecord.customerWalletId || `TB-WAL-${chargeRecord.customerId.replace('TB-CUS-', '')}`);
    const customerMobile = isCurrent9089 ? '+260 97 123 9012' : (chargeRecord.customerMobile || '+260 97 123 9012');
    const transactionType = isCurrent9089 ? 'Deposit' : chargeRecord.transactionType;
    const agentName = isCurrent9089 ? 'Mwansa Tembo' : (chargeRecord.agentName || 'Mwansa Tembo');
    const agentId = isCurrent9089 ? 'TB-AGT-1007-01' : (chargeRecord.agentId || 'TB-AGT-1007-01');
    const businessName = isCurrent9089 ? 'Lusaka Central Express Agency' : (chargeRecord.businessName || 'Lusaka Central Express Agency');
    
    // Accounting Identifiers
    const rateRuleVersion = isCurrent9089 ? 'TB-CHG-RULE-01-V1' : (chargeRecord.rateRuleVersion || 'TB-CHG-RULE-01-V1');
    const idempotencyKey = isCurrent9089 ? 'IDEMP-TB-CHG-9089-01' : (chargeRecord.idempotencyKey || `IDEMP-TB-CHG-${chargeRecord.id}`);
    const ledgerEntryRef = isCurrent9089 ? 'TB-LED-1052-06' : (chargeRecord.ledgerEntryReference || `TB-LED-${chargeRecord.customerId.replace('TB-CUS-', '')}-06`);
    const accountingStatus = 'Posted';

    // Operational Lifecycle
    const lifecycleTimeline = [
      { id: 'LT-1', status: 'Reservation Created', timestamp: '11 Sep 2026, 14:05', actor: customerName },
      { id: 'LT-2', status: 'Charge Accrued', timestamp: '11 Sep 2026, 14:08', actor: 'TellerBud Core Engine' },
      { id: 'LT-3', status: 'Charge Posted', timestamp: '11 Sep 2026, 14:10', actor: 'TellerBud Ledger' },
    ];

    return (
      <div id="charge-detail-page" className="w-full space-y-4 px-3 sm:px-6 pt-2 pb-24 sm:pb-28">
        {/* Dynamic Header & Back Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="space-y-1">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8094] transition-colors mb-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Charges &amp; Commissions</span>
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-teal-50 text-[#0D93AA] border border-[#0D93AA]/20">
                Charge Details
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
                {chargeRef}
              </h1>
              {renderChargeStatus(chargeRecord.status || 'Posted')}
            </div>
            <p className="text-xs text-slate-500">
              Customer Cash Pickup Reservation Charge • Recorded on 11 Sep 2026, 14:10 • Attributed to {businessName}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => copyToClipboard(chargeRef, 'chargeRef')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Copy Charge Reference"
            >
              {copiedKey === 'chargeRef' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copiedKey === 'chargeRef' ? 'Copied' : 'Copy Ref'}</span>
            </button>

            <button
              onClick={() => navigate(`/super-admin/transactions/all/${originalTxn}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="View Original Transaction"
            >
              <ExternalLink size={13} />
              <span>View Transaction ({originalTxn})</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Export / Print Record"
            >
              <Printer size={13} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Top Financial Breakdown Cards (No supporting text) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Reservation Charge */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reservation Charge
            </span>
            <div className="mt-2 text-2xl font-bold font-mono text-[#0D93AA]">
              {formatZMW(resCharge)}
            </div>
          </div>

          {/* Card 2: Original Transaction Amount */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Original Transaction Amount
            </span>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-800">
              {formatZMW(origTxnAmount)}
            </div>
          </div>

          {/* Card 3: Service & Provider (Renamed from Service & Channel) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Service &amp; Provider
            </span>
            <div className="mt-2 text-base font-semibold text-slate-900 truncate">
              {serviceName}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">{providerName}</span>
          </div>

          {/* Card 4: Accounting Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Accounting Status
            </span>
            <div className="mt-2 text-base font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{accountingStatus}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
              Ref: {ledgerEntryRef}
            </span>
          </div>
        </div>

        {/* Lower Layout: Two Detail Cards with Natural Content Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Left Card: Customer & Transaction Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User size={15} className="text-[#0D93AA]" />
                <span>Customer &amp; Transaction Details</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">{customerId}</span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="text-slate-400">Customer</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">{customerName}</dd>
              </div>

              <div>
                <dt className="text-slate-400">Customer ID</dt>
                <dd className="font-mono font-semibold text-slate-800 mt-0.5 whitespace-nowrap">
                  {customerId}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400">Customer Wallet ID</dt>
                <dd className="font-mono font-semibold text-[#0D93AA] mt-0.5 whitespace-nowrap flex items-center gap-1">
                  <Wallet size={12} className="text-[#0D93AA]" />
                  <span>{customerWalletId}</span>
                </dd>
              </div>

              <div>
                <dt className="text-slate-400">Full Mobile Number</dt>
                <dd className="font-mono font-semibold text-slate-800 mt-0.5 whitespace-nowrap flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" />
                  <span>{customerMobile}</span>
                </dd>
              </div>

              <div>
                <dt className="text-slate-400">Original Transaction</dt>
                <dd className="font-mono font-semibold text-slate-800 mt-0.5 whitespace-nowrap">
                  {originalTxn}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400">Transaction Type</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{transactionType}</dd>
              </div>

              <div>
                <dt className="text-slate-400">Service</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{serviceName}</dd>
              </div>

              <div>
                <dt className="text-slate-400">Provider</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{providerName}</dd>
              </div>

              <div>
                <dt className="text-slate-400">Attributed Agent</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">
                  {agentName}
                  <span className="block font-mono text-[11px] text-slate-400 mt-0.5">
                    ID: {agentId}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-slate-400">Business</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{businessName}</dd>
              </div>
            </dl>
          </div>

          {/* Right Card: Accounting & Audit (Renamed from Governance & Audit Trail) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={15} className="text-[#0D93AA]" />
                <span>Accounting &amp; Audit</span>
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Audited
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <div>
                <dt className="text-slate-400">Rate Rule Version</dt>
                <dd className="font-mono font-semibold text-slate-800 mt-0.5">{rateRuleVersion}</dd>
              </div>

              <div>
                <dt className="text-slate-400">Configured Rate Status</dt>
                <dd className="font-semibold text-emerald-700 mt-0.5">Immutable / Locked</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-slate-400">Idempotency Key</dt>
                <dd className="font-mono text-slate-700 mt-0.5 bg-slate-50 px-2 py-1 rounded border border-slate-200/70 flex items-center justify-between">
                  <span className="truncate">{idempotencyKey}</span>
                  <button
                    onClick={() => copyToClipboard(idempotencyKey, 'idemp')}
                    className="text-slate-400 hover:text-slate-700 ml-2 p-0.5 cursor-pointer"
                    title="Copy Idempotency Key"
                  >
                    {copiedKey === 'idemp' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </dd>
              </div>

              <div>
                <dt className="text-slate-400">Ledger Entry Reference</dt>
                <dd className="font-mono font-semibold text-[#0D93AA] mt-0.5 whitespace-nowrap">
                  {ledgerEntryRef}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400">Wallet ID</dt>
                <dd className="font-mono font-semibold text-slate-800 mt-0.5 whitespace-nowrap">
                  {customerWalletId}
                </dd>
              </div>

              <div>
                <dt className="text-slate-400">Accounting Status</dt>
                <dd className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>{accountingStatus}</span>
                </dd>
              </div>

              <div>
                <dt className="text-slate-400">Charge Isolation Policy</dt>
                <dd className="font-semibold text-slate-700 mt-0.5">Customer Balance Dedicated</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Full-Width Operational Lifecycle Card Below */}
        <div
          id="operational-lifecycle-card"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-[#0D93AA]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Operational Lifecycle
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">3 Milestones Completed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {lifecycleTimeline.map((step, idx) => (
              <div
                key={step.id}
                className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg relative"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  {idx + 1}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900">{step.status}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 font-mono">
                    <Calendar size={12} className="text-slate-400 shrink-0" />
                    <span>{step.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Actor: {step.actor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Export PDF Button with Bottom-Right Safety Clearance */}
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 print:hidden">
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-xs sm:text-sm text-white bg-[#0D93AA] hover:bg-[#0b8094] shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            title="Export / Print Charge Details"
          >
            <Printer size={15} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. RENDER COMMISSION DETAIL PAGE
  // =========================================================================
  const comm = commissionRecord!;
  const calculationBasis = comm.calculationBasis || 'ZMW 3,500.00 × 1.00%';
  const commissionRate = comm.commissionRate || '1.00%';
  const settlementLedgerRef = comm.settlementLedgerReference || comm.walletLedgerReference || 'BWL-4310-A';
  const idempotencyKey = comm.idempotencyKey || `IDEMP-COM-${comm.id}`;
  const ruleVersion = comm.rateRuleVersion || 'TB-COM-RULE-03-V2';
  const origTxnAmount = comm.transactionAmount || 3500.0;

  const commissionLifecycle = comm.lifecycleTimeline || [
    { id: 'LT-1', status: 'Commission Accrued', timestamp: comm.createdAt || '11 Sep 2026, 12:20 PM', actor: 'Rule Engine' },
    { id: 'LT-2', status: 'Settled to Agent Balance', timestamp: comm.settledAt || '11 Sep 2026, 12:25 PM', actor: 'Automated Settlement' },
  ];

  return (
    <div id="commission-detail-page" className="w-full space-y-4 px-3 sm:px-6 pt-2 pb-24 sm:pb-28">
      {/* Dynamic Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="space-y-1">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D93AA] hover:text-[#0b8094] transition-colors mb-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Charges &amp; Commissions</span>
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/50">
              Commission Details
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {comm.reference}
            </h1>
            {renderCommissionStatus(comm.settlementStatus)}
          </div>
          <p className="text-xs text-slate-500">
            {comm.recipientType} Commission • Accrued on {comm.createdAt} • Transaction {comm.transactionReference}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => copyToClipboard(comm.reference, 'commRef')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Copy Commission Reference"
          >
            {copiedKey === 'commRef' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copiedKey === 'commRef' ? 'Copied' : 'Copy Ref'}</span>
          </button>

          <button
            onClick={() => navigate(`/super-admin/transactions/all/${comm.transactionReference}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="View Original Transaction"
          >
            <ExternalLink size={13} />
            <span>View Transaction ({comm.transactionReference})</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0D93AA] hover:bg-[#0b8094] rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Export / Print Record"
          >
            <Printer size={13} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Top Financial Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Commission Amount */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Commission Amount
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatZMW(comm.commissionAmount)}
          </div>
        </div>

        {/* Card 2: Commission Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Commission Rate
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-800">
            {commissionRate}
          </div>
        </div>

        {/* Card 3: Commission Recipient & Type */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Commission Recipient
          </span>
          <div className="mt-2 text-base font-semibold text-slate-900 truncate">
            {comm.recipient}
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">{comm.recipientType}</span>
        </div>

        {/* Card 4: Settlement Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Settlement Status
          </span>
          <div className="mt-2 text-base font-semibold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{comm.settlementStatus}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
            Ledger: {settlementLedgerRef}
          </span>
        </div>
      </div>

      {/* Lower Layout: Two Detail Cards with Natural Content Height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Card: Recipient & Entity Attribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={15} className="text-[#0D93AA]" />
              <span>Recipient &amp; Entity Attribution</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">{comm.recipientId}</span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <dt className="text-slate-400">Commission Recipient</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">{comm.recipient}</dd>
            </div>

            <div>
              <dt className="text-slate-400">Recipient ID</dt>
              <dd className="font-mono font-semibold text-slate-800 mt-0.5 whitespace-nowrap">
                {comm.recipientId}
              </dd>
            </div>

            <div>
              <dt className="text-slate-400">Recipient Type</dt>
              <dd className="font-semibold text-slate-800 mt-0.5">{comm.recipientType}</dd>
            </div>

            <div>
              <dt className="text-slate-400">Associated Business</dt>
              <dd className="font-semibold text-slate-800 mt-0.5">
                {comm.associatedBusiness || 'Lusaka Central Express Agency'}
              </dd>
            </div>

            <div>
              <dt className="text-slate-400">Original Transaction</dt>
              <dd className="font-mono font-semibold text-slate-800 mt-0.5 whitespace-nowrap">
                {comm.transactionReference}
              </dd>
            </div>

            <div>
              <dt className="text-slate-400">Original Amount</dt>
              <dd className="font-mono font-semibold text-slate-800 mt-0.5">
                {formatZMW(origTxnAmount)}
              </dd>
            </div>

            <div>
              <dt className="text-slate-400">Service</dt>
              <dd className="font-semibold text-slate-800 mt-0.5">{comm.service}</dd>
            </div>

            <div>
              <dt className="text-slate-400">Provider</dt>
              <dd className="font-semibold text-slate-800 mt-0.5">{comm.provider || 'Airtel Money'}</dd>
            </div>
          </dl>
        </div>

        {/* Right Card: Accounting & Audit */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Percent size={15} className="text-[#0D93AA]" />
              <span>Accounting &amp; Audit</span>
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified
            </span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <dt className="text-slate-400">Calculation Basis</dt>
              <dd className="font-semibold text-slate-900 mt-0.5">{calculationBasis}</dd>
            </div>

            <div>
              <dt className="text-slate-400">Commission Rate</dt>
              <dd className="font-mono font-bold text-emerald-700 mt-0.5">{commissionRate}</dd>
            </div>

            <div>
              <dt className="text-slate-400">Commission Amount</dt>
              <dd className="font-mono font-bold text-slate-900 mt-0.5">
                {formatZMW(comm.commissionAmount)}
              </dd>
            </div>

            <div>
              <dt className="text-slate-400">Rule Version</dt>
              <dd className="font-mono font-semibold text-slate-800 mt-0.5">{ruleVersion}</dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-slate-400">Idempotency Reference</dt>
              <dd className="font-mono text-slate-700 mt-0.5 bg-slate-50 px-2 py-1 rounded border border-slate-200/70 flex items-center justify-between">
                <span className="truncate">{idempotencyKey}</span>
                <button
                  onClick={() => copyToClipboard(idempotencyKey, 'idempComm')}
                  className="text-slate-400 hover:text-slate-700 ml-2 p-0.5 cursor-pointer"
                  title="Copy Idempotency Key"
                >
                  {copiedKey === 'idempComm' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </dd>
            </div>

            <div>
              <dt className="text-slate-400">Settlement Ledger Reference</dt>
              <dd className="font-mono font-semibold text-[#0D93AA] mt-0.5 whitespace-nowrap">
                {settlementLedgerRef}
              </dd>
            </div>

            <div>
              <dt className="text-slate-400">Settlement Status</dt>
              <dd className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>{comm.settlementStatus}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Full-Width Settlement Lifecycle Card Below */}
      <div
        id="settlement-lifecycle-card"
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-[#0D93AA]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Settlement Lifecycle
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {commissionLifecycle.length} Events Logged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {commissionLifecycle.map((step, idx) => (
            <div
              key={step.id || idx}
              className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg relative"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                {idx + 1}
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900">{step.status}</div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5 font-mono">
                  <Calendar size={12} className="text-slate-400 shrink-0" />
                  <span>{step.timestamp}</span>
                </div>
                <div className="text-[11px] text-slate-400">Actor: {step.actor || 'System'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Export PDF Button with Bottom-Right Safety Clearance */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 print:hidden">
        <button
          onClick={handlePrint}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-xs sm:text-sm text-white bg-[#0D93AA] hover:bg-[#0b8094] shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          title="Export / Print Commission Details"
        >
          <Printer size={15} />
          <span>Export PDF</span>
        </button>
      </div>
    </div>
  );
};

export default ChargeCommissionDetailPage;
