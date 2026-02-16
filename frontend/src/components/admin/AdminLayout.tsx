"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AdminLayout.module.scss";

interface AdminLayoutProps {
  children: React.ReactNode;
}

import { DASHBOARD_THEME } from "./theme";

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // Standardized breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/signin?redirect=/admin");
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: DASHBOARD_THEME.mainBg }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const navGroups = [
    {
      label: "Overview",
      items: [
        { href: "/admin", icon: "fa-gauge-high", label: "Dashboard" },
        { href: "/admin/analytics", icon: "fa-chart-line", label: "Analytics" },
        { href: "/admin/auctions", icon: "fa-gavel", label: "Auctions" },
        { href: "/admin/payments", icon: "fa-money-bill-wave", label: "Payments" },
        { href: "/admin/feedback", icon: "fa-comment-dots", label: "Feedback" },
      ],
    },
    {
      label: "Management",
      items: [
        { href: "/admin/users", icon: "fa-users", label: "Users" },
        { href: "/admin/subscriptions", icon: "fa-credit-card", label: "Subscriptions" },
        { href: "/admin/poppins", icon: "fa-bullhorn", label: "Marketing Pop-ins" },
        { href: "/admin/content", icon: "fa-palette", label: "Site Content" },
      ],
    },
    {
      label: "Data",
      items: [
        { href: "/admin/properties", icon: "fa-building", label: "Properties" },
        { href: "/admin/owners", icon: "fa-user-tie", label: "Owners" },
        { href: "/admin/loans", icon: "fa-hand-holding-dollar", label: "Loans" },
        { href: "/admin/data-import", icon: "fa-file-import", label: "Data Import" },
      ],
    },
    {
      label: "System",
      items: [
        { href: "/admin/crawler", icon: "fa-spider", label: "Crawler" },
        { href: "/admin/settings", icon: "fa-gear", label: "Settings" },
        { href: "/admin/profile", icon: "fa-user-shield", label: "Profile" },
      ],
    },
  ];

  const sidebarVariants = {
    open: {
      width: 260,
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" as any }
    },
    collapsed: {
      width: 80,
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" as any }
    },
    mobileOpen: {
      width: 260,
      x: 0,
      transition: { duration: 0.3, ease: "easeInOut" as any }
    },
    mobileHidden: {
      width: 260,
      x: -260,
      transition: { duration: 0.3, ease: "easeInOut" as any }
    }
  };

  const getSidebarState = () => {
    if (isMobile) return sidebarOpen ? "mobileOpen" : "mobileHidden";
    return sidebarOpen ? "open" : "collapsed";
  };

  return (
    <div className={styles.layoutRoot} style={{
      // @ts-ignore
      "--main-bg": DASHBOARD_THEME.mainBg,
      "--sidebar-bg": DASHBOARD_THEME.sidebarBg,
      "--sidebar-border": DASHBOARD_THEME.sidebarBorder,
    }}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className={styles.mobileOverlay}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={getSidebarState()}
        variants={sidebarVariants}
        className={styles.sidebar}
      >
        <div style={{ padding: "24px 24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              minWidth: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
            }}>
              99
            </div>
            {(sidebarOpen || (isMobile && sidebarOpen)) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontWeight: 700, fontSize: 18, color: DASHBOARD_THEME.textPrimary, letterSpacing: "-0.01em" }}>
                Admin<span style={{ color: DASHBOARD_THEME.textSecondary }}>Panel</span>
              </motion.div>
            )}
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: "none", border: "none", color: DASHBOARD_THEME.textSecondary, fontSize: 18, cursor: "pointer" }}
            >
              <i className="fa-solid fa-times"></i>
            </button>
          )}
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: 24 }}>
              {sidebarOpen && (
                <div style={{ padding: "0 12px", marginBottom: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
                  {group.label}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 8,
                        color: isActive ? DASHBOARD_THEME.activeText : DASHBOARD_THEME.textSecondary,
                        background: isActive ? DASHBOARD_THEME.activeBg : "transparent",
                        textDecoration: "none",
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 500,
                        transition: "all 0.2s ease"
                      }}
                    >
                      <i className={`fa-solid ${item.icon}`} style={{ width: 20, textAlign: "center", fontSize: 14 }}></i>
                      {sidebarOpen && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{item.label}</motion.span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div style={{ padding: 16, borderTop: `1px solid ${DASHBOARD_THEME.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, background: DASHBOARD_THEME.hoverBg }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#475569" }}>
              {user?.name?.[0] || "A"}
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: DASHBOARD_THEME.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Admin User"}</div>
                <div style={{ fontSize: 11, color: DASHBOARD_THEME.textSecondary }}>Administrator</div>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={logout} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}>
                <i className="fa-solid fa-power-off"></i>
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`${styles.mainWrapper} ${isMobile ? styles.main_mobile :
          (sidebarOpen ? styles.main_with_sidebar : styles.main_with_collapsed_sidebar)
        }`}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", color: DASHBOARD_THEME.textSecondary, fontSize: 16 }}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: DASHBOARD_THEME.textPrimary, margin: 0 }}>
              {navGroups.flatMap(g => g.items).find(i => i.href === pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/dashboard" style={{
              fontSize: 13, fontWeight: 500, color: "#fff", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, background: "linear-gradient(135deg, #2563eb, #4f46e5)", border: "none", boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
            }}>
              <i className="fa-solid fa-gauge" style={{ fontSize: 12 }}></i>
              Go to Dashboard
            </Link>
            <Link href="/" target="_blank" style={{
              fontSize: 13, fontWeight: 500, color: DASHBOARD_THEME.textSecondary, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 20, background: "#fff", border: `1px solid ${DASHBOARD_THEME.sidebarBorder}`
            }}>
              View Live Site <i className="fa-solid fa-external-link-alt" style={{ fontSize: 11 }}></i>
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
