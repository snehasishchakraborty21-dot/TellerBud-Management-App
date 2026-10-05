import React from 'react';
import {
  Eye,
  FileCheck,
  Tablet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  ShieldAlert,
} from 'lucide-react';
import {
  BusinessOnboardingApplication,
  OnboardingApplicationStatus,
} from '../../types/businessOnboarding';

interface BusinessOnboardingTableProps {
  applications: BusinessOnboardingApplication[];
  loading?: boolean;
  onViewDetails: (app: BusinessOnboardingApplication) => void;
  onReviewApplication: (app: BusinessOnboardingApplication) => void;
  onStartTabletOnboarding: (app: BusinessOnboardingApplication) => void;
  onActivateApplication: (app: BusinessOnboardingApplication) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const BusinessOnboardingTable: React.FC<BusinessOnboardingTableProps> = ({
  applications,
  loading = false,
  onViewDetails,
  onReviewApplication,
  onStartTabletOnboarding,
  onActivateApplication,
  onResetFilters,
  hasActiveFilters,
}) => {
  const getStatusBadge = (status: OnboardingApplicationStatus) => {
    switch (status) {
      case 'Pending Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={11} className="text-amber-500" />
            <span>Pending Review</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Under Review</span>
          </span>
        );
      case 'More Information Required':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle size={11} className="text-orange-500" />
            <span>More Info Required</span>
          </span>
        );
      case 'Approved – Onboarding Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Building2 size={11} className="text-sky-500" />
            <span>Approved – Pending Onboarding</span>
          </span>
        );
      case 'Onboarding in Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Tablet size={11} className="text-indigo-500" />
            <span>Onboarding in Progress</span>
          </span>
        );
      case 'Submitted for Activation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
            <span>Submitted for Activation</span>
          </span>
        );
      case 'Returned for Correction':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <RotateCcw size={11} className="text-rose-500" />
            <span>Returned for Correction</span>
          </span>
        );
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={11} className="text-emerald-600" />
            <span>Active</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <ShieldAlert size={11} className="text-slate-400" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return {
        date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { date: iso, time: '' };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-[280px] bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-[#0D93AA] border-t-transparent rounded-full mb-2" />
        <p className="text-xs text-slate-500">Loading onboarding applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex-1 min-h-[280px] bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Building2 size={22} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">No Applications Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          {hasActiveFilters
            ? 'No business onboarding application matches your selected filter criteria.'
            : 'No business registration requests have been submitted yet.'}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3.5 py-1.5 rounded-lg bg-[#0D93AA] text-white text-xs font-medium hover:bg-[#0b8296] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden w-full">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 shadow-[0_1px_0_0_#E2E8F0]">
            <tr className="text-slate-600 font-semibold text-[11px] sm:text-[11.5px] uppercase tracking-wider select-none">
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Business
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Business Owner
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Contact
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Operating Locations
              </th>
              <th scope="col" className="py-3 px-3 whitespace-nowrap text-center">
                Agents
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Submitted
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap text-center">
                Status
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {applications.map((app) => {
              const dt = formatDateTime(app.websiteData.submittedAt);
              const locationsCount =
                Object.keys(app.websiteData.cityLocations || {}).length ||
                app.websiteData.operatingCities.length;
              const hasAssignedId = Boolean(app.businessId);

              return (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(app)}
                >
                  {/* 1. Business Column */}
                  <td className="py-3 px-3.5 align-middle">
                    <div className="font-semibold text-slate-900 leading-tight">
                      {app.websiteData.businessName}
                    </div>
                    {hasAssignedId ? (
                      <div className="text-[11px] font-mono font-medium text-slate-500 mt-0.5">
                        {app.businessId}
                      </div>
                    ) : (
                      <div className="text-[10.5px] text-slate-400 italic mt-0.5">
                        Pending ID assignment
                      </div>
                    )}
                  </td>

                  {/* 2. Business Owner Column */}
                  <td className="py-3 px-3.5 align-middle">
                    <div className="font-medium text-slate-900">
                      {app.websiteData.ownerFullName}
                    </div>
                  </td>

                  {/* 3. Contact Column */}
                  <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-800 font-mono font-medium text-[11.5px]">
                      <Phone size={12} className="text-slate-400 shrink-0" />
                      <span>{app.websiteData.phone}</span>
                    </div>
                    {app.websiteData.email && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Mail size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[190px]">{app.websiteData.email}</span>
                      </div>
                    )}
                  </td>

                  {/* 4. Operating Locations Column */}
                  <td className="py-3 px-3.5 align-middle">
                    <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <MapPin size={12} className="text-[#0D93AA] shrink-0" />
                      <span
                        className="truncate max-w-[200px]"
                        title={app.websiteData.operatingCities.join(', ')}
                      >
                        {app.websiteData.operatingCities.join(', ')}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5 pl-4.5">
                      {locationsCount} {locationsCount === 1 ? 'branch location' : 'branch locations'}
                    </div>
                  </td>

                  {/* 5. Agents Column */}
                  <td className="py-3 px-3 align-middle text-center">
                    <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-xs">
                      <Users size={11} className="text-slate-500" />
                      {app.websiteData.numberOfAgents}
                    </span>
                  </td>

                  {/* 6. Submitted Column */}
                  <td className="py-3 px-3.5 align-middle whitespace-nowrap">
                    <div className="font-medium text-slate-800">{dt.date}</div>
                    <div className="text-[11px] text-slate-400">{dt.time}</div>
                  </td>

                  {/* 7. Status Column */}
                  <td className="py-3 px-3.5 align-middle text-center whitespace-nowrap">
                    {getStatusBadge(app.status)}
                  </td>

                  {/* 8. Action Column (State-based compact action icons) */}
                  <td
                    className="py-3 px-3.5 align-middle text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      {/* State Action: Review for Pending/Under Review/More Info */}
                      {(app.status === 'Pending Review' ||
                        app.status === 'Under Review' ||
                        app.status === 'More Information Required') && (
                        <button
                          type="button"
                          onClick={() => onReviewApplication(app)}
                          className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-colors cursor-pointer"
                          title="Review Application & Approve/Reject"
                          aria-label={`Review Application for ${app.websiteData.businessName}`}
                        >
                          <FileCheck size={14} />
                        </button>
                      )}

                      {/* State Action: Tablet Onboarding for Approved / In Progress / Returned */}
                      {(app.status === 'Approved – Onboarding Pending' ||
                        app.status === 'Onboarding in Progress' ||
                        app.status === 'Returned for Correction') && (
                        <button
                          type="button"
                          onClick={() => onStartTabletOnboarding(app)}
                          className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer"
                          title="Open Digital Tablet Physical Onboarding Form"
                          aria-label={`Open Tablet Onboarding Form for ${app.websiteData.businessName}`}
                        >
                          <Tablet size={14} />
                        </button>
                      )}

                      {/* State Action: Final Activation Review for Submitted for Activation */}
                      {app.status === 'Submitted for Activation' && (
                        <button
                          type="button"
                          onClick={() => onActivateApplication(app)}
                          className="p-1.5 rounded-lg border border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:border-teal-400 transition-colors cursor-pointer animate-pulse"
                          title="Review Submitted Documents & Activate Business"
                          aria-label={`Activate Business ${app.websiteData.businessName}`}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}

                      {/* General Eye Icon for viewing details */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(app)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                        title="View Full Application Details & Audit Trail"
                        aria-label={`View Application Details for ${app.websiteData.businessName}`}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
