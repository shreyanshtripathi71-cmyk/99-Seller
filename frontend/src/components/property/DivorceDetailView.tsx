"use client";
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { PropertyDetails } from '@/components/dashboard/PropertyDetailsPage';
import OutOfStateOwnerSection from '@/components/property/OutOfStateOwnerSection';

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
const notEmpty = (v: any) => v !== null && v !== undefined && v !== '' && String(v).trim() !== '';
const sanitize = (html: string) => typeof window === 'undefined' ? html : DOMPurify.sanitize(html);
const joinName = (...parts: (string | null | undefined)[]) => {
    const p = parts.filter(notEmpty).map(x => String(x).trim());
    return p.length > 0 ? p.join(' ') : null;
};
const getRelativeTime = (d: any) => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    const diff = new Date().getTime() - dt.getTime();
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    const unit = years > 0 ? `${years}yr` : months > 0 ? `${months}mo` : `${days}d`;
    return diff >= 0 ? `${unit} ago` : `in ${unit}`;
};
const getDaysFrom = (d: any) => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    return Math.round((dt.getTime() - new Date().getTime()) / 86400000);
};

/* ── styles ── */
const S = {
    card: { background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' } as React.CSSProperties,
    heroCard: { background: 'linear-gradient(135deg,#faf5ff 0%,#ede9fe 100%)', borderRadius: '16px', padding: '28px', marginBottom: '20px', border: '1px solid #ddd6fe' } as React.CSSProperties,
    head: { fontSize: '14px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' } as React.CSSProperties,
    grid: (cols = 'repeat(auto-fill, minmax(200px,1fr))') => ({ display: 'grid', gridTemplateColumns: cols, gap: '20px' } as React.CSSProperties),
    label: { display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px' } as React.CSSProperties,
    value: { fontSize: '15px', fontWeight: '600', color: '#0f172a', wordBreak: 'break-word' } as React.CSSProperties,
    pill: (bg: string, color: string) => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: bg, color, borderRadius: '9999px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' } as React.CSSProperties),
    banner: (bg: string, color: string) => ({ padding: '14px 18px', borderRadius: '12px', background: bg, color, fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${color}20`, flexWrap: 'wrap' } as React.CSSProperties),
    expandBtn: { background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: '4px 0', marginTop: '4px' } as React.CSSProperties,
    sideBy: (mobile: boolean) => ({ display: 'flex', gap: '20px', flexDirection: mobile ? 'column' as const : 'row' as const }),
};

const DI = ({ label: l, value: v, color, bold, wide }: { label: string; value: any; color?: string; bold?: boolean; wide?: boolean }) => {
    if (!notEmpty(v)) return null;
    return (
        <div style={{ gridColumn: wide ? '1 / -1' : 'auto' }}>
            <span style={S.label}>{l}</span>
            <span style={{ ...S.value, color: color || '#0f172a', fontWeight: bold ? '700' : '600' }}>{v}</span>
        </div>
    );
};

const ExpandableText = ({ text, limit = 300, preview = 150 }: { text: string; limit?: number; preview?: number }) => {
    const [open, setOpen] = useState(false);
    if (!text) return null;
    if (text.length <= limit) return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
    return (
        <div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{open ? text : text.substring(0, preview) + '...'}</div>
            <button onClick={() => setOpen(!open)} style={S.expandBtn}>{open ? 'Show Less' : 'Show More'}</button>
        </div>
    );
};

/* ═══ SECTION 1 — MEDIA ═══ */
const MediaSection = ({ data }: { data: PropertyDetails }) => {
    const prop = data.property || {};
    const pa = data.proaddress || {};
    const files = ((data as any).filesUrls || []).filter((f: any) => f.PMotiveType === 'DIV');
    if (!prop.local_image_path && !pa.contact_image && !files.length) return null;
    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-camera" /> Property Media &amp; Documents</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: files.length ? '24px' : '0' }}>
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
            {files.length > 0 && (
                <div style={S.grid()}>
                    {files.map((f: any, i: number) => (
                        <div key={i} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <i className="fa-regular fa-file-pdf" style={{ fontSize: '20px', color: '#ef4444' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>
                                        {f.property_card ? 'Property Card' : 'Court Document'}
                                        {f.parsed && <span style={{ marginLeft: '6px', color: '#10b981', fontSize: '10px' }}>✓ VERIFIED</span>}
                                    </div>
                                    <a href={f.url || f.property_card} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#3b82f6' }}>View Document</a>
                                </div>
                            </div>
                            {notEmpty(f.contents) && (
                                <div style={{ fontSize: '12px', color: '#475569', padding: '8px', background: '#fff', borderRadius: '8px', marginTop: '8px', whiteSpace: 'pre-wrap' }}
                                    dangerouslySetInnerHTML={{ __html: sanitize(String(f.contents)) }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ═══ SECTION 2 — PROPERTY OVERVIEW ═══ */
const OverviewSection = ({ data }: { data: PropertyDetails }) => {
    const prop = data.property || {};
    const pa = data.proaddress || {};
    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-house" /> Property Overview</h3>
            <div style={S.grid()}>
                <DI label="Bedrooms" value={prop.beds} />
                <DI label="Bathrooms" value={prop.baths} />
                <DI label="Total Sq Ft" value={prop.sqft?.toLocaleString()} />
                <DI label="Year Built" value={prop.yearBuilt} />
                <DI label="Property Type" value={prop.propertyType} />
                <DI label="Land / Building" value={(prop as any).PLandBuilding} />
                <DI label="Base Value" value={fmtCurrency((prop as any).PBase)} />
                <DI label="Total Land Area" value={(prop as any).PTotLandArea} />
                <DI label="Total Building Area" value={(prop as any).PTotBuildingArea} />
            </div>
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                <div style={S.grid()}>
                    <DI label="Last Sold Price" value={fmtCurrency((prop as any).PLastSoldAmt)} bold />
                    <DI label="Last Sold Date" value={fmtDate((prop as any).PLastSoldDate)} />
                    <DI label="Total Appraised Value" value={fmtCurrency((prop as any).PTotAppraisedAmt || prop.appraisedValue)} bold color="#7c3aed" />
                    <DI label="Building Appraised" value={fmtCurrency((prop as any).PAppraisedBuildingAmt)} />
                    <DI label="Land Appraised" value={fmtCurrency((prop as any).PAppraisedLandAmt)} />
                    <DI label="Listing ID" value={(prop as any).PListingID} />
                    <DI label="Date Filed" value={fmtDate((prop as any).PDateFiled)} />
                </div>
            </div>
            {notEmpty(prop.comments) && (
                <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <span style={S.label}>Property Comments</span>
                    <p style={{ ...S.value, fontSize: '13px', margin: 0 }}>{prop.comments}</p>
                </div>
            )}
            {notEmpty(pa.DATE_TIMEOFEXTRACTION) && (
                <div style={{ marginTop: '16px', fontSize: '11px', color: '#94a3b8' }}>
                    Data Last Updated: {fmtDate(pa.DATE_TIMEOFEXTRACTION)}
                </div>
            )}
        </div>
    );
};

/* ═══ SECTION 3 — LISTING DETAILS ═══ */
const ListingSection = ({ data }: { data: PropertyDetails }) => {
    const pa = data.proaddress || {};
    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-list-check" /> Listing Details</h3>
            <div style={S.grid()}>
                <DI label="Listing ID" value={pa.listing_id} />
                <DI label="Asking Price" value={fmtCurrency(pa.price)} bold color="#7c3aed" />
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
            {notEmpty(pa.comments) && (
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: '#f8fafc' }}>
                    <span style={S.label}>Comments</span>
                    <ExpandableText text={String(pa.comments)} />
                </div>
            )}
            {notEmpty(pa.url) && (
                <div style={{ marginTop: '16px' }}>
                    <a href={pa.url} target="_blank" rel="noopener noreferrer" style={{ ...S.pill('#eff6ff', '#3b82f6'), textDecoration: 'none' }}>
                        <i className="fa-solid fa-external-link" style={{ marginRight: '6px' }} />Original Listing URL
                    </a>
                </div>
            )}
        </div>
    );
};

/* ═══ SECTION 4 — DIVORCE CASE DETAILS (HERO) ═══ */
const getDivorceTypeBadge = (t: string = '') => {
    const l = t.toLowerCase();
    if (l.includes('contested') && !l.includes('un')) return { bg: '#fee2e2', color: '#b91c1c', note: 'Contested divorces may have additional delays in property sale authorization.' };
    if (l.includes('uncontested')) return { bg: '#f0fdf4', color: '#15803d', note: 'Both parties have agreed — sale likely to proceed without court intervention.' };
    if (l.includes('court') || l.includes('judicial')) return { bg: '#fff7ed', color: '#c2410c', note: 'Sale is being directed by court order.' };
    if (l.includes('mediat')) return { bg: '#eff6ff', color: '#1d4ed8', note: '' };
    if (l.includes('default')) return { bg: '#fefce8', color: '#a16207', note: '' };
    return { bg: '#f1f5f9', color: '#475569', note: '' };
};
const getDivorceStatusBadge = (s: string = '') => {
    const l = s.toLowerCase();
    if (['open', 'active', 'pending', 'filed'].some(x => l.includes(x))) return { bg: '#fff7ed', color: '#c2410c' };
    if (['settled', 'closed', 'final', 'resolved'].some(x => l.includes(x))) return { bg: '#f0fdf4', color: '#15803d' };
    if (['contested', 'litigation'].some(x => l.includes(x))) return { bg: '#fee2e2', color: '#b91c1c' };
    if (l.includes('mediat')) return { bg: '#eff6ff', color: '#1d4ed8' };
    if (l.includes('dismiss')) return { bg: '#f1f5f9', color: '#475569' };
    return { bg: '#f1f5f9', color: '#475569' };
};
const SettlementCountdown = ({ date }: { date: any }) => {
    if (!notEmpty(date)) return null;
    const days = getDaysFrom(date);
    if (days === null) return null;
    if (days > 30) return <span style={S.pill('#f0fdf4', '#15803d')}>Settlement in {days} days</span>;
    if (days > 7) return <span style={S.pill('#fff7ed', '#c2410c')}>⚠ SETTLEMENT APPROACHING — {days} days</span>;
    if (days > 0) return <span style={S.pill('#fee2e2', '#b91c1c')}>🔴 IMMINENT SETTLEMENT — {days} days</span>;
    return <span style={S.pill('#f1f5f9', '#475569')}>Settled {Math.abs(days)} days ago</span>;
};

const DivorceSection = ({ data, isMobile }: { data: PropertyDetails; isMobile: boolean }) => {
    const divorces: any[] = (data as any).divorces || [];
    const owners: any[] = (data as any).owners || [];
    const div = divorces[0] || {};
    const ownerName = (() => {
        const o = owners[0] || {};
        return joinName(o.OFirstName, o.OMiddleName, o.OLastName)
            || joinName(data.proaddress?.PFirstName, data.proaddress?.PMiddleName, data.proaddress?.PLastName)
            || data.proaddress?.owner_name || '';
    })();
    const isActive = divorces.some((d: any) => ['open', 'active', 'pending', 'filed'].some(s => d.status?.toLowerCase().includes(s)));
    const isContested = divorces.some((d: any) => d.divorce_type?.toLowerCase().includes('contest') && !d.divorce_type?.toLowerCase().includes('un'));
    const isSettled = divorces.some((d: any) => ['settled', 'closed', 'final', 'resolved'].some(s => d.status?.toLowerCase().includes(s)));
    const bannerBg = isContested ? '#fee2e2' : isActive ? '#fff7ed' : isSettled ? '#f0fdf4' : '#f8fafc';
    const bannerColor = isContested ? '#b91c1c' : isActive ? '#c2410c' : isSettled ? '#15803d' : '#475569';
    const bannerText = isContested ? '⚖ COURT-ORDERED SALE — Contested Proceeding Active'
        : isActive ? '⚖ ACTIVE DIVORCE PROCEEDING — Property is a Marital Asset'
            : isSettled ? '✓ SETTLEMENT REACHED — Sale in Progress'
                : '⚖ DIVORCE PROCEEDING';

    const copyField = (val: string) => { if (typeof navigator !== 'undefined') navigator.clipboard?.writeText(val); };

    return (
        <div>
            {/* Status banner */}
            <div style={{ ...S.banner(bannerBg, bannerColor), flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: '800', fontSize: '15px' }}>{bannerText}</div>
                <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px' }}>
                    Buyer should verify that both parties have consented to the sale or that a valid court order authorizes the sale.
                </div>
            </div>

            {divorces.map((d: any, idx: number) => {
                const typeBadge = getDivorceTypeBadge(d.divorce_type);
                const statusBadge = getDivorceStatusBadge(d.status);
                const petMatch = ownerName && d.petitioner_name && ownerName.toLowerCase().includes(d.petitioner_name.split(' ')[0].toLowerCase());
                const respMatch = ownerName && d.respondent_name && ownerName.toLowerCase().includes(d.respondent_name.split(' ')[0].toLowerCase());
                const neitherMatch = ownerName && !petMatch && !respMatch;
                const filingDiff = d.filing_date !== d.legal_filing_date && d.legal_filing_date;
                const atty = d.attorney_name || '';
                const attyPhone = atty.match(/\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/)?.[0];
                const attyEmail = atty.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0];

                return (
                    <div key={idx} style={{ ...S.heroCard, marginBottom: '20px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#7c3aed', marginBottom: '8px' }}>
                            {divorces.length > 1 ? `DIVORCE CASE #${idx + 1}` : 'DIVORCE CASE'}
                        </div>
                        {/* Case number prominent */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <span style={S.label}>Divorce Case Number</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#1e1b4b', letterSpacing: '-0.02em' }}>{d.case_number}</span>
                                    <button onClick={() => copyField(d.case_number)} style={{ ...S.pill('#ede9fe', '#7c3aed'), cursor: 'pointer', border: 'none' }}>COPY</button>
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#7c3aed', marginTop: '4px' }}>{d.court_name}</div>
                            </div>
                            {notEmpty(d.status) && <span style={{ ...S.pill(statusBadge.bg, statusBadge.color), fontSize: '13px', padding: '6px 16px' }}>{d.status}</span>}
                        </div>

                        {/* Filing dates */}
                        <div style={S.grid('repeat(auto-fill,minmax(180px,1fr))')}>
                            {notEmpty(d.filing_date) && (
                                <div>
                                    <span style={S.label}>Case Filed Date</span>
                                    <span style={{ ...S.value, color: '#7c3aed' }}>{fmtDate(d.filing_date)}</span>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Filed {getRelativeTime(d.filing_date)}</div>
                                </div>
                            )}
                            {notEmpty(d.legal_filing_date) && filingDiff && (
                                <div>
                                    <span style={S.label}>Legal Filing Date</span>
                                    <span style={S.value}>{fmtDate(d.legal_filing_date)}</span>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>Legally recognized filing date</div>
                                </div>
                            )}
                            {notEmpty(d.settlement_date) && (
                                <div>
                                    <span style={S.label}>Settlement Date</span>
                                    <div style={{ ...S.value, marginBottom: '6px' }}>{fmtDate(d.settlement_date)}</div>
                                    <SettlementCountdown date={d.settlement_date} />
                                </div>
                            )}
                        </div>

                        {/* Divorce type badge */}
                        {notEmpty(d.divorce_type) && (
                            <div style={{ margin: '20px 0 0', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.6)', border: '1px solid #ddd6fe' }}>
                                <span style={S.label}>Divorce Type</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: typeBadge.note ? '8px' : '0' }}>
                                    <span style={{ ...S.pill(typeBadge.bg, typeBadge.color), fontSize: '13px', padding: '6px 16px' }}>{d.divorce_type}</span>
                                </div>
                                {notEmpty(typeBadge.note) && <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>{typeBadge.note}</div>}
                            </div>
                        )}

                        {/* Parties */}
                        <div style={{ marginTop: '24px' }}>
                            <span style={{ ...S.label, fontSize: '13px' }}>PARTIES TO THE DIVORCE PROCEEDING</span>
                            <div style={S.sideBy(isMobile)}>
                                {/* Petitioner */}
                                <div style={{ flex: '1 1 200px', padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.8)', border: '2px solid #ddd6fe' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <span style={S.pill('#ede9fe', '#7c3aed')}>PETITIONER</span>
                                        {petMatch && <span style={S.pill('#f0fdf4', '#15803d')}>✓ LISTED OWNER</span>}
                                    </div>
                                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#1e1b4b', marginBottom: '4px' }}>{d.petitioner_name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Party who initiated the divorce filing</div>
                                </div>
                                {/* Respondent */}
                                <div style={{ flex: '1 1 200px', padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.8)', border: '2px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                        <span style={S.pill('#f1f5f9', '#475569')}>RESPONDENT</span>
                                        {respMatch && <span style={S.pill('#f0fdf4', '#15803d')}>✓ LISTED OWNER</span>}
                                    </div>
                                    <div style={{ fontSize: '22px', fontWeight: '900', color: '#1e1b4b', marginBottom: '4px' }}>{d.respondent_name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Other party named in the divorce</div>
                                </div>
                            </div>
                            {neitherMatch && (
                                <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: '#fefce8', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e' }}>
                                    ⚠ Listed owner name differs from both divorce parties — verify ownership with title company.
                                </div>
                            )}
                        </div>

                        {/* Attorney */}
                        {notEmpty(d.attorney_name) && (
                            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.6)', border: '1px solid #ddd6fe' }}>
                                <span style={S.label}>Divorce Attorney / Legal Representative</span>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e1b4b', marginBottom: '6px' }}>{atty}</div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>Contact for legal inquiries regarding this property sale</div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {attyPhone && <a href={`tel:${attyPhone.replace(/\D/g, '')}`} style={{ ...S.pill('#f0fdf4', '#15803d'), textDecoration: 'none' }}><i className="fa-solid fa-phone" style={{ marginRight: '6px' }} />{fmtPhone(attyPhone)}</a>}
                                    {attyEmail && <a href={`mailto:${attyEmail}`} style={{ ...S.pill('#eff6ff', '#1d4ed8'), textDecoration: 'none' }}><i className="fa-solid fa-envelope" style={{ marginRight: '6px' }} />{attyEmail}</a>}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {notEmpty(d.notes) && (
                            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.6)', border: '1px solid #ddd6fe' }}>
                                <span style={S.label}>Case Notes</span>
                                <ExpandableText text={String(d.notes)} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

/* ═══ SECTION 5 — TRUST DEED DETAILS ═══ */
const TrustDeedSection = ({ data }: { data: PropertyDetails }) => {
    const td = (data as any).propertyTrustDeed;
    if (!td) return null;
    const divorces: any[] = (data as any).divorces || [];
    const pet = divorces[0]?.petitioner_name || '';
    const resp = divorces[0]?.respondent_name || '';
    const crossCheck = (name: string) => {
        if (!name) return '';
        if (pet && name.toLowerCase().includes(pet.split(' ')[0].toLowerCase())) return ' (Petitioner)';
        if (resp && name.toLowerCase().includes(resp.split(' ')[0].toLowerCase())) return ' (Respondent)';
        return ' (Verify Ownership)';
    };
    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-file-contract" /> Trust Deed Details</h3>
            <div style={S.grid()}>
                <DI label="Deed ID" value={td.deed_id} />
                {notEmpty(td.owner_name) && (
                    <div>
                        <span style={S.label}>Owner on Deed</span>
                        <span style={S.value}>{td.owner_name}<span style={{ color: '#7c3aed', fontSize: '12px' }}>{crossCheck(td.owner_name)}</span></span>
                    </div>
                )}
                <DI label="Borrower on Deed" value={td.borrower_name} />
                <DI label="Lender on Deed" value={td.lender_name} />
                <DI label="Lender Address" value={td.lender_address} />
                <DI label="Trustee on Deed" value={td.trustee_name} />
                <DI label="Trustee Address on Deed" value={td.trustee_address} />
                <DI label="Loan Amount on Deed" value={fmtCurrency(td.loan_amount)} bold color="#7c3aed" />
                <DI label="County on Deed" value={td.county} />
                <DI label="Address on Deed" value={td.property_address} />
                <DI label="Deed Date" value={fmtDate(td.datetime)} />
            </div>
        </div>
    );
};

/* ═══ SECTION 6 — LOAN & DEFAULT ═══ */
const LoanSection = ({ data }: { data: PropertyDetails }) => {
    const loans: any[] = (data as any).loans || [];
    if (!loans.length) return null;
    const divorces: any[] = (data as any).divorces || [];
    const pet = divorces[0]?.petitioner_name || '';
    const resp = divorces[0]?.respondent_name || '';
    const crossCheck = (name: string) => {
        if (!name) return '';
        if (pet && name.toLowerCase().includes(pet.split(' ')[0].toLowerCase())) return ' (Petitioner)';
        if (resp && name.toLowerCase().includes(resp.split(' ')[0].toLowerCase())) return ' (Respondent)';
        return '';
    };
    const fcStage = (s: string = '') => {
        const l = s.toLowerCase();
        if (['active', 'pending'].some(x => l.includes(x))) return { bg: '#fefce8', color: '#a16207' };
        if (['filed', 'notice'].some(x => l.includes(x))) return { bg: '#fff7ed', color: '#c2410c' };
        if (l.includes('default')) return { bg: '#fee2e2', color: '#b91c1c' };
        return { bg: '#f1f5f9', color: '#475569' };
    };
    const defStatus = (s: string = '') => {
        const l = s.toLowerCase();
        if (l.includes('current')) return { bg: '#f0fdf4', color: '#15803d' };
        if (['delinquent', 'default'].some(x => l.includes(x))) return { bg: '#fee2e2', color: '#b91c1c' };
        return { bg: '#f1f5f9', color: '#475569' };
    };
    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-file-invoice-dollar" /> Loan &amp; Default Details</h3>
            {loans.map((l: any, i: number) => {
                const hasDefault = Number(l.total_default_amount) > 0;
                const hasForeclosure = notEmpty(l.foreclosure_stage);
                const fs = fcStage(l.foreclosure_stage || '');
                const ds = defStatus(l.default_status || '');
                return (
                    <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: i < loans.length - 1 ? '16px' : '0' }}>
                        {hasDefault && (
                            <div style={{ ...S.banner('#fef2f2', '#b91c1c'), padding: '10px 14px', marginBottom: '16px' }}>
                                <i className="fa-solid fa-circle-exclamation" /> ⚠ Outstanding loan default — buyer should conduct full title search.
                            </div>
                        )}
                        {hasForeclosure && (
                            <div style={{ ...S.banner('#fff7ed', '#c2410c'), padding: '10px 14px', marginBottom: '16px' }}>
                                <i className="fa-solid fa-gavel" /> ⚠ Active foreclosure filing alongside the divorce case.
                            </div>
                        )}
                        <div style={S.grid()}>
                            {notEmpty(l.borrower_name) && (
                                <div>
                                    <span style={S.label}>Borrower Name</span>
                                    <span style={S.value}>{l.borrower_name}<span style={{ color: '#7c3aed', fontSize: '12px' }}>{crossCheck(l.borrower_name)}</span></span>
                                </div>
                            )}
                            <DI label="Lender" value={l.lender_name} />
                            <DI label="Lender Address" value={l.lender_address} />
                            <DI label="Original Loan Amount" value={fmtCurrency(l.loan_amount)} bold />
                            <DI label="Total Amount in Default" value={fmtCurrency(l.total_default_amount)} color={hasDefault ? '#b91c1c' : undefined} bold={hasDefault} />
                            <DI label="Arrears Amount" value={fmtCurrency(l.arrears_amount)} />
                            {notEmpty(l.foreclosure_stage) && (
                                <div>
                                    <span style={S.label}>Foreclosure Stage</span>
                                    <span style={S.pill(fs.bg, fs.color)}>{l.foreclosure_stage}</span>
                                </div>
                            )}
                            <DI label="Lis Pendens Filed" value={fmtDate(l.lis_pendens_date)} />
                            {notEmpty(l.default_status) && (
                                <div>
                                    <span style={S.label}>Default Status</span>
                                    <span style={S.pill(ds.bg, ds.color)}>{l.default_status}</span>
                                </div>
                            )}
                            <DI label="Loan Origination Date" value={fmtDate(l.datetime)} />
                            <DI label="Deed Reference ID" value={l.deed_id} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ═══ SECTION 7 — TRUSTEE DETAILS ═══ */
const TrusteeSection = ({ data }: { data: PropertyDetails }) => {
    const pa = data.proaddress || {};
    const t = (data as any).trustee || {};
    const name = pa.trusteename || t.TTrusteeName;
    const company = pa.trusteecompanyname;
    const addr = pa.trusteeaddress || t.TTrusteeAddress;
    const city = pa.trusteecity || t.TTRUSTEECity;
    const state = pa.trusteestate || t.TTRUSTEEState;
    const zip = pa.trusteezip || t.TTRUSTEEZip;
    const phone = pa.trusteephone || t.TTrusteePhone;
    const email = pa.trusteeemail || t.TTrusteeEmail;
    const website = pa.trusteewebsite || t.TTrusteeWebSite;
    const type = pa.trusteetype;
    if (!name && !company && !addr && !phone && !email && !website) return null;
    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-scale-balanced" /> Trustee Details</h3>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 280px' }}>
                    {notEmpty(company) && <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{company}</div>}
                    {notEmpty(name) && <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{name}</div>}
                    {notEmpty(type) && <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>{type}</div>}
                    {(addr || city || state) && (
                        <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                            {notEmpty(addr) && <div>{addr}</div>}
                            {(city || state || zip) && <div>{[city, state].filter(Boolean).join(', ')} {zip || ''}</div>}
                        </div>
                    )}
                </div>
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notEmpty(phone) && <a href={`tel:${String(phone).replace(/\D/g, '')}`} style={{ ...S.pill('#f0fdf4', '#15803d'), textDecoration: 'none', justifyContent: 'flex-start', padding: '10px 16px' }}><i className="fa-solid fa-phone" style={{ marginRight: '8px' }} />{fmtPhone(phone)}</a>}
                    {notEmpty(email) && <a href={`mailto:${email}`} style={{ ...S.pill('#eff6ff', '#1d4ed8'), textDecoration: 'none', justifyContent: 'flex-start', padding: '10px 16px' }}><i className="fa-solid fa-envelope" style={{ marginRight: '8px' }} />{email}</a>}
                    {notEmpty(website) && <a href={String(website)} target="_blank" rel="noopener noreferrer" style={{ ...S.pill('#f8fafc', '#475569'), textDecoration: 'none', justifyContent: 'flex-start', padding: '10px 16px' }}><i className="fa-solid fa-globe" style={{ marginRight: '8px' }} />Website</a>}
                </div>
            </div>
        </div>
    );
};

/* ═══ SECTION 8 — TAX LIEN DETAILS ═══ */
const TaxLienSection = ({ data }: { data: PropertyDetails }) => {
    const liens: any[] = (data as any).taxLiens || [];
    if (!liens.length) return null;
    const lienStatus = (s: string = '') => {
        const l = s.toLowerCase();
        if (['released', 'paid'].some(x => l.includes(x))) return { bg: '#f0fdf4', color: '#15803d' };
        if (['active', 'open'].some(x => l.includes(x))) return { bg: '#fee2e2', color: '#b91c1c' };
        return { bg: '#f1f5f9', color: '#475569' };
    };
    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-building-columns" style={{ color: '#ef4444' }} /> Tax Lien Details</h3>
            <div style={S.banner('#fef2f2', '#b91c1c')}>
                <i className="fa-solid fa-triangle-exclamation" />
                <span>⚠ This property has outstanding tax liens. In divorce proceedings, tax liens must typically be resolved before title can cleanly transfer. Consult a real estate attorney.</span>
            </div>
            <div style={S.grid()}>
                {liens.map((l: any, i: number) => {
                    const ls = lienStatus(l.status || '');
                    const days = getDaysFrom(l.redemption_period_end);
                    return (
                        <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontWeight: '800', color: '#1e293b' }}>{l.tax_year} LIEN</span>
                                {notEmpty(l.status) && <span style={S.pill(ls.bg, ls.color)}>{l.status}</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <DI label="Amount Owed" value={fmtCurrency(l.amount_owed)} bold color="#b91c1c" />
                                <DI label="Last Year Taxes Paid" value={l.last_tax_year_paid} />
                                <DI label="Lien Filed Date" value={fmtDate(l.lien_date)} />
                                <DI label="Tax Authority" value={l.tax_authority} />
                                <DI label="Lien Number" value={l.lien_number} />
                                <DI label="Tax Sale Date" value={fmtDate(l.sale_date)} />
                                {notEmpty(l.redemption_period_end) && (
                                    <div>
                                        <span style={S.label}>Redemption Period Ends</span>
                                        <span style={S.value}>{fmtDate(l.redemption_period_end)}</span>
                                        {days !== null && <div style={{ fontSize: '11px', color: days < 0 ? '#b91c1c' : '#c2410c', marginTop: '2px', fontWeight: '700' }}>
                                            {days < 0 ? 'REDEMPTION PERIOD EXPIRED' : `Expires in ${days} days`}
                                        </div>}
                                    </div>
                                )}
                                <DI label="Notes" value={l.notes} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ═══ SECTION 9 — CODE VIOLATIONS ═══ */
const ViolationsSection = ({ data }: { data: PropertyDetails }) => {
    const viols: any[] = (data as any).violations || [];
    const pa = data.proaddress || {};
    const hasAny = viols.length > 0 || notEmpty(pa.violation_complaint);
    if (!hasAny) return null;
    const typeBadge = (t: string = '') => {
        const l = t.toLowerCase();
        if (l.includes('building') || l.includes('structure') || l.includes('fire') || l.includes('safety')) return { bg: '#fee2e2', color: '#b91c1c' };
        if (l.includes('health') || l.includes('sanitation')) return { bg: '#fff7ed', color: '#c2410c' };
        if (l.includes('zoning') || l.includes('land')) return { bg: '#f3e8ff', color: '#7c3aed' };
        if (l.includes('elec')) return { bg: '#fefce8', color: '#a16207' };
        if (l.includes('plumb')) return { bg: '#eff6ff', color: '#1d4ed8' };
        return { bg: '#f1f5f9', color: '#475569' };
    };
    const compStatus = (s: string = '') => {
        const l = s.toLowerCase();
        if (['resolved', 'compliant', 'closed'].some(x => l.includes(x))) return { bg: '#f0fdf4', color: '#15803d' };
        if (['open', 'pending', 'active'].some(x => l.includes(x))) return { bg: '#fff7ed', color: '#c2410c' };
        if (['overdue', 'non-compliant', 'delinquent'].some(x => l.includes(x))) return { bg: '#fee2e2', color: '#b91c1c' };
        if (l.includes('partial')) return { bg: '#fefce8', color: '#a16207' };
        return { bg: '#f1f5f9', color: '#475569' };
    };
    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b' }} /> Code Violations</h3>
            <div style={S.banner('#fffbeb', '#92400e')}>
                <i className="fa-solid fa-hammer" />
                <span>⚠ This property has recorded code violations. Buyer should review all violations before purchase.</span>
            </div>
            {viols.map((v: any, i: number) => {
                const resolved = ['resolved', 'compliant'].includes(v.compliance_status?.toLowerCase() || '');
                const deadDays = getDaysFrom(v.remediation_deadline);
                const deadOverdue = deadDays !== null && deadDays < 0 && !resolved;
                const deadApproach = deadDays !== null && deadDays >= 0 && deadDays <= 30 && !resolved;
                const cs = compStatus(v.compliance_status || '');
                return (
                    <div key={i} style={{ ...S.card, marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={S.pill('#f1f5f9', '#475569')}>VIOLATION #{i + 1}</span>
                                {notEmpty(v.compliance_status) && <span style={S.pill(cs.bg, cs.color)}>{v.compliance_status}</span>}
                            </div>
                            {notEmpty(v.issue_date) && <div style={{ textAlign: 'right' }}>
                                <span style={S.label}>Issue Date</span>
                                <div style={S.value}>{fmtDate(v.issue_date)} <span style={{ fontWeight: 400, color: '#64748b' }}>({getRelativeTime(v.issue_date)})</span></div>
                            </div>}
                        </div>
                        {notEmpty(v.complaint) && <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '0 0 12px' }}>{v.complaint}</h4>}
                        {notEmpty(v.types) && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {String(v.types).split(',').map((t: string, ti: number) => { const tb = typeBadge(t.trim()); return <span key={ti} style={S.pill(tb.bg, tb.color)}>{t.trim()}</span>; })}
                            </div>
                        )}
                        {notEmpty(v.short_desc) && <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #3b82f6', fontWeight: 600 }}>{v.short_desc}</div>}
                        <div style={S.grid()}>
                            <DI label="Fine Amount" value={fmtCurrency(v.fine_amount)} bold color={Number(v.fine_amount) > 0 ? '#b91c1c' : undefined} />
                            <div>
                                <span style={S.label}>Remediation Deadline</span>
                                <div style={{ ...S.value, color: deadOverdue ? '#b91c1c' : deadApproach ? '#c2410c' : '#0f172a' }}>
                                    {fmtDate(v.remediation_deadline) || 'N/A'}
                                    {deadOverdue && <span style={{ ...S.pill('#fee2e2', '#b91c1c'), marginLeft: '8px' }}>OVERDUE</span>}
                                    {deadApproach && !deadOverdue && <span style={{ ...S.pill('#fff7ed', '#c2410c'), marginLeft: '8px' }}>APPROACHING</span>}
                                </div>
                            </div>
                            <DI label="Current Situation" value={v.current_situation} />
                            {notEmpty(v.resolution_date) && <DI label="Resolution Date" value={fmtDate(v.resolution_date)} color="#15803d" bold />}
                        </div>
                        {notEmpty(v.details) && (
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                <span style={S.label}>Details</span>
                                <ExpandableText text={String(v.details)} />
                            </div>
                        )}
                    </div>
                );
            })}
            {notEmpty(pa.violation_complaint) && (
                <div style={{ ...S.card, border: '1px dashed #cbd5e1' }}>
                    <div style={S.pill('#eff6ff', '#3b82f6')}>LISTING VIOLATION DATA</div>
                    {notEmpty(pa.violation_complaint) && <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '12px 0 8px' }}>{pa.violation_complaint}</h4>}
                    <div style={S.grid()}>
                        <DI label="Issue Date" value={fmtDate(pa.violation_issue_date)} />
                        <DI label="Total Fine Amount" value={fmtCurrency(pa.violation_total) || pa.violation_total} />
                        <DI label="Issued By" value={pa.violation_issued_by} />
                    </div>
                    {notEmpty(pa.violation_types) && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '12px 0 8px' }}>
                            {String(pa.violation_types).split(',').map((t: string, ti: number) => { const tb = typeBadge(t.trim()); return <span key={ti} style={S.pill(tb.bg, tb.color)}>{t.trim()}</span>; })}
                        </div>
                    )}
                    {notEmpty(pa.violation_desc) && <div style={{ marginTop: '10px' }}><span style={S.label}>Description</span><ExpandableText text={String(pa.violation_desc)} /></div>}
                    {notEmpty(pa.violation_details) && <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}><span style={S.label}>Details</span><ExpandableText text={String(pa.violation_details)} /></div>}
                </div>
            )}
        </div>
    );
};

/* ═══ SECTION 10 — EVICTION DETAILS ═══ */
const EvictionSection = ({ data }: { data: PropertyDetails }) => {
    const evictions: any[] = (data as any).evictions || [];
    const pa = data.proaddress || {};
    const hasAny = evictions.length > 0 || notEmpty(pa.court_docket) || notEmpty(pa.court_date);
    if (!hasAny) return null;
    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-door-open" /> Eviction Details</h3>
            <div style={{ ...S.banner('#f5f3ff', '#5b21b6'), fontSize: '12px' }}>
                Active or past eviction proceedings on this property may affect occupancy status and timeline for buyer possession after purchase.
            </div>
            {evictions.map((e: any, i: number) => {
                const days = getDaysFrom(e.court_date);
                const isFuture = days !== null && days > 0;
                return (
                    <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#f5f3ff', border: '1px solid #ddd6fe', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                            <DI label="Plaintiff" value={e.plaintiff_name} bold />
                            <span style={S.pill(isFuture ? '#ede9fe' : '#f1f5f9', isFuture ? '#7c3aed' : '#475569')}>{isFuture ? `Upcoming in ${days} days` : 'Past'}</span>
                        </div>
                        <div style={S.grid()}>
                            <DI label="Court Date" value={fmtDate(e.court_date)} />
                            <DI label="Court Docket #" value={e.court_docket} />
                            <DI label="Court" value={e.court_desc} />
                            <DI label="Court Room" value={e.court_room} />
                        </div>
                        {notEmpty(e.details) && <div style={{ marginTop: '12px' }}><span style={S.label}>Details</span><ExpandableText text={String(e.details)} /></div>}
                    </div>
                );
            })}
            {(notEmpty(pa.court_docket) || notEmpty(pa.court_date)) && (
                <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                    <div style={S.grid()}>
                        <DI label="Court Docket (Listing)" value={pa.court_docket} />
                        <DI label="Court Date (Listing)" value={fmtDate(pa.court_date)} />
                        <DI label="Owner's Attorney" value={pa.eviction_owner_lawyer_name} />
                    </div>
                </div>
            )}
        </div>
    );
};

/* ═══ SECTION 11 — OWNER DETAILS (DIVORCING PARTIES) ═══ */
const OwnerSection = ({ data, isMobile }: { data: PropertyDetails; isMobile: boolean }) => {
    const pa = data.proaddress || {};
    const prop = data.property || {};
    const owners: any[] = (data as any).owners || [];
    const owner = owners[0] || {};
    const oname = (data as any).ownername || {};
    const td = (data as any).propertyTrustDeed || {};
    const loans: any[] = (data as any).loans || [];
    const divorces: any[] = (data as any).divorces || [];
    const div = divorces[0] || {};

    const getOwnerName = () =>
        joinName(owner.OFirstName, owner.OMiddleName, owner.OLastName)
        || joinName(oname.PFirstName, oname.PMiddleName, oname.PLastName)
        || joinName(pa.PFirstName, pa.PMiddleName, pa.PLastName)
        || pa.owner_name || td.owner_name
        || (loans[0]?.borrower_name ? `${loans[0].borrower_name} (from Loan)` : null) || 'Unknown Owner';

    const company = oname.PcompanyName || pa.PcompayName;

    // Property address assembly
    const streetNum = pa.PStreetNum || '';
    const streetName = pa.PStreetName || pa.backup_street_name || `${pa.word || ''} ${pa.abbreviation || ''}`.trim() || '';
    const suffix = pa.street_name_post_type || pa.streetnameposttype || '';
    const suite = pa.PSuiteNum ? ` ${pa.PSuiteNum}` : '';
    const propAddr = pa.PStreetAddr1 || `${streetNum} ${streetName} ${suffix}${suite}`.trim();
    const propCity = pa.Pcity || prop.city || '';
    const propState = pa.PState || prop.state || '';
    const propZip = pa.Pzip || prop.zip || '';

    // Mailing address
    const mailLine1 = owner.OStreetAddr1 ? `${owner.OStreetAddr1}${owner.OStreetAddr2 ? ' ' + owner.OStreetAddr2 : ''}` : pa.owner_mailing_address || '';
    const mailCity = owner.OCity || ''; const mailState = owner.OState || ''; const mailZip = owner.OZip || '';
    const isSameAddr = mailLine1 && propAddr && mailLine1.toLowerCase().includes(propAddr.toLowerCase().substring(0, 10));

    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-users" /> Property Owners (Divorcing Parties)</h3>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px', padding: '12px', background: '#faf5ff', borderRadius: '10px', border: '1px solid #ede9fe' }}>
                Both parties listed below may hold ownership interest in this property. Buyer must verify that all required parties have authorized or been ordered to complete the sale.
            </div>

            {/* Petitioner + Respondent side by side */}
            {(notEmpty(div.petitioner_name) || notEmpty(div.respondent_name)) && (
                <div style={{ ...S.sideBy(isMobile), marginBottom: '24px' }}>
                    {notEmpty(div.petitioner_name) && (
                        <div style={{ flex: '1 1 220px', padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg,#faf5ff,#ede9fe)', border: '2px solid #ddd6fe' }}>
                            <div style={S.pill('#7c3aed', '#fff')}>PETITIONER</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#1e1b4b', margin: '12px 0 4px' }}>{div.petitioner_name}</div>
                            <div style={{ fontSize: '11px', color: '#7c3aed' }}>Party who initiated divorce filing</div>
                        </div>
                    )}
                    {notEmpty(div.respondent_name) && (
                        <div style={{ flex: '1 1 220px', padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', border: '2px solid #e2e8f0' }}>
                            <div style={S.pill('#475569', '#fff')}>RESPONDENT</div>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '12px 0 4px' }}>{div.respondent_name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Other party named in the divorce</div>
                        </div>
                    )}
                </div>
            )}

            {/* General owner / company */}
            <div style={{ background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', flexShrink: 0 }}>
                        {getOwnerName().charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{getOwnerName()}</div>
                        {notEmpty(company) && <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}><i className="fa-solid fa-building" style={{ marginRight: '6px' }} />{company}</div>}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {notEmpty(pa.owner_phone) && <a href={`tel:${String(pa.owner_phone).replace(/\D/g, '')}`} style={{ ...S.pill('#f0fdf4', '#166534'), textDecoration: 'none', padding: '10px 16px' }}><i className="fa-solid fa-phone" style={{ marginRight: '8px' }} />CALL</a>}
                    {notEmpty(owner.email) && <a href={`mailto:${owner.email}`} style={{ ...S.pill('#eff6ff', '#1d4ed8'), textDecoration: 'none', padding: '10px 16px' }}><i className="fa-solid fa-envelope" style={{ marginRight: '8px' }} />EMAIL</a>}
                    {notEmpty(div.attorney_name) && (
                        <div style={{ ...S.pill('#faf5ff', '#7c3aed'), padding: '10px 16px' }}><i className="fa-solid fa-gavel" style={{ marginRight: '8px' }} />Attorney: {div.attorney_name.split('—')[0].trim()}</div>
                    )}
                </div>
            </div>

            {/* Ownername HTML */}
            {notEmpty((data as any).ownername?.html) && (
                <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: '#faf5ff', border: '1px solid #ede9fe' }}>
                    <div dangerouslySetInnerHTML={{ __html: sanitize(String((data as any).ownername.html)) }} style={{ fontSize: '13px', lineHeight: '1.6' }} />
                </div>
            )}

            {/* Dual address blocks */}
            <div style={S.sideBy(isMobile)}>
                <div style={{ flex: '1 1 280px', padding: '20px', borderRadius: '12px', background: '#fff', border: '1px solid #f1f5f9' }}>
                    <span style={S.label}>Property Location (Marital Asset)</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{propAddr}</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>{propCity}{propCity && propState ? ', ' : ''}{propState} {propZip}</div>
                </div>
                <div style={{ flex: '1 1 280px', padding: '20px', borderRadius: '12px', background: isSameAddr ? '#f0fdf4' : '#fff', border: isSameAddr ? '1px solid #bbf7d0' : '1px solid #f1f5f9' }}>
                    <span style={S.label}>Owner's Mailing Address</span>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>May be separate if one party has vacated the marital home</div>
                    {isSameAddr ? (
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}><i className="fa-solid fa-house-user" style={{ marginRight: '8px' }} />Owner resides at the property address</div>
                    ) : (
                        <>
                            {owner.is_out_of_state && <div style={{ ...S.pill('#fff7ed', '#ea580c'), marginBottom: '8px' }}>⚠ OUT OF STATE OWNER — One or both parties may have already relocated</div>}
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{mailLine1 || 'Address Unavailable'}</div>
                            {(mailCity || mailState) && <div style={{ fontSize: '14px', color: '#64748b' }}>{mailCity}{mailCity && mailState ? ', ' : ''}{mailState} {mailZip}</div>}
                            {notEmpty(pa.owner_current_state) && <DI label="Current State of Residence" value={pa.owner_current_state} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ═══ SECTION 12 — COUNTY & JURISDICTION ═══ */
const CountySection = ({ data }: { data: PropertyDetails }) => {
    const pa = data.proaddress || {};
    const prop = data.property || {};
    const county = pa.county_fixed || prop.county;
    const divorces: any[] = (data as any).divorces || [];
    const courtName = divorces[0]?.court_name || '';
    if (!notEmpty(county) && !notEmpty(courtName)) return null;
    const countyLower = String(county || '').toLowerCase();
    const courtHasDiffCounty = () => notEmpty(courtName) && !courtName.toLowerCase().includes(countyLower);
    return (
        <div style={S.card}>
            <h3 style={S.head}><i className="fa-solid fa-building-shield" /> County &amp; Jurisdiction</h3>
            <div style={S.grid()}>
                <DI label="Property County" value={county} />
                <DI label="Divorce Court" value={courtName} />
            </div>
            {courtHasDiffCounty() && (
                <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e' }}>
                    ⚠ Note: Divorce court may be in a different jurisdiction than the property county. Consult a real estate attorney for title implications.
                </div>
            )}
            <div style={{ marginTop: '16px', padding: '14px', borderRadius: '12px', background: '#faf5ff', border: '1px solid #ede9fe', fontSize: '12px', color: '#7c3aed' }}>
                <strong>Buyer Advisory:</strong> The court named in the divorce filing has jurisdiction over this asset's sale. Any offer should be communicated through the listing attorney to ensure court compliance.
            </div>
        </div>
    );
};

/* ═══ ROOT COMPONENT ═══ */
const DivorceDetailView: React.FC<Props> = ({ data, isMobile }) => (
    <div style={{ padding: isMobile ? '0' : '8px' }}>
        <MediaSection data={data} />
        <OverviewSection data={data} />
        <ListingSection data={data} />
        <DivorceSection data={data} isMobile={isMobile} />
        <TrustDeedSection data={data} />
        <LoanSection data={data} />
        <TrusteeSection data={data} />
        <OutOfStateOwnerSection data={data} isMobile={isMobile} />
        <TaxLienSection data={data} />
        <ViolationsSection data={data} />
        <EvictionSection data={data} />
        <OwnerSection data={data} isMobile={isMobile} />
        <CountySection data={data} />
    </div>
);

export default DivorceDetailView;

