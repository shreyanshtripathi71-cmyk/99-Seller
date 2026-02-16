"use client"
import React from "react";
import Link from "next/link";
import styles from "./dashboard.module.scss";
import type { Lead } from "./LeadTable";

interface LeadGridProps {
   leads: Lead[];
   onToggleSave: (id: number) => void;
   getAddress: (lead: Lead) => string;
   userPlan: 'Free' | 'Pro';
}

const LeadGrid = ({ leads, onToggleSave, getAddress, userPlan }: LeadGridProps) => {
   if (leads.length === 0) {
      return (
         <div 
            style={{
               textAlign: 'center',
               padding: '80px 20px',
               color: '#64748B'
            }}
         >
            <div style={{
               width: 64,
               height: 64,
               borderRadius: '50%',
               background: 'rgba(37, 99, 235, 0.12)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               margin: '0 auto 16px',
               fontSize: '24px',
               color: '#2563EB'
            }}>
               <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
               No properties found
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B' }}>
               Try adjusting your filters or search criteria
            </p>
         </div>
      );
   }

   return (
      <div className={styles.grid_container}>
         {leads.map((lead, index) => {
            const equityPercent = Math.round(((lead.appraised - lead.debt) / lead.appraised) * 100);
            
            return (
               <div 
                  key={lead.id} 
                  className={styles.grid_card}
                  style={{
                     transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-4px)';
                     e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'translateY(0)';
                     e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }}
               >
                  {/* Image */}
                  <div className={styles.card_img} style={{ height: '140px' }}>
                     {lead.image && (
                        <img src={lead.image} alt="Property" />
                     )}
                     
                     {/* Badges */}
                     <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span 
                           className={`${styles.badge} ${
                              lead.type === 'Foreclosure' ? styles.badge_red :
                              lead.type === 'Divorce' ? styles.badge_blue :
                              lead.type === 'Tax Default' ? styles.badge_green :
                              styles.badge_purple
                           }`}
                           style={{ 
                              background: '#FFFFFF', 
                              border: 'none', 
                              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
                              fontWeight: '700'
                           }}
                        >
                           {lead.type}
                        </span>
                     </div>

                     {/* Equity Badge */}
                     <div style={{ position: 'absolute', top: 12, right: 12 }}>
                        <div
                           style={{
                              background: equityPercent > 50 ? '#00C853' : equityPercent > 30 ? '#F59E0B' : '#EF4444',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '700',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              fontFamily: 'monospace'
                           }}
                        >
                           {equityPercent}%
                        </div>
                     </div>

                     {/* Gradient overlay */}
                     <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.35), transparent)',
                        pointerEvents: 'none'
                     }}></div>
                  </div>

                  {/* Card Body */}
                  <div className={styles.card_body}>
                     {/* Price */}
                     <div className={styles.card_price} style={{ 
                        fontSize: '20px', 
                        fontWeight: '700',
                        color: '#0F172A',
                        marginBottom: '6px'
                     }}>
                        ${lead.appraised.toLocaleString()}
                     </div>

                     {/* Address */}
                     <div className={styles.card_address} style={{ 
                        marginBottom: '12px',
                        minHeight: '36px'
                     }}>
                        <div style={{ 
                           fontSize: '14px', 
                           fontWeight: '600', 
                           color: '#0F172A',
                           marginBottom: '2px'
                        }}>
                           {getAddress(lead)}
                           {userPlan === 'Free' && (
                              <i className="fa-solid fa-lock ms-2" style={{ fontSize: '10px', color: '#EF4444' }}></i>
                           )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                           {lead.city}, {lead.state} {lead.zip}
                        </div>
                     </div>

                     {/* Metrics */}
                     <div className={styles.card_metrics} style={{ marginBottom: '12px' }}>
                        <div>
                           <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Beds
                           </span>
                           <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                              {lead.beds}
                           </span>
                        </div>
                        <div>
                           <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Baths
                           </span>
                           <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                              {lead.baths}
                           </span>
                        </div>
                        <div>
                           <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              SqFt
                           </span>
                           <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', fontFamily: 'monospace' }}>
                              {lead.sqft.toLocaleString()}
                           </span>
                        </div>
                        <div>
                           <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Year
                           </span>
                           <span style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', fontFamily: 'monospace' }}>
                              {lead.year}
                           </span>
                        </div>
                     </div>

                     {/* Auction Date */}
                     <div style={{
                        padding: '8px 12px',
                        background: '#F8FAFC',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid #E2E8F0'
                     }}>
                        <i className="fa-regular fa-calendar" style={{ color: '#64748B', fontSize: '12px' }}></i>
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>
                           Auction: <strong style={{ color: '#0F172A' }}>{lead.auctionDate}</strong>
                        </span>
                     </div>

                     {/* Footer */}
                     <div className={styles.card_footer}>
                        <button 
                           className={`${styles.btn_icon} ${lead.saved ? styles.saved : ''}`}
                           onClick={() => onToggleSave(lead.id)}
                           style={{ 
                              border: '1px solid #E2E8F0',
                              width: 40,
                              height: 40,
                              transition: 'all 0.15s ease'
                           }}
                           onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.borderColor = lead.saved ? '#EF4444' : '#2563EB';
                           }}
                           onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.borderColor = '#E2E8F0';
                           }}
                        >
                           <i className={lead.saved ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                        </button>
                        <div style={{ flex: 1 }}>
                           <Link 
                              href={`/property/${lead.id}`} 
                              className={styles.btn_details}
                              style={{ 
                                 flex: 1, 
                                 background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                 color: '#FFFFFF',
                                 fontWeight: '700',
                                 boxShadow: '0 2px 8px rgba(37, 99, 235, 0.28)'
                              }}
                           >
                              <i className="fa-regular fa-eye me-2"></i>
                              View Details
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
   );
};

export default LeadGrid;
