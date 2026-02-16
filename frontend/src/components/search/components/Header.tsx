"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "../styles/dashboard.module.scss";

interface HeaderProps {
  title: string;
  subtitle?: string;
  userPlan: "Free" | "Premium";
  actions?: React.ReactNode;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  userPlan,
  actions,
  userName = "User",
  userEmail = "",
  userInitials = "U",
  onLogout,
  onMenuClick,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className={styles.top_header}>
      <div className={styles.header_left}>
        <button
          className={styles.menu_toggle}
          onClick={onMenuClick}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <h1 className={styles.page_title}>{title}</h1>
        {subtitle && (
          <span className={`${styles.badge} ${styles.badge_success}`}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10B981",
                display: "inline-block",
              }}
            ></span>
            {subtitle}
          </span>
        )}
      </div>

      <div className={styles.header_right}>
        {/* Page Actions */}
        {actions && <div className={styles.header_actions}>{actions}</div>}

        {/* User Menu */}
        <div style={{ position: "relative" }}>
          <button
            className={styles.user_avatar}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {userInitials}
          </button>

          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 49,
                }}
                onClick={() => setShowUserMenu(false)}
              />

              <div className={styles.user_dropdown}>
                <div className={styles.user_info}>
                  <p className={styles.user_name}>{userName}</p>
                  <p className={styles.user_email}>{userEmail}</p>
                  {userPlan === "Premium" && (
                    <span className={styles.pro_badge} style={{ marginTop: 8 }}>
                      PREMIUM
                    </span>
                  )}
                </div>

                <Link
                  href="/dashboard/profile"
                  className={styles.user_menu_item}
                  onClick={() => setShowUserMenu(false)}
                >
                  <i className="fa-regular fa-user"></i>
                  Profile
                </Link>
                <Link
                  href="/dashboard/subscription"
                  className={styles.user_menu_item}
                  onClick={() => setShowUserMenu(false)}
                >
                  <i className="fa-regular fa-credit-card"></i>
                  Billing
                </Link>

                <div className={styles.user_menu_divider} />

                <button
                  className={`${styles.user_menu_item} ${styles.danger}`}
                  onClick={handleLogout}
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
