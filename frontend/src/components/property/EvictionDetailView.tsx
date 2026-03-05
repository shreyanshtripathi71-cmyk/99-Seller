"use client";
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import OutOfStateOwnerSection from '@/components/property/OutOfStateOwnerSection';
import { PropertyDetails } from '@/components/dashboard/PropertyDetailsPage';

interface Props { data: PropertyDetails; isMobile: boolean; }

/* ── helpers ── */
const fmtCurrency = (v: any) => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'string' ? parseFloat(v.replace(/[$,]/g, '')) : Number(v);
    if (isNaN(n)) return null;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};

const fmtDate = (d: any) => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const fmtPhone = (p: any) => {
    if (!p) return null;
    const c = String(p).replace(/\D/g, '');
    return c.length === 10 ? `(${c.slice(0, 3)}) ${c.slice(3, 6)}-${c.slice(6)}` : String(p);
};

const getRelativeTime = (d: any, suffix: string = "ago") => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    const now = new Date();
    const diff = now.getTime() - dt.getTime();
    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let timeStr = "";
    if (years > 0) timeStr = `${years} year${years > 1 ? 's' : ''}`;
    else if (months > 0) timeStr = `${months} month${months > 1 ? 's' : ''}`;
    else timeStr = `${days} day${days > 1 ? 's' : ''}`;

    return diff >= 0 ? `${timeStr} ${suffix}` : `in ${timeStr}`;
};

const notEmpty = (v: any) => v !== null && v !== undefined && v !== '' && String(v).trim() !== '';
const sanitize = (html: string) => typeof window === 'undefined' ? html : DOMPurify.sanitize(html);

const joinName = (...parts: (string | null | undefined)[]) => {
    const p = parts.filter(notEmpty).map(x => String(x).trim());
    return p.length > 0 ? p.join(' ') : null;
};

