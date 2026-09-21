import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getZambiaTodayString,
  isValidDateString,
  formatBusinessOwnerHeaderDate,
} from '../utils/dateUtils';
import { useAuth } from './AuthContext';

export interface CustomDateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

interface BusinessOwnerDateContextType {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  customDateRange: CustomDateRange | null;
  setCustomDateRange: (range: CustomDateRange | null) => void;
  isCustomRange: boolean;
  resetToToday: () => void;
  announcement: string;
}

const SESSION_STORAGE_KEY = 'bo_operational_date';

const BusinessOwnerDateContext = createContext<BusinessOwnerDateContextType | undefined>(undefined);

export const BusinessOwnerDateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Initialize selected date from session storage or fallback to Africa/Lusaka today
  const [selectedDate, setSelectedDateState] = useState<string>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored && isValidDateString(stored)) {
        return stored;
      }
    } catch {
      // Ignore session storage errors
    }
    return getZambiaTodayString();
  });

  const [customDateRange, setCustomDateRangeState] = useState<CustomDateRange | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  // Reset to today upon new sign-in or user change
  useEffect(() => {
    const today = getZambiaTodayString();
    setSelectedDateState(today);
    setCustomDateRangeState(null);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, today);
    } catch {
      // Ignore session storage errors
    }
  }, [currentUser?.uid]);

  const setSelectedDate = useCallback((date: string) => {
    if (!isValidDateString(date)) {
      return;
    }

    const today = getZambiaTodayString();
    // Do not allow future dates
    if (date > today) {
      return;
    }

    setSelectedDateState(date);
    setCustomDateRangeState(null);

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, date);
    } catch {
      // Ignore session storage errors
    }

    const formatted = formatBusinessOwnerHeaderDate(date);
    setAnnouncement(`Operational date changed to ${formatted}`);
  }, []);

  const setCustomDateRange = useCallback((range: CustomDateRange | null) => {
    if (!range) {
      setCustomDateRangeState(null);
      return;
    }

    // If single day range, treat as single date selection
    if (range.from && range.to && range.from === range.to) {
      setSelectedDate(range.from);
      return;
    }

    setCustomDateRangeState(range);
    setAnnouncement(`Custom operational date range set: ${range.from} to ${range.to}`);
  }, [setSelectedDate]);

  const resetToToday = useCallback(() => {
    const today = getZambiaTodayString();
    setSelectedDate(today);
  }, [setSelectedDate]);

  const isCustomRange = Boolean(
    customDateRange &&
    customDateRange.from &&
    customDateRange.to &&
    customDateRange.from !== customDateRange.to
  );

  return (
    <BusinessOwnerDateContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        customDateRange,
        setCustomDateRange,
        isCustomRange,
        resetToToday,
        announcement,
      }}
    >
      {children}
      {/* Screen Reader Live Announcement Region */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </BusinessOwnerDateContext.Provider>
  );
};

export function useBusinessOwnerDate() {
  const context = useContext(BusinessOwnerDateContext);
  if (!context) {
    throw new Error('useBusinessOwnerDate must be used within a BusinessOwnerDateProvider');
  }
  return context;
}
