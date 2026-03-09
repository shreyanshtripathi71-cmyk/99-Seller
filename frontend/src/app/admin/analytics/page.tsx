"use client";

import React, { useState, useEffect } from "react";
import { adminAPI } from "@/services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import CountUp from 'react-countup';
import { DASHBOARD_THEME } from "@/components/admin/theme";
import styles from './analytics.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface UserStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  userTypes: Record<string, number>;
  growth: string;
}

interface PropertyStats {
  totalProperties: number;
  totalValue: number;
  avgPrice: number;
  propertiesByType: { PType: string; count: number; avgPrice: number }[];
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  trialingSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  conversionRate: number;
  planDistribution: Record<string, number>;
  revenueDistribution: Record<string, number>;
  growth: number;
}

interface HistoricalStats {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [propertyStats, setPropertyStats] = useState<PropertyStats | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);
  const [historicalStats, setHistoricalStats] = useState<HistoricalStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, propertyRes, subRes, histRes, actRes] = await Promise.all([
        adminAPI.users.getStats(),
        adminAPI.properties.getStats(),
        adminAPI.subscriptions.getStats(),
        adminAPI.getHistoricalStats(),
        adminAPI.activities.getRecent(),
      ]);

      if (userRes.success) setUserStats(userRes.data);
      if (propertyRes.success) setPropertyStats(propertyRes.data);
      if (subRes.success) setSubscriptionStats(subRes.data);
      if (histRes.success) setHistoricalStats(histRes.data);
      if (actRes.success) setActivities(actRes.data || []);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: DASHBOARD_THEME.mainBg,
        color: DASHBOARD_THEME.textSecondary,
        fontSize: 14,
        fontWeight: 500
      }}>
        Loading Analytics...
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: DASHBOARD_THEME.cardBg,
    borderRadius: 12,
    padding: 24,
    border: `1px solid ${DASHBOARD_THEME.cardBorder}`,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  return (
    <div className={styles.container} style={{ background: DASHBOARD_THEME.mainBg }}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: DASHBOARD_THEME.textPrimary, margin: "0 0 4px 0" }}>
            Analytics Overview
          </h1>
          <p style={{ color: DASHBOARD_THEME.textSecondary, margin: 0, fontSize: 14 }}>
            Performance metrics and platform intelligence.
          </p>
        </div>
        <button onClick={fetchAllStats} style={{ background: "#fff", border: `1px solid ${DASHBOARD_THEME.cardBorder}`, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 500, color: DASHBOARD_THEME.textSecondary, display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <i className="fa-solid fa-rotate-right"></i> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, marginBottom: 24, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        <StatCard
          icon="fa-users"
          color={DASHBOARD_THEME.info}
          bg="#eff6ff"
          label="Total Users"
          value={userStats?.totalUsers || 0}
          growth={userStats?.growth}
        />
        <StatCard
          icon="fa-building"
          color={DASHBOARD_THEME.success}
          bg="#ecfdf5"
          label="Properties"
          value={propertyStats?.totalProperties || 0}
          growth="5.2"
        />
        <StatCard
          icon="fa-bolt"
          color={DASHBOARD_THEME.accent}
          bg="#f5f3ff"
          label="Active Subs"
          value={subscriptionStats?.activeSubscriptions || 0}
          growth="8.1"
        />
        <StatCard
          icon="fa-chart-line"
          color={DASHBOARD_THEME.warning}
          bg="#fffbeb"
          label="Est. Monthly"
          value={subscriptionStats?.monthlyRevenue || 0}
          growth="12.4"
          isCurrency
        />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        {/* Revenue Chart */}
        <div style={{ ...cardStyle, minHeight: 350, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DASHBOARD_THEME.textPrimary, margin: 0 }}>Revenue Trend</h3>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            {historicalStats && (
              <Line
                data={{
                  labels: historicalStats.labels,
                  datasets: [{
                    label: 'Revenue',
                    data: historicalStats.datasets[0].data,
                    borderColor: DASHBOARD_THEME.accent,
                    backgroundColor: (context: any) => {
                      const ctx = context.chart.ctx;
                      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.1)');
                      gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
                      return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: DASHBOARD_THEME.accent,
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1e293b", padding: 8, cornerRadius: 6, titleFont: { size: 12 }, bodyFont: { size: 12 } } },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: DASHBOARD_THEME.textSecondary, font: { size: 11 } } },
                    y: { grid: { color: "#f1f5f9" }, ticks: { color: DASHBOARD_THEME.textSecondary, font: { size: 11 }, callback: (val) => '$' + val }, border: { display: false } }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Property Doughnut */}
        <div style={{ ...cardStyle, minHeight: 350, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: DASHBOARD_THEME.textPrimary, marginBottom: 24 }}>Portfolio Mix</h3>
          <div style={{ flex: 1, position: "relative" }}>
            {propertyStats?.propertiesByType && (
              <Doughnut
                data={{
                  labels: propertyStats.propertiesByType.map((p: any) => p.PType),
                  datasets: [{
                    data: propertyStats.propertiesByType.map((p: any) => p.count),
                    backgroundColor: [DASHBOARD_THEME.info, DASHBOARD_THEME.accent, DASHBOARD_THEME.success, DASHBOARD_THEME.warning, DASHBOARD_THEME.danger],
                    borderWidth: 0,
                    hoverOffset: 10
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: DASHBOARD_THEME.textSecondary, usePointStyle: true, padding: 16, font: { size: 11 }, boxWidth: 8 } }
                  },
                  cutout: '75%'
                }}
              />
            )}
            <div style={{ position: "absolute", top: "42%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: DASHBOARD_THEME.textPrimary }}>{propertyStats?.totalProperties}</div>
              <div style={{ fontSize: 11, color: DASHBOARD_THEME.textSecondary, textTransform: "uppercase" }}>Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Dynamics */}
      <div className={styles.metricsGrid}>
        <MetricBox label="Conversion Rate" value={`${subscriptionStats?.conversionRate?.toFixed(1) || 0}%`} sub="Paid / Total" />
        <MetricBox label="Avg. Revenue" value={`$${((subscriptionStats?.monthlyRevenue || 0) / (subscriptionStats?.activeSubscriptions || 1)).toFixed(0)}`} sub="Per Subscriber" />
        <MetricBox label="Active Trials" value={subscriptionStats?.trialingSubscriptions || 0} sub="Potential Leads" />
      </div>
    </div>
  );
};

// --- Sub-components ---

const StatCard = ({ icon, color, bg, label, value, growth, isCurrency }: any) => (
  <div
    style={{
      background: DASHBOARD_THEME.cardBg,
      borderRadius: 12,
      padding: 24,
      border: `1px solid ${DASHBOARD_THEME.cardBorder}`,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: DASHBOARD_THEME.textSecondary, textTransform: "uppercase" }}>{label}</div>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: DASHBOARD_THEME.textPrimary }}>
        {isCurrency && "$"}
        <CountUp end={value} duration={1} separator="," />
      </div>
      {growth && (
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: parseFloat(growth) >= 0 ? DASHBOARD_THEME.success : DASHBOARD_THEME.danger,
        }}>
          {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
        </div>
      )}
    </div>
  </div>
);

const MetricBox = ({ label, value, sub }: any) => (
  <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: `1px solid ${DASHBOARD_THEME.cardBorder}` }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: DASHBOARD_THEME.textSecondary, marginBottom: 4, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: DASHBOARD_THEME.textPrimary }}>{value}</div>
    <div style={{ fontSize: 12, color: DASHBOARD_THEME.textSecondary, marginTop: 2 }}>{sub}</div>
  </div>
);

export default AdminAnalyticsPage;
