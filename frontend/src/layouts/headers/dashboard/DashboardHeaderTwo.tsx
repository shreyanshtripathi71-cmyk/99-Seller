"use client"
import Link from "next/link"
import React from "react"
import { usePathname } from "next/navigation"

const DashboardHeaderTwo = ({ isActive, setIsActive }: any) => {
   const pathname = usePathname();

   const menuItems = [
      { title: "Dashboard", link: "/search", icon: "fa-light fa-grid-2" },
      { title: "Search Leads", link: "/search", icon: "fa-light fa-search" },
      { title: "Saved Leads", link: "/dashboard/favourites", icon: "fa-light fa-heart" },
      { title: "Saved Searches", link: "/dashboard/saved-search", icon: "fa-light fa-bookmark" },
      { title: "Membership", link: "/dashboard/membership", icon: "fa-light fa-credit-card-front" },
      { title: "Profile", link: "/dashboard/profile", icon: "fa-light fa-user-gear" },
   ];

   return (
      <aside 
         className={`dash-aside-navbar ${isActive ? "show" : ""} bg-white border-end`} 
         style={{
            width: "280px",
            minWidth: "280px",
            height: "100vh",
            position: "sticky", 
            top: 0
         }}
      >
         <div className="d-flex flex-column h-100">
            <div className="logo px-4 pt-4 pb-4 mb-2">
               <Link href="/" className="d-block text-decoration-none">
                  <h4 className="fw-bold m-0 text-dark tracking-tight text-nowrap">
                     99Sellers<span className="text-primary">.</span>
                  </h4>
               </Link>
            </div>
            
            <nav className="dasboard-main-nav px-3 flex-grow-1">
               <ul className="style-none">
                  {menuItems.map((item, index) => {
                     const isActiveLink = pathname === item.link;
                     return (
                        <li key={index} className="mb-2">
                           <Link 
                              href={item.link} 
                              // FIX: Added text-decoration-none and border-0 to kill the line
                              className={`d-flex align-items-center px-3 py-3 rounded-3 transition-3s fw-500 text-decoration-none border-0
                                 ${isActiveLink 
                                    ? "bg-dark text-white shadow-lg" 
                                    : "text-muted hover-bg-light text-dark-hover"
                                 }`}
                           >
                              <i className={`${item.icon} fs-5 me-3 ${isActiveLink ? "text-white" : "text-dark"}`}></i>
                              <span className="fs-16">{item.title}</span>
                           </Link>
                        </li>
                     )
                  })}
               </ul>
            </nav>

            <div className="px-4 pb-4 pt-3 mt-auto">
               <Link href="#" className="d-flex align-items-center justify-content-center px-3 py-3 rounded-3 text-danger bg-danger-subtle hover-bg-danger hover-text-white transition-3s fw-600 text-decoration-none">
                  <i className="fa-light fa-arrow-right-from-bracket me-2"></i>
                  <span>Sign Out</span>
               </Link>
               <div className="mt-3 text-center">
                  <p className="fs-12 text-muted m-0 opacity-75">v2.4.0 (Pro)</p>
               </div>
            </div>
         </div>
      </aside>
   )
}

export default DashboardHeaderTwo