import * as XLSX from 'xlsx';
import { AgentToAgentRequest } from '../types/admin';
import { formatZMW, formatWithdrawalDate } from './formatters';
import { formatZambianPhone } from './customerUtils';

/**
 * Exports Agent-to-Agent Liquidity requests for a Business Owner to an Excel (.xlsx) file.
 * Filename format: Agent_To_Agent_Liquidity_[Status]_[FromDate]_to_[ToDate].xlsx
 */
export function exportAgentLiquidityRequestsToExcel(
  requests: AgentToAgentRequest[],
  statusTab: string,
  dateFrom?: string,
  dateTo?: string,
  businessName?: string
) {
  const fromPart = dateFrom || 'all';
  const toPart = dateTo || 'all';
  const statusPart = (statusTab || 'All').replace(/\s+/g, '_');
  const filename = `Agent_To_Agent_Liquidity_${statusPart}_${fromPart}_to_${toPart}.xlsx`;

  // Filter to ensure strict business scoping
  const scoped = requests.filter((req) => {
    if (!businessName || businessName === 'ALL') return true;
    const bLower = businessName.toLowerCase().trim();
    return (
      req.requestingAgentBusiness.toLowerCase().trim() === bLower ||
      req.currentOfferedAgent?.business.toLowerCase().trim() === bLower ||
      req.matchedAgent?.business.toLowerCase().trim() === bLower
    );
  });

  const rows = scoped.map((req) => {
    const offeredOrMatched = req.matchedAgent
      ? `${req.matchedAgent.name} (${req.matchedAgent.id}) - ${req.matchedAgent.business}`
      : req.currentOfferedAgent
      ? `${req.currentOfferedAgent.name} (${req.currentOfferedAgent.id}) - ${req.currentOfferedAgent.business}`
      : req.status === 'Matching'
      ? 'Searching for Agent...'
      : req.status === 'No Agent Available'
      ? 'No Agent Available'
      : req.status === 'Expired'
      ? 'Offer Expired'
      : req.status === 'Cancelled'
      ? 'Cancelled'
      : '—';

    return {
      'Reference': req.reference,
      'Requesting Agent': req.requestingAgentName,
      'Agent ID': req.requestingAgentId,
      'Phone': formatZambianPhone(req.requestingAgentPhone),
      'Business Agency': req.requestingAgentBusiness,
      'Requested From': req.requestedFrom,
      'Type': req.requestType,
      'Amount (ZMW)': req.amount,
      'Offered / Matched Agent': offeredOrMatched,
      'Requested Date & Time': formatWithdrawalDate(req.requestedAt),
      'Status': req.status,
      'Notes': req.notes || '—',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 18 }, // Reference
    { wch: 22 }, // Requesting Agent
    { wch: 16 }, // Agent ID
    { wch: 20 }, // Phone
    { wch: 30 }, // Business Agency
    { wch: 18 }, // Requested From
    { wch: 12 }, // Type
    { wch: 16 }, // Amount
    { wch: 42 }, // Offered / Matched Agent
    { wch: 26 }, // Requested Date & Time
    { wch: 20 }, // Status
    { wch: 35 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Liquidity Requests');
  XLSX.writeFile(workbook, filename);
}
