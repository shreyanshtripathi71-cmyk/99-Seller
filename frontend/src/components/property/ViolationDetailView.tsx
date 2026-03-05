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
    const codFiles = files.filter((f: any) => f.PMotiveType === "COD");

    const hasMedia = prop.local_image_path || pa.contact_image || codFiles.length > 0;
    if (!hasMedia) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-camera" /> Property Media & Documents</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: codFiles.length ? '24px' : '0' }}>
                {prop.local_image_path && (
                    <div style={{ flex: '1 1 300px' }}>
                        <span style={S.label}>Property Photo</span>
                        <img src={prop.local_image_path} alt="Property" style={{ width: '100%', borderRadius: '12px', height: '200px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                    </div>
                )}
                {pa.contact_image && (
                    <div style={{ flex: '1 1 300px' }}>
                        <span style={S.label}>Contact Photo</span>
                        <img src={pa.contact_image} alt="Contact" style={{ width: '100%', borderRadius: '12px', height: '200px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                    </div>
                )}
            </div>

            {codFiles.length > 0 && (
                <div style={S.grid()}>
                    {codFiles.map((f: any, i: number) => (
                        <div key={i} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i className="fa-regular fa-file-pdf" style={{ fontSize: '20px', color: '#ef4444' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>
                                    {f.property_card ? 'Property Card' : 'Violation Document'}
                                    {f.parsed && <span style={{ marginLeft: '6px', color: '#10b981', fontSize: '10px' }}>✓ VERIFIED</span>}
                                </div>
                                <a href={f.url || f.property_card} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#3b82f6', textDecoration: 'underline' }}>
                                    View {f.property_card ? 'Card' : 'Document'}
                                </a>
                            </div>
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
                    <DI label="Building Appraised" value={fmtCurrency((prop as any).PAppraisedBuildingAmt)} />
                    <DI label="Land Appraised" value={fmtCurrency((prop as any).PAppraisedLandAmt)} />
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
   SECTION 4 — ★ CODE VIOLATIONS ★
══════════════════════════════════════════════════ */
const ViolationsSection = ({ data }: { data: PropertyDetails }) => {
    const violations = (data as any).violations || [];
    const pa = data.proaddress || {};

    // Total Fines Calculation
    const tableFines = violations.reduce((sum: number, v: any) => sum + (Number(v.fine_amount) || 0), 0);
    const paFine = Number(pa.violation_total) || 0;
    const totalFines = tableFines + paFine;

    // Status counts
    const openCount = violations.filter((v: any) => ['open', 'pending'].includes(v.compliance_status?.toLowerCase())).length;
    const resolvedCount = violations.filter((v: any) => ['resolved', 'compliant'].includes(v.compliance_status?.toLowerCase())).length;

    const overdueCount = violations.filter((v: any) => {
        if (['resolved', 'compliant'].includes(v.compliance_status?.toLowerCase())) return false;
        if (!v.remediation_deadline) return false;
        return new Date(v.remediation_deadline) < new Date();
    }).length;

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
        <div id="violations-hero">
            {/* Summary Bar */}
            <div style={{ ...S.card, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.7 }}>TOTAL VIOLATIONS</span>
                        <div style={{ fontSize: '28px', fontWeight: '900' }}>{violations.length + (pa.violation_complaint ? 1 : 0)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.7 }}>TOTAL FINES</span>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#fbbf24' }}>{fmtCurrency(totalFines)}</div>
                    </div>
                    {overdueCount > 0 && (
                        <div style={{ ...S.pill('#fecaca', '#b91c1c'), padding: '8px 16px' }}>
                            <i className="fa-solid fa-clock" style={{ marginRight: '8px' }} /> {overdueCount} OVERDUE
                        </div>
                    )}
                    {openCount > 0 && (
                        <div style={{ ...S.pill('#fed7aa', '#9a3412'), padding: '8px 16px' }}>
                            {openCount} OPEN
                        </div>
                    )}
                    {resolvedCount > 0 && (
                        <div style={{ ...S.pill('#bbf7d0', '#15803d'), padding: '8px 16px' }}>
                            {resolvedCount} RESOLVED
                        </div>
                    )}
                </div>
            </div>

            {/* Violation Cards - Source A */}
            {violations.map((v: any, i: number) => {
                const sp = getStatusProps(v.compliance_status);
                const deadlineDate = v.remediation_deadline ? new Date(v.remediation_deadline) : null;
                const isOverdue = deadlineDate && deadlineDate < new Date() && !['resolved', 'compliant'].includes(v.compliance_status?.toLowerCase());
                const isApproaching = deadlineDate && !isOverdue && (deadlineDate.getTime() - new Date().getTime() < 30 * 86400000);

                return (
                    <div key={i} style={S.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ ...S.pill('#f1f5f9', '#475569'), fontSize: '12px' }}>VIOLATION #{i + 1}</div>
                                <div style={S.pill(sp.bg, sp.color)}>{sp.label}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={S.label}>Issue Date</span>
                                <div style={S.value}>{fmtDate(v.issue_date)} <span style={{ fontWeight: 400, color: '#64748b' }}>({getRelativeTime(v.issue_date)})</span></div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px' }}>{v.complaint}</h4>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {v.types?.split(',').map((t: string, idx: number) => {
                                const bp = getBadgeProps(t.trim());
                                return <span key={idx} style={S.pill(bp.bg, bp.color)}>{t.trim()}</span>;
                            })}
                        </div>

                        {v.short_desc && <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #3b82f6', fontWeight: 600 }}>{v.short_desc}</div>}

                        <div style={S.grid()}>
                            <DI label="Fine Amount" value={fmtCurrency(v.fine_amount)} bold color={Number(v.fine_amount) > 0 ? '#ef4444' : '#059669'} />
                            <div style={{ gridColumn: 'span 1' }}>
                                <span style={S.label}>Remediation Deadline</span>
                                <div style={{ ...S.value, color: isOverdue ? '#ef4444' : isApproaching ? '#f59e0b' : '#0f172a' }}>
                                    {fmtDate(v.remediation_deadline) || 'N/A'}
                                    {isOverdue && <span style={{ ...S.pill('#fee2e2', '#ef4444'), marginLeft: '8px' }}>OVERDUE</span>}
                                    {isApproaching && <span style={{ ...S.pill('#fff7ed', '#f59e0b'), marginLeft: '8px' }}>APPROACHING</span>}
                                </div>
                                {v.remediation_deadline && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isOverdue ? `Expired ${getRelativeTime(v.remediation_deadline)}` : `Due ${getRelativeTime(v.remediation_deadline)}`}</div>}
                            </div>
                            <DI label="Current Situation" value={v.current_situation} />
                            <DI label="Resolution Date" value={v.resolution_date ? `${fmtDate(v.resolution_date)} (Resolved)` : null} color="#10b981" bold />
                        </div>

                        {v.details && (
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                <span style={S.label}>Full Details</span>
                                <ExpandableText text={v.details} />
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Source B Card */}
            {pa.violation_complaint && (
                <div style={S.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ ...S.pill('#eff6ff', '#3b82f6'), fontSize: '12px' }}>LISTING VIOLATION DATA</div>
                        <DI label="Issued By" value={pa.violation_issued_by} />
                    </div>

                    <h4 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: '0 0 12px' }}>{pa.violation_complaint}</h4>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        {pa.violation_types?.split(',').map((t: string, idx: number) => {
                            const bp = getBadgeProps(t.trim());
                            return <span key={idx} style={S.pill(bp.bg, bp.color)}>{t.trim()}</span>;
                        })}
                    </div>

                    <div style={S.grid()}>
                        <DI label="Issue Date" value={pa.violation_issue_date ? `${fmtDate(pa.violation_issue_date)} (${getRelativeTime(pa.violation_issue_date)})` : 'N/A'} />
                        <DI label="Total Fines / Count" value={pa.violation_total} bold color="#ef4444" />
                    </div>

                    {pa.violation_desc && (
                        <div style={{ marginTop: '20px' }}>
                            <span style={S.label}>Description</span>
                            <ExpandableText text={pa.violation_desc} />
                        </div>
                    )}
                    {pa.violation_details && (
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                            <span style={S.label}>Full Details</span>
                            <ExpandableText text={pa.violation_details} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 5 — TAX LIEN DETAILS
══════════════════════════════════════════════════ */
const TaxLienSection = ({ data }: { data: PropertyDetails }) => {
    const liens = (data as any).taxLiens || [];
    if (!liens.length) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-building-columns" style={{ color: '#ef4444' }} /> Tax Lien Records</h3>
            <div style={S.banner('#fef2f2', '#b91c1c')}>
                <i className="fa-solid fa-triangle-exclamation" /> <strong>⚠ Outstanding Tax Liens:</strong> Buyer assumes all financial encumbrances.
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <DI label="Amount Owed" value={fmtCurrency(l.amount_owed)} bold color="#ef4444" />
                                <DI label="Lien Filed Date" value={fmtDate(l.lien_date)} />
                                <DI label="Tax Authority" value={l.tax_authority} />
                                <DI label="Redemption Ends" value={fmtDate(l.redemption_period_end)} />
                                {l.redemption_period_end && (
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: isExpired ? '#ef4444' : '#f59e0b' }}>
                                        {isExpired ? 'EXPIRED' : `Expires ${getRelativeTime(l.redemption_period_end)}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 6 — EVICTION DETAILS
══════════════════════════════════════════════════ */
const EvictionSection = ({ data }: { data: PropertyDetails }) => {
    const evictions = (data as any).evictions || [];
    const pa = data.proaddress || {};
    const hasEviction = evictions.length > 0 || pa.court_docket || pa.court_date;

    if (!hasEviction) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-door-open" /> Tenant Disputes & Evictions</h3>
            <div style={S.banner('#f5f3ff', '#5b21b6')}>
                <strong>Occupancy Warning:</strong> Active filings indicate potentially occupied property.
            </div>

            {evictions.map((e: any, i: number) => {
                const isFuture = e.court_date && new Date(e.court_date) > new Date();
                return (
                    <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#f1f5f9', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <DI label="Plaintiff" value={e.plaintiff_name} bold />
                            <div style={S.pill(isFuture ? '#ede9fe' : '#f1f5f9', isFuture ? '#7c3aed' : '#64748b')}>{isFuture ? 'UPCOMING' : 'PAST'}</div>
                        </div>
                        <div style={S.grid()}>
                            <DI label="Court Date" value={fmtDate(e.court_date)} />
                            <DI label="Docket #" value={e.court_docket} />
                            <DI label="Court Room" value={e.court_room} />
                        </div>
                    </div>
                )
            })}

            {(pa.court_docket || pa.court_date) && (
                <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                    <div style={S.grid()}>
                        <DI label="Listing Docket #" value={pa.court_docket} />
                        <DI label="Listing Court Date" value={fmtDate(pa.court_date)} />
                        <DI label="Owner's Attorney" value={pa.eviction_owner_lawyer_name} />
                    </div>
                </div>
            )}
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
            <h3 style={S.sectionHead}><i className="fa-solid fa-file-invoice-dollar" /> Loans & Defaults</h3>
            {loans.map((l: any, i: number) => {
                const hasDefault = l.total_default_amount > 0;
                return (
                    <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                        {hasDefault && (
                            <div style={{ ...S.banner('#fef2f2', '#ef4444'), padding: '10px 14px' }}>
                                <i className="fa-solid fa-circle-exclamation" /> <strong>⚠ Outstanding Default:</strong> Financial liability exists in addition to violation fines.
                            </div>
                        )}
                        <div style={S.grid()}>
                            <DI label="Lender" value={l.lender_name} bold />
                            <DI label="Loan Amount" value={fmtCurrency(l.loan_amount)} />
                            <DI label="Default Amount" value={fmtCurrency(l.total_default_amount)} color="#ef4444" bold />
                            <DI label="Foreclosure Stage" value={l.foreclosure_stage} color="#f59e0b" />
                            <DI label="Lis Pendens Date" value={fmtDate(l.lis_pendens_date)} />
                            <DI label="Borrower" value={l.borrower_name} />
                        </div>
                    </div>
                )
            })}
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
    const td = (data as any).propertyTrustDeed || {};
    const loan = ((data as any).loans && (data as any).loans[0]) || {};

    const getName = () => {
        const o = joinName(owner.OFirstName, owner.OMiddleName, owner.OLastName);
        if (o) return o;
        const n = joinName(oname.PFirstName, oname.PMiddleName, oname.PLastName);
        if (n) return n;
        const p = joinName(pa.PFirstName, pa.PMiddleName, pa.PLastName);
        if (p) return p;
        if (pa.owner_name) return pa.owner_name;
        if (td.owner_name) return td.owner_name;
        if (loan.borrower_name) return `${loan.borrower_name} (from Loan)`;
        return "Unknown Owner";
    };

    const ownerName = getName();
    const company = oname.PcompanyName || pa.PcompayName;

    // Address Assembly for Property
    const propAddr = pa.PStreetAddr1 || `${pa.PStreetNum || ''} ${pa.PStreetName || pa.backup_street_name || ''} ${pa.street_name_post_type || pa.streetnameposttype || ''} ${pa.PSuiteNum || ''}`.trim();
    const propCity = pa.Pcity || prop.city;
    const propState = pa.PState || prop.state;
    const propZip = pa.Pzip || prop.zip;

    // Mailing Address
    const mailAddr = owner.OStreetAddr1 ? `${owner.OStreetAddr1} ${owner.OStreetAddr2 || ''}`.trim() : pa.owner_mailing_address;
    const isSame = mailAddr && propAddr && mailAddr.toLowerCase().includes(propAddr.toLowerCase());

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-user-tie" /> Property Owner (Responsible Party)</h3>

            <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800' }}>
                        {ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{ownerName}</div>
                        {company && <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}><i className="fa-solid fa-building" /> {company}</div>}
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '24px' }}>
                    {pa.owner_phone && (
                        <a href={`tel:${pa.owner_phone.replace(/\D/g, '')}`} style={{ ...S.pill('#f0fdf4', '#166534'), textDecoration: 'none', padding: '10px 16px' }}>
                            <i className="fa-solid fa-phone" style={{ marginRight: '8px' }} /> CALL OWNER
                        </a>
                    )}
                    {owner.email && (
                        <a href={`mailto:${owner.email}`} style={{ ...S.pill('#eff6ff', '#1d4ed8'), textDecoration: 'none', padding: '10px 16px' }}>
                            <i className="fa-solid fa-envelope" style={{ marginRight: '8px' }} /> EMAIL OWNER
                        </a>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', padding: '20px', borderRadius: '12px', background: '#fff', border: '1px solid #f1f5f9' }}>
                    <span style={S.label}>Property Location (Violation Site)</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{propAddr}</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>{propCity}, {propState} {propZip}</div>
                </div>

                <div style={{ flex: '1 1 300px', padding: '20px', borderRadius: '12px', background: isSame ? '#f0fdf4' : '#fff', border: isSame ? '1px solid #bbf7d0' : '1px solid #f1f5f9' }}>
                    <span style={S.label}>Owner's Mailing Address</span>
                    {isSame ? (
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>
                            <i className="fa-solid fa-house-user" style={{ marginRight: '8px' }} /> Owner resides at the property address
                        </div>
                    ) : (
                        <>
                            {owner.is_out_of_state && <div style={{ ...S.pill('#fff7ed', '#ea580c'), marginBottom: '8px' }}>⚠ OUT OF STATE OWNER</div>}
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{mailAddr || 'Address Unavailable'}</div>
                            {owner.OCity && <div style={{ fontSize: '14px', color: '#64748b' }}>{owner.OCity}, {owner.OState} {owner.OZip}</div>}
                            <DI label="Current State of Residence" value={pa.owner_current_state} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 11 — ISSUING AUTHORITY & JURISDICTION
══════════════════════════════════════════════════ */
const AuthoritySection = ({ data }: { data: PropertyDetails }) => {
    const violations = (data as any).violations || [];
    const pa = data.proaddress || {};

    const authorities = Array.from(new Set([
        pa.violation_issued_by,
        ...violations.map((v: any) => v.issued_by) // though not in spec for SOURCE A table, checking just in case
    ].filter(notEmpty)));

    if (!authorities.length && !pa.county_fixed) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-building-shield" /> Issuing Authority & Jurisdiction</h3>

            {authorities.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <span style={S.label}>Issuing Authorities</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {authorities.map((a: any, i: number) => (
                            <span key={i} style={S.pill('#f1f5f9', '#475569')}>{a}</span>
                        ))}
                    </div>
                </div>
            )}

            <div style={S.grid()}>
                <DI label="Property County" value={pa.county_fixed} />
                <DI label="State" value={pa.PState} />
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   ROOT — VIOLATION DETAIL VIEW
══════════════════════════════════════════════════ */
const ViolationDetailView: React.FC<Props> = ({ data, isMobile }) => {
    return (
        <div style={{ padding: isMobile ? '0' : '8px' }}>
            <MediaSection data={data} />
            <OverviewSection data={data} />
            <ListingSection data={data} />
            <ViolationsSection data={data} />
            <TaxLienSection data={data} />
            <EvictionSection data={data} />
            <LoanSection data={data} />
            <OutOfStateOwnerSection data={data} isMobile={isMobile} />
            <OwnerSection data={data} />
            <AuthoritySection data={data} />
        </div>
    );
};

export default ViolationDetailView;
