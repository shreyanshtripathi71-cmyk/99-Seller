"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Subscription, useAuth } from "@/context/AuthContext";
import styles from "@/components/search/styles/dashboard.module.scss";

/** ==========================================
 *  COMPONENT: Sidebar
 *  ========================================== */
export interface SidebarProps {
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

export const Sidebar: React.FC<SidebarProps> = ({ userPlan, onUpgrade, subscription, isOpen, onClose }) => {
    const pathname = usePathname();

    const getPlanName = () => {
        if (subscription?.status === "trialing") {
            return `Trial (${subscription.trialDaysRemaining || 0} days left)`;
        }
        return userPlan === "Premium" ? "PREMIUM" : "FREE";
    };

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.show : ""}`}>
            <div className={styles.sidebar_brand}>
                <Link href="/" className={styles.brand_logo}>
                    99<span>Sellers</span>
                </Link>
                <button className="d-lg-none border-0 bg-transparent ms-auto" onClick={onClose} style={{ fontSize: '20px', color: '#64748B' }}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <nav className={styles.sidebar_nav}>
                {navItems.map((section) => (
                    <div key={section.section} className={styles.nav_section}>
                        <div className={styles.nav_label}>{section.section}</div>
                        {section.items.map((item) => (
                            <Link key={item.href} href={item.href} className={`${styles.nav_item} ${pathname === item.href ? styles.active : ""}`}>
                                <i className={item.icon}></i>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            <div className={styles.sidebar_footer}>
                {userPlan === "Free" ? (
                    <div style={{ padding: 16, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="fa-solid fa-bolt" style={{ color: "#fff", fontSize: 14 }}></i>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 14, color: "#1E293B" }}>Go Premium</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 12px", lineHeight: 1.5 }}>
                            Unlock full addresses, owner contacts, and exports.
                        </p>
                        <button onClick={onUpgrade} style={{ width: "100%", padding: "10px 16px", background: "#2563EB", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>
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


/** ==========================================
 *  COMPONENT: Header
 *  ========================================== */
export interface HeaderProps {
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

export const Header: React.FC<HeaderProps> = ({
    title, subtitle, userPlan, actions, userName = "User", userEmail = "", userInitials = "U", onLogout, onMenuClick,
}) => {
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        setShowUserMenu(false);
        if (onLogout) onLogout();
    };

    return (
        <header className={styles.top_header}>
            <div className={styles.header_left}>
                <button className={styles.menu_toggle} onClick={onMenuClick}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <h1 className={styles.page_title}>{title}</h1>
                {subtitle && (
                    <span className={`${styles.badge} ${styles.badge_success}`}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }}></span>
                        {subtitle}
                    </span>
                )}
            </div>

            <div className={styles.header_right}>
                {actions && <div className={styles.header_actions}>{actions}</div>}

                <div style={{ position: "relative" }}>
                    <button className={styles.user_avatar} onClick={() => setShowUserMenu(!showUserMenu)}>{userInitials}</button>
                    {showUserMenu && (
                        <>
                            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 49 }} onClick={() => setShowUserMenu(false)} />
                            <div className={styles.user_dropdown}>
                                <div className={styles.user_info}>
                                    <p className={styles.user_name}>{userName}</p>
                                    <p className={styles.user_email}>{userEmail}</p>
                                    {userPlan === "Premium" && <span className={styles.pro_badge} style={{ marginTop: 8 }}>PREMIUM</span>}
                                </div>
                                <Link href="/dashboard/profile" className={styles.user_menu_item} onClick={() => setShowUserMenu(false)}><i className="fa-regular fa-user"></i>Profile</Link>
                                <Link href="/dashboard/subscription" className={styles.user_menu_item} onClick={() => setShowUserMenu(false)}><i className="fa-regular fa-credit-card"></i>Billing</Link>
                                <div className={styles.user_menu_divider} />
                                <button className={`${styles.user_menu_item} ${styles.danger}`} onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i>Sign Out</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};


/** ==========================================
 *  COMPONENT: DashboardLayout
 *  ========================================== */
export interface DashboardLayoutProps {
    children: React.ReactNode;
    userPlan: 'Free' | 'Pro' | 'Premium';
    onUpgrade: () => void;
}

export const DashboardLayout = ({ children, userPlan, onUpgrade }: DashboardLayoutProps) => {
    return (
        <div className={styles.dashboard_layout}>
            <motion.aside
                className={styles.sidebar}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Link href="/" className={styles.logo_area}>
                    <div style={{ width: 18, height: 18, background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)', borderRadius: 4, boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)' }}></div>
                    <span style={{ fontSize: '16px', fontWeight: '700', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>99Sellers</span>
                </Link>
                <nav className={styles.nav_menu}>
                    <motion.div className={`${styles.nav_item} ${styles.active}`} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <i className="fa-solid fa-search"></i><span>Search Leads</span><div className={styles.active_indicator}></div>
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link href="/dashboard/favorites" className={styles.nav_item}><i className="fa-solid fa-heart"></i><span>Saved Addresses</span></Link>
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link href="/dashboard/saved-search" className={styles.nav_item}><i className="fa-solid fa-bookmark"></i><span>Saved Searches</span></Link>
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link href="/dashboard/profile" className={styles.nav_item}><i className="fa-solid fa-user"></i><span>Account</span></Link>
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                        <Link href="/dashboard/membership" className={styles.nav_item}><i className="fa-solid fa-credit-card"></i><span>Billing</span></Link>
                    </motion.div>
                </nav>

                {userPlan === 'Free' && (
                    <motion.div
                        style={{ marginTop: 'auto', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden' }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="fa-solid fa-bolt" style={{ color: '#fff', fontSize: 12 }}></i>
                            </div>
                            <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: '600' }}>Go Premium</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '12px', lineHeight: '1.5' }}>Unlock full addresses and owner contact info</p>
                        <motion.button onClick={onUpgrade} style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Upgrade Now</motion.button>
                    </motion.div>
                )}

                {(userPlan === 'Pro' || userPlan === 'Premium') && (
                    <motion.div
                        style={{ marginTop: 'auto', padding: '12px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderRadius: '12px', border: '1px solid #BFDBFE', textAlign: 'center' }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div style={{ fontSize: '12px', color: '#1E40AF', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-crown" style={{ color: '#F59E0B' }}></i>Pro Member
                        </div>
                    </motion.div>
                )}
            </motion.aside>

            <main className={styles.main_content}>
                {children}
            </main>
        </div>
    );
};

/** ==========================================
 *  COMPONENT: DashboardShell
 *  ========================================== */
export interface DashboardShellProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children, title, subtitle, actions }) => {
    const { user, subscription, canAccessPremium, isTrialActive, logout } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const userPlan = canAccessPremium() || isTrialActive() ? "Premium" : "Free";
    const handleUpgrade = () => router.push("/dashboard/subscription");
    const handleLogout = () => { logout(); router.push("/signin"); };
    const userName = user?.name || user?.firstName || "User";
    const userEmail = user?.email || "";
    const userInitials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

    return (
        <div className={styles.dashboard_root}>
            <Sidebar userPlan={userPlan} onUpgrade={handleUpgrade} subscription={subscription} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className={`${styles.main_content} ${isSidebarOpen ? styles.sidebar_open : ""}`}>
                <div className={`${styles.sidebar_overlay} ${isSidebarOpen ? styles.show : ""}`} onClick={() => setIsSidebarOpen(false)} />
                <Header title={title} subtitle={subtitle} userPlan={userPlan} actions={actions} userName={userName} userEmail={userEmail} userInitials={userInitials} onLogout={handleLogout} onMenuClick={() => setIsSidebarOpen(true)} />
                <div className={styles.content_area}>{children}</div>
            </main>
        </div>
    );
};
