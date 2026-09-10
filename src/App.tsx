import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BusinessOwnerDashboardPage } from './pages/BusinessOwnerDashboardPage';
import { CustomerWithdrawalsPage } from './pages/CustomerWithdrawalsPage';
import { CustomerWithdrawalDetailPage } from './pages/CustomerWithdrawalDetailPage';
import { CashFloatRequestsPage } from './pages/CashFloatRequestsPage';
import { CashFloatRequestDetailPage } from './pages/CashFloatRequestDetailPage';
import { AgentLiquidityPage } from './pages/AgentLiquidityPage';
import { AgentLiquidityDetailPage } from './pages/AgentLiquidityDetailPage';
import { WalkInTransactionsPage } from './pages/WalkInTransactionsPage';
import { WalkInDetailPage } from './pages/WalkInDetailPage';
import { MobileMoneyTransactionsPage } from './pages/MobileMoneyTransactionsPage';
import { AgentsPage } from './pages/AgentsPage';
import { AgentDetailPage } from './pages/AgentDetailPage';
import { AttendanceEndOfDayPage } from './pages/AttendanceEndOfDayPage';
import { AttendanceDetailPage } from './pages/AttendanceDetailPage';
import { EndOfDayDetailPage } from './pages/EndOfDayDetailPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { GlobalWalletPage } from './pages/GlobalWalletPage';
import { WalletLedgerPage } from './pages/WalletLedgerPage';
import { AllTransactionsPage } from './pages/AllTransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { ChargesCommissionsPage } from './pages/ChargesCommissionsPage';
import { BusinessOwnerNotificationsPage } from './pages/BusinessOwnerNotificationsPage';
import { BusinessOwnerChatsPage } from './pages/BusinessOwnerChatsPage';
import { LiveOperationsPage } from './pages/LiveOperationsPage';
import { CustomerRequestsPage } from './pages/CustomerRequestsPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { BusinessesPage } from './pages/BusinessesPage';
import { BusinessDetailsPage } from './pages/BusinessDetailsPage';
import { AddBusinessPage } from './pages/AddBusinessPage';
import { CustomerWalletsPage } from './pages/CustomerWalletsPage';
import { CustomerWalletDetailPage } from './pages/CustomerWalletDetailPage';
import { BusinessGlobalWalletsPage } from './pages/BusinessGlobalWalletsPage';
import { BusinessGlobalWalletDetailPage } from './pages/BusinessGlobalWalletDetailPage';
import { WalletFundingPage } from './pages/WalletFundingPage';
import { WalletFundingDetailPage } from './pages/WalletFundingDetailPage';
import { GenericPageScaffold } from './pages/GenericPageScaffold';
import {
  SUPER_ADMIN_NAVIGATION_CONFIG,
  BUSINESS_OWNER_NAVIGATION_CONFIG,
} from './config/navigation';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingState } from './components/common/LoadingState';

/**
 * Root Redirect Handler: Routes authenticated users to their respective dashboard,
 * or unauthenticated users to the /login screen.
 */
function RootRedirect() {
  const { currentUser, isCheckingAuth } = useAuth();
  if (isCheckingAuth) {
    return <LoadingState message="Loading portal..." />;
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role === 'business_owner') {
    return <Navigate to="/business-owner/dashboard" replace />;
  }
  return <Navigate to="/super-admin/dashboard" replace />;
}

/**
 * Public Login Route Guard: If already authenticated, redirect to appropriate dashboard.
 */
function PublicLoginRoute() {
  const { currentUser, isCheckingAuth } = useAuth();
  if (isCheckingAuth) {
    return <LoadingState message="Loading portal..." />;
  }
  if (currentUser) {
    if (currentUser.role === 'business_owner') {
      return <Navigate to="/business-owner/dashboard" replace />;
    }
    return <Navigate to="/super-admin/dashboard" replace />;
  }
  return <LoginPage />;
}

/**
 * Legacy Path Resolver: Redirects older non-prefixed paths to role-scoped paths.
 */
