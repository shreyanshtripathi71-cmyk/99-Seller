"use client";
import React, { useState, useRef } from "react";
import styles from "../styles/dashboard.module.scss";

export interface Filters {
  state: string;
  county: string;
  zipCode: string;       // comma-separated zip codes
  motive: string;        // comma-separated motive types
  minEquity: string;
  maxEquity: string;
  minDebt: string;
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
const MOTIVES = ["Foreclosure", "Divorce", "Tax Default", "Probate", "Pre-Foreclosure", "Bankruptcy"];
const BEDS = ["Any", "1", "2", "3", "4", "5+"];
const BATHS = ["Any", "1", "1.5", "2", "2.5", "3", "3+"];

// Reusable Tag/Chip Input for zip codes
const ZipTagInput: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const zips = value ? value.split(",").map(z => z.trim()).filter(Boolean) : [];

  const addZip = (zip: string) => {
    const cleaned = zip.replace(/\D/g, "").substring(0, 5);
    if (cleaned.length >= 3 && !zips.includes(cleaned)) {
      const newZips = [...zips, cleaned];
      onChange(newZips.join(","));
    }
    setInputVal("");
  };

  const removeZip = (zip: string) => {
    onChange(zips.filter(z => z !== zip).join(","));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      if (inputVal.trim()) addZip(inputVal.trim());
    } else if (e.key === "Backspace" && !inputVal && zips.length > 0) {
      removeZip(zips[zips.length - 1]);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: "flex", flexWrap: "wrap", gap: 4, padding: "6px 10px",
        border: "1px solid #d1d5db", borderRadius: 8, background: "#fff",
        minHeight: 38, alignItems: "center", cursor: "text"
      }}
    >
      {zips.map(zip => (
        <span key={zip} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "2px 8px", background: "#dbeafe", color: "#1d4ed8",
          borderRadius: 4, fontSize: 12, fontWeight: 500,
        }}>
          {zip}
          <button onClick={(e) => { e.stopPropagation(); removeZip(zip); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#1d4ed8", fontSize: 14, padding: 0, lineHeight: 1 }}>
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputVal.trim()) addZip(inputVal.trim()); }}
        placeholder={zips.length === 0 ? "Type zip + Enter" : ""}
        style={{ border: "none", outline: "none", flex: 1, fontSize: 13, minWidth: 80, padding: 0, background: "transparent" }}
        maxLength={5}
      />
    </div>
  );
};

// Multi-select motive chips
const MotiveChips: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const selected = value && value !== "All" ? value.split(",").map(m => m.trim()).filter(Boolean) : [];

  const toggle = (motive: string) => {
    let newSelected: string[];
    if (selected.includes(motive)) {
      newSelected = selected.filter(m => m !== motive);
    } else {
      newSelected = [...selected, motive];
    }
    onChange(newSelected.length === 0 ? "All" : newSelected.join(","));
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {MOTIVES.map(m => {
        const isActive = selected.includes(m);
        return (
          <button
            key={m}
            type="button"
            onClick={() => toggle(m)}
            style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
              border: isActive ? "1.5px solid #2563eb" : "1px solid #d1d5db",
              background: isActive ? "#dbeafe" : "#fff",
              color: isActive ? "#1d4ed8" : "#374151",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {isActive && <span style={{ marginRight: 4 }}>✓</span>}
            {m}
          </button>
        );
      })}
    </div>
  );
};

// Dual Range Slider component
const DualRangeSlider: React.FC<{
  min: number; max: number; step: number;
  minVal: number; maxVal: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  formatLabel?: (v: number) => string;
}> = ({ min, max, step, minVal, maxVal, onMinChange, onMaxChange, formatLabel }) => {
  const fmt = formatLabel || ((v) => String(v));
  const leftPct = ((minVal - min) / (max - min)) * 100;
  const rightPct = ((maxVal - min) / (max - min)) * 100;

  return (
    <div style={{ position: "relative", paddingTop: 4, paddingBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8", background: "#dbeafe", padding: "2px 8px", borderRadius: 4 }}>
          {fmt(minVal)}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8", background: "#dbeafe", padding: "2px 8px", borderRadius: 4 }}>
          {fmt(maxVal)}
        </span>
      </div>
      <div style={{ position: "relative", height: 6, borderRadius: 3, background: "#e5e7eb" }}>
        <div style={{
          position: "absolute", height: "100%", borderRadius: 3,
          background: "linear-gradient(90deg, #2563eb, #3b82f6)",
          left: `${leftPct}%`, width: `${rightPct - leftPct}%`
        }} />
      </div>
      <input
        type="range" min={min} max={max} step={step} value={minVal}
        onChange={e => { const v = Number(e.target.value); if (v <= maxVal) onMinChange(v); }}
        style={{ position: "absolute", top: 20, left: 0, width: "100%", height: 6, opacity: 0, cursor: "pointer", zIndex: 2 }}
      />
      <input
        type="range" min={min} max={max} step={step} value={maxVal}
        onChange={e => { const v = Number(e.target.value); if (v >= minVal) onMaxChange(v); }}
        style={{ position: "absolute", top: 20, left: 0, width: "100%", height: 6, opacity: 0, cursor: "pointer", zIndex: 3 }}
      />
    </div>
  );
};

const FilterPanel: React.FC<FiltersProps> = ({
  filters,
  onChange,
  onReset,
  onApply,
  isOpen,
}) => {
  if (!isOpen) return null;

  const equityMin = parseInt(filters.minEquity) || 0;
  const equityMax = parseInt(filters.maxEquity) || 100;
  const debtMin = parseInt(filters.minDebt) || 0;
  const debtMax = parseInt(filters.maxDebt) || 1000000;

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

        {/* Zip Codes - Multi Tag Input */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Zip Codes</label>
          <ZipTagInput
            value={filters.zipCode}
            onChange={(val) => onChange("zipCode", val)}
          />
        </div>

        {/* Motive / Distress Type - Multi Chips */}
        <div className={styles.filter_group} style={{ gridColumn: "1 / -1" }}>
          <label className={styles.filter_label}>Distress Type</label>
          <MotiveChips
            value={filters.motive}
            onChange={(val) => onChange("motive", val)}
          />
        </div>

        {/* Equity Range */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Equity Range</label>
          <DualRangeSlider
            min={0} max={100} step={5}
            minVal={equityMin} maxVal={equityMax}
            onMinChange={(v) => onChange("minEquity", String(v))}
            onMaxChange={(v) => onChange("maxEquity", String(v))}
            formatLabel={(v) => `${v}%`}
          />
        </div>

        {/* Debt Range */}
        <div className={styles.filter_group}>
          <label className={styles.filter_label}>Debt Range</label>
          <DualRangeSlider
            min={0} max={1000000} step={10000}
            minVal={debtMin} maxVal={debtMax}
            onMinChange={(v) => onChange("minDebt", String(v))}
            onMaxChange={(v) => onChange("maxDebt", String(v))}
            formatLabel={(v) => v >= 1000000 ? "$1M+" : v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${v}`}
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
