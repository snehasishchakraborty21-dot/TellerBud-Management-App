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
  }> = [
    {
      id: 'ALL',
      title: 'Total Applications',
      count: summary.totalApplications,
      icon: Inbox,
      bgGradient: 'from-slate-50 to-white',
      accentColor: 'text-slate-700',
      borderColor: 'border-slate-200',
    },
    {
      id: 'Pending Review',
      title: 'Pending Review',
      count: summary.pendingReview,
      icon: Clock,
      bgGradient: 'from-amber-50/60 to-white',
      accentColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      id: 'Approved – Onboarding Pending',
      title: 'Approved – Pending Onboarding',
      count: summary.approvedOnboardingPending,
      icon: UserCheck,
      bgGradient: 'from-sky-50/60 to-white',
      accentColor: 'text-sky-600',
      borderColor: 'border-sky-200',
    },
    {
      id: 'Onboarding in Progress',
      title: 'Onboarding in Progress',
      count: summary.onboardingInProgress,
      icon: Tablet,
      bgGradient: 'from-indigo-50/60 to-white',
      accentColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
    },
    {
      id: 'Submitted for Activation',
      title: 'Ready for Activation',
      count: summary.readyForActivation,
      icon: Sparkles,
      bgGradient: 'from-teal-50/60 to-white',
      accentColor: 'text-teal-600',
      borderColor: 'border-teal-300',
    },
    {
      id: 'Active',
      title: 'Activated',
      count: summary.activated,
      icon: CheckCircle2,
      bgGradient: 'from-emerald-50/60 to-white',
      accentColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedStatus === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus(card.id)}
            className={`text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer bg-gradient-to-b ${card.bgGradient} ${
              isSelected
                ? 'ring-2 ring-[#0D93AA] border-[#0D93AA] shadow-sm bg-white'
                : `hover:border-slate-300 hover:shadow-xs ${card.borderColor}`
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {card.title}
              </span>
              <div className={`p-1 rounded-md bg-white border border-slate-100 shadow-xs shrink-0 ${card.accentColor}`}>
                <Icon size={13} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-bold tracking-tight ${card.accentColor}`}>
                {card.count}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">apps</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
