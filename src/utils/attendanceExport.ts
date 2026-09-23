import { AttendanceRecord, EndOfDayRecord } from '../types/attendance';

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Attendance records for the logged-in Business Owner to a CSV file.
 * Filename format: attendance-report-DD-MM-YYYY-to-DD-MM-YYYY.csv
 */
export function exportAttendanceToCsv(
  records: AttendanceRecord[],
  dateFrom?: string,
  dateTo?: string
) {
  const filename =
    dateFrom && dateTo
      ? `attendance-report-${dateFrom}-to-${dateTo}.csv`
      : `attendance-report-${dateFrom || dateTo || 'all'}.csv`;

  const headers = [
    'Attendance Reference',
    'Agent Name',
    'Agent ID',
    'Agent Number',
    'Store',
    'Booth',
    'Check-in Date & Time',
    'Check-out Date & Time',
    'Attendance Status',
    'Activity',
    'Total Working Duration',
  ];

  const rows = records.map((rec) => [
    rec.id,
    rec.agentName,
    rec.agentId,
    rec.agentPhone,
    rec.businessName,
    rec.businessCentre || 'Main Booth',
    rec.checkInTime ? `${rec.date} ${rec.checkInTime}` : '—',
    rec.checkOutTime ? `${rec.date} ${rec.checkOutTime}` : '—',
    rec.status,
    rec.assignment || 'None',
    rec.totalHours || rec.checkedInDuration || '—',
  ]);

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  downloadCsv(csvContent, filename);
}

/**
 * Exports End-of-Day records for the logged-in Business Owner to a CSV file.
 * Filename format: end-of-day-report-DD-MM-YYYY-to-DD-MM-YYYY.csv
 */
export function exportEndOfDayToCsv(
  records: EndOfDayRecord[],
  dateFrom?: string,
  dateTo?: string
) {
  const filename =
    dateFrom && dateTo
      ? `end-of-day-report-${dateFrom}-to-${dateTo}.csv`
      : `end-of-day-report-${dateFrom || dateTo || 'all'}.csv`;

  const headers = [
    'End-of-Day Reference',
    'Agent Name',
    'Agent ID',
    'Agent Number',
    'Store',
    'Booth',
    'Submission Date & Time',
    'Expected Cash (ZMW)',
    'Declared Cash (ZMW)',
    'Cash Variance (ZMW)',
    'Status',
    'Availability',
    'Review / Reconciliation Info',
  ];

  const rows = records.map((rec) => [
    rec.reference,
    rec.agentName,
    rec.agentId,
    rec.agentPhone,
    rec.businessName,
    rec.businessCentre || 'Main Booth',
    rec.submittedTimestamp ? `${rec.businessDate} ${rec.submittedTimestamp}` : '—',
    rec.expectedCash.toFixed(2),
    rec.declaredCash !== undefined ? rec.declaredCash.toFixed(2) : '—',
    rec.cashVariance.toFixed(2),
    rec.status,
    rec.availability,
    rec.status === 'Reconciled'
      ? 'Reconciled'
      : rec.status === 'Exception'
      ? 'Variance Exception'
      : rec.status === 'Pending Review'
      ? 'Pending Review'
      : 'Pending Submission',
  ]);

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  downloadCsv(csvContent, filename);
}
