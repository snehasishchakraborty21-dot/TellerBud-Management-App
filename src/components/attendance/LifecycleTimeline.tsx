import React from 'react';
import { LifecycleEvent } from '../../types/attendance';

interface LifecycleTimelineProps {
  events: LifecycleEvent[];
  title?: string;
}

export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({
  events,
  title = 'Lifecycle Timeline',
}) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-gray-900 tracking-tight">
        {title}
      </h4>
      <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#0D93AA]/20">
        {events.map((ev, index) => {
          const isLatest = index === events.length - 1;

          return (
            <div key={ev.id || index} className="relative flex items-center justify-between gap-3 text-xs">
              {/* Oceanic Blue Dot */}
              <div
                className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  isLatest
                    ? 'bg-[#0D93AA] ring-2 ring-[#0D93AA]/30'
                    : 'bg-[#0D93AA]'
                }`}
              />

              <span className={`font-semibold ${isLatest ? 'text-[#0D93AA]' : 'text-gray-800'}`}>
                {ev.event}
              </span>

              <span className="text-gray-400 font-mono text-[11px] shrink-0">
                {ev.timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
