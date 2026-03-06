"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import styles from "@/components/search/styles/dashboard.module.scss";

/** ==========================================
 *  TYPES
 *  ========================================== */
export interface Filters {
    state: string;
    county: string;
    zipCode: string;
    motive: string;
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

export interface Lead {
    id: number;
    image: string;
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
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    motiveTypeCode?: string;
    motiveType?: { code: string; name: string; };
    auctions?: any[];
    loans?: any[];
    probates?: any[];
    violations?: any[];
    evictions?: any[];
    divorces?: any[];
    taxLiens?: any[];
    proaddress?: any;
}


/** ==========================================
 *  COMPONENT: FilterPanel
 *  ========================================== */
interface FiltersProps {
    filters: Filters;
    onChange: (field: keyof Filters, value: string) => void;
    onReset: () => void;
    onApply: () => void;
    isOpen: boolean;
}

const STATES = ["All", "AL", "AZ", "CA", "FL", "GA", "IL", "KY", "MD", "MI", "NC", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "TN", "TX", "UT", "VA", "WA", "WI"];
const MOTIVES = ["Pre-foreclosure", "Foreclosure", "Auction", "Probate", "Code Violations", "Eviction", "Divorce", "Unpaid Taxes", "Out of State"];
const BEDS = ["Any", "1", "2", "3", "4", "5+"];
const BATHS = ["Any", "1", "1.5", "2", "2.5", "3", "3+"];

const ZipTagInput: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
    const [inputVal, setInputVal] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const zips = value ? value.split(",").map(z => z.trim()).filter(Boolean) : [];

    const addZip = (zip: string) => {
        const cleaned = zip.replace(/\D/g, "").substring(0, 5);
        if (cleaned.length >= 3 && !zips.includes(cleaned)) {
            onChange([...zips, cleaned].join(","));
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
        <div onClick={() => inputRef.current?.focus()} style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", minHeight: 38, alignItems: "center", cursor: "text" }}>
            {zips.map(zip => (
                <span key={zip} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#dbeafe", color: "#1d4ed8", borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                    {zip}
                    <button onClick={(e) => { e.stopPropagation(); removeZip(zip); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#1d4ed8", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                </span>
            ))}
            <input ref={inputRef} type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={handleKeyDown} onBlur={() => { if (inputVal.trim()) addZip(inputVal.trim()); }} placeholder={zips.length === 0 ? "Type zip + Enter" : ""} style={{ border: "none", outline: "none", flex: 1, fontSize: 13, minWidth: 80, padding: 0, background: "transparent" }} maxLength={5} />
        </div>
    );
};

const MotiveChips: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
    const selected = value && value !== "All" ? value.split(",").map(m => m.trim()).filter(Boolean) : [];
    const toggle = (motive: string) => {
        const newSelected = selected.includes(motive) ? selected.filter(m => m !== motive) : [...selected, motive];
        onChange(newSelected.length === 0 ? "All" : newSelected.join(","));
    };
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MOTIVES.map(m => {
                const isActive = selected.includes(m);
                return (
                    <button key={m} type="button" onClick={() => toggle(m)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: isActive ? "1.5px solid #2563eb" : "1px solid #d1d5db", background: isActive ? "#dbeafe" : "#fff", color: isActive ? "#1d4ed8" : "#374151", cursor: "pointer", transition: "all 0.15s" }}>
                        {isActive && <span style={{ marginRight: 4 }}>✓</span>}
                        {m}
                    </button>
                );
            })}
        </div>
    );
};

