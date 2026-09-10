import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { getNavigationConfigForRole } from '../config/navigation';
import { adminService } from '../services/mockAdminService';
import { AdminNotification } from '../types/admin';
import { useAuth } from '../context/AuthContext';

import { boNotificationService } from '../services/notificationService';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const navigationConfig = getNavigationConfigForRole(currentUser?.role);

  useEffect(() => {
    async function loadHeaderData() {
      try {
        const notifs = await adminService.getNotifications(
          currentUser?.role === 'business_owner' ? currentUser.businessName : undefined
        );
        setNotifications(notifs);
      } catch (e) {
        console.error('Failed to load header data:', e);
      }
    }
    loadHeaderData();

    if (currentUser?.role === 'business_owner') {
      const unsubscribe = boNotificationService.subscribe(() => {
        loadHeaderData();
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  // Determine current page title based on active path
  const getCurrentPageTitle = (): string => {
    const pathname = location.pathname;
    if (
      pathname === '/business-owner/communication/notifications' ||
      pathname === '/business-owner/notifications'
    ) {
      return 'Notifications';
    }

    if (
      pathname === '/business-owner/communication/chats' ||
      pathname === '/business-owner/chats' ||
      pathname === '/super-admin/communication/chats' ||
      pathname === '/super-admin/chats'
    ) {
      return 'Chats';
    }

    if (
      pathname === '/super-admin/dashboard' ||
      pathname === '/business-owner/dashboard' ||
      pathname === '/'
    ) {
      return 'Dashboard';
    }

    if (
      pathname === '/super-admin/people/businesses/add' ||
      pathname === '/super-admin/businesses/add' ||
      pathname.endsWith('/businesses/add')
    ) {
      return 'Add Business';
    }

    if (
      pathname === '/super-admin/people/businesses' ||
      pathname === '/super-admin/businesses' ||
      pathname === '/tellerbud-admin/businesses'
    ) {
      return 'Businesses';
    }

    if (
      pathname.startsWith('/super-admin/people/businesses/') ||
      pathname.startsWith('/super-admin/businesses/') ||
      pathname.includes('/businesses/')
    ) {
      return 'Business Details';
    }

    if (
      pathname.startsWith('/super-admin/people/customers/') ||
      pathname.startsWith('/super-admin/customers/')
    ) {
      return 'Customer Profile';
    }

    if (
      pathname === '/super-admin/people/customers' ||
      pathname === '/super-admin/customers'
    ) {
      return 'Customers';
    }

    if (
      pathname.includes('/wallets/customers/') &&
      pathname !== '/super-admin/wallets/customers'
    ) {
      return 'Customer Wallet Details';
    }

    if (
      pathname === '/super-admin/wallets/customers' ||
      pathname.endsWith('/wallets/customers')
    ) {
      return 'Customer Wallets';
    }

    if (
      pathname.includes('/wallets/customer-withdrawals/') &&
      pathname !== '/super-admin/wallets/customer-withdrawals'
    ) {
      return 'Withdrawal Details';
    }

    if (
      pathname === '/super-admin/wallets/customer-withdrawals' ||
      pathname === '/wallets/customer-withdrawals' ||
      pathname.endsWith('/wallets/customer-withdrawals')
    ) {
      return 'Customer Withdrawals';
    }

    if (
      pathname.startsWith('/business-global-wallets/') ||
      pathname.startsWith('/super-admin/business-global-wallets/') ||
      (pathname.startsWith('/super-admin/wallets/business-agent/') &&
        pathname !== '/super-admin/wallets/business-agent')
    ) {
      return 'Business Global Wallet Details';
    }

    if (
      pathname === '/business-global-wallets' ||
      pathname === '/super-admin/business-global-wallets' ||
      pathname === '/super-admin/wallets/business-agent' ||
      pathname.endsWith('/wallets/business-agent')
    ) {
      return 'Business Global Wallets';
    }

    if (
      pathname.includes('/wallets/add-funds/') ||
      pathname.includes('/wallets/funding/') ||
      pathname.includes('/wallet-funding/')
    ) {
      return 'Wallet Funding Details';
    }

    if (
      pathname === '/super-admin/wallets/add-funds' ||
      pathname === '/super-admin/wallets/funding' ||
      pathname === '/super-admin/wallet-funding' ||
      pathname.endsWith('/wallets/add-funds') ||
      pathname.endsWith('/wallets/funding') ||
      pathname.endsWith('/wallet-funding')
    ) {
      return 'Wallet Funding';
    }

    if (
      pathname.includes('/mobile-money-transactions/') ||
      pathname.includes('/walk-in-transactions/')
    ) {
      return 'Mobile Money Transaction Details';
    }

    if (
      pathname.endsWith('/mobile-money-transactions') ||
      pathname.endsWith('/walk-in-transactions')
    ) {
      return 'Mobile Money Transactions';
    }

    if (
      pathname.includes('/operations/cash-float-requests/') &&
      !pathname.endsWith('/cash-float-requests')
    ) {
      return 'Cash / Float Request Details';
    }

    if (
      pathname.includes('/operations/agent-to-agent-liquidity/') &&
      !pathname.endsWith('/agent-to-agent-liquidity')
    ) {
      return 'Agent-to-Agent Liquidity Request Details';
    }

    if (
      pathname.includes('/attendance-end-of-day/attendance/') ||
      pathname.includes('/people/attendance/attendance/')
    ) {
      return 'Attendance Details';
    }

    if (
      pathname.includes('/attendance-end-of-day/end-of-day/') ||
      pathname.includes('/people/attendance/end-of-day/')
    ) {
      return 'End-of-Day Details';
    }

    if (
      pathname === '/business-owner/attendance-end-of-day' ||
      pathname === '/business-owner/people/attendance'
    ) {
      return 'Attendance & End-of-Day';
    }

    if (
      pathname === '/business-owner/business-profile' ||
      pathname === '/business-owner/people/business-profile'
    ) {
      return 'Business Profile';
    }

    if (
      pathname === '/business-owner/wallets/global-wallet' ||
      pathname === '/business-owner/global-wallet' ||
      pathname === '/business-owner/wallets/business-agent'
    ) {
      return 'Global Wallet';
    }

    if (
      pathname === '/business-owner/wallets/ledger' ||
      pathname === '/business-owner/ledger'
    ) {
      return 'Wallet Ledger';
    }

    for (const group of navigationConfig) {
      for (const item of group.items) {
        if (item.path === pathname) {
          return item.label;
        }
      }
    }

    // Fallback based on route segments
    const segment = pathname.split('/').filter(Boolean).pop();
    if (!segment) return 'Dashboard';
    return segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const handleMarkNotificationRead = async (id: string) => {
    await adminService.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = async () => {
    await adminService.markAllNotificationsAsRead(
      currentUser?.role === 'business_owner' ? currentUser.businessName : undefined
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="h-screen h-[100dvh] bg-[#FAFAFA] flex flex-row overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isDesktopCollapsed={isDesktopCollapsed}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AdminHeader
          pageTitle={getCurrentPageTitle()}
          onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)}
          onToggleDesktopCollapse={() => setIsDesktopCollapsed((prev) => !prev)}
          isDesktopCollapsed={isDesktopCollapsed}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        />

        <main className="flex-1 overflow-y-auto min-h-0 bg-[#FAFAFA]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
