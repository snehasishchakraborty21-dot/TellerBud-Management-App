import React from 'react';
import {
  BusinessOnboardingSummary,
  OnboardingApplicationStatus,
} from '../../types/businessOnboarding';

interface BusinessOnboardingKPICardsProps {
  summary: BusinessOnboardingSummary;
  selectedStatus: 'ALL' | OnboardingApplicationStatus;
  onSelectStatus: (status: 'ALL' | OnboardingApplicationStatus) => void;
}

export const BusinessOnboardingKPICards: React.FC<BusinessOnboardingKPICardsProps> = ({
  summary,
  selectedStatus,
  onSelectStatus,
}) => {
  const cards: Array<{
    id: 'ALL' | OnboardingApplicationStatus;
    title: string;
    count: number;
    bgGradient: string;
    accentColor: string;
    borderColor: string;
  }> = [
    {
      id: 'ALL',
      title: 'Total Applications',
      count: summary.totalApplications,
      bgGradient: 'from-slate-50/80 to-white',
      accentColor: 'text-slate-800',
      borderColor: 'border-slate-200',
    },
    {
      id: 'Pending Review',
      title: 'Pending Review',
      count: summary.pendingReview,
      bgGradient: 'from-amber-50/60 to-white',
      accentColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      id: 'Approved – Onboarding Pending',
      title: 'Approved Pending',
      count: summary.approvedOnboardingPending,
      bgGradient: 'from-sky-50/60 to-white',
      accentColor: 'text-sky-600',
      borderColor: 'border-sky-200',
    },
    {
      id: 'Onboarding in Progress',
      title: 'Onboarding In Progress',
      count: summary.onboardingInProgress,
      bgGradient: 'from-indigo-50/60 to-white',
      accentColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
    },
    {
      id: 'Submitted for Activation',
      title: 'Ready for Activation',
      count: summary.readyForActivation,
      bgGradient: 'from-teal-50/60 to-white',
      accentColor: 'text-teal-600',
      borderColor: 'border-teal-300',
    },
    {
      id: 'Active',
      title: 'Activated',
      count: summary.activated,
      bgGradient: 'from-emerald-50/60 to-white',
      accentColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 w-full">
      {cards.map((card) => {
        const isSelected = selectedStatus === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus(card.id)}
            className={`text-left h-[68px] sm:h-[72px] px-3.5 sm:px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer bg-gradient-to-b ${card.bgGradient} flex items-center justify-between gap-2 shadow-2xs select-none ${
              isSelected
                ? 'ring-2 ring-[#0D93AA] border-[#0D93AA] shadow-sm bg-white'
                : `hover:border-slate-300 hover:shadow-xs ${card.borderColor}`
            }`}
          >
            {/* Left: Complete KPI title in Title Case on a single line */}
            <span className="text-[12px] sm:text-[12.5px] font-medium text-slate-700 whitespace-nowrap min-w-0 pr-1 select-none">
              {card.title}
            </span>

            {/* Right: Numeric value (Single line, right aligned, vertically centered, bold font-mono) */}
            <span
              className={`text-[17px] sm:text-[18px] font-bold font-mono tracking-tight ${card.accentColor} shrink-0 text-right leading-none`}
            >
              {card.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
