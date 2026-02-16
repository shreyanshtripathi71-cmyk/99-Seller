"use client"
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./dashboard.module.scss";

export interface Filters {
   state: string;
   county: string;
   zipCode: string;
   motive: string;
   minEquity: string;
   maxDebt: string;
   minBeds: string;
   minBaths: string;
   minSqft: string;
   minYear: string;
   auctionDateStart: string;
}

interface SearchFiltersProps {
   filters: Filters;
   onFilterChange: (field: string, value: string) => void;
   onReset: () => void;
   onClose: () => void;
   isOpen: boolean;
}

const SearchFilters = ({ filters, onFilterChange, onReset, onClose, isOpen }: SearchFiltersProps) => {
   if (!isOpen) return null;

   return (
      <AnimatePresence>
         <motion.div
            className={styles.filter_container}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
         >
            <div className={styles.filter_header}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-sliders" style={{ color: '#2563EB' }}></i>
                  <span style={{ fontWeight: '700' }}>Advanced Filters</span>
               </div>
               <motion.button
                  className={styles.btn_clear}
                  onClick={onReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
               >
                  <i className="fa-solid fa-rotate-right me-1"></i>
                  Reset All
               </motion.button>
            </div>

            <div className={styles.filter_body}>
               {/* Location & Motive */}
               <motion.div
                  className={styles.filter_row}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
               >
                  <div className={styles.row_title}>
                     <i className="fa-solid fa-location-dot me-2" style={{ color: '#EF4444' }}></i>
                     Location & Motive
                  </div>
                  <div className={styles.filter_grid_advanced}>
                     <div className={styles.input_group}>
                        <label>State</label>
                        <select value={filters.state} onChange={(e) => onFilterChange('state', e.target.value)}>
                           <option value="All">All States</option>
                           <option value="TX">Texas</option>
                           <option value="FL">Florida</option>
                           <option value="CA">California</option>
                           <option value="AZ">Arizona</option>
                        </select>
                     </div>
                     <div className={styles.input_group}>
                        <label>Zip Code</label>
                        <input
                           type="text"
                           placeholder="e.g. 78701"
                           value={filters.zipCode}
                           onChange={(e) => onFilterChange('zipCode', e.target.value)}
                           maxLength={5}
                        />
                     </div>
                     <div className={styles.input_group}>
                        <label>Distress Type</label>
                        <select value={filters.motive} onChange={(e) => onFilterChange('motive', e.target.value)}>
                           <option value="All">All Types</option>
                           <option value="Foreclosure">Foreclosure</option>
                           <option value="Divorce">Divorce</option>
                           <option value="Tax Default">Tax Default</option>
                           <option value="Probate">Probate</option>
                        </select>
                     </div>
                     <div className={styles.input_group}>
                        <label>Minimum Equity</label>
                        <select value={filters.minEquity} onChange={(e) => onFilterChange('minEquity', e.target.value)}>
                           <option value="0">Any Equity</option>
                           <option value="20">20%+</option>
                           <option value="30">30%+</option>
                           <option value="50">50%+</option>
                           <option value="75">75%+</option>
                        </select>
                     </div>
                  </div>
               </motion.div>

               {/* Property Details */}
               <motion.div
                  className={styles.filter_row}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
               >
                  <div className={styles.row_title}>
                     <i className="fa-solid fa-house me-2" style={{ color: '#3B82F6' }}></i>
                     Property Details
                  </div>
                  <div className={styles.filter_grid_advanced}>
                     <div className={styles.input_group}>
                        <label>Minimum Beds</label>
                        <select value={filters.minBeds} onChange={(e) => onFilterChange('minBeds', e.target.value)}>
                           <option value="Any">Any</option>
                           <option value="1">1+</option>
                           <option value="2">2+</option>
                           <option value="3">3+</option>
                           <option value="4">4+</option>
                           <option value="5">5+</option>
                        </select>
                     </div>
                     <div className={styles.input_group}>
                        <label>Minimum Baths</label>
                        <select value={filters.minBaths} onChange={(e) => onFilterChange('minBaths', e.target.value)}>
                           <option value="Any">Any</option>
                           <option value="1">1+</option>
                           <option value="2">2+</option>
                           <option value="3">3+</option>
                           <option value="4">4+</option>
                        </select>
                     </div>
                     <div className={styles.input_group}>
                        <label>Min Square Feet</label>
                        <input
                           type="number"
                           placeholder="e.g. 1500"
                           value={filters.minSqft}
                           onChange={(e) => onFilterChange('minSqft', e.target.value)}
                        />
                     </div>
                     <div className={styles.input_group}>
                        <label>Min Year Built</label>
                        <input
                           type="number"
                           placeholder="e.g. 2000"
                           value={filters.minYear}
                           onChange={(e) => onFilterChange('minYear', e.target.value)}
                        />
                     </div>
                  </div>
               </motion.div>

               {/* Financial Constraints */}
               <motion.div
                  className={styles.filter_row}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
               >
                  <div className={styles.row_title}>
                     <i className="fa-solid fa-dollar-sign me-2" style={{ color: '#10B981' }}></i>
                     Financial Constraints
                  </div>
                  <div className={styles.filter_grid_advanced}>
                     <div className={styles.input_group}>
                        <label>Maximum Debt</label>
                        <input
                           type="number"
                           placeholder="e.g. 200000"
                           value={filters.maxDebt}
                           onChange={(e) => onFilterChange('maxDebt', e.target.value)}
                        />
                     </div>
                     <div className={styles.input_group}>
                        <label>Auction Date (After)</label>
                        <input
                           type="date"
                           value={filters.auctionDateStart}
                           onChange={(e) => onFilterChange('auctionDateStart', e.target.value)}
                        />
                     </div>
                  </div>
               </motion.div>
            </div>

            <div className={styles.filter_footer}>
               <motion.button
                  className={styles.btn_primary_small}
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
               >
                  <i className="fa-solid fa-check me-2"></i>
                  Apply Filters
               </motion.button>
            </div>
         </motion.div>
      </AnimatePresence>
   );
};

export default SearchFilters;