function LegacyRedirect({ defaultSuperAdminPath, defaultBusinessOwnerPath }: { defaultSuperAdminPath: string; defaultBusinessOwnerPath: string }) {
  const { currentUser, isCheckingAuth } = useAuth();
  if (isCheckingAuth) {
    return <LoadingState message="Redirecting..." />;
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role === 'business_owner') {
    return <Navigate to={defaultBusinessOwnerPath} replace />;
  }
  return <Navigate to={defaultSuperAdminPath} replace />;
}

function TellerbudAdminBusinessIdRedirect() {
  const { businessId, id } = useParams<{ businessId?: string; id?: string }>();
  return <Navigate to={`/super-admin/people/businesses/${businessId || id}`} replace />;
}

function WalletFundingLegacyRedirect() {
  const { fundingId } = useParams<{ fundingId?: string }>();
  return <Navigate to={`/super-admin/wallet-funding/${fundingId || ''}`} replace />;
}

function AppRoutes() {
  // TellerBud Admin custom routes that have explicit page implementations
  const superAdminCustomPaths = [
    '/super-admin/dashboard',
    '/super-admin/operations/live',
    '/super-admin/operations/requests',
    '/super-admin/wallets/customers',
    '/super-admin/customer-wallets',
    '/super-admin/wallets/add-funds',
    '/super-admin/wallets/funding',
    '/super-admin/wallet-funding',
    '/super-admin/wallets/customer-withdrawals',
    '/super-admin/wallets/withdrawals',
    '/super-admin/wallets/business-agent',
    '/super-admin/business-global-wallets',
    '/business-global-wallets',
    '/super-admin/operations/agent-to-agent-liquidity',
    '/super-admin/operations/agent-liquidity',
    '/super-admin/mobile-money-transactions',
    '/super-admin/walk-in-transactions',
    '/super-admin/operations/walk-in',
    '/super-admin/people/customers',
    '/super-admin/customers',
    '/super-admin/people/businesses',
    '/super-admin/people/businesses/add',
    '/super-admin/businesses',
    '/super-admin/businesses/add',
  ];

  const superAdminScaffolds = SUPER_ADMIN_NAVIGATION_CONFIG.flatMap((g) =>
    g.items.filter((item) => !superAdminCustomPaths.includes(item.path))
  );

  // Business Owner custom routes that have explicit page implementations
  const businessOwnerCustomPaths = [
    '/business-owner/dashboard',
    '/business-owner/operations/live',
    '/business-owner/live',
    '/business-owner/operations/cash-float-requests',
    '/business-owner/operations/agent-to-agent-liquidity',
    '/business-owner/mobile-money-transactions',
    '/business-owner/walk-in-transactions',
    '/business-owner/operations/walk-in',
    '/business-owner/agents',
    '/business-owner/people/agents',
    '/business-owner/attendance-end-of-day',
    '/business-owner/people/attendance',
    '/business-owner/business-profile',
    '/business-owner/people/business-profile',
    '/business-owner/wallets/global-wallet',
    '/business-owner/wallets/ledger',
    '/business-owner/wallets/business-agent',
    '/business-owner/transactions/all',
    '/business-owner/transactions',
    '/business-owner/transactions/commissions',
    '/business-owner/transactions/charges-commissions',
    '/business-owner/communication/notifications',
    '/business-owner/notifications',
    '/business-owner/communication/chats',
    '/business-owner/chats',
  ];

  const businessOwnerScaffolds = BUSINESS_OWNER_NAVIGATION_CONFIG.flatMap((g) =>
    g.items.filter((item) => !businessOwnerCustomPaths.includes(item.path))
  );

  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<RootRedirect />} />

      {/* Login Route */}
      <Route path="/login" element={<PublicLoginRoute />} />

      {/* TellerBud Admin Protected Portal */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Live Operations */}
        <Route path="operations/live" element={<LiveOperationsPage />} />

        {/* Customer Requests */}
        <Route path="operations/requests" element={<CustomerRequestsPage />} />
        <Route path="customer-requests" element={<Navigate to="/super-admin/operations/requests" replace />} />
        <Route path="operations/customer-requests" element={<Navigate to="/super-admin/operations/requests" replace />} />

        {/* Removed Sections -> Safe Redirects to Dashboard */}
        <Route path="operations/matching" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="operations/matching/*" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="matching" element={<Navigate to="/super-admin/dashboard" replace />} />

        <Route path="operations/cash-float-requests" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="operations/cash-float-requests/*" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="cash-float-requests" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="cash-float-requests/*" element={<Navigate to="/super-admin/dashboard" replace />} />

        <Route path="people/attendance" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="people/attendance/*" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="attendance" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="attendance/*" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="attendance-end-of-day" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="attendance-end-of-day/*" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="people/attendance-end-of-day" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="people/attendance-end-of-day/*" element={<Navigate to="/super-admin/dashboard" replace />} />

        {/* Customer Wallets */}
        <Route path="wallets/customers" element={<CustomerWalletsPage />} />
        <Route path="wallets/customers/:walletId" element={<CustomerWalletDetailPage />} />
        <Route path="customer-wallets" element={<Navigate to="/super-admin/wallets/customers" replace />} />
        <Route path="customer-wallets/:walletId" element={<CustomerWalletDetailPage />} />

        {/* Wallet Funding */}
        <Route path="wallets/add-funds" element={<WalletFundingPage />} />
        <Route path="wallets/add-funds/:fundingId" element={<WalletFundingDetailPage />} />
        <Route path="wallets/funding" element={<Navigate to="/super-admin/wallets/add-funds" replace />} />
        <Route path="wallets/funding/:fundingId" element={<WalletFundingDetailPage />} />
        <Route path="wallet-funding" element={<Navigate to="/super-admin/wallets/add-funds" replace />} />
        <Route path="wallet-funding/:fundingId" element={<WalletFundingDetailPage />} />

        {/* Customer Withdrawals */}
        <Route path="wallets/customer-withdrawals" element={<CustomerWithdrawalsPage />} />
        <Route path="wallets/customer-withdrawals/:reference" element={<CustomerWithdrawalDetailPage />} />
        <Route path="wallets/withdrawals" element={<Navigate to="/super-admin/wallets/customer-withdrawals" replace />} />

        {/* Business Global Wallets */}
        <Route path="wallets/business-agent" element={<BusinessGlobalWalletsPage />} />
        <Route path="wallets/business-agent/:walletId" element={<BusinessGlobalWalletDetailPage />} />
        <Route path="business-global-wallets" element={<BusinessGlobalWalletsPage />} />
        <Route path="business-global-wallets/:walletId" element={<BusinessGlobalWalletDetailPage />} />

        {/* Agent to Agent Liquidity */}
        <Route path="operations/agent-to-agent-liquidity" element={<AgentLiquidityPage />} />
        <Route path="operations/agent-to-agent-liquidity/:reference" element={<AgentLiquidityDetailPage />} />
        <Route path="operations/agent-liquidity" element={<Navigate to="/super-admin/operations/agent-to-agent-liquidity" replace />} />

        {/* Mobile Money Transactions (formerly Walk-In Transactions) */}
        <Route path="mobile-money-transactions" element={<MobileMoneyTransactionsPage />} />
        <Route path="mobile-money-transactions/:reference" element={<MobileMoneyTransactionsPage />} />
        <Route path="walk-in-transactions" element={<Navigate to="/super-admin/mobile-money-transactions" replace />} />
        <Route path="walk-in-transactions/:reference" element={<Navigate to="/super-admin/mobile-money-transactions" replace />} />
        <Route path="operations/walk-in" element={<Navigate to="/super-admin/mobile-money-transactions" replace />} />

        {/* Customers */}
        <Route path="people/customers" element={<CustomersPage />} />
        <Route path="people/customers/:id" element={<CustomerProfilePage />} />
        <Route path="customers" element={<Navigate to="/super-admin/people/customers" replace />} />
        <Route path="customers/:id" element={<CustomerProfilePage />} />

        {/* Businesses */}
        <Route path="people/businesses" element={<BusinessesPage />} />
        <Route path="people/businesses/add" element={<AddBusinessPage />} />
        <Route path="people/businesses/:id" element={<BusinessDetailsPage />} />
        <Route path="businesses" element={<Navigate to="/super-admin/people/businesses" replace />} />
        <Route path="businesses/add" element={<AddBusinessPage />} />
        <Route path="businesses/:id" element={<BusinessDetailsPage />} />

        {/* Removed TellerBud Admin Agents routes - redirect safely to Businesses */}
        <Route path="people/agents" element={<Navigate to="/super-admin/people/businesses" replace />} />
        <Route path="people/agents/*" element={<Navigate to="/super-admin/people/businesses" replace />} />
        <Route path="agents" element={<Navigate to="/super-admin/people/businesses" replace />} />
        <Route path="agents/*" element={<Navigate to="/super-admin/people/businesses" replace />} />

        {/* TellerBud Admin Scaffold Modules */}
        {superAdminScaffolds.map((item) => {
          const subPath = item.path.replace('/super-admin/', '');
          return (
            <React.Fragment key={item.id}>
              <Route
                path={subPath}
                element={<GenericPageScaffold title={item.label} />}
              />
            </React.Fragment>
          );
        })}
      </Route>

      {/* Business Owner Protected Portal */}
      <Route
        path="/business-owner"
        element={
          <ProtectedRoute allowedRoles={['business_owner']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/business-owner/dashboard" replace />} />
        <Route path="dashboard" element={<BusinessOwnerDashboardPage />} />

        {/* Live Operations (Scoped to Business) */}
        <Route path="operations/live" element={<LiveOperationsPage />} />
        <Route path="live" element={<Navigate to="/business-owner/operations/live" replace />} />

        {/* Cash / Float Requests (Scoped to Business) */}
        <Route path="operations/cash-float-requests" element={<CashFloatRequestsPage />} />
        <Route path="operations/cash-float-requests/:reference" element={<CashFloatRequestDetailPage />} />
        <Route path="cash-float-requests" element={<CashFloatRequestsPage />} />
        <Route path="cash-float-requests/:reference" element={<CashFloatRequestDetailPage />} />

        {/* Agent to Agent Liquidity (Scoped to Business) */}
        <Route path="operations/agent-to-agent-liquidity" element={<AgentLiquidityPage />} />
        <Route path="operations/agent-to-agent-liquidity/:reference" element={<AgentLiquidityDetailPage />} />
        <Route path="agent-to-agent-liquidity" element={<AgentLiquidityPage />} />
        <Route path="agent-to-agent-liquidity/:reference" element={<AgentLiquidityDetailPage />} />

        {/* Mobile Money Transactions (formerly Walk-In Transactions) */}
        <Route path="mobile-money-transactions" element={<MobileMoneyTransactionsPage />} />
        <Route path="mobile-money-transactions/:reference" element={<MobileMoneyTransactionsPage />} />
        <Route path="walk-in-transactions" element={<Navigate to="/business-owner/mobile-money-transactions" replace />} />
        <Route path="walk-in-transactions/:reference" element={<Navigate to="/business-owner/mobile-money-transactions" replace />} />
        <Route path="operations/walk-in" element={<Navigate to="/business-owner/mobile-money-transactions" replace />} />

        {/* Agents Directory (Scoped to Business) */}
        <Route path="agents" element={<AgentsPage />} />
        <Route path="agents/:id" element={<AgentDetailPage />} />
        <Route path="people/agents" element={<Navigate to="/business-owner/agents" replace />} />
        <Route path="people/agents/:id" element={<AgentDetailPage />} />

        {/* Attendance & End-of-Day (Scoped to Business) */}
        <Route path="attendance-end-of-day" element={<AttendanceEndOfDayPage />} />
        <Route path="attendance-end-of-day/attendance/:agentId/:date" element={<AttendanceDetailPage />} />
        <Route path="attendance-end-of-day/end-of-day/:reference" element={<EndOfDayDetailPage />} />
        <Route path="people/attendance" element={<AttendanceEndOfDayPage />} />
        <Route path="people/attendance/attendance/:agentId/:date" element={<AttendanceDetailPage />} />
        <Route path="people/attendance/end-of-day/:reference" element={<EndOfDayDetailPage />} />

        {/* Business Profile (Scoped to Business) */}
        <Route path="people/business-profile" element={<BusinessProfilePage />} />
        <Route path="business-profile" element={<BusinessProfilePage />} />

        {/* Global Wallet (Lusaka Central Express Agency Shared Wallet) */}
        <Route path="wallets/global-wallet" element={<GlobalWalletPage />} />
        <Route path="global-wallet" element={<Navigate to="/business-owner/wallets/global-wallet" replace />} />
        {/* Legacy redirects */}
        <Route path="wallets/business-agent" element={<Navigate to="/business-owner/wallets/global-wallet" replace />} />
        <Route path="wallets/business-agent/:agentId" element={<Navigate to="/business-owner/wallets/global-wallet" replace />} />
        <Route path="business-agent-wallets" element={<Navigate to="/business-owner/wallets/global-wallet" replace />} />

        {/* Global Wallet Ledger */}
        <Route path="wallets/ledger" element={<WalletLedgerPage />} />
        <Route path="ledger" element={<Navigate to="/business-owner/wallets/ledger" replace />} />

        {/* All Transactions (Scoped to Business) */}
        <Route path="transactions/all" element={<AllTransactionsPage />} />
        <Route path="transactions/all/:reference" element={<TransactionDetailPage />} />
        <Route path="transactions" element={<Navigate to="/business-owner/transactions/all" replace />} />
        <Route path="transactions/:reference" element={<TransactionDetailPage />} />

        {/* Charges & Commissions (Scoped to Business) */}
        <Route path="transactions/commissions" element={<ChargesCommissionsPage />} />
        <Route path="transactions/charges-commissions" element={<ChargesCommissionsPage />} />
        <Route path="commissions" element={<Navigate to="/business-owner/transactions/commissions" replace />} />
        <Route path="charges" element={<Navigate to="/business-owner/transactions/commissions" replace />} />

        {/* Notifications (Scoped to Business) */}
        <Route path="communication/notifications" element={<BusinessOwnerNotificationsPage />} />
        <Route path="notifications" element={<Navigate to="/business-owner/communication/notifications" replace />} />

        {/* Chats (Scoped to Business Owner & Authorised Agents) */}
        <Route path="communication/chats" element={<BusinessOwnerChatsPage />} />
        <Route path="chats" element={<Navigate to="/business-owner/communication/chats" replace />} />

        {/* Business Owner Scaffold Modules */}
        {businessOwnerScaffolds.map((item) => {
          const subPath = item.path.replace('/business-owner/', '');
          return (
            <React.Fragment key={item.id}>
              <Route
                path={subPath}
                element={<GenericPageScaffold title={item.label} />}
              />
            </React.Fragment>
          );
        })}
      </Route>

      {/* Backward Compatibility Legacy Redirects */}
      <Route
        path="/operations/live"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/operations/live"
            defaultBusinessOwnerPath="/business-owner/operations/live"
          />
        }
      />
      <Route
        path="/live"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/operations/live"
            defaultBusinessOwnerPath="/business-owner/operations/live"
          />
        }
      />
      <Route
        path="/operations/requests"
        element={<Navigate to="/super-admin/operations/requests" replace />}
      />
      <Route
        path="/customer-requests"
        element={<Navigate to="/super-admin/operations/requests" replace />}
      />
      <Route
        path="/wallets/customer-withdrawals"
        element={<Navigate to="/super-admin/wallets/customer-withdrawals" replace />}
      />
      <Route
        path="/wallets/customer-withdrawals/:reference"
        element={<Navigate to="/super-admin/wallets/customer-withdrawals" replace />}
      />
      <Route
        path="/operations/cash-float-requests"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/dashboard"
            defaultBusinessOwnerPath="/business-owner/operations/cash-float-requests"
          />
        }
      />
      <Route
        path="/cash-float-requests"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/dashboard"
            defaultBusinessOwnerPath="/business-owner/operations/cash-float-requests"
          />
        }
      />
      <Route
        path="/operations/matching"
        element={<Navigate to="/super-admin/dashboard" replace />}
      />
      <Route
        path="/matching"
        element={<Navigate to="/super-admin/dashboard" replace />}
      />
      <Route
        path="/attendance-end-of-day"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/dashboard"
            defaultBusinessOwnerPath="/business-owner/attendance-end-of-day"
          />
        }
      />
      <Route
        path="/attendance"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/dashboard"
            defaultBusinessOwnerPath="/business-owner/attendance-end-of-day"
          />
        }
      />
      <Route
        path="/people/attendance"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/dashboard"
            defaultBusinessOwnerPath="/business-owner/attendance-end-of-day"
          />
        }
      />
      <Route
        path="/operations/agent-to-agent-liquidity"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/operations/agent-to-agent-liquidity"
            defaultBusinessOwnerPath="/business-owner/operations/agent-to-agent-liquidity"
          />
        }
      />
      <Route
        path="/mobile-money-transactions"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/mobile-money-transactions"
            defaultBusinessOwnerPath="/business-owner/mobile-money-transactions"
          />
        }
      />
      <Route
        path="/mobile-money-transactions/:reference"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/mobile-money-transactions"
            defaultBusinessOwnerPath="/business-owner/mobile-money-transactions"
          />
        }
      />
      <Route
        path="/walk-in-transactions"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/mobile-money-transactions"
            defaultBusinessOwnerPath="/business-owner/mobile-money-transactions"
          />
        }
      />
      <Route
        path="/walk-in-transactions/:reference"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/mobile-money-transactions"
            defaultBusinessOwnerPath="/business-owner/mobile-money-transactions"
          />
        }
      />
      <Route
        path="/operations/walk-in"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/mobile-money-transactions"
            defaultBusinessOwnerPath="/business-owner/mobile-money-transactions"
          />
        }
      />
      <Route
        path="/agents"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/people/businesses"
            defaultBusinessOwnerPath="/business-owner/agents"
          />
        }
      />
      <Route
        path="/people/agents"
        element={
          <LegacyRedirect
            defaultSuperAdminPath="/super-admin/people/businesses"
            defaultBusinessOwnerPath="/business-owner/agents"
          />
        }
      />
      <Route
        path="/transactions/all"
        element={<Navigate to="/business-owner/transactions/all" replace />}
      />
      <Route
        path="/transactions"
        element={<Navigate to="/business-owner/transactions/all" replace />}
      />

      {/* TellerBud Admin Businesses Direct & Legacy Routes */}
      <Route
        path="/tellerbud-admin/businesses"
        element={<Navigate to="/super-admin/people/businesses" replace />}
      />
      <Route
        path="/tellerbud-admin/businesses/add"
        element={<Navigate to="/super-admin/people/businesses/add" replace />}
      />
      <Route
        path="/tellerbud-admin/businesses/:businessId"
        element={<TellerbudAdminBusinessIdRedirect />}
      />

      {/* Wallet Funding Direct & Legacy Routes */}
      <Route
        path="/wallet-funding"
        element={<Navigate to="/super-admin/wallets/add-funds" replace />}
      />
      <Route
        path="/wallet-funding/:fundingId"
        element={<WalletFundingLegacyRedirect />}
      />

      {/* Business Global Wallets Direct & Details Routes */}
      <Route
        path="/business-global-wallets"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BusinessGlobalWalletsPage />} />
        <Route path=":walletId" element={<BusinessGlobalWalletDetailPage />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
