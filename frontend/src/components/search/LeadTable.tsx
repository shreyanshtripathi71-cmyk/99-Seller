"use client"
import React from "react";
import Link from "next/link";
import styles from "./dashboard.module.scss";

export interface Lead {
   id: number;
   image?: string;
   type: string;
   address: string;
   city: string;
   state: string;
   zip: string;
   beds: number;
   baths: number;
   appraised: number;
   debt: number;
   sqft: number;
   year: number;
   auctionDate: string;
   publishedOn: string;
   saved: boolean;
}

interface LeadTableProps {
   leads: Lead[];
   onToggleSave: (id: number) => void;
   getAddress: (lead: Lead) => string;
   userPlan: 'Free' | 'Pro';
}

const LeadTable = ({ leads, onToggleSave, getAddress, userPlan }: LeadTableProps) => {
   if (leads.length === 0) {
      return (
         <div className={styles.table_container}>
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
                  background: 'rgba(37, 99, 235, 0.1)',
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
               <p style={{ fontSize: '14px' }}>
                  Try adjusting your filters or search criteria
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className={styles.table_container}>
         <table className={styles.data_table}>
            <thead>
               <tr>
                  <th>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-location-dot" style={{ fontSize: '12px', color: '#94A3B8' }}></i>
                        Address
                     </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                        <i className="fa-solid fa-dollar-sign" style={{ fontSize: '12px', color: '#94A3B8' }}></i>
                        Appraised
                     </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                        <i className="fa-solid fa-chart-line" style={{ fontSize: '12px', color: '#94A3B8' }}></i>
                        Equity %
                     </div>
                  </th>
                  <th>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-tag" style={{ fontSize: '12px', color: '#94A3B8' }}></i>
                        Type
                     </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>SqFt</th>
                  <th>Auction Date</th>
                  <th>Published</th>
                  <th>Year</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
               </tr>
            </thead>
            <tbody>
               {leads.map((lead, index) => {
                  const profit = lead.appraised - lead.debt;
                  const equityPercent = Math.round((profit / lead.appraised) * 100);
                  
                  return (
                     <tr 
                        key={lead.id}
                        style={{
                           transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                           e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                           e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                     >
                        <td>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {lead.image && (
                                 <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                 }}>
                                    <img 
                                       src={lead.image} 
                                       alt="Property" 
                                       style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                 </div>
                              )}
                              <div>
                                 <div style={{ fontWeight: '600', color: '#0F172A', marginBottom: '2px' }}>
                                    {getAddress(lead)}
                                    {userPlan === 'Free' && (
                                       <i className="fa-solid fa-lock ms-2" style={{ fontSize: '11px', color: '#EF4444' }}></i>
                                    )}
                                 </div>
                                 <div style={{ fontSize: '12px', color: '#64748B' }}>
                                    {lead.city}, {lead.state} {lead.zip}
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className={styles.mono_text} style={{ textAlign: 'right', fontWeight: '600' }}>
                           ${lead.appraised.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                           <div 
                              className={styles.mono_text} 
                              style={{ 
                                 color: equityPercent > 50 ? '#10B981' : equityPercent > 30 ? '#F59E0B' : '#EF4444',
                                 fontWeight: '700',
                                 fontSize: '15px'
                              }}
                           >
                              {equityPercent}%
                           </div>
                        </td>
                        <td>
                           <span className={`${styles.badge} ${
                              lead.type === 'Foreclosure' ? styles.badge_red :
                              lead.type === 'Divorce' ? styles.badge_blue :
                              lead.type === 'Tax Default' ? styles.badge_green :
                              styles.badge_purple
                           }`}>
                              {lead.type}
                           </span>
                        </td>
                        <td className={styles.mono_text} style={{ textAlign: 'right', color: '#475569' }}>
                           {lead.sqft.toLocaleString()}
                        </td>
                        <td className={styles.mono_text} style={{ fontSize: '13px', color: '#475569' }}>
                           {lead.auctionDate}
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748B' }}>
                           {lead.publishedOn}
                        </td>
                        <td className={styles.mono_text} style={{ color: '#475569' }}>
                           {lead.year}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                           <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button 
                                 className={`${styles.btn_icon} ${lead.saved ? styles.saved : ''}`}
                                 onClick={() => onToggleSave(lead.id)}
                                 style={{ transition: 'transform 0.15s ease' }}
                                 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                 <i className={lead.saved ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                              </button>
                              <div>
                                 <Link href={`/search/${lead.id}`} className={styles.btn_details}>
                                    Details
                                 </Link>
                              </div>
                           </div>
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>
   );
};

export default LeadTable;
