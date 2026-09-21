import * as XLSX from 'xlsx';
import { MobileMoneyTransaction } from '../types/mobileMoney';
import { VENDOR_LOGO_MAP } from '../components/walk-in/VendorLogo';
import { formatZMW } from './financialUtils';
import { maskZambianPhone } from './customerUtils';

/**
 * Exports Mobile Money transactions for a Business Owner to an Excel (.xlsx) file.
 * Filename format: Mobile_Money_Transactions_YYYY-MM-DD_to_YYYY-MM-DD.xlsx
 * Approved fields:
 * - Ref/Date
 * - Service Channel
 * - Transaction Type
 * - Cust/TB ID
 * - Customer #
 * - Vendor (Full vendor name)
 * - Amount
 * - Commission (Coming Soon — Phase 2)
 * - Balance
 */
export function exportMobileMoneyTransactionsToExcel(
  transactions: MobileMoneyTransaction[],
  dateFrom: string, // YYYY-MM-DD
  dateTo: string, // YYYY-MM-DD
  businessName: string
) {
  const filename = `Mobile_Money_Transactions_${dateFrom}_to_${dateTo}.xlsx`;

  // Guarantee strict business scoping: do not export any other business data
  const scoped = transactions.filter((tx) => {
    if (!businessName || businessName === 'ALL') return true;
    const bLower = businessName.toLowerCase().trim();
    return (
      tx.businessName.toLowerCase().trim() === bLower ||
      tx.businessId.toLowerCase().trim() === bLower
    );
  });

  const rows = scoped.map((tx) => {
    const custTbId =
      !tx.isRegisteredCustomer || !tx.customerId
        ? 'Walk-In Customer'
        : `${tx.customerName} (${tx.customerId})`;

    const vendorFullName = VENDOR_LOGO_MAP[tx.vendor]?.name || tx.vendor;

    return {
      'Ref/Date': `${tx.reference} (${tx.formattedDate})`,
      'Service Channel': tx.serviceChannel,
      'Transaction Type': tx.transactionType,
      'Cust/TB ID': custTbId,
      'Customer #': maskZambianPhone(tx.customerPhone),
      'Vendor': vendorFullName,
      'Amount': formatZMW(tx.amount),
      'Commission': 'Coming Soon — Phase 2',
      'Balance': formatZMW(tx.balanceAfter),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set readable column widths for the Excel sheet
  worksheet['!cols'] = [
    { wch: 32 }, // Ref/Date
    { wch: 18 }, // Service Channel
    { wch: 18 }, // Transaction Type
    { wch: 30 }, // Cust/TB ID
    { wch: 20 }, // Customer #
    { wch: 24 }, // Vendor
    { wch: 18 }, // Amount
    { wch: 26 }, // Commission
    { wch: 18 }, // Balance
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, filename);
}
