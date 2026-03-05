"use client";
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { PropertyDetails } from '@/components/dashboard/PropertyDetailsPage';

interface Props { data: PropertyDetails; isMobile: boolean; }

/* ── helpers ── */
const fmtCurrency = (v: any): string | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'string' ? parseFloat(v.replace(/[$,]/g, '')) : Number(v);
    if (isNaN(n)) return null;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};

const fmtPhone = (p: any): string | null => {
    if (!p) return null;
    const c = String(p).replace(/\D/g, '');
    return c.length === 10 ? `(${c.slice(0, 3)}) ${c.slice(3, 6)}-${c.slice(6)}` : String(p);
};

const fmtDate = (d: any): string | null => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const notEmpty = (v: any): boolean => v !== null && v !== undefined && v !== '' && String(v).trim() !== '';
const sanitize = (html: string) => typeof window === 'undefined' ? html : DOMPurify.sanitize(html);
const joinName = (...parts: (string | null | undefined)[]): string | null => {
    const p = parts.filter(notEmpty).map(x => String(x).trim());
    return p.length > 0 ? p.join(' ') : null;
};

const STATE_NAMES: Record<string, string> = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
    MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
    OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    DC: 'Washington D.C.'
};
const stateLabel = (abbr: string | null | undefined): string => {
    if (!abbr) return '';
    const a = String(abbr).trim().toUpperCase();
    return STATE_NAMES[a] || abbr;
};

