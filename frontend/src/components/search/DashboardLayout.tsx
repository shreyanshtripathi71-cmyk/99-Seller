"use client"
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./dashboard.module.scss";

interface DashboardLayoutProps {
   children: React.ReactNode;
   userPlan: 'Free' | 'Pro';
   onUpgrade: () => void;
}

const DashboardLayout = ({ children, userPlan, onUpgrade }: DashboardLayoutProps) => {
   return (
      <div className={styles.dashboard_layout}>
         {/* SIDEBAR */}
         <motion.aside
            className={styles.sidebar}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
         >
            <Link href="/" className={styles.logo_area}>
               <div style={{
                  width: 18,
                  height: 18,
                  background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                  borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
               }}></div>
               <span style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
               }}>
                  99Sellers
               </span>
            </Link>

            <nav className={styles.nav_menu}>
               <motion.div
                  className={`${styles.nav_item} ${styles.active}`}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
               >
                  <i className="fa-solid fa-search"></i>
                  <span>Search Leads</span>
                  <div className={styles.active_indicator}></div>
               </motion.div>

               <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <Link href="/dashboard/favorites" className={styles.nav_item}>
                     <i className="fa-solid fa-heart"></i>
                     <span>Saved Addresses</span>
                  </Link>
               </motion.div>

               <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <Link href="/dashboard/saved-search" className={styles.nav_item}>
                     <i className="fa-solid fa-bookmark"></i>
                     <span>Saved Searches</span>
                  </Link>
               </motion.div>

               <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <Link href="/dashboard/profile" className={styles.nav_item}>
                     <i className="fa-solid fa-user"></i>
                     <span>Account</span>
                  </Link>
               </motion.div>

               <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                  <Link href="/dashboard/membership" className={styles.nav_item}>
                     <i className="fa-solid fa-credit-card"></i>
                     <span>Billing</span>
                  </Link>
               </motion.div>
            </nav>

            {/* UPGRADE CARD */}
            {userPlan === 'Free' && (
               <motion.div
                  style={{
                     marginTop: 'auto',
                     padding: '16px',
                     background: '#F8FAFC',
                     borderRadius: '12px',
                     border: '1px solid #E2E8F0',
                     position: 'relative',
                     overflow: 'hidden'
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
               >
                  <div style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: '8px',
                     marginBottom: '8px'
                  }}>
                     <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                     }}>
                        <i className="fa-solid fa-bolt" style={{ color: '#fff', fontSize: 12 }}></i>
                     </div>
                     <span style={{
                        fontSize: '13px',
                        color: '#1E293B',
                        fontWeight: '600'
                     }}>
                        Go Premium
                     </span>
                  </div>
                  <p style={{
                     fontSize: '11px',
                     color: '#64748B',
                     marginBottom: '12px',
                     lineHeight: '1.5'
                  }}>
                     Unlock full addresses and owner contact info
                  </p>
                  <motion.button
                     onClick={onUpgrade}
                     style={{
                        width: '100%',
                        background: '#2563EB',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                     }}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                  >
                     Upgrade Now
                  </motion.button>
               </motion.div>
            )}

            {/* PRO BADGE */}
            {userPlan === 'Pro' && (
               <motion.div
                  style={{
                     marginTop: 'auto',
                     padding: '12px',
                     background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                     borderRadius: '12px',
                     border: '1px solid #BFDBFE',
                     textAlign: 'center'
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
               >
                  <div style={{
                     fontSize: '12px',
                     color: '#1E40AF',
                     fontWeight: '700',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '6px'
                  }}>
                     <i className="fa-solid fa-crown" style={{ color: '#F59E0B' }}></i>
                     Pro Member
                  </div>
               </motion.div>
            )}
         </motion.aside>

         {/* MAIN CONTENT */}
         <main className={styles.main_content}>
            {children}
         </main>
      </div>
   );
};

export default DashboardLayout;
