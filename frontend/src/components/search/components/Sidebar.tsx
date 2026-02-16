"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Subscription } from "@/context/AuthContext";
import styles from "../styles/dashboard.module.scss";

interface SidebarProps {
  userPlan: "Free" | "Premium";
  onUpgrade: () => void;
  subscription?: Subscription | null;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    section: "Discover",
    items: [
      { href: "/search", icon: "fa-solid fa-magnifying-glass", label: "Search Leads" },
      { href: "/dashboard/saved-leads", icon: "fa-regular fa-bookmark", label: "Saved Leads" },
      { href: "/dashboard/saved-searches", icon: "fa-regular fa-folder", label: "Saved Searches" },
    ],
  },
  {
    section: "Tools",
    items: [
      { href: "/dashboard/export", icon: "fa-solid fa-download", label: "Export Data" },
    ],
  },
  {
    section: "Account",
    items: [
      { href: "/dashboard/profile", icon: "fa-regular fa-user", label: "Profile" },
      { href: "/dashboard/billing", icon: "fa-regular fa-credit-card", label: "Billing" },
      { href: "/dashboard/subscription", icon: "fa-solid fa-crown", label: "Subscription" },
      { href: "/dashboard/account-settings", icon: "fa-solid fa-gear", label: "Settings" },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ userPlan, onUpgrade, subscription, isOpen, onClose }) => {
  const pathname = usePathname();

  // Get plan display name - standardized to PREMIUM for paid users
  const getPlanName = () => {
    if (subscription?.status === "trialing") {
      return `Trial (${subscription.trialDaysRemaining || 0} days left)`;
    }
    // Always show PREMIUM for paid users for consistency
    return userPlan === "Premium" ? "PREMIUM" : "FREE";
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.show : ""}`}>
      {/* Brand */}
      <div className={styles.sidebar_brand}>
        <Link href="/" className={styles.brand_logo}>
          99<span>Sellers</span>
        </Link>

        {/* Close button for mobile */}
        <button
          className="d-lg-none border-0 bg-transparent ms-auto"
          onClick={onClose}
          style={{ fontSize: '20px', color: '#64748B' }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.sidebar_nav}>
        {navItems.map((section) => (
          <div key={section.section} className={styles.nav_section}>
            <div className={styles.nav_label}>{section.section}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.nav_item} ${pathname === item.href ? styles.active : ""}`}
              >
                <i className={item.icon}></i>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.sidebar_footer}>
        {userPlan === "Free" ? (
          <div style={{
            padding: 16,
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <i className="fa-solid fa-bolt" style={{ color: "#fff", fontSize: 14 }}></i>
              </div>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#1E293B" }}>Go Premium</span>
            </div>
            <p style={{
              fontSize: 12,
              color: "#64748B",
              margin: "0 0 12px",
              lineHeight: 1.5
            }}>
              Unlock full addresses, owner contacts, and exports.
            </p>
            <button
              onClick={onUpgrade}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "#2563EB",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              Upgrade Now
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <span className={styles.pro_badge}>{getPlanName()}</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
