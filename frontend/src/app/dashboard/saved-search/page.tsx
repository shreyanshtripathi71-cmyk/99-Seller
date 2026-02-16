"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/search/DashboardLayout";
import styles from "@/components/search/dashboard.module.scss";

interface SavedSearch {
   id: number;
   name: string;
   filters: {
      state?: string;
      distressType?: string;
      minEquity?: number;
      beds?: number;
      baths?: number;
      minSqft?: number;
      maxDebt?: number;
   };
   resultsCount: number;
   createdDate: string;
   lastUsed?: string;
}

const SavedSearchesPage = () => {
   const router = useRouter();
   const [userPlan] = useState<'Free' | 'Pro'>('Free');
   
   // Mock saved searches - replace with actual data from localStorage/Redux
   const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
      {
         id: 1,
         name: "High Equity Foreclosures in Austin",
         filters: {
            state: "TX",
            distressType: "Foreclosure",
            minEquity: 50
         },
         resultsCount: 23,
         createdDate: "2025-03-15",
         lastUsed: "2025-03-27"
      },
      {
         id: 2,
         name: "Divorce Cases - Dallas Area",
         filters: {
            state: "TX",
            distressType: "Divorce",
            minEquity: 30,
            beds: 3
         },
         resultsCount: 15,
         createdDate: "2025-03-10",
         lastUsed: "2025-03-25"
      }
   ]);

   const handleDelete = (id: number) => {
      setSavedSearches(prev => prev.filter(search => search.id !== id));
   };

   const handleLoadSearch = (filters: SavedSearch['filters']) => {
      // In a real app, you'd save these filters to Redux/state and navigate to dashboard
      console.log('Loading search with filters:', filters);
      router.push('/dashboard');
   };

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         month: 'short',
         day: 'numeric',
         year: 'numeric'
      });
   };

   const getFilterDisplay = (filters: SavedSearch['filters']) => {
      const parts: string[] = [];
      
      if (filters.state) parts.push(`State: ${filters.state}`);
      if (filters.distressType) parts.push(`Type: ${filters.distressType}`);
      if (filters.minEquity) parts.push(`Min Equity: ${filters.minEquity}%`);
      if (filters.beds) parts.push(`Beds: ${filters.beds}+`);
      if (filters.baths) parts.push(`Baths: ${filters.baths}+`);
      if (filters.minSqft) parts.push(`Min Sqft: ${filters.minSqft.toLocaleString()}`);
      if (filters.maxDebt) parts.push(`Max Debt: $${filters.maxDebt.toLocaleString()}`);
      
      return parts;
   };

   return (
      <DashboardLayout userPlan={userPlan} onUpgrade={() => console.log('Upgrade clicked')}>
         <div className={styles.page_container}>
            {/* Header */}
            <div className={styles.page_header}>
               <div>
                  <h1 className={styles.page_title}>
                     <i className="fa-solid fa-bookmark me-3" style={{ color: '#38BDF8' }}></i>
                     Saved Searches
                  </h1>
                  <p className={styles.page_subtitle}>
                     Quickly access your frequently used search criteria
                  </p>
               </div>
               <div style={{ 
                  padding: '12px 24px', 
                  background: 'rgba(56, 189, 248, 0.12)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#38BDF8'
               }}>
                  {savedSearches.length} Saved
               </div>
            </div>

            {/* Content */}
            {savedSearches.length === 0 ? (
               <div style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  color: '#94A3B8'
               }}>
                  <div style={{
                     width: 64,
                     height: 64,
                     borderRadius: '50%',
                     background: 'rgba(56, 189, 248, 0.15)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     margin: '0 auto 16px',
                     fontSize: '24px',
                     color: '#38BDF8'
                  }}>
                     <i className="fa-solid fa-bookmark"></i>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#E5E7EB', marginBottom: '8px' }}>
                     No saved searches
                  </h3>
                  <p style={{ fontSize: '14px', marginBottom: '24px', color: '#94A3B8' }}>
                     Save your filter combinations for quick access later
                  </p>
                  <button 
                     onClick={() => router.push('/dashboard')}
                     style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)',
                        color: '#0B1220',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                     }}
                  >
                     <i className="fa-solid fa-magnifying-glass"></i>
                     Go to Search
                  </button>
               </div>
            ) : (
               <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '20px'
               }}>
                  {savedSearches.map((search) => (
                     <div 
                        key={search.id}
                        style={{
                           background: '#0F172A',
                           borderRadius: '12px',
                           padding: '24px',
                           border: '1px solid #1F2937',
                           transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                           e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)';
                           e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                           e.currentTarget.style.boxShadow = 'none';
                           e.currentTarget.style.transform = 'translateY(0)';
                        }}
                     >
                        {/* Header */}
                        <div style={{ marginBottom: '16px' }}>
                           <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <h3 style={{ 
                                 fontSize: '16px', 
                                 fontWeight: '700', 
                                 color: '#E5E7EB',
                                 flex: 1,
                                 marginRight: '12px'
                              }}>
                                 {search.name}
                              </h3>
                              <div style={{
                                 background: 'rgba(56, 189, 248, 0.12)',
                                 color: '#38BDF8',
                                 padding: '4px 12px',
                                 borderRadius: '6px',
                                 fontSize: '13px',
                                 fontWeight: '700',
                                 fontFamily: 'monospace'
                              }}>
                                 {search.resultsCount} leads
                              </div>
                           </div>
                           <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94A3B8' }}>
                              <span>
                                 <i className="fa-regular fa-calendar me-1"></i>
                                 Created {formatDate(search.createdDate)}
                              </span>
                              {search.lastUsed && (
                                 <span>
                                    <i className="fa-regular fa-clock me-1"></i>
                                    Used {formatDate(search.lastUsed)}
                                 </span>
                              )}
                           </div>
                        </div>

                        {/* Filters */}
                        <div style={{ 
                           background: '#0B1220',
                           borderRadius: '8px',
                           padding: '12px',
                           marginBottom: '16px',
                           border: '1px solid #1F2937'
                        }}>
                           <div style={{ 
                              fontSize: '11px', 
                              fontWeight: '600', 
                              color: '#94A3B8',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              marginBottom: '8px'
                           }}>
                              Filter Criteria
                           </div>
                           <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '6px'
                           }}>
                              {getFilterDisplay(search.filters).map((filter, index) => (
                                 <span 
                                    key={index}
                                    style={{
                                       background: '#0F172A',
                                       border: '1px solid #1F2937',
                                       padding: '4px 10px',
                                       borderRadius: '6px',
                                       fontSize: '12px',
                                       color: '#94A3B8',
                                       fontWeight: '500'
                                    }}
                                 >
                                    {filter}
                                 </span>
                              ))}
                           </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                           <button
                              onClick={() => handleLoadSearch(search.filters)}
                              style={{
                                 flex: 1,
                                 padding: '10px 16px',
                                 background: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)',
                                 color: '#0B1220',
                                 border: 'none',
                                 borderRadius: '8px',
                                 fontWeight: '600',
                                 fontSize: '13px',
                                 cursor: 'pointer',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 gap: '6px'
                              }}
                           >
                              <i className="fa-solid fa-play"></i>
                              Load Search
                           </button>
                           <button
                              onClick={() => handleDelete(search.id)}
                              style={{
                                 padding: '10px 16px',
                                 background: '#0B1220',
                                 border: '1px solid #FCA5A5',
                                 color: '#FCA5A5',
                                 borderRadius: '8px',
                                 fontWeight: '600',
                                 fontSize: '13px',
                                 cursor: 'pointer'
                              }}
                           >
                              <i className="fa-solid fa-trash"></i>
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </DashboardLayout>
   );
};

export default SavedSearchesPage;
