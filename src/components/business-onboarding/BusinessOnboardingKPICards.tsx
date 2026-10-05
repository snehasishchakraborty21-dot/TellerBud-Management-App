import React from 'react';
import {
  Inbox,
  Clock,
  UserCheck,
  Tablet,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
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
    icon: React.ComponentType<{ className?: string; size?: number }>;
    bgGradient: string;
    accentColor: string;
    borderColor: string;
    iconBg: string;
  }> = [
    {
      id: 'ALL',
      title: 'Total Applications',
      count: summary.totalApplications,
      icon: Inbox,
      bgGradient: 'from-slate-50/80 to-white',
      accentColor: 'text-slate-800',
      borderColor: 'border-slate-200',
      iconBg: 'bg-slate-100/90 text-slate-700 border-slate-200',
    },
    {
      id: 'Pending Review',
      title: 'Pending Review',
      count: summary.pendingReview,
      icon: Clock,
      bgGradient: 'from-amber-50/60 to-white',
      accentColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      id: 'Approved – Onboarding Pending',
      title: 'Approved – Pending Onboarding',
      count: summary.approvedOnboardingPending,
      icon: UserCheck,
      bgGradient: 'from-sky-50/60 to-white',
      accentColor: 'text-sky-600',
      borderColor: 'border-sky-200',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      id: 'Onboarding in Progress',
      title: 'Onboarding in Progress',
      count: summary.onboardingInProgress,
      icon: Tablet,
      bgGradient: 'from-indigo-50/60 to-white',
      accentColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      id: 'Submitted for Activation',
      title: 'Ready for Activation',
      count: summary.readyForActivation,
      icon: Sparkles,
      bgGradient: 'from-teal-50/60 to-white',
      accentColor: 'text-teal-600',
      borderColor: 'border-teal-300',
      iconBg: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      id: 'Active',
      title: 'Activated',
      count: summary.activated,
      icon: CheckCircle2,
      bgGradient: 'from-emerald-50/60 to-white',
      accentColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-2.5 w-full">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedStatus === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus(card.id)}
            className={`text-left h-[70px] sm:h-[74px] p-2.5 sm:px-3 sm:py-2.5 rounded-xl border transition-all duration-150 cursor-pointer bg-gradient-to-b ${card.bgGradient} flex items-center justify-between gap-2 shadow-2xs ${
              isSelected
                ? 'ring-2 ring-[#0D93AA] border-[#0D93AA] shadow-sm bg-white'
                : `hover:border-slate-300 hover:shadow-xs ${card.borderColor}`
            }`}
          >
            {/* Left: Small Icon Container (approx 26-28px) */}
            <div
              className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg flex items-center justify-center border shrink-0 ${card.iconBg}`}
            >
              <Icon size={14} className="shrink-0" />
            </div>

            {/* Middle: Complete KPI label (Wrapped onto max 2 lines, no truncation, no ellipsis) */}
            <span className="text-[10px] sm:text-[10.5px] font-bold text-slate-600 uppercase tracking-wide leading-tight line-clamp-2 break-words flex-1 min-w-0 pr-1 select-none">
              {card.title}
            </span>

            {/* Right: Numeric count (Single line, right aligned, vertically centered, no 'apps') */}
            <span
              className={`text-[16px] sm:text-[18px] font-bold font-mono tracking-tight ${card.accentColor} shrink-0 text-right leading-none`}
            >
              {card.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
