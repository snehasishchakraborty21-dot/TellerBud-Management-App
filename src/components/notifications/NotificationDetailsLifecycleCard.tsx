import React from 'react';
import { Check } from 'lucide-react';
import { TellerBudNotification } from '../../types/notificationsPage';

interface NotificationDetailsLifecycleCardProps {
  notification: TellerBudNotification;
}

type StepStatus = 'completed' | 'pending';

interface LifecycleStep {
  id: string;
  label: string;
  status: StepStatus;
  actor?: string;
  dateTime?: string;
  description?: string;
}

export const NotificationDetailsLifecycleCard: React.FC<
  NotificationDetailsLifecycleCardProps
> = ({ notification }) => {
  const isUnread = notification.status === 'Unread';
  const isResolved = notification.status === 'Resolved';

  const defaultSource = notification.source || 'Customer Withdrawal System';

  // Compute the 4 lifecycle steps
  const steps: LifecycleStep[] = [
    {
      id: 'created',
      label: 'Notification Created',
      status: 'completed',
      actor: defaultSource,
      dateTime: notification.dateTime,
      description: 'System event triggered and generated alert',
    },
    {
      id: 'delivered',
      label: 'Delivered to Super Admin',
      status: 'completed',
      actor: notification.deliveredTo || 'TellerBud Notification Dispatcher',
      dateTime: notification.deliveredAt || notification.dateTime,
      description: 'Dispatched to administrative inbox and bell center',
    },
    {
      id: 'read',
      label: 'Read',
      status: isUnread ? 'pending' : 'completed',
      actor: isUnread ? undefined : notification.readBy || 'Sililo Lubinda (Super Admin)',
      dateTime: isUnread ? undefined : notification.readAt || notification.dateTime,
      description: isUnread
        ? 'Awaiting Super Admin action'
        : 'Acknowledged by Super Admin',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      status: isResolved ? 'completed' : 'pending',
      actor: isResolved ? notification.resolvedBy || 'Sililo Lubinda (Super Admin)' : undefined,
      dateTime: isResolved ? notification.resolvedAt : undefined,
      description: isResolved
        ? 'Action completed and record finalized'
        : 'Pending resolution',
    },
  ];

  return (
    <div
      id="notification-lifecycle-card"
      className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 md:p-6 w-full"
    >
      <div className="border-b border-gray-100 pb-3 mb-6 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Notification Lifecycle</h2>
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Completed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            Pending
          </span>
        </div>
      </div>

      {/* 4-Step Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';

          return (
            <div
              key={step.id}
              id={`lifecycle-step-${step.id}`}
              className={`relative p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50/25'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              {/* Step indicator header */}
              <div className="flex items-center gap-3 mb-2.5">
                {isCompleted ? (
                  <div
                    className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs"
                    title="Completed step"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : (
                  <div
                    className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 border border-gray-300 flex items-center justify-center shrink-0 font-bold text-xs"
                    title="Pending step"
                  >
                    <span>{index + 1}</span>
                  </div>
                )}

                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Step {index + 1}
                  </span>
                  <h3
                    className={`text-sm font-bold tracking-tight truncate ${
                      isCompleted ? 'text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {step.label}
                  </h3>
                </div>
              </div>

              {/* Responsible User or System and Date/Time OR Pending Details */}
              <div className="mt-3 pt-2.5 border-t border-gray-200/60 text-xs">
                {isCompleted ? (
                  <div className="space-y-1.5">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-gray-500">
                        Responsible:
                      </span>
                      <span className="font-semibold text-gray-900 truncate">
                        {step.actor || 'Sililo Lubinda (Super Admin)'}
                      </span>
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="text-[11px] font-medium text-gray-500">
                        Date and Time:
                      </span>
                      <span className="font-medium text-gray-700">
                        {step.dateTime || '—'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-1 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      Pending
                    </div>
                    {step.description && (
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                        {step.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
