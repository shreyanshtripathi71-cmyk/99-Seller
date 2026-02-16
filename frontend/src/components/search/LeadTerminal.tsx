"use client"
import React, { useState, useMemo } from "react";
import DashboardLayout from "./DashboardLayout";
import SearchFilters, { type Filters } from "./SearchFilters";
import LeadTable, { type Lead } from "./LeadTable";
import LeadGrid from "./LeadGrid";
import SaveSearchModal from "@/modals/SaveSearchModal";
import styles from "./styles/dashboard.module.scss";

// Mock data
const MOCK_LEADS: Lead[] = [
   { id: 1, image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400", type: "Foreclosure", address: "1024 Elm St", city: "Austin", state: "TX", zip: "78701", beds: 3, baths: 2, appraised: 450000, debt: 120000, sqft: 2400, year: 2015, auctionDate: "2026-02-14", publishedOn: "2 days ago", saved: false },
   { id: 2, image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400", type: "Divorce", address: "550 Maple Ave", city: "Dallas", state: "TX", zip: "75201", beds: 4, baths: 3, appraised: 320000, debt: 280000, sqft: 1800, year: 1998, auctionDate: "Pending", publishedOn: "5 hours ago", saved: true },
   { id: 3, image: "https://images.unsplash.com/photo-1600596542815-2a4d9f6fac90?w=400", type: "Tax Default", address: "880 Oak Ln", city: "Houston", state: "TX", zip: "77002", beds: 2, baths: 1, appraised: 610000, debt: 50000, sqft: 3200, year: 2005, auctionDate: "2026-03-01", publishedOn: "1 week ago", saved: false },
   { id: 4, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", type: "Probate", address: "2210 Pine Rd", city: "San Antonio", state: "TX", zip: "78205", beds: 5, baths: 4, appraised: 890000, debt: 320000, sqft: 4200, year: 2018, auctionDate: "2026-02-20", publishedOn: "3 days ago", saved: false },
   { id: 5, image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400", type: "Foreclosure", address: "1556 Cedar Blvd", city: "Fort Worth", state: "TX", zip: "76102", beds: 3, baths: 2.5, appraised: 375000, debt: 95000, sqft: 2100, year: 2012, auctionDate: "2026-03-15", publishedOn: "1 day ago", saved: false },
];

const LeadTerminal = () => {
   // State
   const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
   const [userPlan, setUserPlan] = useState<'Free' | 'Pro'>('Free');
   const [showSaveModal, setShowSaveModal] = useState(false);
   const [showFilters, setShowFilters] = useState(false);
   const [showUserMenu, setShowUserMenu] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

   // Filters
   const [filters, setFilters] = useState<Filters>({
      state: "All",
      county: "All",
      zipCode: "",
      motive: "All",
      minEquity: "0",
      maxDebt: "",
      minBeds: "Any",
      minBaths: "Any",
      minSqft: "",
      minYear: "",
      auctionDateStart: ""
   });

   // Filter logic
   const filteredLeads = useMemo(() => {
      return leads.filter(lead => {
         const matchesSearch =
            lead.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.zip.includes(searchQuery);

         const matchesState = filters.state === "All" || lead.state === filters.state;
         const matchesZip = !filters.zipCode || lead.zip.startsWith(filters.zipCode);
         const matchesMotive = filters.motive === "All" || lead.type === filters.motive;
         const matchesBeds = filters.minBeds === "Any" || lead.beds >= parseInt(filters.minBeds);
         const matchesBaths = filters.minBaths === "Any" || lead.baths >= parseInt(filters.minBaths);
         const matchesSqft = !filters.minSqft || lead.sqft >= parseInt(filters.minSqft);
         const matchesYear = !filters.minYear || lead.year >= parseInt(filters.minYear);
         const matchesDebt = !filters.maxDebt || lead.debt <= parseInt(filters.maxDebt);

         const profit = lead.appraised - lead.debt;
         const equityPercent = (profit / lead.appraised) * 100;
         const matchesEquity = equityPercent >= parseInt(filters.minEquity);

         const matchesDate = !filters.auctionDateStart || lead.auctionDate >= filters.auctionDateStart;

         return matchesSearch && matchesState && matchesZip && matchesMotive && matchesBeds &&
            matchesBaths && matchesSqft && matchesYear && matchesDebt &&
            matchesEquity && matchesDate;
      });
   }, [leads, searchQuery, filters]);

   // Handlers
   const handleFilterChange = (field: string, value: string) => {
      setFilters(prev => ({ ...prev, [field]: value }));
   };

   const toggleSave = (id: number) => {
      setLeads(leads.map(l => l.id === id ? { ...l, saved: !l.saved } : l));
   };

   const getAddress = (lead: Lead) => {
      if (userPlan === 'Pro') return lead.address;
      return lead.address.substring(0, 2) + "** " + lead.address.split(' ').slice(1).join(' ');
   };

   const resetFilters = () => {
      setFilters({
         state: "All",
         county: "All",
         zipCode: "",
         motive: "All",
         minEquity: "0",
         maxDebt: "",
         minBeds: "Any",
         minBaths: "Any",
         minSqft: "",
         minYear: "",
         auctionDateStart: ""
      });
      setSearchQuery("");
   };

   return (
      <>
         {/* Save Search Modal */}
         {showSaveModal && (
            <SaveSearchModal
               onClose={() => setShowSaveModal(false)}
               onSave={(name) => {
                  alert(`Saved search: ${name}`);
                  setShowSaveModal(false);
               }}
               filters={filters}
            />
         )}

         <DashboardLayout userPlan={userPlan} onUpgrade={() => setUserPlan('Pro')}>
            {/* Header */}
            <header className={styles.top_header}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{
                     fontSize: '18px',
                     fontWeight: '700',
                     color: '#111827',
                     margin: 0
                  }}>
                     Lead Discovery
                  </h3>
                  <span className={`${styles.badge} ${styles.badge_green}`}>
                     <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#10B981',
                        display: 'inline-block',
                        marginRight: '6px'
                     }}></span>
                     Live
                  </span>
               </div>

               <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                     className={styles.btn_details}
                     onClick={() => setShowSaveModal(true)}
                  >
                     <i className="fa-regular fa-bookmark" style={{ marginRight: '6px' }}></i>
                     Save Search
                  </button>

                  {/* User Menu */}
                  <div style={{ position: 'relative' }}>
                     <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{
                           width: 36,
                           height: 36,
                           borderRadius: '50%',
                           background: '#2563EB',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           fontSize: '13px',
                           fontWeight: '600',
                           color: '#FFFFFF',
                           border: 'none',
                           cursor: 'pointer'
                        }}
                     >
                        JD
                     </button>

                     {showUserMenu && (
                        <>
                           <div
                              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
                              onClick={() => setShowUserMenu(false)}
                           ></div>

                           <div
                              style={{
                                 position: 'absolute',
                                 top: '44px',
                                 right: 0,
                                 width: '200px',
                                 background: '#FFFFFF',
                                 border: '1px solid #E5E7EB',
                                 borderRadius: '8px',
                                 boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                 zIndex: 100,
                                 padding: '4px',
                                 overflow: 'hidden'
                              }}
                           >
                              <div style={{
                                 padding: '12px',
                                 borderBottom: '1px solid #E5E7EB',
                                 marginBottom: '4px'
                              }}>
                                 <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                                    John Doe
                                 </div>
                                 <div style={{ fontSize: '13px', color: '#6B7280' }}>
                                    john@example.com
                                 </div>
                                 {userPlan === 'Pro' && (
                                    <span className={`${styles.badge} ${styles.badge_blue}`} style={{ marginTop: '6px' }}>
                                       PRO
                                    </span>
                                 )}
                              </div>
                              <a
                                 href="/dashboard/profile"
                                 style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    color: '#4B5563',
                                    textDecoration: 'none',
                                    cursor: 'pointer'
                                 }}
                              >
                                 <i className="fa-regular fa-user"></i>
                                 Profile
                              </a>
                              <a
                                 href="/dashboard/membership"
                                 style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    color: '#4B5563',
                                    textDecoration: 'none',
                                    cursor: 'pointer'
                                 }}
                              >
                                 <i className="fa-regular fa-credit-card"></i>
                                 Billing
                              </a>
                              <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }}></div>
                              <button
                                 style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    color: '#EF4444',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                 }}
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

            <div className={styles.scroll_area}>
               {/* Search Bar */}
               <div className={styles.simple_search_bar}>
                  <i className="fa-solid fa-magnifying-glass" style={{ color: '#9CA3AF' }}></i>
                  <input
                     type="text"
                     className={styles.search_input_large}
                     placeholder="Search by City, Zip, or Address..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className={styles.btn_primary}>
                     Search
                  </button>

                  <div style={{ width: '1px', height: '24px', background: '#E5E7EB', margin: '0 8px' }}></div>

                  {/* View Toggle */}
                  <div className={styles.view_toggle}>
                     <button
                        className={`${styles.btn_view_mode} ${viewMode === 'list' ? styles.active : ''}`}
                        onClick={() => setViewMode('list')}
                     >
                        <i className="fa-solid fa-bars"></i>
                     </button>
                     <button
                        className={`${styles.btn_view_mode} ${viewMode === 'grid' ? styles.active : ''}`}
                        onClick={() => setViewMode('grid')}
                     >
                        <i className="fa-solid fa-border-all"></i>
                     </button>
                  </div>

                  {/* Filter Toggle */}
                  <button
                     className={`${styles.btn_filter_toggle} ${showFilters ? styles.active : ''}`}
                     onClick={() => setShowFilters(!showFilters)}
                  >
                     <i className="fa-solid fa-sliders"></i>
                     Filters
                  </button>
               </div>

               {/* Filters Component */}
               <SearchFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={resetFilters}
                  onClose={() => setShowFilters(false)}
                  isOpen={showFilters}
               />

               {/* Results Count */}
               <div
                  style={{
                     padding: '12px 0',
                     fontSize: '14px',
                     color: '#6B7280'
                  }}
               >
                  Found <strong style={{ color: '#111827' }}>{filteredLeads.length}</strong> properties
                  {searchQuery && ` matching "${searchQuery}"`}
               </div>

               {/* Table or Grid View */}
               {viewMode === 'list' ? (
                  <LeadTable
                     leads={filteredLeads}
                     onToggleSave={toggleSave}
                     getAddress={getAddress}
                     userPlan={userPlan}
                  />
               ) : (
                  <LeadGrid
                     leads={filteredLeads}
                     onToggleSave={toggleSave}
                     getAddress={getAddress}
                     userPlan={userPlan}
                  />
               )}
            </div>
         </DashboardLayout>
      </>
   );
};

export default LeadTerminal;
