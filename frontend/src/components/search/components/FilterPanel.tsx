"use client";
import React from "react";
import styles from "../styles/dashboard.module.scss";

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

interface FiltersProps {
  filters: Filters;
  onChange: (field: keyof Filters, value: string) => void;
  onReset: () => void;
  onApply: () => void;
  isOpen: boolean;
}

const STATES = ["All", "TX", "CA", "FL", "NY", "AZ", "GA", "NC", "OH", "PA", "IL"];
const MOTIVES = ["All", "Foreclosure", "Divorce", "Tax Default", "Probate", "Pre-Foreclosure", "Bankruptcy"];
const BEDS = ["Any", "1", "2", "3", "4", "5+"];
const BATHS = ["Any", "1", "1.5", "2", "2.5", "3", "3+"];

const FilterPanel: React.FC<FiltersProps> = ({
  filters,
  onChange,
  onReset,
  onApply,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.filters_panel}>
      <div className={styles.filters_header}>
        <h3>
          <i className="fa-solid fa-filter" style={{ marginRight: 8, opacity: 0.7 }}></i>
          Filters
        </h3>
      </div>

      <div className={styles.filters_body}>
        {/* State */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>State</label>
          <select
            className={styles.filter_select}
            value={filters.state}
            onChange={(e) => onChange("state", e.target.value)}
          >
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Zip Code */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Zip Code</label>
          <input
            type="text"
            className={styles.filter_input}
            placeholder="e.g. 78701"
            value={filters.zipCode}
            onChange={(e) => onChange("zipCode", e.target.value)}
            maxLength={5}
          />
        </div>

        {/* Motive */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Distress Type</label>
          <select
            className={styles.filter_select}
            value={filters.motive}
            onChange={(e) => onChange("motive", e.target.value)}
          >
            {MOTIVES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Min Equity */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Min Equity %</label>
          <select
            className={styles.filter_select}
            value={filters.minEquity}
            onChange={(e) => onChange("minEquity", e.target.value)}
          >
            <option value="0">Any</option>
            <option value="20">20%+</option>
            <option value="30">30%+</option>
            <option value="40">40%+</option>
            <option value="50">50%+</option>
          </select>
        </div>

        {/* Max Debt */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Max Debt</label>
          <input
            type="text"
            className={styles.filter_input}
            placeholder="e.g. 200000"
            value={filters.maxDebt}
            onChange={(e) => onChange("maxDebt", e.target.value)}
          />
        </div>

        {/* Beds */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Bedrooms</label>
          <select
            className={styles.filter_select}
            value={filters.minBeds}
            onChange={(e) => onChange("minBeds", e.target.value)}
          >
            {BEDS.map((b) => (
              <option key={b} value={b}>
                {b === "Any" ? "Any" : `${b}+`}
              </option>
            ))}
          </select>
        </div>

        {/* Baths */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Bathrooms</label>
          <select
            className={styles.filter_select}
            value={filters.minBaths}
            onChange={(e) => onChange("minBaths", e.target.value)}
          >
            {BATHS.map((b) => (
              <option key={b} value={b}>
                {b === "Any" ? "Any" : `${b}+`}
              </option>
            ))}
          </select>
        </div>

        {/* Min Sqft */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Min Sq Ft</label>
          <input
            type="text"
            className={styles.filter_input}
            placeholder="e.g. 1500"
            value={filters.minSqft}
            onChange={(e) => onChange("minSqft", e.target.value)}
          />
        </div>

        {/* Year Built */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Year Built After</label>
          <input
            type="text"
            className={styles.filter_input}
            placeholder="e.g. 2000"
            value={filters.minYear}
            onChange={(e) => onChange("minYear", e.target.value)}
          />
        </div>
      </div>

      <div className={styles.filters_footer}>
        <button className={styles.btn_secondary} onClick={onReset}>
          Reset
        </button>
        <button className={styles.btn_primary} onClick={onApply}>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
