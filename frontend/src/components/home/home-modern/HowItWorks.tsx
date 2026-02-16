"use client"
import React from "react";
import styles from "./saas.module.scss";

const steps = [
   {
      number: "1",
      title: "Choose Your Market",
      description: "Select your target state, county, or city. Focus on areas you know or explore new high-opportunity markets across all 50 states."
   },
   {
      number: "2",
      title: "Set Your Criteria",
      description: "Filter by lead type (foreclosure, probate, tax lien), equity percentage, property type, auction dates, and 100+ other parameters."
   },
   {
      number: "3",
      title: "Analyze & Score",
      description: "Our AI scores each lead based on motivation indicators, equity, and market conditions. Focus on the highest-probability opportunities."
   },
   {
      number: "4",
      title: "Export & Contact",
      description: "Download verified owner contact information. Reach out via phone, mail, or integrate directly with your marketing tools."
   }
];

const HowItWorks = () => {
   return (
      <section className={styles.sectionAlt}>
         <div className={styles.container}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
               
               {/* Left: Content */}
               <div>
                  <p style={{ 
                     fontSize: '14px', 
                     fontWeight: '600', 
                     color: '#2563EB', 
                     textTransform: 'uppercase', 
                     letterSpacing: '0.05em',
                     marginBottom: '12px' 
                  }}>
                     How It Works
                  </p>
                  <h2 className={styles.sectionTitle} style={{ marginBottom: '24px' }}>
                     From search to deal<br />in four simple steps
                  </h2>
                  <p className={styles.sectionSubtitle} style={{ marginBottom: '48px' }}>
                     No complicated setup. No steep learning curve. Just log in, 
                     set your filters, and start finding deals today.
                  </p>

                  {/* Steps */}
                  <div>
                     {steps.map((step, i) => (
                        <div key={i} className={styles.step} style={{ borderBottom: i < steps.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                           <div className={styles.stepNumber}>{step.number}</div>
                           <div className={styles.stepContent}>
                              <h3 className={styles.stepTitle}>{step.title}</h3>
                              <p className={styles.stepDesc}>{step.description}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Right: Visual */}
               <div 
                  style={{
                     background: '#FFFFFF',
                     border: '1px solid #E5E7EB',
                     borderRadius: '16px',
                     padding: '32px',
                     boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)'
                  }}
               >
                  {/* Interactive Filter Preview */}
                  <div style={{ marginBottom: '24px' }}>
                     <p style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                        Active Filters
                     </p>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {[
                           { label: 'Texas', icon: 'fa-location-dot' },
                           { label: 'Pre-Foreclosure', icon: 'fa-house' },
                           { label: 'Equity > 40%', icon: 'fa-chart-simple' },
                           { label: 'SFH', icon: 'fa-building' },
                        ].map((filter, i) => (
                           <span 
                              key={i}
                              style={{
                                 display: 'inline-flex',
                                 alignItems: 'center',
                                 gap: '6px',
                                 padding: '8px 12px',
                                 background: '#EFF6FF',
                                 color: '#2563EB',
                                 fontSize: '13px',
                                 fontWeight: '500',
                                 borderRadius: '6px'
                              }}
                           >
                              <i className={`fa-solid ${filter.icon}`} style={{ fontSize: '11px' }} />
                              {filter.label}
                           </span>
                        ))}
                     </div>
                  </div>

                  {/* Results preview */}
                  <div style={{ 
                     background: '#F9FAFB', 
                     borderRadius: '12px', 
                     padding: '20px',
                     marginBottom: '24px'
                  }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Results Found</span>
                        <span style={{ fontSize: '28px', fontWeight: '700', color: '#2563EB' }}>2,847</span>
                     </div>
                     <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg, #2563EB, #10B981)', borderRadius: '4px' }} />
                     </div>
                     <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>68% with verified owner contact info</p>
                  </div>

                  {/* Sample leads */}
                  <div>
                     <p style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                        Top Matches
                     </p>
                     {[
                        { address: '1024 Elm St, Austin', equity: '73%', score: 94 },
                        { address: '550 Maple Ave, Dallas', equity: '81%', score: 91 },
                        { address: '880 Oak Ln, Houston', equity: '92%', score: 88 },
                     ].map((lead, i) => (
                        <div 
                           key={i}
                           style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 0',
                              borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none'
                           }}
                        >
                           <div>
                              <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>{lead.address}</p>
                              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Equity: <span style={{ color: '#10B981', fontWeight: '600' }}>{lead.equity}</span></p>
                           </div>
                           <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              background: lead.score >= 90 ? '#D1FAE5' : '#FEF3C7',
                              color: lead.score >= 90 ? '#059669' : '#D97706',
                              fontSize: '12px',
                              fontWeight: '600',
                              borderRadius: '100px'
                           }}>
                              <i className="fa-solid fa-fire" style={{ fontSize: '10px' }} />
                              {lead.score}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default HowItWorks;