/* ── style tokens ── */
const S = {
    card: { background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' } as React.CSSProperties,
    sectionHead: { fontSize: '14px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' } as React.CSSProperties,
    grid: (cols = 'repeat(auto-fill, minmax(200px, 1fr))') => ({ display: 'grid', gridTemplateColumns: cols, gap: '20px' } as React.CSSProperties),
    label: { display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px' } as React.CSSProperties,
    value: { fontSize: '15px', fontWeight: '600', color: '#0f172a', wordBreak: 'break-word' } as React.CSSProperties,
    pill: (bg: string, color: string) => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: bg, color, borderRadius: '9999px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' } as React.CSSProperties),
    banner: (bg: string, color: string) => ({ padding: '14px 18px', borderRadius: '12px', background: bg, color, fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${color}30` } as React.CSSProperties),
    expandBtn: { background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: '4px 0', marginTop: '4px', textTransform: 'uppercase' as any } as React.CSSProperties,
    ctaBtn: (bg: string, color: string) => ({ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: bg, color, borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', textDecoration: 'none', border: `1px solid ${color}30` } as React.CSSProperties),
};

const DI = ({ label: l, value: v, color, bold, wide }: { label: string; value: any; color?: string; bold?: boolean; wide?: boolean }) => {
    if (!notEmpty(v)) return null;
    return (
        <div style={{ gridColumn: wide ? '1 / -1' : 'auto' }}>
            <span style={S.label}>{l}</span>
            <span style={{ ...S.value, color: color || '#0f172a', fontWeight: bold ? '750' : '600' }}>{v}</span>
        </div>
    );
};

const ExpandableText = ({ text, limit = 300, preview = 150 }: { text: string; limit?: number; preview?: number }) => {
    const [exp, setExp] = useState(false);
    if (!text) return null;
    if (text.length <= limit) return <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#475569' }}>{text}</div>;
    return (
        <div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#475569' }}>{exp ? text : text.substring(0, preview) + '...'}</div>
            <button onClick={() => setExp(!exp)} style={S.expandBtn}>{exp ? 'Show Less' : 'Show More'}</button>
        </div>
    );
};

/* ─────────────────────────────────────────────
   TRIGGER EVALUATION
   Returns true if this component should render
   ───────────────────────────────────────────── */
const shouldRender = (data: PropertyDetails): boolean => {
    const owners: any[] = (data as any).owners || [];
    const owner: any = owners[0] || {};
    const pa: any = data.proaddress || {};
    const prop: any = data.property || {};

    // A: Owner.is_out_of_state = true
    if (owner.is_out_of_state === true) return true;

    // B: PMotiveType = "OOS"
    if (pa.PMotiveType === 'OOS') return true;

    // C: owner_current_state ≠ property state
    const ocs = pa.owner_current_state;
    const pstate = prop.state || pa.PState;
    if (ocs && pstate && ocs.toUpperCase().trim() !== pstate.toUpperCase().trim()) return true;

    // D: Owner.OState ≠ Property.Pstate
    if (owner.OState && pstate && owner.OState.toUpperCase().trim() !== pstate.toUpperCase().trim()) return true;

    // E: parse state from owner_mailing_address
    if (pa.owner_mailing_address && pstate) {
        const match = String(pa.owner_mailing_address).match(/\b([A-Z]{2})\s+\d{5}/);
        if (match && match[1].toUpperCase() !== pstate.toUpperCase()) return true;
    }

    return false;
};

/* ─────────────────────────────────────────────
   HELPER: resolve owner state
   ───────────────────────────────────────────── */
const resolveOwnerState = (data: PropertyDetails): string | null => {
    const owners: any[] = (data as any).owners || [];
    const owner: any = owners[0] || {};
    const pa: any = data.proaddress || {};

    // 1. Proaddress.owner_current_state
    if (notEmpty(pa.owner_current_state)) return pa.owner_current_state;
    // 2. Owner.OState
    if (notEmpty(owner.OState)) return owner.OState;
    // 3. Parse from owner_mailing_address
    if (pa.owner_mailing_address) {
        const match = String(pa.owner_mailing_address).match(/\b([A-Z]{2})\s+\d{5}/);
        if (match) return match[1];
    }
    return null;
};

/* ─────────────────────────────────────────────
   HELPER: resolve owner name
   ───────────────────────────────────────────── */
const resolveOwnerName = (data: PropertyDetails): string => {
    const owners: any[] = (data as any).owners || [];
    const owner: any = owners[0] || {};
    const oname: any = (data as any).ownername || {};
    const pa: any = data.proaddress || {};
    const td: any = (data as any).propertyTrustDeed || {};
    const loans: any[] = (data as any).loans || [];

    const a = joinName(owner.OFirstName, owner.OMiddleName, owner.OLastName);
    if (a) return a;
    const b = joinName(oname.PFirstName, oname.PMiddleName, oname.PLastName);
    if (b) return b;
    const c = joinName(pa.PFirstName, pa.PMiddleName, pa.PLastName);
    if (c) return c;
    if (notEmpty(pa.owner_name)) return pa.owner_name;
    if (notEmpty(td.owner_name)) return td.owner_name;
    if (loans[0]?.borrower_name) return `${loans[0].borrower_name} (from Loan Record)`;
    return 'Unknown Owner';
};

/* ─────────────────────────────────────────────
   FIELD 1 — STATE COMPARISON BLOCK
   ───────────────────────────────────────────── */
const StateComparisonBlock = ({ data, isMobile }: { data: PropertyDetails; isMobile: boolean }) => {
    const prop: any = data.property || {};
    const pa: any = data.proaddress || {};
    const propState = prop.state || pa.PState;
    const ownerState = resolveOwnerState(data);

    if (!propState) return null;

    const propStateLabel = stateLabel(propState);
    const ownerStateLabel = ownerState ? stateLabel(ownerState) : null;
    const isActuallyDiff = ownerState && ownerState.toUpperCase().trim() !== propState.toUpperCase().trim();

    return (
        <div style={{
            display: 'flex', flexDirection: isMobile ? 'column' : 'row',
            gap: '16px', alignItems: 'center', marginBottom: '24px',
            padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
            border: '1px solid #bfdbfe'
        }}>
            {/* Property State */}
            <div style={{ flex: 1, textAlign: 'center', padding: '16px 20px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>🏠 Property Located In</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e3a5f' }}>{propStateLabel || propState}</div>
                {prop.city && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{prop.city}</div>}
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '28px', color: '#3b82f6' }}>↔</div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remote</div>
            </div>

            {/* Owner State */}
            <div style={{ flex: 1, textAlign: 'center', padding: '16px 20px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>📍 Owner Currently In</div>
                {ownerStateLabel ? (
                    <div style={{ fontSize: '24px', fontWeight: '900', color: isActuallyDiff ? '#b91c1c' : '#1e3a5f' }}>{ownerStateLabel}</div>
                ) : (
                    <div style={{ fontSize: '14px', color: '#9ca3af' }}>State Unknown</div>
                )}
            </div>

            {/* Sub-note */}
            {isMobile && isActuallyDiff && ownerStateLabel &&
                <div style={{ width: '100%', fontSize: '12px', color: '#475569', fontWeight: '600', textAlign: 'center' }}>
                    Owner is managing this property remotely from <strong>{ownerStateLabel}</strong>
                </div>
            }
        </div>
    );
};

/* ─────────────────────────────────────────────
   FIELD 2+3 — OWNER IDENTITY & CONTACT HEADER
   ───────────────────────────────────────────── */
const OwnerIdentityBlock = ({ data }: { data: PropertyDetails }) => {
    const owners: any[] = (data as any).owners || [];
    const owner: any = owners[0] || {};
    const oname: any = (data as any).ownername || {};
    const pa: any = data.proaddress || {};
    const [showHtml, setShowHtml] = useState(false);

    const name = resolveOwnerName(data);
    const company = oname.PcompanyName || pa.PcompayName;
    const phone = pa.owner_phone;
    const email = owner.email;
    const htmlContent = oname.html;

    return (
        <div style={{ background: 'linear-gradient(135deg, rgba(30,58,95,0.06) 0%, rgba(30,58,95,0.02) 100%)', padding: '24px', borderRadius: '14px', border: '1px solid #e0eaff', marginBottom: '20px' }}>
            {/* Avatar + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '900', flexShrink: 0 }}>
                    {name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{name}</div>
                    {notEmpty(company) && (
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', marginTop: '2px' }}>
                            <i className="fa-solid fa-building" style={{ marginRight: '6px' }} />
                            Company / Entity: {company}
                        </div>
                    )}
                    <div style={{ marginTop: '6px' }}>
                        <span style={S.pill('#fef2f2', '#b91c1c')}>⚠ Out of State Owner</span>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div>
                <div style={{ ...S.label, marginBottom: '4px' }}>Contact Owner</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '14px' }}>
                    Owner is located out of state — remote communication preferred
                </div>
                {(phone || email) ? (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {phone && (
                            <a href={`tel:${phone}`} style={{ ...S.ctaBtn('#f0fdf4', '#166534'), textDecoration: 'none' }}>
                                <i className="fa-solid fa-phone" /> Call Owner — {fmtPhone(phone)}
                            </a>
                        )}
                        {email && (
                            <a href={`mailto:${email}`} style={{ ...S.ctaBtn('#eff6ff', '#1d4ed8'), textDecoration: 'none' }}>
                                <i className="fa-solid fa-envelope" /> Email Owner
                            </a>
                        )}
                    </div>
                ) : (
                    <div style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                        No direct contact information available — contact via mailing address below
                    </div>
                )}
            </div>

            {/* Expandable HTML profile */}
            {notEmpty(htmlContent) && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <button onClick={() => setShowHtml(!showHtml)} style={{ ...S.expandBtn }}>
                        {showHtml ? '▲ Hide' : '▼ View'} Additional Owner Info
                    </button>
                    {showHtml && (
                        <div style={{ marginTop: '12px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}
                            dangerouslySetInnerHTML={{ __html: sanitize(htmlContent) }} />
                    )}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   FIELD 4+5 — ADDRESS BLOCKS
   ───────────────────────────────────────────── */
const AddressBlock = ({ data, isMobile }: { data: PropertyDetails; isMobile: boolean }) => {
    const owners: any[] = (data as any).owners || [];
    const owner: any = owners[0] || {};
    const pa: any = data.proaddress || {};
    const prop: any = data.property || {};

    // Owner mailing address assembly
    let mailingLine1: string | null = null;
    let mailingLine2: string | null = null;
    let mailingCityStateZip: string | null = null;

    if (notEmpty(owner.OStreetAddr1)) {
        // Source A — Owner table
        mailingLine1 = owner.OStreetAddr1;
        mailingLine2 = owner.OStreetAddr2 || null;
        const city = owner.OCity || '';
        const state = owner.OState || '';
        const zip = owner.OZip || '';
        mailingCityStateZip = [city, state ? (city ? `, ${state}` : state) : '', zip ? ` ${zip}` : ''].filter(Boolean).join('').trim() || null;
    } else if (notEmpty(pa.owner_mailing_address)) {
        // Source B — Proaddress.owner_mailing_address
        mailingLine1 = pa.owner_mailing_address;
    } else if (notEmpty(pa.owner_current_state)) {
        // Source C — fallback
        mailingLine1 = `Current State: ${pa.owner_current_state}`;
    }

    const fullOwnerAddress = [mailingLine1, mailingLine2, mailingCityStateZip].filter(Boolean).join('\n');
    const mapUrl = owner.OCity && owner.OState
        ? `https://www.google.com/maps/search/${encodeURIComponent(`${owner.OCity}, ${owner.OState}`)}`
        : mailingLine1 ? `https://www.google.com/maps/search/${encodeURIComponent(mailingLine1)}` : null;

    // Property address assembly
    const streetNum = pa.PStreetNum || '';
    const streetName = pa.PStreetName || pa.backup_street_name || '';
    const streetPost = pa.street_name_post_type || pa.streetnameposttype || '';
    const suite = pa.PSuiteNum ? ` #${pa.PSuiteNum}` : '';
    const propAddr = [streetNum, streetName, streetPost].filter(Boolean).join(' ').trim() + suite || prop.address;
    const propCity = pa.Pcity || prop.city;
    const propState = pa.PState || prop.state;
    const propZip = pa.Pzip || prop.zip;
    const propCounty = pa.county_fixed ? `County #${pa.county_fixed}` : prop.county;

    const copyToClipboard = (text: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => alert('Address copied!')).catch(() => { });
        }
    };

    return (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {/* Owner Mailing Address */}
            {mailingLine1 && (
                <div style={{ flex: '1 1 320px', padding: '20px', borderRadius: '14px', background: '#fef2f2', border: '2px solid #fecaca' }}>
                    <span style={{ ...S.label, color: '#b91c1c' }}>Owner's Out of State Mailing Address</span>
                    <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', marginBottom: '12px' }}>
                        This is where the owner is currently located
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: '1.5' }}>
                        {mailingLine1}
                        {mailingLine2 && <div>{mailingLine2}</div>}
                        {mailingCityStateZip && <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>{mailingCityStateZip}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => copyToClipboard(fullOwnerAddress)}
                            style={S.ctaBtn('#fff', '#1d4ed8')}
                        >
                            <i className="fa-regular fa-copy" /> Copy Address
                        </button>
                        {mapUrl && (
                            <a href={mapUrl} target="_blank" rel="noopener noreferrer" style={{ ...S.ctaBtn('#fff', '#166534'), textDecoration: 'none' }}>
                                <i className="fa-solid fa-map-location-dot" /> View on Map
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Property Location */}
            {propAddr && (
                <div style={{ flex: '1 1 320px', padding: '20px', borderRadius: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <span style={{ ...S.label, color: '#166534' }}>Property Location</span>
                    <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginBottom: '12px' }}>
                        Location the owner is managing remotely
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{propAddr}</div>
                    {(propCity || propState) && (
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginTop: '4px' }}>
                            {propCity}{propCity && propState ? ', ' : ''}{propState} {propZip}
                        </div>
                    )}
                    {propCounty && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{propCounty} County</div>}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   FIELD 6 — VACANCY / OCCUPANCY INDICATOR
   ───────────────────────────────────────────── */
const OccupancyIndicator = ({ data }: { data: PropertyDetails }) => {
    const pa: any = data.proaddress || {};
    const prop: any = data.property || {};
    const owners: any[] = (data as any).owners || [];
    const owner: any = owners[0] || {};
    const evictions: any[] = (data as any).evictions || [];

    const comments = (pa.comments || prop.comments || '').toLowerCase();
    const isVacant = comments.includes('vacant');

    let badge: { bg: string; color: string; icon: string; text: string; note?: string } | null = null;

    if (evictions.length > 0) {
        badge = {
            bg: '#fff7ed', color: '#c2410c', icon: 'fa-triangle-exclamation',
            text: '⚠ Tenant Present — Eviction Proceedings Active',
            note: 'Buyer should verify occupancy and eviction status before proceeding.'
        };
    } else if (pa.court_date || pa.court_docket) {
        badge = {
            bg: '#fff7ed', color: '#b45309', icon: 'fa-gavel',
            text: '⚠ Court Proceedings on Record — Verify Occupancy',
            note: 'Court record found. Buyer should confirm whether property is occupied.'
        };
    } else if (isVacant) {
        badge = {
            bg: '#f8fafc', color: '#64748b', icon: 'fa-house-circle-xmark',
            text: 'Property May Be Vacant — Verify Before Purchase',
            note: 'Comments suggest the property may be vacant.'
        };
    } else if (owner.is_out_of_state) {
        badge = {
            bg: '#eff6ff', color: '#1d4ed8', icon: 'fa-circle-question',
            text: 'Owner Absent — Occupancy Status Unknown',
            note: 'Buyer is advised to verify whether this property is currently occupied, vacant, or tenant-managed.'
        };
    }

    if (!badge) {
        return (
            <div style={{ marginBottom: '20px' }}>
                <span style={S.label}>Property Occupancy</span>
                <div style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                    Occupancy status not confirmed — verify independently
                </div>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '20px' }}>
            <span style={S.label}>Property Occupancy</span>
            <div style={{ ...S.banner(badge.bg, badge.color), marginBottom: '0' }}>
                <i className={`fa-solid ${badge.icon}`} />
                <div>
                    <div style={{ fontWeight: '800' }}>{badge.text}</div>
                    {badge.note && <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '3px' }}>{badge.note}</div>}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   FIELD 7 — OWNERSHIP DURATION
   ───────────────────────────────────────────── */
const OwnershipDuration = ({ data }: { data: PropertyDetails }) => {
    const td: any = (data as any).propertyTrustDeed || {};
    const loans: any[] = (data as any).loans || [];
    const prop: any = data.property || {};

    const dates = [td.datetime, loans[0]?.datetime, prop.lastSaleDate, (prop as any).PLastSoldDate].filter(Boolean);
    if (!dates.length) return null;

    const earliest = dates.reduce((a, b) => {
        const da = new Date(a), db = new Date(b);
        return isNaN(da.getTime()) ? b : isNaN(db.getTime()) ? a : da < db ? a : b;
    });

    const dt = new Date(earliest);
    if (isNaN(dt.getTime())) return null;

    const now = new Date();
    const totalMonths = Math.floor((now.getTime() - dt.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const duration = [years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '', months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''].filter(Boolean).join(', ');

    if (!duration) return null;

    return (
        <div style={{ padding: '16px 20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <span style={S.label}>Estimated Time as Out of State Owner</span>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#1e3a5f', marginTop: '4px' }}>Approx. {duration}</div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
                Estimated time owner has been managing this property remotely
                {fmtDate(earliest) && ` · Since ${fmtDate(earliest)}`}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   FIELD 8 — FINANCIAL EXPOSURE SUMMARY
   ───────────────────────────────────────────── */
const FinancialExposure = ({ data }: { data: PropertyDetails }) => {
    const loans: any[] = (data as any).loans || [];
    const taxLiens: any[] = (data as any).taxLiens || [];
    const violations: any[] = (data as any).violations || [];
    const pa: any = data.proaddress || {};
    const prop: any = data.property || {};

    const loanAmt = loans[0]?.loan_amount ? Number(loans[0].loan_amount) : 0;
    const isDefault = loans[0]?.default_status?.toLowerCase().includes('delinquent') || loans[0]?.default_status?.toLowerCase().includes('default') || Number(loans[0]?.total_default_amount) > 0;

    const totalLiens = taxLiens.reduce((sum: number, l: any) => sum + (Number(l.amount_owed) || 0), 0);
    const violationFines = violations.reduce((sum: number, v: any) => sum + (Number(v.fine_amount) || 0), 0)
        + (notEmpty(pa.violation_total) ? Number(pa.violation_total) : 0);

    const totalEncumbrances = loanAmt + totalLiens + violationFines;
    const appraisedVal = Number(prop.appraisedValue) || Number((prop as any).PTotAppraisedAmt) || 0;
    const equity = appraisedVal - totalEncumbrances;

    const hasAny = loanAmt > 0 || totalLiens > 0 || violationFines > 0;
    if (!hasAny) return null;

    return (
        <div style={{ padding: '20px', borderRadius: '14px', background: '#fff', border: '2px solid #f1f5f9', marginBottom: '20px' }}>
            <div style={S.sectionHead as React.CSSProperties}>
                <i className="fa-solid fa-chart-pie" style={{ color: '#ef4444' }} /> Financial Exposure Summary
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '16px' }}>
                Outstanding financial obligations on this property
            </div>

            <div style={S.grid('repeat(auto-fill, minmax(180px, 1fr))')}>
                {loanAmt > 0 && (
                    <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <span style={S.label}>Outstanding Loan</span>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>{fmtCurrency(loanAmt)}</div>
                        {isDefault && <span style={S.pill('#fef2f2', '#b91c1c')}>In Default</span>}
                    </div>
                )}
                {totalLiens > 0 && (
                    <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <span style={S.label}>Total Tax Liens</span>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>{fmtCurrency(totalLiens)}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>({taxLiens.length} lien record{taxLiens.length > 1 ? 's' : ''})</div>
                    </div>
                )}
                {violationFines > 0 && (
                    <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <span style={S.label}>Total Violation Fines</span>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#f97316' }}>{fmtCurrency(violationFines)}</div>
                    </div>
                )}
                {appraisedVal > 0 && (
                    <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <span style={S.label}>Appraised Value</span>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981' }}>{fmtCurrency(appraisedVal)}</div>
                    </div>
                )}
            </div>

            {/* Total encumbrances */}
            {totalEncumbrances > 0 && (
                <div style={{ marginTop: '16px', padding: '16px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)', color: '#fff' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estimated Total Encumbrances</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', marginTop: '4px' }}>{fmtCurrency(totalEncumbrances)}</div>
                    {appraisedVal > 0 && (
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', opacity: 0.8 }}>Estimated Equity:</span>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: equity >= 0 ? '#86efac' : '#fca5a5' }}>
                                {equity >= 0 ? fmtCurrency(equity) : `Estimated Underwater: ${fmtCurrency(Math.abs(equity))}`}
                            </span>
                        </div>
                    )}
                    <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '8px' }}>
                        * Estimate only. Buyer should obtain full title report before purchase.
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   FIELD 9 — REMOTE MANAGEMENT SIGNALS
   ───────────────────────────────────────────── */
const ManagementSignals = ({ data }: { data: PropertyDetails }) => {
    const owners: any[] = (data as any).owners || [];
    const owner: any = owners[0] || {};
    const pa: any = data.proaddress || {};
    const prop: any = data.property || {};
    const loans: any[] = (data as any).loans || [];
    const taxLiens: any[] = (data as any).taxLiens || [];
    const violations: any[] = (data as any).violations || [];
    const evictions: any[] = (data as any).evictions || [];

    const pstate = prop.state || pa.PState;
    const comments = (pa.comments || prop.comments || '').toLowerCase();

    const chips: { text: string; bg: string; color: string }[] = [];

    if (owner.is_out_of_state === true)
        chips.push({ text: '✓ Out of State Owner Confirmed', bg: '#f0fdf4', color: '#166534' });
    if (owner.OState && pstate && owner.OState.toUpperCase() !== pstate.toUpperCase())
        chips.push({ text: '↔ Owner Address Differs from Property State', bg: '#eff6ff', color: '#1d4ed8' });
    if (pa.owner_current_state && pstate && pa.owner_current_state.toUpperCase() !== pstate.toUpperCase())
        chips.push({ text: '📍 Mailing Address Out of State', bg: '#eff6ff', color: '#2563eb' });
    if (taxLiens.length > 0)
        chips.push({ text: `⚠ Active Tax Liens (${taxLiens.length})`, bg: '#fef2f2', color: '#b91c1c' });
    if (violations.length > 0 || pa.violation_complaint)
        chips.push({ text: `⚠ Code Violations on Record (${violations.length || 1})`, bg: '#fff7ed', color: '#c2410c' });
    if (evictions.length > 0)
        chips.push({ text: '🔴 Eviction Filed', bg: '#fef2f2', color: '#dc2626' });
    if (loans[0]?.default_status?.toLowerCase().includes('delinquent') || loans[0]?.default_status?.toLowerCase().includes('default') || loans[0]?.foreclosure_stage)
        chips.push({ text: '🔴 Loan in Default', bg: '#fef2f2', color: '#b91c1c' });
    if (comments.includes('vacant'))
        chips.push({ text: '🏚 Vacant Property Indicators', bg: '#f8fafc', color: '#64748b' });

    if (chips.length === 0) return null;

    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={S.sectionHead as React.CSSProperties}>
                <i className="fa-solid fa-radar" style={{ color: '#3b82f6' }} /> Remote Management Indicators
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '14px' }}>
                Signals that suggest remote or absent ownership
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {chips.map((c, i) => (
                    <span key={i} style={{ ...S.pill(c.bg, c.color), padding: '7px 14px', fontSize: '12px', fontWeight: '700' }}>
                        {c.text}
                    </span>
                ))}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   ROOT — OUT OF STATE OWNER SECTION
   ───────────────────────────────────────────── */
const OutOfStateOwnerSection: React.FC<Props> = ({ data, isMobile }) => {
    const pa: any = data.proaddress || {};
    const prop: any = data.property || {};

    // Guard: only render if any trigger condition is met
    if (!shouldRender(data)) return null;

    const isPrimaryOOS = pa.PMotiveType === 'OOS';
    const propState = prop.state || pa.PState;

    return (
        <div style={{ padding: isMobile ? '0' : '4px' }}>
            {/* ── BANNER HEADER ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)',
                borderRadius: '18px',
                padding: '28px 28px 24px',
                marginBottom: '20px',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Decorative circle */}
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                    <i className="fa-solid fa-plane-departure" style={{ fontSize: '28px', marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '0.03em' }}>
                            🏠 OUT OF STATE OWNER
                        </div>
                        {propState ? (
                            <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.85, marginTop: '4px', maxWidth: '520px', lineHeight: '1.5' }}>
                                The owner of this property does not reside in <strong>{stateLabel(propState)}</strong>. Out of state owners are often highly motivated sellers.
                            </div>
                        ) : (
                            <div style={{ fontSize: '14px', fontWeight: '600', opacity: 0.85, marginTop: '4px' }}>
                                The owner of this property resides out of state — a strong motivated seller signal.
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span style={{ ...S.pill('rgba(255,255,255,0.2)', '#fff'), fontSize: '12px' }}>
                        🎯 Motivated Seller — Out of State
                    </span>
                    <span style={{ ...S.pill('rgba(255,255,255,0.2)', '#fff'), fontSize: '12px' }}>
                        📍 Remote Owner
                    </span>
                    {isPrimaryOOS && (
                        <span style={{ ...S.pill('rgba(255,255,255,0.25)', '#fff'), fontSize: '12px', border: '1px solid rgba(255,255,255,0.4)' }}>
                            Primary Motive Type: Out of State
                        </span>
                    )}
                </div>
            </div>

            {/* State Comparison */}
            <StateComparisonBlock data={data} isMobile={isMobile} />

            {/* Owner Identity + Contact */}
            <OwnerIdentityBlock data={data} />

            {/* Address Blocks */}
            <AddressBlock data={data} isMobile={isMobile} />

            {/* Occupancy */}
            <OccupancyIndicator data={data} />

            {/* Ownership Duration */}
            <OwnershipDuration data={data} />

            {/* Financial Exposure */}
            <FinancialExposure data={data} />

            {/* Management Signals */}
            <ManagementSignals data={data} />
        </div>
    );
};

export default OutOfStateOwnerSection;
