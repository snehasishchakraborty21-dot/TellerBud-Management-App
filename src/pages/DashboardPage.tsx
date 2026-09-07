import React, { useState, useEffect } from 'react';
import { adminService } from '../services/mockAdminService';
import {
  OperationalMetrics,
  RequiresAttentionItem,
  PickupRequest,
  AgentAvailabilitySummary,
  FinancialActivityRecord,
} from '../types/admin';
import { OperationalMetricsGrid } from '../components/dashboard/OperationalMetrics';
import { RequiresAttentionSection } from '../components/dashboard/RequiresAttentionSection';
import { LivePickupOperationsTable } from '../components/dashboard/LivePickupOperationsTable';
import { AgentAvailabilityCard } from '../components/dashboard/AgentAvailabilityCard';
import { RecentFinancialActivitySection } from '../components/dashboard/RecentFinancialActivitySection';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<OperationalMetrics | null>(null);
  const [attentionItems, setAttentionItems] = useState<RequiresAttentionItem[]>([]);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [agentAvailability, setAgentAvailability] = useState<AgentAvailabilitySummary | null>(null);
  const [financialActivity, setFinancialActivity] = useState<FinancialActivityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [
          metricsData,
          attentionData,
          pickupsData,
          availabilityData,
          financialData,
        ] = await Promise.all([
          adminService.getOperationalMetrics(),
          adminService.getRequiresAttentionItems(),
          adminService.getLivePickupOperations(),
          adminService.getAgentAvailability(),
          adminService.getRecentFinancialActivity(),
        ]);

        setMetrics(metricsData);
        setAttentionItems(attentionData);
        setPickupRequests(pickupsData);
        setAgentAvailability(availabilityData);
        setFinancialActivity(financialData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
    const unsubscribe = adminService.subscribe(loadDashboardData);
    return () => unsubscribe();
  }, []);

  if (isLoading || !metrics || !agentAvailability) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Primary Operational Metrics (Section A) */}
      <OperationalMetricsGrid metrics={metrics} />

      {/* Operations Grid: Requires Attention (Section B) & Agent Availability (Section D) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <RequiresAttentionSection
            items={attentionItems}
            onViewItem={(item) => {
              if (item.targetRoute) navigate(item.targetRoute);
            }}
          />
        </div>
        <div className="lg:col-span-6">
          <AgentAvailabilityCard data={agentAvailability} />
        </div>
      </div>

      {/* Live Pickup Operations (Section C) */}
      <LivePickupOperationsTable
        requests={pickupRequests.slice(0, 4)}
        onViewAll={() => navigate('/super-admin/operations/live')}
      />

      {/* Recent Financial Activity (Section E) */}
      <RecentFinancialActivitySection
        records={financialActivity}
        onViewRecord={(record) => {
          if (record.type.includes('Withdrawal') || record.reference.startsWith('TB-WDR')) {
            navigate(`/super-admin/wallets/customer-withdrawals?highlight=${record.reference}`);
          } else {
            navigate('/super-admin/transactions/all');
          }
        }}
      />
    </div>
  );
};
