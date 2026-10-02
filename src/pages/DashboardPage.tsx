import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/mockAdminService';
import { businessService } from '../services/businessService';
import { OperationalMetrics } from '../types/admin';
import { BusinessRecord } from '../types/business';
import { OperationalMetricsGrid } from '../components/dashboard/OperationalMetrics';
import {
  RequiresAttentionSection,
  WithdrawalAttentionItem,
} from '../components/dashboard/RequiresAttentionSection';
import {
  ActiveBusinessesCard,
  BusinessSummaryData,
} from '../components/dashboard/ActiveBusinessesCard';
import { MonthlyBusinessTransactionChart } from '../components/dashboard/MonthlyBusinessTransactionChart';
import { AdminMobileMoneyTransactionMatrix } from '../components/dashboard/AdminMobileMoneyTransactionMatrix';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [withdrawalItems, setWithdrawalItems] = useState<WithdrawalAttentionItem[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const [metricsData, custWithdrawalsRes] = await Promise.all([
        adminService.getOperationalMetrics(),
        adminService.getCustomerWithdrawals({ status: 'Pending Review' }),
      ]);

      const bizList = businessService.getBusinesses();
      setBusinesses(bizList);

      // 1. Calculate pending customer withdrawals
      const pendingCustomerWithdrawals = custWithdrawalsRes.items.filter(
        (w) => w.status === 'Pending Review'
      );
      const customerPendingCount = pendingCustomerWithdrawals.length;
      const customerPendingAmount = pendingCustomerWithdrawals.reduce(
        (sum, w) => sum + (w.amount || 0),
        0
      );

      // 2. Calculate pending business withdrawals (e.g. 2 pending global wallet withdrawal requests)
      const businessPendingCount = 2;
      const businessPendingAmount = 35000.0;

      const items: WithdrawalAttentionItem[] = [
        {
          id: 'att-cust-withdrawal',
          type: 'Customer Withdrawal',
          count: customerPendingCount,
          amount: customerPendingAmount,
          targetRoute: '/super-admin/wallets/customer-withdrawals?status=Pending Review',
        },
        {
          id: 'att-biz-withdrawal',
          type: 'Business Withdrawal',
          count: businessPendingCount,
          amount: businessPendingAmount,
          targetRoute: '/super-admin/wallets/business-agent',
        },
      ];

      setMetrics(metricsData);
      setWithdrawalItems(items);
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const unsubscribeAdmin = adminService.subscribe(loadDashboardData);
    const unsubscribeBiz = businessService.subscribe(loadDashboardData);

    return () => {
      unsubscribeAdmin();
      unsubscribeBiz();
    };
  }, [loadDashboardData]);

  // Derived dynamic business summary
  const businessSummary: BusinessSummaryData = useMemo(() => {
    const total = businesses.length;
    const active = businesses.filter((b) => b.status === 'Active').length;
    const pending = businesses.filter((b) => b.status === 'Pending').length;
    const suspended = businesses.filter((b) => b.status === 'Suspended').length;

    return { total, active, pending, suspended };
  }, [businesses]);

  if (isLoading || !metrics) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 h-56 bg-slate-200 rounded-xl" />
          <div className="lg:col-span-6 h-56 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-96 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Compact Top Operational Metrics Cards */}
      <OperationalMetricsGrid metrics={metrics} />

      {/* 2. Operations Row: Requires Attention (Withdrawals only) & Active Businesses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <RequiresAttentionSection
            items={withdrawalItems}
            onViewItem={(item) => {
              if (item.targetRoute) navigate(item.targetRoute);
            }}
          />
        </div>
        <div className="lg:col-span-6 flex flex-col">
          <ActiveBusinessesCard
            data={businessSummary}
            onSelectStatus={(status) => {
              if (status === 'ALL') {
                navigate('/super-admin/businesses');
              } else {
                navigate('/super-admin/businesses', {
                  state: { filters: { status } },
                });
              }
            }}
          />
        </div>
      </div>

      {/* 3. Monthly Business Transaction Amount Bar Chart (Full Width) */}
      <div className="w-full">
        <MonthlyBusinessTransactionChart initialYear={2026} />
      </div>

      {/* 4. Cross-Business Mobile Money Transactions Year Matrix (Full Width) */}
      <div className="w-full">
        <AdminMobileMoneyTransactionMatrix initialYear={2026} />
      </div>
    </div>
  );
};