const DualRangeSlider: React.FC<{ min: number; max: number; step: number; minVal: number; maxVal: number; onMinChange: (v: number) => void; onMaxChange: (v: number) => void; formatLabel?: (v: number) => string; }> = ({ min, max, step, minVal, maxVal, onMinChange, onMaxChange, formatLabel }) => {
    const fmt = formatLabel || ((v) => String(v));
    const leftPct = ((minVal - min) / (max - min)) * 100;
    const rightPct = ((maxVal - min) / (max - min)) * 100;
    return (
        <div style={{ position: "relative", paddingTop: 4, paddingBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8", background: "#dbeafe", padding: "2px 8px", borderRadius: 4 }}>{fmt(minVal)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8", background: "#dbeafe", padding: "2px 8px", borderRadius: 4 }}>{fmt(maxVal)}</span>
            </div>
            <div style={{ position: "relative", height: 6, borderRadius: 3, background: "#e5e7eb" }}>
                <div style={{ position: "absolute", height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #2563eb, #3b82f6)", left: `${leftPct}%`, width: `${rightPct - leftPct}%` }} />
            </div>
            <input type="range" min={min} max={max} step={step} value={minVal} onChange={e => { const v = Number(e.target.value); if (v <= maxVal) onMinChange(v); }} style={{ position: "absolute", top: 20, left: 0, width: "100%", height: 6, opacity: 0, cursor: "pointer", zIndex: 2 }} />
            <input type="range" min={min} max={max} step={step} value={maxVal} onChange={e => { const v = Number(e.target.value); if (v >= minVal) onMaxChange(v); }} style={{ position: "absolute", top: 20, left: 0, width: "100%", height: 6, opacity: 0, cursor: "pointer", zIndex: 3 }} />
        </div>
    );
};

export const FilterPanel: React.FC<FiltersProps> = ({ filters, onChange, onReset, onApply, isOpen }) => {
    if (!isOpen) return null;
    const equityMin = parseInt(filters.minEquity) || 0;
    const equityMax = parseInt(filters.maxEquity) || 100;
    const debtMin = parseInt(filters.minDebt) || 0;
    const debtMax = parseInt(filters.maxDebt) || 1000000;

    return (
        <div className={styles.filters_panel}>
            <div className={styles.filters_header}>
                <h3><i className="fa-solid fa-filter" style={{ marginRight: 8, opacity: 0.7 }}></i>Filters</h3>
            </div>
            <div className={styles.filters_body}>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>State</label>
                    <select className={styles.filter_select} value={filters.state} onChange={(e) => onChange("state", e.target.value)}>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Zip Codes</label>
                    <ZipTagInput value={filters.zipCode} onChange={(val) => onChange("zipCode", val)} />
                </div>
                <div className={styles.filter_group} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.filter_label}>Motive Type</label>
                    <MotiveChips value={filters.motive} onChange={(val) => onChange("motive", val)} />
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Equity Range</label>
                    <DualRangeSlider min={0} max={100} step={5} minVal={equityMin} maxVal={equityMax} onMinChange={(v) => onChange("minEquity", String(v))} onMaxChange={(v) => onChange("maxEquity", String(v))} formatLabel={(v) => `${v}%`} />
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Debt Range</label>
                    <DualRangeSlider min={0} max={1000000} step={10000} minVal={debtMin} maxVal={debtMax} onMinChange={(v) => onChange("minDebt", String(v))} onMaxChange={(v) => onChange("maxDebt", String(v))} formatLabel={(v) => v >= 1000000 ? "$1M+" : v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${v}`} />
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Bedrooms</label>
                    <select className={styles.filter_select} value={filters.minBeds} onChange={(e) => onChange("minBeds", e.target.value)}>
                        {BEDS.map((b) => <option key={b} value={b}>{b === "Any" ? "Any" : `${b}+`}</option>)}
                    </select>
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Bathrooms</label>
                    <select className={styles.filter_select} value={filters.minBaths} onChange={(e) => onChange("minBaths", e.target.value)}>
                        {BATHS.map((b) => <option key={b} value={b}>{b === "Any" ? "Any" : `${b}+`}</option>)}
                    </select>
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Min Sq Ft</label>
                    <input type="text" className={styles.filter_input} placeholder="e.g. 1500" value={filters.minSqft} onChange={(e) => onChange("minSqft", e.target.value)} />
                </div>
                <div className={styles.filter_group}>
                    <label className={styles.filter_label}>Year Built After</label>
                    <input type="text" className={styles.filter_input} placeholder="e.g. 2000" value={filters.minYear} onChange={(e) => onChange("minYear", e.target.value)} />
                </div>
            </div>
            <div className={styles.filters_footer}>
                <button className={styles.btn_secondary} onClick={onReset}>Reset</button>
                <button className={styles.btn_primary} onClick={onApply}>Apply Filters</button>
            </div>
        </div>
    );
};

/** ==========================================
 *  COMPONENT: Lead Details Formatting
 *  ========================================== */
const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const maskOwnerName = (name: string | undefined, isPremium: boolean): string => { if (!name) return "---"; if (isPremium) return name; const parts = name.split(" "); return parts.map(part => part[0] + "****").join(" "); };
const maskPhone = (phone: string | undefined, isPremium: boolean): string => { if (!phone) return "---"; if (isPremium) return phone; return "(***) ***-" + phone.slice(-4); };
const maskEmail = (email: string | undefined, isPremium: boolean): string => { if (!email) return "---"; if (isPremium) return email; const atIndex = email.indexOf("@"); if (atIndex <= 0) return "****@****.com"; return email[0] + "****" + email.substring(atIndex); };

interface LeadTableProps {
    leads: Lead[];
    onToggleSave: (id: number) => void;
    getAddress: (lead: Lead) => string;
    userPlan: "Free" | "Premium";
}

/** ==========================================
 *  COMPONENT: LeadTableView
 *  ========================================== */
export const LeadTableView: React.FC<LeadTableProps> = ({ leads, onToggleSave, getAddress, userPlan }) => {
    const isPremium = userPlan === "Premium";
    if (leads.length === 0) {
        return (
            <div className={styles.empty_state}>
                <div className={styles.empty_icon}><i className="fa-solid fa-house-circle-xmark"></i></div>
                <h3>No properties found</h3>
                <p>Try adjusting your filters or search query to find more leads.</p>
                <button className={styles.btn_primary}>Clear Filters</button>
            </div>
        );
    }
    return (
        <div className="responsive-table-outer">
            <table className={styles.table}>
                <thead className={styles.table_header}>
                    <tr><th>Property</th><th>Type</th><th>Owner Info</th><th>Details</th><th>Equity</th><th></th></tr>
                </thead>
                <tbody>
                    {leads.map((lead) => {
                        const equity = lead.appraised - lead.debt;
                        const equityPercent = Math.round((equity / lead.appraised) * 100);
                        return (
                            <tr key={lead.id} className={styles.table_row} onClick={() => window.location.href = `/property/${lead.id}`} style={{ cursor: "pointer" }}>
                                <td>
                                    <div className={styles.table_address}>
                                        <img src={lead.image || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4YiI+PHBhdGggZD0iTTEyIDNMMiAxMmgzdjhoNnYtNmgydjZoNnYtOGgzTDEyIDN6Ii8+PC9zdmc+'} alt="" loading="lazy" className={styles.address_image} onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4YiI+PHBhdGggZD0iTTEyIDNMMiAxMmgzdjhoNnYtNmgydjZoNnYtOGgzTDEyIDN6Ii8+PC9zdmc+'; }} />
                                        <div className={styles.address_text}>
                                            <span className={styles.address_line}>
                                                {getAddress(lead)}
                                                {!isPremium && <i className="fa-solid fa-lock" style={{ marginLeft: 6, fontSize: 10, color: "#9CA3AF", verticalAlign: "middle" }} title="Upgrade to Premium format"></i>}
                                            </span>
                                            <span className={styles.address_city}>{lead.city}, {lead.state} {lead.zip}</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span className={`${styles.badge} ${styles.badge_primary}`}>{lead.type}</span></td>
                                <td>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        <span style={{ fontWeight: 500, color: "var(--notion-text-primary)", fontSize: 13 }}>{maskOwnerName(lead.ownerName || "John Smith", isPremium)} {!isPremium && <i className="fa-solid fa-lock" style={{ marginLeft: 6, fontSize: 9, color: "#9CA3AF" }}></i>}</span>
                                        <span style={{ fontSize: 12, color: "var(--notion-text-secondary)" }}>{maskPhone(lead.ownerPhone || "(555) 123-4567", isPremium)}</span>
                                    </div>
                                </td>
                                <td><span style={{ color: "var(--notion-text-secondary)", fontSize: 13 }}>{lead.beds} bd • {lead.baths} ba • {lead.sqft.toLocaleString()} sqft</span></td>
                                <td>
                                    <div className={styles.table_equity}>
                                        <span className={styles.equity_value}>{formatCurrency(equity)}</span>
                                        <span className={styles.equity_percent}>{equityPercent}% equity</span>
                                    </div>
                                </td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div className={styles.table_actions}>
                                        <button className={`${styles.save_btn} ${lead.saved ? styles.saved : ""}`} onClick={() => onToggleSave(lead.id)} title={lead.saved ? "Remove from saved" : "Save lead"}><i className={lead.saved ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i></button>
                                        <Link href={`/property/${lead.id}`} className={styles.btn_icon} title="View details"><i className="fa-solid fa-arrow-up-right-from-square"></i></Link>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {!isPremium && (
                <div style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", borderRadius: 8, padding: "clamp(1rem, 3vw, 1.5rem)", marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", border: "1px solid #BFDBFE" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <i className="fa-solid fa-lock" style={{ color: "#2563EB" }}></i>
                        <span style={{ fontSize: 13, color: "#1E40AF", fontWeight: 500 }}>Some data is hidden. Upgrade to Premium to see full addresses, owner contacts, and more.</span>
                    </div>
                    <Link href="/dashboard/subscription" style={{ background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none", textAlign: "center", flex: "1 1 auto" }}>Upgrade Now</Link>
                </div>
            )}
        </div>
    );
};

/** ==========================================
 *  COMPONENT: LeadGridView
 *  ========================================== */
export const LeadGridView: React.FC<LeadTableProps> = ({ leads, onToggleSave, getAddress, userPlan }) => {
    const isPremium = userPlan === "Premium";
    if (leads.length === 0) {
        return (
            <div className={styles.empty_state}>
                <div className={styles.empty_icon}><i className="fa-solid fa-house-circle-xmark"></i></div>
                <h3>No properties found</h3>
                <p>Try adjusting your filters or search query to find more leads.</p>
                <button className={styles.btn_primary}>Clear Filters</button>
            </div>
        );
    }

    return (
        <>
            <div className={styles.grid_container}>
                {leads.map((lead) => {
                    const equity = lead.appraised - lead.debt;
                    return (
                        <Link href={`/property/${lead.id}`} key={lead.id} className={styles.grid_card}>
                            <div className={styles.card_image}>
                                <img src={lead.image} alt={getAddress(lead)} />
                                <span className={`${styles.card_badge} ${styles.badge} ${styles.badge_primary}`}>{lead.type}</span>
                                <button className={`${styles.card_save} ${lead.saved ? styles.saved : ""}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(lead.id); }}><i className={lead.saved ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i></button>
                                {!isPremium && (
                                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", padding: "24px 12px 8px", display: "flex", alignItems: "center", gap: 6 }}>
                                        <i className="fa-solid fa-lock" style={{ color: "#fff", fontSize: 10 }}></i><span style={{ color: "#fff", fontSize: 10, fontWeight: 500 }}>Upgrade for full details</span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.card_content}>
                                <h3 className={styles.card_title}>{getAddress(lead)} {!isPremium && <i className="fa-solid fa-lock" style={{ marginLeft: 6, fontSize: 10, color: "#9CA3AF" }}></i>}</h3>
                                <p className={styles.card_location}>{lead.city}, {lead.state} {lead.zip}</p>
                                <div style={{ marginTop: 8, padding: "8px 0", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
                                    <span style={{ fontSize: 11, color: "#6B7280", display: "block", marginBottom: 2 }}>Owner</span>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{maskOwnerName(lead.ownerName || "John Smith", isPremium)} {!isPremium && <i className="fa-solid fa-lock" style={{ marginLeft: 4, fontSize: 9, color: "#9CA3AF" }}></i>}</span>
                                </div>
                                <div className={styles.card_stats}>
                                    <div className={styles.stat}><span className={styles.stat_label}>Value</span><span className={styles.stat_value}>{formatCurrency(lead.appraised)}</span></div>
                                    <div className={styles.stat}><span className={styles.stat_label}>Equity</span><span className={styles.stat_value} style={{ color: "#10B981" }}>{formatCurrency(equity)}</span></div>
                                    <div className={styles.stat}><span className={styles.stat_label}>Details</span><span className={styles.stat_value}>{lead.beds}bd/{lead.baths}ba</span></div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
            {!isPremium && (
                <div style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", borderRadius: 8, padding: "12px 16px", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #BFDBFE" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}><i className="fa-solid fa-lock" style={{ color: "#2563EB" }}></i><span style={{ fontSize: 13, color: "#1E40AF", fontWeight: 500 }}>Some data is hidden. Upgrade to Premium to see full addresses, owner contacts, and more.</span></div>
                    <Link href="/dashboard/subscription" style={{ background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Upgrade Now</Link>
                </div>
            )}
        </>
    );
};
