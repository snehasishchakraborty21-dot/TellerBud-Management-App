import * as XLSX from 'xlsx';
import { CashFloatRequest } from '../types/admin';
import { formatZMW, formatWithdrawalDate } from './formatters';

/**
 * Exports Cash/Float requests for a Business Owner to an Excel (.xlsx) file.
 * Filename format: Cash_Float_Requests_[Status]_[FromDate]_to_[ToDate].xlsx
 */
export function exportCashFloatRequestsToExcel(
  requests: CashFloatRequest[],
  statusTab: string,
  dateFrom?: string,
  dateTo?: string,
  businessName?: string
) {
  const fromPart = dateFrom || 'all';
  const toPart = dateTo || 'all';
  const statusPart = (statusTab || 'All').replace(/\s+/g, '_');
  const filename = `Cash_Float_Requests_${statusPart}_${fromPart}_to_${toPart}.xlsx`;

  // Filter to guarantee strict business scoping
  const scoped = requests.filter((req) => {
    if (!businessName || businessName === 'ALL') return true;
    return req.businessName.toLowerCase().trim() === businessName.toLowerCase().trim();
  });

  const rows = scoped.map((req) => {
    return {
      'Reference': req.reference,
      'Agent': req.agentName,
      'Agent ID': req.agentId,
      'Agent Phone': req.agentPhone,
      'Business': req.businessName,
      'Requested From': req.requestedFrom,
      'Request Type': req.requestType,
      'Amount': formatZMW(req.amount),
      'Requested Date & Time': formatWithdrawalDate(req.requestedAt),
      'Status': req.status,
      'Notes': req.notes || '—',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 18 }, // Reference
    { wch: 22 }, // Agent
    { wch: 16 }, // Agent ID
    { wch: 20 }, // Agent Phone
    { wch: 30 }, // Business
    { wch: 18 }, // Requested From
    { wch: 14 }, // Request Type
    { wch: 16 }, // Amount
    { wch: 26 }, // Requested Date & Time
    { wch: 18 }, // Status
    { wch: 36 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cash Float Requests');
  XLSX.writeFile(workbook, filename);
}
