"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import styles from "./styles/dashboard.module.scss";

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  title,
  subtitle,
  actions,
}) => {
  const { user, subscription, canAccessPremium, isTrialActive, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Derive plan from actual subscription state
  const userPlan = canAccessPremium() || isTrialActive() ? "Premium" : "Free";

  const handleUpgrade = () => {
    router.push("/dashboard/subscription");
  };

  const handleLogout = () => {
    logout();
    router.push("/signin");
  };

  // Get user display info
  const userName = user?.name || user?.firstName || "User";
  const userEmail = user?.email || "";
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className={styles.dashboard_root}>
      <Sidebar
        userPlan={userPlan}
        onUpgrade={handleUpgrade}
        subscription={subscription}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className={`${styles.main_content} ${isSidebarOpen ? styles.sidebar_open : ""}`}>
        {/* Mobile Overlay */}
        <div
          className={`${styles.sidebar_overlay} ${isSidebarOpen ? styles.show : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />
        <Header
          title={title}
          subtitle={subtitle}
          userPlan={userPlan}
          actions={actions}
          userName={userName}
          userEmail={userEmail}
          userInitials={userInitials}
          onLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <div className={styles.content_area}>{children}</div>
      </main>
    </div>
  );
};

export default DashboardShell;
