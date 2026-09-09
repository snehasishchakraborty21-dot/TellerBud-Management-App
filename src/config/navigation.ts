import {
  LayoutDashboard,
  Activity,
  UserCheck,
  GitPullRequest,
  Users,
  Banknote,
  Repeat,
  Store,
  CreditCard,
  PlusCircle,
  ArrowUpRight,
  ArrowLeftRight,
  Wallet,
  BookOpen,
  CheckCheck,
  Receipt,
  Percent,
  Building2,
  Sliders,
  BellRing,
  Settings,
  MessageSquare,
  History,
  FileBarChart,
  FileSpreadsheet,
  ShieldCheck,
  UserCog,
  CalendarCheck,
  Compass,
  Bell,
  User,
} from 'lucide-react';
import React from 'react';
import { UserRole } from '../types/auth';

export interface NavSubItem {
  id: string;
  label: string;
  path: string;
  badge?: string | number;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string | number;
  children?: NavSubItem[];
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

/**
 * TellerBud Admin Navigation Configuration
 */
export const SUPER_ADMIN_NAVIGATION_CONFIG: NavGroup[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      {
        id: 'dashboard-home',
        label: 'Dashboard',
        path: '/super-admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      {
        id: 'live-operations',
        label: 'Live Operations',
        path: '/super-admin/operations/live',
        icon: Activity,
        badge: 18,
      },
      {
        id: 'customer-requests',
        label: 'Customer Requests',
        path: '/super-admin/operations/requests',
        icon: GitPullRequest,
      },
      {
        id: 'agent-to-agent-liquidity',
        label: 'Agent-to-Agent Liquidity',
        path: '/super-admin/operations/agent-to-agent-liquidity',
        icon: Repeat,
      },
      {
        id: 'mobile-money-transactions',
        label: 'Mobile Money Transactions',
        path: '/super-admin/mobile-money-transactions',
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    id: 'people',
    title: 'People',
    items: [
      {
        id: 'customers',
        label: 'Customers',
        path: '/super-admin/people/customers',
        icon: Users,
      },
      {
        id: 'businesses',
        label: 'Businesses',
        path: '/super-admin/people/businesses',
        icon: Building2,
        children: [
          {
            id: 'all-businesses',
            label: 'All Businesses',
            path: '/super-admin/people/businesses',
          },
          {
            id: 'add-business',
            label: 'Add Business',
            path: '/super-admin/people/businesses/add',
          },
        ],
      },
    ],
  },
  {
    id: 'wallets-payments',
    title: 'Wallets & Payments',
    items: [
      {
        id: 'customer-wallets',
        label: 'Customer Wallets',
        path: '/super-admin/wallets/customers',
        icon: Wallet,
      },
      {
        id: 'add-funds',
        label: 'Wallet Funding',
        path: '/super-admin/wallets/add-funds',
        icon: PlusCircle,
      },
      {
        id: 'customer-withdrawals',
        label: 'Customer Withdrawals',
        path: '/super-admin/wallets/customer-withdrawals',
        icon: ArrowUpRight,
        badge: 9,
      },
      {
        id: 'business-agent-wallets',
        label: 'Business Global Wallets',
        path: '/super-admin/wallets/business-agent',
        icon: CreditCard,
      },
      {
        id: 'wallet-ledger',
        label: 'Wallet Ledger',
        path: '/super-admin/wallets/ledger',
        icon: BookOpen,
      },
      {
        id: 'api-ledger-reconciliation',
        label: 'API & Ledger Reconciliation',
        path: '/super-admin/wallets/reconciliation',
        icon: CheckCheck,
      },
    ],
  },
  {
    id: 'transactions',
    title: 'Transactions',
    items: [
      {
        id: 'all-transactions',
        label: 'All Transactions',
        path: '/super-admin/transactions/all',
        icon: Receipt,
      },
      {
        id: 'charges-commissions',
        label: 'Charges & Commissions',
        path: '/super-admin/transactions/commissions',
        icon: Percent,
      },
    ],
  },
  {
    id: 'configuration',
    title: 'Configuration',
    items: [
      {
        id: 'vendors',
        label: 'Vendors',
        path: '/super-admin/configuration/vendors',
        icon: Building2,
      },
      {
        id: 'vendor-eligibility',
        label: 'Vendor Eligibility',
        path: '/super-admin/configuration/vendor-eligibility',
        icon: Sliders,
      },
      {
        id: 'service-modes',
        label: 'Service Modes',
        path: '/super-admin/configuration/service-modes',
        icon: Compass,
      },
      {
        id: 'notifications-config',
        label: 'Notifications',
        path: '/super-admin/configuration/notifications',
        icon: BellRing,
      },
      {
        id: 'system-settings',
        label: 'System Settings',
        path: '/super-admin/configuration/settings',
        icon: Settings,
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    items: [
      {
        id: 'chats',
        label: 'Chats',
        path: '/super-admin/communication/chats',
        icon: MessageSquare,
      },
    ],
  },
];

/**
 * Business Owner Navigation Configuration
 */
export const BUSINESS_OWNER_NAVIGATION_CONFIG: NavGroup[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      {
        id: 'dashboard-home',
        label: 'Dashboard',
        path: '/business-owner/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      {
        id: 'live-operations',
        label: 'Live Operations',
        path: '/business-owner/operations/live',
        icon: Activity,
        badge: 4,
      },
      {
        id: 'agent-cash-float-requests',
        label: 'Cash / Float Requests',
        path: '/business-owner/operations/cash-float-requests',
        icon: Banknote,
        badge: 2,
      },
      {
        id: 'agent-to-agent-liquidity',
        label: 'Agent-to-Agent Liquidity',
        path: '/business-owner/operations/agent-to-agent-liquidity',
        icon: Repeat,
      },
      {
        id: 'mobile-money-transactions',
        label: 'Mobile Money Transactions',
        path: '/business-owner/mobile-money-transactions',
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    id: 'people',
    title: 'People',
    items: [
      {
        id: 'agents',
        label: 'Agents',
        path: '/business-owner/agents',
        icon: UserCheck,
      },
      {
        id: 'attendance-end-of-day',
        label: 'Attendance & End-of-Day',
        path: '/business-owner/people/attendance',
        icon: CalendarCheck,
      },
      {
        id: 'business-profile',
        label: 'Business Profile',
        path: '/business-owner/people/business-profile',
        icon: Building2,
      },
    ],
  },
  {
    id: 'wallets-transactions',
    title: 'Wallets & Transactions',
    items: [
      {
        id: 'global-wallet',
        label: 'Global Wallet',
        path: '/business-owner/wallets/global-wallet',
        icon: CreditCard,
      },
      {
        id: 'wallet-ledger',
        label: 'Wallet Ledger',
        path: '/business-owner/wallets/ledger',
        icon: BookOpen,
      },
      {
        id: 'all-transactions',
        label: 'All Transactions',
        path: '/business-owner/transactions/all',
        icon: Receipt,
      },
      {
        id: 'charges-commissions',
        label: 'Charges & Commissions',
        path: '/business-owner/transactions/commissions',
        icon: Percent,
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        path: '/business-owner/communication/notifications',
        icon: Bell,
      },
      {
        id: 'chats',
        label: 'Chats',
        path: '/business-owner/communication/chats',
        icon: MessageSquare,
      },
    ],
  },
];

export function getNavigationConfigForRole(role?: UserRole | null): NavGroup[] {
  if (role === 'business_owner') {
    return BUSINESS_OWNER_NAVIGATION_CONFIG;
  }
  return SUPER_ADMIN_NAVIGATION_CONFIG;
}

// Backwards compatibility export
export const NAVIGATION_CONFIG = SUPER_ADMIN_NAVIGATION_CONFIG;
