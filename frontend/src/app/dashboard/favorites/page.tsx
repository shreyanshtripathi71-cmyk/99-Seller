"use client"
import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/search/DashboardLayout";
import styles from "@/components/search/dashboard.module.scss";

interface SavedLead {
   id: number;
   address: string;
   city: string;
   state: string;
   zip: string;
   type: string;
   appraised: number;
   debt: number;
   beds: number;
   baths: number;
   sqft: number;
   auctionDate: string;
   savedDate: string;
}

const FavoritesPage = () => {
   const [userPlan] = useState<'Free' | 'Pro'>('Free');
   
   const [savedLeads, setSavedLeads] = useState<SavedLead[]>([
      {
         id: 1,
         address: "123 Oak Street",
         city: "Austin",
         state: "TX",
         zip: "78701",
         type: "Foreclosure",
         appraised: 450000,
         debt: 180000,
         beds: 4,
         baths: 3,
         sqft: 2400,
         auctionDate: "2025-04-15",
         savedDate: "2025-03-20"
      },
      {
         id: 2,
         address: "456 Maple Avenue",
         city: "Dallas",
         state: "TX",
         zip: "75201",
         type: "Divorce",
         appraised: 325000,
         debt: 195000,
         beds: 3,
         baths: 2,
         sqft: 1800,
         auctionDate: "2025-04-22",
         savedDate: "2025-03-19"
      }
   ]);

   const handleRemove = (id: number) => {
      setSavedLeads(prev => prev.filter(lead => lead.id !== id));
   };

   const getEquityPercent = (appraised: number, debt: number) => {
      return Math.round(((appraised - debt) / appraised) * 100);
   };

   const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
         minimumFractionDigits: 0,
         maximumFractionDigits: 0,
      }).format(value);
   };

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         month: 'short',
         day: 'numeric',
         year: 'numeric'
      });
   };

   return (
      <DashboardLayout userPlan={userPlan} onUpgrade={() => console.log('Upgrade clicked')}>
         <div className={styles.page_container}>
            {/* Header */}
            <div className={styles.page_header}>
               <div>
                  <h1 className={styles.page_title}>
                     <i className="fa-solid fa-heart" style={{ color: '#EF4444', marginRight: '12px' }}></i>
                     Saved Addresses
                  </h1>
                  <p className={styles.page_subtitle}>
                     {savedLeads.length} properties saved for future reference
                  </p>
               </div>
            </div>

            {/* Content */}
            {savedLeads.length === 0 ? (
               <div style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                     color: '#94A3B8'
               }}>
                  <div style={{
                     width: 64,
                     height: 64,
                     borderRadius: '50%',
                     background: 'rgba(239, 68, 68, 0.15)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     margin: '0 auto 16px',
                     fontSize: '24px',
                     color: '#EF4444'
                  }}>
                     <i className="fa-regular fa-heart"></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#E5E7EB', marginBottom: '8px' }}>
                     No saved properties
                  </h3>
                  <p style={{ fontSize: '14px', marginBottom: '24px', color: '#94A3B8' }}>
                     Start saving properties from the search page
                  </p>
                  <Link 
                     href="/dashboard"
                     style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)',
                        color: '#0B1220',
                        borderRadius: '8px',
                        fontWeight: '600',
                        textDecoration: 'none'
                     }}
                  >
                     <i className="fa-solid fa-magnifying-glass"></i>
                     Go to Search
                  </Link>
               </div>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {savedLeads.map((lead) => {
                     const equityPercent = getEquityPercent(lead.appraised, lead.debt);
                     
                     return (
                        <div key={lead.id} className={styles.saved_card}>
                           <div style={{ display: 'flex', gap: '16px' }}>
                              {/* Property Image */}
                              <div style={{
                                 width: '140px',
                                 height: '100px',
                                 borderRadius: '6px',
                                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                 flexShrink: 0
                              }} />

                              {/* Content */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                 {/* Title Row */}
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                       <h3 style={{ 
                                          fontSize: '15px', 
                                          fontWeight: '700', 
                                   color: '#E5E7EB', 
                                          margin: '0 0 2px 0',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                       }}>
                                          {lead.address}
                                       </h3>
                                       <p style={{ 
                                          fontSize: '12px', 
                                          color: '#94A3B8',
                                          margin: 0
                                       }}>
                                          {lead.city}, {lead.state} {lead.zip}
                                       </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', marginLeft: '12px', flexShrink: 0 }}>
                                       <span 
                                          className={`${styles.badge} ${
                                             lead.type === 'Foreclosure' ? styles.badge_red :
                                             lead.type === 'Divorce' ? styles.badge_blue :
                                             lead.type === 'Tax Default' ? styles.badge_green :
                                             styles.badge_purple
                                          }`}
                                       >
                                          {lead.type}
                                       </span>
                                       <div style={{
                                          background: equityPercent > 50 ? '#00C853' : equityPercent > 30 ? '#F59E0B' : '#EF4444',
                                          color: 'white',
                                          padding: '3px 8px',
                                          borderRadius: '6px',
                                          fontSize: '12px',
                                          fontWeight: '700',
                                          fontFamily: 'monospace'
                                       }}>
                                          {equityPercent}%
                                       </div>
                                    </div>
                                 </div>

                                 {/* Metrics Row */}
                                 <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(5, 1fr)',
                                    gap: '12px',
                                    padding: '8px 0',
                                      borderTop: '1px solid #1F2937',
                                      borderBottom: '1px solid #1F2937',
                                    marginBottom: '8px'
                                 }}>
                                    <div>
                                       <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                          Value
                                       </div>
                                       <div style={{ fontSize: '13px', fontWeight: '700', color: '#E5E7EB', fontFamily: 'monospace' }}>
                                          {formatCurrency(lead.appraised)}
                                       </div>
                                    </div>
                                    <div>
                                       <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                          Debt
                                       </div>
                                       <div style={{ fontSize: '13px', fontWeight: '700', color: '#E5E7EB', fontFamily: 'monospace' }}>
                                          {formatCurrency(lead.debt)}
                                       </div>
                                    </div>
                                    <div>
                                       <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                          Beds/Baths
                                       </div>
                                       <div style={{ fontSize: '13px', fontWeight: '700', color: '#E5E7EB' }}>
                                          {lead.beds} / {lead.baths}
                                       </div>
                                    </div>
                                    <div>
                                       <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                          Size
                                       </div>
                                       <div style={{ fontSize: '13px', fontWeight: '700', color: '#E5E7EB', fontFamily: 'monospace' }}>
                                          {lead.sqft.toLocaleString()} ft²
                                       </div>
                                    </div>
                                    <div>
                                       <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                          Auction
                                       </div>
                                       <div style={{ fontSize: '13px', fontWeight: '700', color: '#E5E7EB' }}>
                                          {formatDate(lead.auctionDate)}
                                       </div>
                                    </div>
                                 </div>

                                 {/* Actions Row */}
                                 <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button
                                       onClick={() => handleRemove(lead.id)}
                                       style={{
                                          padding: '6px 12px',
                                          background: '#0B1220',
                                          border: '1px solid #1F2937',
                                          color: '#94A3B8',
                                          borderRadius: '6px',
                                          fontWeight: '500',
                                          fontSize: '13px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          transition: 'all 0.15s ease'
                                       }}
                                       onMouseEnter={(e) => {
                                          e.currentTarget.style.borderColor = '#FCA5A5';
                                          e.currentTarget.style.color = '#DC2626';
                                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                       }}
                                       onMouseLeave={(e) => {
                                          e.currentTarget.style.borderColor = '#1F2937';
                                          e.currentTarget.style.color = '#94A3B8';
                                          e.currentTarget.style.background = '#0B1220';
                                       }}
                                    >
                                       <i className="fa-solid fa-trash" style={{ fontSize: '12px' }}></i>
                                       Remove
                                    </button>
                                    <Link
                                       href={`/listing_details_01/${lead.id}`}
                                       style={{
                                          padding: '6px 16px',
                                          background: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)',
                                          color: '#0B1220',
                                          border: 'none',
                                          borderRadius: '6px',
                                          fontWeight: '600',
                                          fontSize: '12px',
                                          textDecoration: 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          transition: 'all 0.15s ease'
                                       }}
                                       onMouseEnter={(e) => {
                                          e.currentTarget.style.transform = 'translateY(-1px)';
                                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                                       }}
                                       onMouseLeave={(e) => {
                                          e.currentTarget.style.transform = 'translateY(0)';
                                          e.currentTarget.style.boxShadow = 'none';
                                       }}
                                    >
                                       <i className="fa-regular fa-eye" style={{ fontSize: '12px' }}></i>
                                       View Details
                                    </Link>
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>
      </DashboardLayout>
   );
};

export default FavoritesPage;
