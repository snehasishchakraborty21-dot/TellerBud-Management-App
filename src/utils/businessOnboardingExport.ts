import * as XLSX from 'xlsx';
import { BusinessOnboardingApplication } from '../types/businessOnboarding';

export function exportOnboardingToExcel(
  applications: BusinessOnboardingApplication[],
  filename = 'TellerBud_Business_Onboarding_Applications'
): void {
  const data = applications.map((app) => ({
    'Business': app.websiteData.businessName,
    'Business ID': app.businessId || 'Pending Approval',
    'Business Owner': app.websiteData.ownerFullName,
    'Business Owner ID': app.businessOwnerId || 'Pending Approval',
    'Contact Phone': app.websiteData.phone,
    'Contact Email': app.websiteData.email || 'Not Provided',
    'Operating Cities': app.websiteData.operatingCities.join(', '),
    'Total Locations': Object.keys(app.websiteData.cityLocations || {}).length || app.websiteData.operatingCities.length,
    'Agents': app.websiteData.numberOfAgents,
    'Selected Providers': app.websiteData.selectedProviders.join(', '),
    'Submitted At': new Date(app.websiteData.submittedAt).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    'Status': app.status,
    'Assigned Executive': app.executiveAssignment?.executiveName || 'Unassigned',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Business Onboarding');

  // Auto column widths
  const colWidths = [
    { wch: 32 }, // Business
    { wch: 18 }, // Business ID
    { wch: 24 }, // Owner
    { wch: 18 }, // Owner ID
    { wch: 18 }, // Phone
    { wch: 28 }, // Email
    { wch: 26 }, // Cities
    { wch: 15 }, // Locations
    { wch: 10 }, // Agents
    { wch: 30 }, // Providers
    { wch: 20 }, // Submitted
    { wch: 28 }, // Status
    { wch: 26 }, // Executive
  ];
  worksheet['!cols'] = colWidths;

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${dateStr}.xlsx`);
}

export function exportOnboardingToCSV(
  applications: BusinessOnboardingApplication[],
  filename = 'TellerBud_Business_Onboarding_Applications'
): void {
  const headers = [
    'Business',
    'Business ID',
    'Business Owner',
    'Business Owner ID',
    'Contact Phone',
    'Contact Email',
    'Operating Cities',
    'Total Locations',
    'Agents',
    'Selected Providers',
    'Submitted At',
    'Status',
    'Assigned Executive',
  ];

  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = applications.map((app) => [
    escapeCsv(app.websiteData.businessName),
    escapeCsv(app.businessId || 'Pending Approval'),
    escapeCsv(app.websiteData.ownerFullName),
    escapeCsv(app.businessOwnerId || 'Pending Approval'),
    escapeCsv(app.websiteData.phone),
    escapeCsv(app.websiteData.email || 'Not Provided'),
    escapeCsv(app.websiteData.operatingCities.join(', ')),
    escapeCsv(Object.keys(app.websiteData.cityLocations || {}).length || app.websiteData.operatingCities.length),
    escapeCsv(app.websiteData.numberOfAgents),
    escapeCsv(app.websiteData.selectedProviders.join(', ')),
    escapeCsv(
      new Date(app.websiteData.submittedAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    ),
    escapeCsv(app.status),
    escapeCsv(app.executiveAssignment?.executiveName || 'Unassigned'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
