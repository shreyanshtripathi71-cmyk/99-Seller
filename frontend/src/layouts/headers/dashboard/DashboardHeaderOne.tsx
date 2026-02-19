"use client"
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from "@/context/AuthContext";

const DashboardHeaderOne = ({ isActive, setIsActive }: any) => {
   const pathname = usePathname();
   const router = useRouter();
   const { logout, user, subscription, isTrialActive, getTrialDaysRemaining, isAdmin } = useAuth();

   const handleLogout = () => {
      logout();
      router.push("/");
   };

   return (
      <aside className={`dash-aside-navbar ${isActive ? "show" : ""}`}>
         <div className="position-relative">
            <div className="logo d-md-block d-flex align-items-center justify-content-between plr bottom-line pb-30">
               <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>99<span style={{ color: '#2563eb' }}>Sellers</span></span>
               </Link>
               <button onClick={() => setIsActive(false)} className="close-btn d-block d-md-none"><i className="fa-light fa-circle-xmark"></i></button>
            </div>
            <nav className="dasboard-main-nav pt-30 pb-30 bottom-line">
               <ul className="style-none">
                  {/* Admin Panel Link - Only visible for admins */}
                  {isAdmin && (
                     <li className="plr" style={{ marginBottom: 12 }}>
                        <Link href="/admin" className="d-flex w-100 align-items-center" style={{
                           padding: '12px 16px',
                           background: 'linear-gradient(135deg, #dc2626, #7c3aed)',
                           borderRadius: 10,
                           color: '#fff',
                           textDecoration: 'none',
                           fontWeight: 600,
                           fontSize: 14,
                           gap: 10,
                           boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                           transition: 'all 0.2s ease'
                        }}>
                           <div style={{
                              width: 36, height: 36, borderRadius: 8,
                              background: 'rgba(255,255,255,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                           }}>
                              <i className="fa-solid fa-user-shield" style={{ fontSize: 16 }}></i>
                           </div>
                           <span>Admin Panel</span>
                        </Link>
                     </li>
                  )}
                  <li className="plr"><Link href="/search" className={`d-flex w-100 align-items-center ${pathname === '/search' ? 'active' : ''}`}>
                     <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: pathname === '/search' ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                        <i className={`fa-solid fa-gauge-high ${pathname === '/search' ? 'text-primary' : ''}`}></i>
                     </div>
                     <span>Dashboard</span>
                  </Link></li>
                  <li className="plr"><Link href="/search" className={`d-flex w-100 align-items-center ${pathname === '/search' ? 'active' : ''}`}>
                     <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: pathname === '/search' ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                        <i className={`fa-solid fa-magnifying-glass ${pathname === '/search' ? 'text-primary' : ''}`}></i>
                     </div>
                     <span>Search Leads</span>
                  </Link></li>
                  <li className="bottom-line pt-30 lg-pt-20 mb-40 lg-mb-30"></li>
                  <li><div className="nav-title">Leads</div></li>
                  <li className="plr"><Link href="/dashboard/favourites" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/favourites' || pathname === '/dashboard/saved-leads' ? 'active' : ''}`}>
                     <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: (pathname === '/dashboard/favourites' || pathname === '/dashboard/saved-leads') ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                        <i className={`fa-solid fa-heart ${(pathname === '/dashboard/favourites' || pathname === '/dashboard/saved-leads') ? 'text-primary' : ''}`}></i>
                     </div>
                     <span>Saved Leads</span>
                  </Link></li>
                  <li className="plr"><Link href="/dashboard/saved-search" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/saved-search' || pathname === '/dashboard/saved-searches' ? 'active' : ''}`}>
                     <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: (pathname === '/dashboard/saved-search' || pathname === '/dashboard/saved-searches') ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                        <i className={`fa-solid fa-bookmark ${(pathname === '/dashboard/saved-search' || pathname === '/dashboard/saved-searches') ? 'text-primary' : ''}`}></i>
                     </div>
                     <span>Saved Searches</span>
                  </Link></li>
                  <li className="plr"><Link href="/dashboard/analytics" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/analytics' ? 'active' : ''}`}>
                     <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: pathname === '/dashboard/analytics' ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                        <i className={`fa-solid fa-chart-line ${pathname === '/dashboard/analytics' ? 'text-primary' : ''}`}></i>
                     </div>
                     <span>Analytics</span>
                  </Link></li>
                  <li className="plr"><Link href="/dashboard/export" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/export' ? 'active' : ''}`}>
                     <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: pathname === '/dashboard/export' ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                        <i className={`fa-solid fa-download ${pathname === '/dashboard/export' ? 'text-primary' : ''}`}></i>
                     </div>
                     <span>Export Data</span>
                  </Link></li>
                  <li className="bottom-line pt-30 lg-pt-20 mb-40 lg-mb-30"></li>
                  <li><div className="nav-title">Account</div></li>
                  <li className="plr"><Link href="/dashboard/profile" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/profile' ? 'active' : ''}`}>
                     <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: pathname === '/dashboard/profile' ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                        <i className={`fa-solid fa-user ${pathname === '/dashboard/profile' ? 'text-primary' : ''}`}></i>
                     </div>
                     <span>Profile</span>
                  </Link></li>
                  <li className="plr"><Link href="/dashboard/subscription" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/subscription' || pathname === '/dashboard/membership' ? 'active' : ''}`}>
                     <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: (pathname === '/dashboard/subscription' || pathname === '/dashboard/membership') ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                        <i className={`fa-solid fa-crown ${(pathname === '/dashboard/subscription' || pathname === '/dashboard/membership') ? 'text-primary' : ''}`}></i>
                     </div>
                     <span>Subscription</span>
                  </Link></li>
                  <li className="plr"><Link href="/dashboard/account-settings" className={`d-flex w-100 align-items-center ${pathname === '/dashboard/account-settings' ? 'active' : ''}`}>
                     <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40, background: pathname === '/dashboard/account-settings' ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                        <i className={`fa-solid fa-gear ${pathname === '/dashboard/account-settings' ? 'text-primary' : ''}`}></i>
                     </div>
                     <span>Settings</span>
                  </Link></li>
               </ul>
            </nav>

            {/* Trial/Subscription Status */}
            {isTrialActive() ? (
               <div className="plr pb-35">
                  <div style={{ padding: "16px", background: "rgba(37, 99, 235, 0.1)", borderRadius: "12px", border: "1px solid rgba(37, 99, 235, 0.2)" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <i className="fa-solid fa-clock" style={{ color: "#2563EB" }}></i>
                        <span style={{ fontWeight: 600, fontSize: "14px" }}>Trial Active</span>
                     </div>
                     <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{getTrialDaysRemaining()} days remaining</p>
                     <Link href="/dashboard/subscription" style={{ display: "block", marginTop: "12px", padding: "8px 16px", background: "#2563EB", color: "white", borderRadius: "8px", textAlign: "center", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                        Upgrade Now
                     </Link>
                  </div>
               </div>
            ) : subscription?.plan === "free" ? (
               <div className="plr pb-35">
                  <div style={{ padding: "16px", background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)", borderRadius: "12px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <i className="fa-solid fa-crown" style={{ color: "#F59E0B" }}></i>
                        <span style={{ fontWeight: 600, fontSize: "14px" }}>Free Plan</span>
                     </div>
                     <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Limited access</p>
                     <Link href="/dashboard/subscription" style={{ display: "block", marginTop: "12px", padding: "8px 16px", background: "#F59E0B", color: "white", borderRadius: "8px", textAlign: "center", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
                        Start Free Trial
                     </Link>
                  </div>
               </div>
            ) : null}

            <div className="plr">
               <button onClick={handleLogout} className="d-flex w-100 align-items-center logout-btn" style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <div className="icon tran3s d-flex align-items-center justify-content-center rounded-circle" style={{ width: 40, height: 40 }}>
                     <i className="fa-solid fa-right-from-bracket"></i>
                  </div>
                  <span>Logout</span>
               </button>
            </div>
         </div>
      </aside>
   )
}

export default DashboardHeaderOne;
