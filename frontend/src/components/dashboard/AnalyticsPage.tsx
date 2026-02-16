"use client";

import React, { useState } from "react";
import DashboardShell from "@/components/search/DashboardShell";
import styles from "@/components/search/styles/dashboard.module.scss";

// Mock analytics data
const ANALYTICS_DATA = {
  overview: {
    totalSearches: 156,
    searchesChange: 12.5,
    leadsViewed: 1248,
    leadsChange: 8.3,
    leadsSaved: 89,
    savedChange: 15.2,
    exportsCount: 24,
    exportsChange: -3.1,
  },
  recentSearches: [
    { id: 1, query: "Foreclosures in Texas", results: 234, date: "2025-03-27" },
    { id: 2, query: "High Equity Properties, CA", results: 156, date: "2025-03-26" },
    { id: 3, query: "Divorce Cases, Florida", results: 89, date: "2025-03-25" },
    { id: 4, query: "Pre-Foreclosure, Arizona", results: 178, date: "2025-03-24" },
  ],
  topStates: [
    { state: "Texas", count: 456, percentage: 28 },
    { state: "California", count: 389, percentage: 24 },
    { state: "Florida", count: 298, percentage: 18 },
    { state: "Arizona", count: 234, percentage: 14 },
    { state: "Nevada", count: 167, percentage: 10 },
  ],
  weeklyActivity: [
    { day: "Mon", searches: 24, leads: 156 },
    { day: "Tue", searches: 31, leads: 198 },
    { day: "Wed", searches: 18, leads: 112 },
    { day: "Thu", searches: 28, leads: 187 },
    { day: "Fri", searches: 35, leads: 234 },
    { day: "Sat", searches: 12, leads: 78 },
    { day: "Sun", searches: 8, leads: 45 },
  ],
};

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const maxActivity = Math.max(...ANALYTICS_DATA.weeklyActivity.map(d => d.leads));

  const formatChange = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={isPositive ? styles.textSuccess : styles.textDanger}>
        <i className={`fa-solid fa-arrow-${isPositive ? "up" : "down"} me-1`}></i>
        {Math.abs(value)}%
      </span>
    );
  };

  return (
    <DashboardShell
      title="Analytics"
      subtitle="Track your search activity and lead insights"
      actions={
        <div className={styles.btnGroup}>
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              className={`${styles.btn} ${timeRange === range ? styles.btnPrimary : styles.btnSecondary}`}
              onClick={() => setTimeRange(range)}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      }
    >
      <div className={styles.pageContent}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563EB" }}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{ANALYTICS_DATA.overview.totalSearches}</span>
              <span className={styles.statLabel}>Total Searches</span>
            </div>
            <div className={styles.statChange}>
              {formatChange(ANALYTICS_DATA.overview.searchesChange)}
              <span className={styles.statPeriod}>vs last period</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
              <i className="fa-solid fa-eye"></i>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{ANALYTICS_DATA.overview.leadsViewed.toLocaleString()}</span>
              <span className={styles.statLabel}>Leads Viewed</span>
            </div>
            <div className={styles.statChange}>
              {formatChange(ANALYTICS_DATA.overview.leadsChange)}
              <span className={styles.statPeriod}>vs last period</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#F59E0B" }}>
              <i className="fa-solid fa-bookmark"></i>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{ANALYTICS_DATA.overview.leadsSaved}</span>
              <span className={styles.statLabel}>Leads Saved</span>
            </div>
            <div className={styles.statChange}>
              {formatChange(ANALYTICS_DATA.overview.savedChange)}
              <span className={styles.statPeriod}>vs last period</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8B5CF6" }}>
              <i className="fa-solid fa-download"></i>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{ANALYTICS_DATA.overview.exportsCount}</span>
              <span className={styles.statLabel}>Exports</span>
            </div>
            <div className={styles.statChange}>
              {formatChange(ANALYTICS_DATA.overview.exportsChange)}
              <span className={styles.statPeriod}>vs last period</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className={styles.row}>
          {/* Activity Chart */}
          <div className={styles.col8}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Weekly Activity</h3>
                <div className={styles.cardActions}>
                  <span className={styles.legendDot} style={{ background: "#2563EB" }}></span>
                  <span className={styles.legendLabel}>Leads</span>
                  <span className={styles.legendDot} style={{ background: "#10B981", marginLeft: "16px" }}></span>
                  <span className={styles.legendLabel}>Searches</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.chartContainer}>
                  {ANALYTICS_DATA.weeklyActivity.map((day, index) => (
                    <div key={index} className={styles.chartBar}>
                      <div className={styles.barContainer}>
                        <div
                          className={styles.barFill}
                          style={{
                            height: `${(day.leads / maxActivity) * 100}%`,
                            background: "linear-gradient(180deg, #2563EB 0%, #1E40AF 100%)",
                          }}
                        >
                          <span className={styles.barTooltip}>{day.leads} leads</span>
                        </div>
                      </div>
                      <span className={styles.barLabel}>{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top States */}
          <div className={styles.col4}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Top States</h3>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.statesList}>
                  {ANALYTICS_DATA.topStates.map((item, index) => (
                    <div key={index} className={styles.stateItem}>
                      <div className={styles.stateInfo}>
                        <span className={styles.stateRank}>#{index + 1}</span>
                        <span className={styles.stateName}>{item.state}</span>
                        <span className={styles.stateCount}>{item.count}</span>
                      </div>
                      <div className={styles.stateBar}>
                        <div
                          className={styles.stateBarFill}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Searches */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Searches</h3>
            <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
              View All <i className="fa-solid fa-arrow-right ms-1"></i>
            </button>
          </div>
          <div className={styles.cardBody}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Search Query</th>
                  <th>Results</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ANALYTICS_DATA.recentSearches.map((search) => (
                  <tr key={search.id}>
                    <td>
                      <div className={styles.searchQuery}>
                        <i className="fa-solid fa-magnifying-glass text-muted me-2"></i>
                        {search.query}
                      </div>
                    </td>
                    <td>
                      <span className={styles.badge}>{search.results} leads</span>
                    </td>
                    <td className={styles.textMuted}>
                      {new Date(search.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>
                        <i className="fa-solid fa-play me-1"></i>
                        Run Again
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default AnalyticsPage;