/* ── style tokens ── */
const S = {
    card: { background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', overflow: 'hidden' } as React.CSSProperties,
    heroCard: { background: 'linear-gradient(135deg, #fff 0%, #f1f5f9 100%)', borderRadius: '16px', padding: '28px', marginBottom: '20px', border: '1px solid #e2e8f0', position: 'relative' } as React.CSSProperties,
    sectionHead: { fontSize: '14px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' } as React.CSSProperties,
    grid: (cols = 'repeat(auto-fill, minmax(200px, 1fr))') => ({ display: 'grid', gridTemplateColumns: cols, gap: '20px' } as React.CSSProperties),
    label: { display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px' } as React.CSSProperties,
    value: { fontSize: '15px', fontWeight: '600', color: '#0f172a', wordBreak: 'break-word' } as React.CSSProperties,
    pill: (bg: string, color: string) => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: bg, color, borderRadius: '9999px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' } as React.CSSProperties),
    banner: (bg: string, color: string) => ({ padding: '14px 18px', borderRadius: '12px', background: bg, color, fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${color}20` } as React.CSSProperties),
    expandBtn: { background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: '4px 0', marginTop: '4px', textTransform: 'uppercase' as any } as React.CSSProperties,
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
    const [isExpanded, setIsExpanded] = useState(false);
    if (!text) return null;
    if (text.length <= limit) return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
    return (
        <div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{isExpanded ? text : text.substring(0, preview) + '...'}</div>
            <button onClick={() => setIsExpanded(!isExpanded)} style={S.expandBtn}>
                {isExpanded ? 'Show Less' : 'Show More'}
            </button>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 1 — PROPERTY IMAGES & MEDIA
   ══════════════════════════════════════════════════ */
const MediaSection = ({ data }: { data: PropertyDetails }) => {
    const prop = data.property || {};
    const pa = data.proaddress || {};
    const files = (data as any).filesUrls || [];
    const eviFiles = files.filter((f: any) => f.PMotiveType === "EVI");

    const hasMedia = prop.local_image_path || pa.contact_image || eviFiles.length > 0;
    if (!hasMedia) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-camera" /> Property Media & Documents</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: eviFiles.length ? '24px' : '0' }}>
                {prop.local_image_path && (
                    <div style={{ flex: '1 1 300px' }}>
                        <span style={S.label}>Property Photo</span>
                        <img src={prop.local_image_path} alt="Property" style={{ width: '100%', borderRadius: '12px', height: '240px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                    </div>
                )}
                {pa.contact_image && (
                    <div style={{ flex: '1 1 300px' }}>
                        <span style={S.label}>Contact Photo</span>
                        <img src={pa.contact_image} alt="Contact" style={{ width: '100%', borderRadius: '12px', height: '240px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                    </div>
                )}
            </div>

            {eviFiles.length > 0 && (
                <div style={S.grid()}>
                    {eviFiles.map((f: any, i: number) => (
                        <div key={i} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i className="fa-regular fa-file-lines" style={{ fontSize: '20px', color: '#1e293b' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>
                                    {f.property_card ? 'Property Card' : 'Eviction Document'}
                                    {f.parsed && <span style={{ marginLeft: '6px', color: '#10b981', fontSize: '10px' }}>✓ VERIFIED</span>}
                                </div>
                                <a href={f.url || f.property_card} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#3b82f6', textDecoration: 'underline' }}>
                                    View {f.property_card ? 'Card' : 'Notice/Filing'}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {eviFiles.some((f: any) => f.contents) && (
                <div style={{ marginTop: '20px' }}>
                    {eviFiles.map((f: any, i: number) => f.contents && (
                        <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                            <span style={S.label}>Document Content Excerpt</span>
                            <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', color: '#475569' }}
                                dangerouslySetInnerHTML={{ __html: sanitize(f.contents) }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 2 — PROPERTY OVERVIEW
   ══════════════════════════════════════════════════ */
const OverviewSection = ({ data }: { data: PropertyDetails }) => {
    const prop = data.property || {};
    const pa = data.proaddress || {};

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-house" /> Property Overview</h3>
            <div style={S.grid()}>
                <DI label="Bedrooms" value={prop.beds} />
                <DI label="Bathrooms" value={prop.baths} />
                <DI label="Total Sq Ft" value={prop.sqft?.toLocaleString()} />
                <DI label="Year Built" value={prop.yearBuilt} />
                <DI label="Property Type" value={prop.propertyType} />
                <DI label="Land / Building Classification" value={(prop as any).PLandBuilding} />
                <DI label="Base Value" value={fmtCurrency((prop as any).PBase)} />
                <DI label="Total Land Area" value={(prop as any).PTotLandArea} />
                <DI label="Total Building Area" value={(prop as any).PTotBuildingArea} />
            </div>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                <div style={S.grid()}>
                    <DI label="Last Sold Price" value={fmtCurrency((prop as any).PLastSoldAmt)} bold />
                    <DI label="Last Sold Date" value={fmtDate((prop as any).PLastSoldDate)} />
                    <DI label="Total Appraised Value" value={fmtCurrency(prop.appraisedValue)} bold color="#10b981" />
                    <DI label="Building Appraised Value" value={fmtCurrency((prop as any).PAppraisedBuildingAmt)} />
                    <DI label="Land Appraised Value" value={fmtCurrency((prop as any).PAppraisedLandAmt)} />
                    <DI label="Listing ID" value={(prop as any).PListingID} />
                    <DI label="Date Filed" value={fmtDate((prop as any).PDateFiled)} />
                </div>
            </div>

            {prop.comments && (
                <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <span style={S.label}>Property Comments</span>
                    <p style={{ ...S.value, fontSize: '13px', fontStyle: 'italic', margin: 0 }}>{prop.comments}</p>
                </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '11px', color: '#94a3b8' }}>
                {pa.DATE_TIMEOFEXTRACTION && <span>Data Last Updated: {fmtDate(pa.DATE_TIMEOFEXTRACTION)}</span>}
                {pa.site && <a href={pa.site.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Source: {pa.site.url}</a>}
                {pa.pageUrl && <a href={pa.pageUrl.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Original Page</a>}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 3 — LISTING DETAILS
   ══════════════════════════════════════════════════ */
const ListingSection = ({ data }: { data: PropertyDetails }) => {
    const pa = data.proaddress || {};
    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-list-check" /> Listing Details</h3>
            <div style={S.grid()}>
                <DI label="Listing ID" value={pa.listing_id} />
                <DI label="Asking Price" value={fmtCurrency(pa.price)} bold color="#10b981" />
                <DI label="Property Type" value={pa.proptype} />
                <DI label="Beds" value={pa.beds} />
                <DI label="Baths" value={pa.baths} />
                <DI label="Square Feet" value={pa.square_feet?.toLocaleString()} />
                <DI label="Floors" value={pa.floors} />
                <DI label="Year Built" value={pa.PYearBuilt} />
                <DI label="Lot Size" value={pa.lot_size} />
                <DI label="Garage Size" value={pa.garage_size} />
                <DI label="School District" value={pa.school_district} />
                <DI label="Amenities" value={pa.amenities} />
                <DI label="Comments" value={pa.comments} wide />
                <DI label="Case / Reference Number" value={pa.case_number} />
                <DI label="Deed Book / Page" value={pa.deed_book_page} />
                <DI label="Expected Sale Date" value={fmtDate(pa.sale_date)} />
                <DI label="Sale Time" value={pa.sale_time} />
                <DI label="Counties" value={pa.counties} />
            </div>
            {pa.url && (
                <div style={{ marginTop: '20px' }}>
                    <a href={pa.url} target="_blank" rel="noopener noreferrer" style={{ ...S.pill('#eff6ff', '#3b82f6'), textDecoration: 'none' }}>
                        <i className="fa-solid fa-external-link" style={{ marginRight: '6px' }} /> Original Listing URL
                    </a>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 4 — EVICTION PROCEEDINGS
   ══════════════════════════════════════════════════ */
const EvictionProceedings = ({ data }: { data: PropertyDetails }) => {
    const evictions = (data as any).evictions || [];
    const pa = data.proaddress || {};

    const allDates = [
        ...evictions.map((e: any) => e.court_date),
        pa.court_date
    ].filter(Boolean);

    const hasFuture = allDates.some(d => new Date(d) > new Date());
    const allPast = allDates.length > 0 && allDates.every(d => new Date(d) < new Date());

    const getBanner = () => {
        if (hasFuture) return { text: "⚠ OCCUPIED — Eviction Proceedings Active", bg: "#FEF2F2", color: "#B91C1C", icon: "fa-triangle-exclamation" };
        if (allPast) return { text: "✓ Eviction Proceedings Past — Verify Occupancy", bg: "#F8FAF8", color: "#475569", icon: "fa-circle-check" };
        return { text: "⚠ OCCUPANCY STATUS UNKNOWN — Verify Before Purchase", bg: "#FFFBEB", color: "#92400E", icon: "fa-circle-question" };
    };

    const banner = getBanner();

    const renderDateStatus = (date: any) => {
        if (!date) return null;
        const dt = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dtClear = new Date(dt);
        dtClear.setHours(0, 0, 0, 0);

        if (dtClear.getTime() === today.getTime()) return <span style={{ ...S.pill('#FEF2F2', '#EF4444'), animation: 'pulse 2s infinite' }}>TODAY</span>;
        if (dtClear.getTime() < today.getTime()) return <span style={S.pill('#F1F5F9', '#64748B')}>PAST</span>;

        const diff = dtClear.getTime() - today.getTime();
        const days = Math.floor(diff / 86400000);
        if (days <= 7) return <span style={S.pill('#FEF2F2', '#EF4444')}>IMMINENT</span>;
        return <span style={S.pill('#FFF7ED', '#F97316')}>UPCOMING</span>;
    };

    return (
        <div id="eviction-section">
            {/* Occupancy Banner */}
            <div style={{ ...S.banner(banner.bg, banner.color), border: `1px solid ${banner.color}30`, position: 'sticky', top: 0, zIndex: 10 }}>
                <i className={`fa-solid ${banner.icon}`} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>{banner.text}</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>Buyer is advised to independently verify current occupancy status before completing purchase.</div>
                </div>
            </div>

            {/* Source A: Eviction Table */}
            {evictions.sort((a: any, b: any) => new Date(a.court_date).getTime() - new Date(b.court_date).getTime()).map((e: any, i: number) => (
                <div key={i} style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <span style={S.pill('#F1F5F9', '#475569')}>Eviction Proceeding #{i + 1}</span>
                            <div style={{ marginTop: '12px' }}>
                                <span style={S.label}>Court Date</span>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {fmtDate(e.court_date)}
                                    {renderDateStatus(e.court_date)}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                                    {getRelativeTime(e.court_date)}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={S.label}>Court Docket #</span>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(e.court_docket); alert('Docket copied!'); }}>
                                {e.court_docket} <i className="fa-regular fa-copy" style={{ fontSize: '14px', marginLeft: '6px', color: '#3B82F6' }} />
                            </div>
                        </div>
                    </div>

                    <div style={S.grid()}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <span style={S.label}>Plaintiff (Landlord / Owner)</span>
                            <div style={{ ...S.value, fontSize: '18px' }}>{e.plaintiff_name}</div>
                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Party who filed the eviction</div>
                        </div>
                        <div>
                            <span style={S.label}>Jurisdiction / Location</span>
                            <div style={S.pill('#EFF6FF', '#1E40AF')}>
                                {e.court_desc} {e.court_room && `— Room ${e.court_room}`}
                            </div>
                        </div>
                    </div>

                    {e.details && (
                        <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: '#F8FAF8', border: '1px solid #E2E8F0' }}>
                            <span style={S.label}>Case Details</span>
                            <ExpandableText text={e.details} limit={300} preview={150} />
                        </div>
                    )}
                </div>
            ))}

            {/* Source B: Proaddress Fields */}
            {(pa.court_docket || pa.court_date || pa.eviction_owner_lawyer_name) && (
                <div style={{ ...S.card, border: '1px dashed #CBD5E1' }}>
                    <h4 style={S.sectionHead}><i className="fa-solid fa-gavel" /> Listing Eviction Data</h4>
                    <div style={S.grid()}>
                        <div>
                            <span style={S.label}>Court Date</span>
                            <div style={{ ...S.value, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {fmtDate(pa.court_date) || 'Not listed'}
                                {pa.court_date && renderDateStatus(pa.court_date)}
                            </div>
                        </div>
                        <div>
                            <span style={S.label}>Court Docket #</span>
                            <div style={{ ...S.value, cursor: 'pointer' }} onClick={() => pa.court_docket && navigator.clipboard.writeText(pa.court_docket)}>
                                {pa.court_docket || 'Not listed'} {pa.court_docket && <i className="fa-regular fa-copy" style={{ fontSize: '12px', color: '#3B82F6' }} />}
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <span style={S.label}>Owner's Attorney / Lawyer</span>
                            <div style={{ ...S.value, color: '#2563EB', fontSize: '17px' }}>{pa.eviction_owner_lawyer_name || 'Generic Representation'}</div>
                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Contact regarding eviction proceedings</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 5 — CODE VIOLATIONS
   ══════════════════════════════════════════════════ */
const ViolationsSection = ({ data }: { data: PropertyDetails }) => {
    const violations = (data as any).violations || [];
    const pa = data.proaddress || {};

    if (violations.length === 0 && !pa.violation_complaint) return null;

    const getBadgeProps = (type: string = '') => {
        const t = type.toLowerCase();
        if (t.includes('building') || t.includes('structure') || t.includes('fire') || t.includes('safety')) return { bg: '#fee2e2', color: '#ef4444' };
        if (t.includes('health') || t.includes('sanitation')) return { bg: '#ffedd5', color: '#f97316' };
        if (t.includes('zoning') || t.includes('land')) return { bg: '#f3e8ff', color: '#a855f7' };
        if (t.includes('elec')) return { bg: '#fef9c3', color: '#a16207' };
        if (t.includes('plumb')) return { bg: '#dbeafe', color: '#3b82f6' };
        return { bg: '#f1f5f9', color: '#64748b' };
    };

    const getStatusProps = (s: string = '') => {
        const lower = s.toLowerCase();
        if (['resolved', 'compliant', 'closed'].includes(lower)) return { bg: '#f0fdf4', color: '#10b981', label: 'RESOLVED' };
        if (['open', 'pending', 'active'].includes(lower)) return { bg: '#fff7ed', color: '#f97316', label: 'OPEN' };
        if (['overdue', 'non-compliant', 'delinquent'].includes(lower)) return { bg: '#fef2f2', color: '#ef4444', label: 'OVERDUE' };
        return { bg: '#f1f5f9', color: '#64748b', label: s.toUpperCase() };
    };

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-triangle-exclamation" style={{ color: '#F59E0B' }} /> Code Violations</h3>
            <div style={S.banner('#FEF2F2', '#B91C1C')}>
                <i className="fa-solid fa-circle-exclamation" />
                <strong>⚠ This property has recorded code violations. Buyer should review all violations before purchase.</strong>
            </div>

            {violations.map((v: any, i: number) => {
                const sp = getStatusProps(v.compliance_status);
                const deadlineDate = v.remediation_deadline ? new Date(v.remediation_deadline) : null;
                const isOverdue = deadlineDate && deadlineDate < new Date() && !['resolved', 'compliant'].includes(v.compliance_status?.toLowerCase());
                const isApproaching = deadlineDate && !isOverdue && (deadlineDate.getTime() - new Date().getTime() < 30 * 86400000);

                return (
                    <div key={i} style={{ padding: '20px', background: '#F8FAF8', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ ...S.value, color: '#1E293B' }}>{v.complaint}</div>
                            <div style={S.pill(sp.bg, sp.color)}>{sp.label}</div>
                        </div>
                        <div style={S.grid()}>
                            <DI label="Issue Date" value={`${fmtDate(v.issue_date)} (${getRelativeTime(v.issue_date)})`} />
                            <div>
                                <span style={S.label}>Remediation Deadline</span>
                                <div style={{ ...S.value, color: isOverdue ? '#EF4444' : isApproaching ? '#F59E0B' : '#0F172A' }}>
                                    {fmtDate(v.remediation_deadline) || 'N/A'}
                                    {isOverdue && <span style={{ ...S.pill('#FEE2E2', '#EF4444'), marginLeft: '8px' }}>OVERDUE</span>}
                                    {isApproaching && <span style={{ ...S.pill('#FFF7ED', '#F59E0B'), marginLeft: '8px' }}>APPROACHING</span>}
                                </div>
                            </div>
                            <DI label="Fine Amount" value={fmtCurrency(v.fine_amount)} bold color="#EF4444" />
                            <DI label="Compliance" value={v.compliance_status} />
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <span style={S.label}>Violation Types</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {v.types?.split(',').map((t: string, idx: number) => {
                                    const bp = getBadgeProps(t.trim());
                                    return <span key={idx} style={S.pill(bp.bg, bp.color)}>{t.trim()}</span>;
                                })}
                            </div>
                        </div>
                        {v.short_desc && <div style={{ marginTop: '12px', fontSize: '13px', fontWeight: 600, color: '#475569' }}>{v.short_desc}</div>}
                    </div>
                );
            })}

            {pa.violation_complaint && (
                <div style={{ padding: '16px', border: '1px dashed #CBD5E1', borderRadius: '12px', background: '#fff' }}>
                    <h4 style={{ ...S.sectionHead, fontSize: '12px' }}>Listing Violation Data</h4>
                    <div style={S.grid()}>
                        <DI label="Complaint" value={pa.violation_complaint} />
                        <DI label="Issue Date" value={fmtDate(pa.violation_issue_date)} />
                        <DI label="Total Fine Amount" value={fmtCurrency(pa.violation_total)} bold />
                        <DI label="Issued By" value={pa.violation_issued_by} />
                    </div>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 6 — TAX LIEN DETAILS
   ══════════════════════════════════════════════════ */
const TaxLienSection = ({ data }: { data: PropertyDetails }) => {
    const liens = (data as any).taxLiens || [];
    if (!liens.length) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-building-columns" style={{ color: '#ef4444' }} /> Tax Lien Records</h3>
            <div style={S.banner('#fef2f2', '#b91c1c')}>
                <i className="fa-solid fa-triangle-exclamation" /> <strong>⚠ This property has outstanding tax liens. Buyer assumes all financial encumbrances upon purchase.</strong>
            </div>
            <div style={S.grid()}>
                {liens.map((l: any, i: number) => {
                    const isExpired = l.redemption_period_end && new Date(l.redemption_period_end) < new Date();
                    return (
                        <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontWeight: '800', color: '#1e293b' }}>{l.tax_year} LIEN</span>
                                <span style={S.pill(l.status === 'Paid' ? '#f0fdf4' : '#fee2e2', l.status === 'Paid' ? '#10b981' : '#ef4444')}>{l.status || 'Active'}</span>
                            </div>
                            <div style={S.grid('1fr')}>
                                <DI label="Amount Owed" value={fmtCurrency(l.amount_owed)} bold color="#ef4444" />
                                <DI label="Lien Filed Date" value={fmtDate(l.lien_date)} />
                                <DI label="Tax Authority" value={l.tax_authority} />
                                <div>
                                    <span style={S.label}>Redemption Period Ends</span>
                                    <div style={{ ...S.value, color: isExpired ? '#ef4444' : '#f59e0b' }}>
                                        {fmtDate(l.redemption_period_end)}
                                        {isExpired ? (
                                            <span style={{ ...S.pill('#fee2e2', '#ef4444'), marginLeft: '8px' }}>EXPIRED</span>
                                        ) : (
                                            <span style={{ fontSize: '11px', fontWeight: 700, marginLeft: '8px' }}>Expires {getRelativeTime(l.redemption_period_end)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 7 — LOAN & DEFAULT DETAILS
   ══════════════════════════════════════════════════ */
const LoanSection = ({ data }: { data: PropertyDetails }) => {
    const loans = (data as any).loans || [];
    if (!loans.length) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-file-invoice-dollar" /> Loan & Default Details</h3>
            {loans.map((l: any, i: number) => {
                const isDefault = Number(l.total_default_amount) > 0 || l.default_status?.toLowerCase().includes('default') || l.default_status?.toLowerCase().includes('delinquent');
                return (
                    <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                        {isDefault && (
                            <div style={S.banner('#FEF2F2', '#EF4444')}>
                                <i className="fa-solid fa-circle-exclamation" /> <strong>⚠ Outstanding loan default exists alongside eviction proceedings</strong>
                            </div>
                        )}
                        {l.foreclosure_stage && (
                            <div style={S.banner('#FFF7ED', '#F97316')}>
                                <i className="fa-solid fa-house-fire" /> <strong>⚠ This property also has an active foreclosure filing: {l.foreclosure_stage}</strong>
                            </div>
                        )}
                        <div style={S.grid()}>
                            <DI label="Borrower Name" value={l.borrower_name} bold />
                            <DI label="Lender" value={l.lender_name} />
                            <DI label="Lender Address" value={l.lender_address} wide />
                            <DI label="Original Loan Amount" value={fmtCurrency(l.loan_amount)} />
                            <DI label="Total Amount in Default" value={fmtCurrency(l.total_default_amount)} color="#EF4444" bold />
                            <DI label="Arrears Amount" value={fmtCurrency(l.arrears_amount)} />
                            <DI label="Foreclosure Stage" value={l.foreclosure_stage} />
                            <DI label="Lis Pendens Filed" value={fmtDate(l.lis_pendens_date)} />
                            <DI label="Default Status" value={l.default_status} color={isDefault ? '#EF4444' : '#10B981'} />
                            <DI label="Loan Origination Date" value={fmtDate(l.datetime)} />
                            <DI label="Deed Reference ID" value={l.deed_id} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 8 — TRUST DEED DETAILS
   ══════════════════════════════════════════════════ */
const TrustDeedSection = ({ data }: { data: PropertyDetails }) => {
    const td = (data as any).propertyTrustDeed || {};
    if (!td.deed_id && !td.property_address) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-stamp" /> Trust Deed Details</h3>
            <div style={S.grid()}>
                <DI label="Deed ID" value={td.deed_id} />
                <DI label="Owner on Deed" value={td.owner_name} />
                <DI label="Borrower on Deed" value={td.borrower_name} />
                <DI label="Lender on Deed" value={td.lender_name} />
                <DI label="Lender Address on Deed" value={td.lender_address} />
                <DI label="Trustee on Deed" value={td.trustee_name} />
                <DI label="Trustee Address on Deed" value={td.trustee_address} />
                <DI label="Loan Amount on Deed" value={fmtCurrency(td.loan_amount)} />
                <DI label="County on Deed" value={td.county} />
                <DI label="Address on Deed" value={td.property_address} />
                <DI label="Deed Date" value={fmtDate(td.datetime)} />
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 9 — TRUSTEE DETAILS
   ══════════════════════════════════════════════════ */
const TrusteeSection = ({ data }: { data: PropertyDetails }) => {
    const pa = data.proaddress || {};
    const trustee = (data as any).trustee || {};

    const name = pa.trusteename || trustee.TTrusteeName;
    const company = pa.trusteecompanyname;
    const addr = pa.trusteeaddress || trustee.TTrusteeAddress;
    const city = pa.trusteecity || trustee.TTRUSTEECity;
    const state = pa.trusteestate || trustee.TTRUSTEEState;
    const zip = pa.trusteezip || trustee.TTRUSTEEZip;
    const phone = pa.trusteephone || trustee.TTrusteePhone;
    const email = pa.trusteeemail || trustee.TTrusteeEmail;
    const website = pa.trusteewebsite || trustee.TTrusteeWebSite;

    if (!name && !addr && !phone) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-building-user" /> Trustee Details</h3>
            <div style={S.grid()}>
                <div style={{ gridColumn: 'span 2' }}>
                    <span style={S.label}>Trustee Information</span>
                    <div style={{ ...S.value, lineHeight: '1.6' }}>
                        {company && <div style={{ fontWeight: 800 }}>{company}</div>}
                        {name && <div style={{ fontSize: '16px' }}>{name}</div>}
                        {addr && <div>{addr}</div>}
                        {(city || state || zip) && <div>{city}{city && state ? ', ' : ''}{state} {zip}</div>}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <DI label="Trustee Phone" value={phone ? <a href={`tel:${phone}`} style={{ color: '#3B82F6' }}>{fmtPhone(phone)}</a> : null} />
                    <DI label="Trustee Email" value={email ? <a href={`mailto:${email}`} style={{ color: '#3B82F6' }}>{email}</a> : null} />
                    <DI label="Trustee Website" value={website ? <a href={website} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6' }}><i className="fa-solid fa-globe" /> Visit Site</a> : null} />
                    <DI label="Trustee Type" value={pa.trusteetype} />
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 10 — OWNER DETAILS
   ══════════════════════════════════════════════════ */
const OwnerSection = ({ data }: { data: PropertyDetails }) => {
    const pa = data.proaddress || {};
    const prop = data.property || {};
    const owners = (data as any).owners || [];
    const owner = owners[0] || {};
    const oname = (data as any).ownername || {};
    const evi = ((data as any).evictions && (data as any).evictions[0]) || {};

    // Priority Fallback Chain
    const getName = () => {
        const o = joinName(owner.OFirstName, owner.OMiddleName, owner.OLastName);
        if (o) return o;
        const n = joinName(oname.PFirstName, oname.PMiddleName, oname.PLastName);
        if (n) return n;
        const p = joinName(pa.PFirstName, pa.PMiddleName, pa.PLastName);
        if (p) return p;
        if (pa.owner_name) return pa.owner_name;
        const td = (data as any).propertyTrustDeed || {};
        if (td.owner_name) return td.owner_name;
        const loan = ((data as any).loans && (data as any).loans[0]) || {};
        if (loan.borrower_name) return `${loan.borrower_name} (Owner from Loan)`;
        return "Unknown Owner";
    };

    const ownerName = getName();
    const isPlaintiff = evi.plaintiff_name?.toLowerCase().includes(ownerName.toLowerCase()) || ownerName.toLowerCase().includes(evi.plaintiff_name?.toLowerCase());

    // Address Blocks
    const propAddr = pa.PStreetAddr1 || `${pa.PStreetNum || ''} ${pa.PStreetName || pa.backup_street_name || ''} ${pa.street_name_post_type || pa.streetnameposttype || ''} ${pa.PSuiteNum || ''}`.trim();
    const propCity = pa.Pcity || prop.city;
    const propState = pa.PState || prop.state;
    const propZip = pa.Pzip || prop.zip;
    const propCounty = pa.county_fixed || prop.county;

    const mailAddr1 = owner.OStreetAddr1 || pa.owner_mailing_address;
    const mailAddr2 = owner.OStreetAddr2;
    const mailCity = owner.OCity;
    const mailState = owner.OState;
    const mailZip = owner.OZip;

    const isSame = mailAddr1 && propAddr && mailAddr1.toLowerCase().includes(propAddr.toLowerCase());

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-user-tie" /> Property Owner (Landlord / Plaintiff)</h3>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '20px' }}>This is the party who filed the eviction and is the motivated seller</div>

            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800' }}>
                        {ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {ownerName}
                            {isPlaintiff && <span style={S.pill('#F0FDF4', '#10B981')}>✓ Confirmed as Eviction Plaintiff</span>}
                        </div>
                        {oname.PcompanyName || pa.PcompayName ? (
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#64748b' }}>
                                <i className="fa-solid fa-building" /> Company / Entity: {oname.PcompanyName || pa.PcompayName}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {pa.owner_phone && (
                        <a href={`tel:${pa.owner_phone}`} style={{ ...S.pill('#F0FDF4', '#166534'), textDecoration: 'none', padding: '10px 18px', fontWeight: 700 }}>
                            <i className="fa-solid fa-phone" style={{ marginRight: '8px' }} /> CALL OWNER / LANDLORD
                        </a>
                    )}
                    {owner.email && (
                        <a href={`mailto:${owner.email}`} style={{ ...S.pill('#EFF6FF', '#1D4ED8'), textDecoration: 'none', padding: '10px 18px', fontWeight: 700 }}>
                            <i className="fa-solid fa-envelope" style={{ marginRight: '8px' }} /> EMAIL OWNER / LANDLORD
                        </a>
                    )}
                </div>

                {pa.eviction_owner_lawyer_name && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                        <span style={S.label}>Owner's Attorney</span>
                        <div style={{ ...S.value, color: '#2563EB', fontSize: '16px' }}>{pa.eviction_owner_lawyer_name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Contact for legal inquiries</div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Location Block */}
                <div style={{ flex: '1 1 340px', padding: '20px', borderRadius: '12px', background: '#fff', border: '1px solid #F1F5F9' }}>
                    <span style={S.label}>Property Location (Eviction Site)</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{propAddr}</div>
                    <div style={{ fontSize: '15px', color: '#475569', fontWeight: 600 }}>{propCity}, {propState} {propZip}</div>
                    <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>{propCounty} County</div>
                </div>

                {/* Mailing Block */}
                <div style={{ flex: '1 1 340px', padding: '20px', borderRadius: '12px', background: isSame ? '#F0FDF4' : '#fff', border: isSame ? '1px solid #BBF7D0' : '1px solid #F1F5F9' }}>
                    <span style={S.label}>Owner's Mailing Address</span>
                    {isSame ? (
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#166534' }}>
                            <i className="fa-solid fa-house-chimney-user" style={{ marginRight: '8px' }} /> Owner resides at the property address
                        </div>
                    ) : (
                        <div>
                            {owner.is_out_of_state && (
                                <div style={{ ...S.pill('#FEF2F2', '#EF4444'), marginBottom: '10px', fontSize: '10px' }}>⚠ OUT OF STATE OWNER</div>
                            )}
                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{mailAddr1}</div>
                            {mailAddr2 && <div>{mailAddr2}</div>}
                            {(mailCity || mailState || mailZip) && (
                                <div style={{ fontSize: '15px', color: '#475569', fontWeight: 600 }}>{mailCity}{mailCity && mailState ? ', ' : ''}{mailState} {mailZip}</div>
                            )}
                            {pa.owner_current_state && (
                                <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748B' }}>
                                    Current State of Residence: <span style={{ fontWeight: 700 }}>{pa.owner_current_state}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {oname.html && (
                <div style={{ marginTop: '24px' }}>
                    <span style={S.label}>Owner/Entity Profile</span>
                    <div style={{ fontSize: '13px', color: '#475569', background: '#F8FAF8', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                        dangerouslySetInnerHTML={{ __html: sanitize(oname.html) }} />
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   ROOT — EVICTION DETAIL VIEW
   ══════════════════════════════════════════════════ */
const EvictionDetailView: React.FC<Props> = ({ data, isMobile }) => {
    // Scroll to violations logic or similar could go here if needed via IDs

    return (
        <div style={{ padding: isMobile ? '0' : '12px' }}>
            <MediaSection data={data} />
            <OverviewSection data={data} />
            <ListingSection data={data} />
            <EvictionProceedings data={data} />
            <ViolationsSection data={data} />
            <TaxLienSection data={data} />
            <LoanSection data={data} />
            <TrustDeedSection data={data} />
            <TrusteeSection data={data} />
            <OutOfStateOwnerSection data={data} isMobile={isMobile} />
            <OwnerSection data={data} />

            <style jsx global>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default EvictionDetailView;
