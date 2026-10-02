import * as XLSX from 'xlsx';
import { BusinessGlobalWallet } from '../types/businessWallet';
import { formatZmwListingAmount } from './formatters';

export function exportBusinessWalletsToExcel(
  wallets: BusinessGlobalWallet[],
  filename = 'Business_Global_Wallets.xlsx'
) {
  const rows = wallets.map((w) => ({
    'Business': w.businessName,
    'Business ID': w.businessId,
    'Business Owner': w.ownerName,
    'Balance (ZMW)': formatZmwListingAmount(w.postedBalance),
    'Available (ZMW)': formatZmwListingAmount(w.availableBalance),
    'Reserved (ZMW)': formatZmwListingAmount(w.reservedFunds),
    'Status': w.state,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Business Wallets');
  XLSX.writeFile(workbook, filename);
}

export function exportBusinessWalletsToCSV(
  wallets: BusinessGlobalWallet[],
  filename = 'Business_Global_Wallets.csv'
) {
  const headers = [
    'Business',
    'Business ID',
    'Business Owner',
    'Balance (ZMW)',
    'Available (ZMW)',
    'Reserved (ZMW)',
    'Status',
  ];

  const escapeCsv = (val: string | number) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = wallets.map((w) => [
    escapeCsv(w.businessName),
    escapeCsv(w.businessId),
    escapeCsv(w.ownerName),
    escapeCsv(formatZmwListingAmount(w.postedBalance)),
    escapeCsv(formatZmwListingAmount(w.availableBalance)),
    escapeCsv(formatZmwListingAmount(w.reservedFunds)),
    escapeCsv(w.state),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
