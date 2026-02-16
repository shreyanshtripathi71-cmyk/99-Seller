"use client";

import React, { useEffect, useState } from "react";
import { adminAPI } from "@/services/api";
import Link from "next/link";
import { DASHBOARD_THEME } from "./theme";
import CountUp from 'react-countup';

interface DashboardStats {
  users: { totalUsers: number; adminUsers: number; regularUsers: number; newToday?: number };
  properties: { totalProperties: number; propertiesByType?: any[] };
  auctions: { total: number; upcoming: number };
  subscriptions: { activeSubscriptions: number; monthlyRevenue: number; trialingSubscriptions?: number };
}

interface RecentActivity {
  id: string;
  type: "user" | "subscription" | "property" | "login";
  message: string;
  time: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResult, propertiesResult, auctionsResult, subscriptionsResult, activityResult] = await Promise.all([
          adminAPI.users.getStats(),
          adminAPI.properties.getStats(),
          adminAPI.auctions.getStats(),
          adminAPI.subscriptions.getStats(),
          adminAPI.activities.getRecent()
        ]);

        setStats({
          users: usersResult.success ? usersResult.data : { totalUsers: 0, adminUsers: 0, regularUsers: 0, newToday: 0 },
          properties: propertiesResult.success ? propertiesResult.data : { totalProperties: 0 },
          auctions: auctionsResult.success ? auctionsResult.data : { total: 0, upcoming: 0 },
          subscriptions: subscriptionsResult.success ? subscriptionsResult.data : { activeSubscriptions: 0, monthlyRevenue: 0, trialingSubscriptions: 0 },
        });

        if (activityResult.success && activityResult.data) {
          const mapped = activityResult.data.slice(0, 8).map((a: any) => ({
            id: a.id.toString(),
            type: a.type,
            message: a.message,
            time: formatRelativeTime(new Date(a.createdAt))
          }));
          setRecentActivity(mapped);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user": return "fa-user-plus";
      case "subscription": return "fa-star";
      case "property": return "fa-house";
      case "login": return "fa-arrow-right-to-bracket";
      default: return "fa-bell";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user": return DASHBOARD_THEME.info;
      case "subscription": return DASHBOARD_THEME.success;
      case "property": return DASHBOARD_THEME.warning;
      case "login": return DASHBOARD_THEME.accent;
      default: return DASHBOARD_THEME.textSecondary;
    }
  };

  return (
    <div className="page-wrapper" style={{ gap: "2rem" }}>
      <header style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1.5rem"
      }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.25rem, 4vw, 1.5rem)", fontWeight: 700, color: DASHBOARD_THEME.textPrimary, margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: DASHBOARD_THEME.textSecondary, marginTop: "0.25rem" }}>
            Welcome back, Admin.
          </p>
        </div>
        <div style={{ fontSize: 13, color: DASHBOARD_THEME.textSecondary, background: "#fff", padding: "8px 12px", borderRadius: 8, border: `1px solid ${DASHBOARD_THEME.cardBorder}` }}>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </header>

      {/* 1. Stats Grid - Using Global Responsive Grid */}
      <div className="responsive-grid">
        {[
          {
            label: "Total Users",
            value: stats?.users?.totalUsers || 0,
            sub: `+${stats?.users?.newToday || 0} today`,
            icon: "fa-users",
            color: DASHBOARD_THEME.info,
            bg: "#eff6ff"
          },
          {
            label: "Active Subs",
            value: stats?.subscriptions?.activeSubscriptions || 0,
            sub: `${stats?.subscriptions?.trialingSubscriptions || 0} trialing`,
            icon: "fa-credit-card",
            color: DASHBOARD_THEME.accent,
            bg: "#f5f3ff"
          },
          {
            label: "Properties",
            value: stats?.properties?.totalProperties || 0,
            sub: "Listed on platform",
            icon: "fa-building",
            color: DASHBOARD_THEME.success,
            bg: "#ecfdf5"
          },
          {
            label: "Revenue (Mo)",
            value: stats?.subscriptions?.monthlyRevenue || 0,
            sub: "Estimated recurring",
            icon: "fa-chart-pie",
            isMoney: true,
            color: DASHBOARD_THEME.warning,
            bg: "#fffbeb"
          },
        ].map((item, idx) => (
          <div key={idx} style={{
            background: DASHBOARD_THEME.cardBg,
            borderRadius: 12,
            padding: 20,
            border: `1px solid ${DASHBOARD_THEME.cardBorder}`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: DASHBOARD_THEME.textSecondary, textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                <i className={`fa-solid ${item.icon}`}></i>
              </div>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: DASHBOARD_THEME.textPrimary }}>
              {loading ? "..." : (item.isMoney ? "$" : "")}
              {!loading && <CountUp end={item.value} separator="," duration={0.8} />}
            </div>
            <div style={{ fontSize: 13, color: DASHBOARD_THEME.textSecondary, marginTop: 4 }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main Content Split */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
        gap: "1.5rem"
      }}>

        {/* Recent Activity List */}
        <div style={{
          background: DASHBOARD_THEME.cardBg,
          borderRadius: 12,
          padding: 20,
          border: `1px solid ${DASHBOARD_THEME.cardBorder}`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: DASHBOARD_THEME.textPrimary,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>Recent Activity</span>
            <Link href="/admin/analytics" style={{ fontSize: 13, color: DASHBOARD_THEME.accent, textDecoration: "none" }}>View All</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <div key={activity.id} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: i < recentActivity.length - 1 ? `1px solid #f1f5f9` : "none"
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: getActivityColor(activity.type) }}></div>
                <div style={{ flex: 1, fontSize: 14, color: DASHBOARD_THEME.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activity.message}</div>
                <div style={{ fontSize: 12, color: DASHBOARD_THEME.textSecondary }}>{activity.time}</div>
              </div>
            )) : (
              <div style={{ padding: 20, textAlign: "center", color: DASHBOARD_THEME.textSecondary, fontSize: 14 }}>No activity found.</div>
            )}
          </div>
        </div>

        {/* Quick Actions & Property Overview Stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Property Overview */}
          <div style={{
            background: DASHBOARD_THEME.cardBg,
            borderRadius: 12,
            padding: 20,
            border: `1px solid ${DASHBOARD_THEME.cardBorder}`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: DASHBOARD_THEME.textPrimary,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>Property Overview</span>
              <Link href="/admin/properties" style={{ fontSize: 13, color: DASHBOARD_THEME.accent, textDecoration: "none" }}>Manage</Link>
            </div>
            <div style={{ display: "flex", gap: 4, height: 24, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
              {stats?.properties?.propertiesByType?.map((type: any, i: number) => (
                <div
                  key={i}
                  style={{
                    flex: type.count,
                    background: [DASHBOARD_THEME.info, DASHBOARD_THEME.success, DASHBOARD_THEME.warning, DASHBOARD_THEME.accent][i % 4],
                  }}
                  title={`${type.PType}: ${type.count}`}
                />
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem" }}>
              {stats?.properties?.propertiesByType?.map((type: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: [DASHBOARD_THEME.info, DASHBOARD_THEME.success, DASHBOARD_THEME.warning, DASHBOARD_THEME.accent][i % 4] }}></div>
                  <span style={{ fontSize: 13, color: DASHBOARD_THEME.textSecondary }}>{type.PType} <strong style={{ color: DASHBOARD_THEME.textPrimary }}>({type.count})</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: DASHBOARD_THEME.cardBg,
            borderRadius: 12,
            padding: 20,
            border: `1px solid ${DASHBOARD_THEME.cardBorder}`,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: DASHBOARD_THEME.textPrimary, marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { label: "Add User", icon: "fa-user-plus", href: "/admin/users?action=add" },
                { label: "New Announcement", icon: "fa-bullhorn", href: "/admin/poppins" },
                { label: "Import Data", icon: "fa-upload", href: "/admin/data-import" },
                { label: "System Settings", icon: "fa-cog", href: "/admin/settings" },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 8,
                  textDecoration: "none",
                  background: DASHBOARD_THEME.hoverBg,
                  color: DASHBOARD_THEME.textPrimary,
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "background 0.2s"
                }}>
                  <i className={`fa-solid ${link.icon}`} style={{ color: DASHBOARD_THEME.textSecondary, width: 20 }}></i>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
