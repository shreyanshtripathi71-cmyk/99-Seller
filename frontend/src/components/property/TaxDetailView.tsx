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
   SECTION 0 — TAX LIEN SUMMARY BANNER (Hero)
══════════════════════════════════════════════════ */
const TaxSummaryBanner = ({ data }: { data: PropertyDetails }) => {
    const liens = (data as any).taxLiens || [];
    const prop = data.property || {};
    const pa = data.proaddress || {};

    const totalLiens = liens.length;
    const totalOwed = liens.reduce((sum: number, l: any) => sum + (Number(l.amount_owed) || 0), 0);
    const appraised = Number(prop.appraisedValue) || 0;

    // Estimate Equity = Appraised - Debt - (Tax Owed if not counted in debt)
    // Assume data.financials.estimatedEquity exists, but adjust it if we know exact tax owed
    const baseEquity = (data as any).financials?.estimatedEquity || 0;
    const isUnderwater = baseEquity < 0;

    const activeCount = liens.filter((l: any) => !['paid', 'released', 'closed'].includes(l.status?.toLowerCase())).length;
    const paidCount = liens.filter((l: any) => ['paid', 'released', 'closed'].includes(l.status?.toLowerCase())).length;

    // Nearest Future Tax Sale Date
    const futureSales = liens.map((l: any) => l.tax_sale_date ? new Date(l.tax_sale_date) : null)
        .filter((d: any) => d && d >= new Date())
        .sort((a: any, b: any) => a.getTime() - b.getTime());
    const nextSale = futureSales[0];

    const isToday = nextSale && new Date().toDateString() === nextSale.toDateString();

    // Redemptions
    const futureRedems = liens.map((l: any) => l.redemption_period_end ? new Date(l.redemption_period_end) : null)
        .filter((d: any) => d && d >= new Date())
        .sort((a: any, b: any) => a.getTime() - b.getTime());
    const nextRedemp = futureRedems[0];

    const pastRedems = liens.map((l: any) => l.redemption_period_end ? new Date(l.redemption_period_end) : null)
        .filter((d: any) => d && d < new Date());
    const hasExpiredRedemp = pastRedems.length > 0;

    return (
        <div style={{ ...S.card, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <i className="fa-solid fa-building-columns" style={{ fontSize: '24px', color: '#ef4444' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>TAX LIEN SUMMARY</h2>
                </div>

                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                    <div>
                        <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.7, textTransform: 'uppercase' }}>Total Owed</span>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#ef4444' }}>{fmtCurrency(totalOwed)}</div>
                    </div>
                    <div>
                        <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.7, textTransform: 'uppercase' }}>Active / Open Liens</span>
                        <div style={{ fontSize: '32px', fontWeight: '900' }}>{activeCount}</div>
                    </div>
                    <div>
                        <span style={{ fontSize: '11px', fontWeight: '800', opacity: 0.7, textTransform: 'uppercase' }}>Estimated Equity</span>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: isUnderwater ? '#ef4444' : '#10b981' }}>
                            {isUnderwater ? 'UNDERWATER' : fmtCurrency(baseEquity)}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Urgency Indicators */}
                    {nextSale ? (
                        <div style={{ ...S.pill(isToday ? '#ef4444' : '#fee2e2', isToday ? '#fff' : '#ef4444'), padding: '8px 16px', border: isToday ? '2px solid #b91c1c' : 'none', animation: isToday ? 'pulse 2s infinite' : 'none' }}>
                            <i className="fa-solid fa-gavel" style={{ marginRight: '8px' }} />
                            TAX SALE: {isToday ? 'TODAY' : fmtDate(nextSale)} ({getRelativeTime(nextSale, "")})
                        </div>
                    ) : (
                        <div style={{ ...S.pill('#334155', '#94a3b8'), padding: '8px 16px' }}>
                            <i className="fa-solid fa-gavel" style={{ marginRight: '8px' }} /> NO UPCOMING TAX SALE
                        </div>
                    )}

                    {nextRedemp && (
                        <div style={{ ...S.pill('#ffedd5', '#ea580c'), padding: '8px 16px' }}>
                            <i className="fa-solid fa-clock" style={{ marginRight: '8px' }} />
                            REDEMPTION ENDS: {fmtDate(nextRedemp)} ({getRelativeTime(nextRedemp, "")})
                        </div>
                    )}
                    {hasExpiredRedemp && (
                        <div style={{ ...S.pill('#fee2e2', '#ef4444'), padding: '8px 16px' }}>
                            <i className="fa-solid fa-ban" style={{ marginRight: '8px' }} /> REDEMPTION EXPIRED
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px', fontSize: '13px', lineHeight: 1.5 }}>
                    <strong>BUYER ADVISORY:</strong> Tax liens hold priority over almost all other encumbrances, including trust deeds and mortgages. Purchasing this property requires satisfying these liens to avoid loss of title via tax deed sale. Review redemption periods carefully.
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
            `}} />
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
    const taxFiles = files.filter((f: any) => f.PMotiveType === "TAX");

    const hasMedia = prop.local_image_path || pa.contact_image || taxFiles.length > 0;
    if (!hasMedia) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-camera" /> Property Media & Tax Documents</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: taxFiles.length ? '24px' : '0' }}>
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

            {taxFiles.length > 0 && (
                <div style={S.grid()}>
                    {taxFiles.map((f: any, i: number) => (
                        <div key={i} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i className="fa-regular fa-file-pdf" style={{ fontSize: '20px', color: '#ef4444' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>
                                    {f.property_card ? 'Property Card' : 'Tax Sale Document'}
                                    {f.parsed && <span style={{ marginLeft: '6px', color: '#10b981', fontSize: '10px' }}>✓ VERIFIED</span>}
                                </div>
                                <a href={f.url || f.property_card} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#3b82f6', textDecoration: 'underline' }}>
                                    View Document
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

    const propAddr = pa.PStreetAddr1 || `${pa.PStreetNum || ''} ${pa.PStreetName || pa.backup_street_name || ''} ${pa.street_name_post_type || pa.streetnameposttype || ''} ${pa.PSuiteNum || ''}`.trim();
    const propCity = pa.Pcity || prop.city;
    const propState = pa.PState || prop.state;
    const propZip = pa.Pzip || prop.zip;
    const fullAddress = `${propAddr}, ${propCity}, ${propState} ${propZip}`;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-house" /> Property Overview</h3>
            <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={S.label}>Address</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{fullAddress}</div>
            </div>

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
                <DI label="Expected Sale Date" value={fmtDate(pa.sale_date)} />
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
   SECTION 4 — ★ TAX LIEN DETAILS ★
══════════════════════════════════════════════════ */
const TaxLienDetailsSection = ({ data }: { data: PropertyDetails }) => {
    const liens = (data as any).taxLiens || [];
    if (!liens.length) return null;

    const getDelinquencyProps = (yearsDelinquent: number) => {
        if (yearsDelinquent >= 3) return { bg: '#fee2e2', color: '#ef4444', text: '3+ YEARS DELINQUENT' };
        if (yearsDelinquent === 2) return { bg: '#ffedd5', color: '#ea580c', text: '2 YEARS DELINQUENT' };
        if (yearsDelinquent === 1) return { bg: '#fef9c3', color: '#ca8a04', text: '1 YEAR DELINQUENT' };
        return { bg: '#f1f5f9', color: '#64748b', text: 'RECENT TAX DEFAULT' };
    };

    return (
        <div style={{ ...S.card, border: '1px solid #ef4444' }}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-file-invoice-dollar" style={{ color: '#ef4444' }} /> Tax Lien Records</h3>

            {/* Sub Summary Bar */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                    <span style={S.label}>TOTAL RECORDS</span>
                    <div style={{ ...S.value, color: '#0f172a' }}>{liens.length} Liens</div>
                </div>
                <div>
                    <span style={S.label}>UNPAID YEARS</span>
                    <div style={{ ...S.value, color: '#ef4444' }}>{new Set(liens.map((l: any) => l.tax_year)).size} Years</div>
                </div>
                <div>
                    <span style={S.label}>LAST PAYMENT YEAR</span>
                    <div style={{ ...S.value, color: '#0f172a' }}>{liens.length ? Math.max(...liens.map((l: any) => l.last_tax_year_paid || 0)) || 'N/A' : 'N/A'}</div>
                </div>
            </div>

            {/* Individual Lien Records */}
            {liens.map((l: any, i: number) => {
                const isPaid = ['paid', 'released', 'closed'].includes(l.status?.toLowerCase());
                const currentYear = new Date().getFullYear();
                const yearNum = parseInt(l.tax_year);
                const yearsDelinquent = !isNaN(yearNum) ? currentYear - yearNum : 0;

                const dbadge = getDelinquencyProps(yearsDelinquent);
                const isExpired = l.redemption_period_end && new Date(l.redemption_period_end) < new Date();

                return (
                    <div key={i} style={{ padding: '24px', borderRadius: '14px', background: '#fff', border: '1px solid #e2e8f0', marginBottom: '20px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: isPaid ? '#10b981' : '#ef4444', borderTopLeftRadius: '14px', borderBottomLeftRadius: '14px' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingLeft: '12px' }}>
                            <div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{l.tax_year} LIEN</div>
                                    <div style={S.pill(isPaid ? '#dcfce7' : '#fee2e2', isPaid ? '#166534' : '#b91c1c')}>{l.status || 'ACTIVE'}</div>
                                    {!isPaid && <div style={S.pill(dbadge.bg, dbadge.color)}>{dbadge.text}</div>}
                                </div>
                                <div style={S.pill('#f1f5f9', '#475569')}><i className="fa-solid fa-landmark" style={{ marginRight: '6px' }} /> {l.tax_authority || 'Unknown Authority'}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={S.label}>Amount Owed</span>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: isPaid ? '#10b981' : '#ef4444' }}>{fmtCurrency(l.amount_owed)}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>+ Interest & Penalties may accrue</div>
                            </div>
                        </div>

                        <div style={{ paddingLeft: '12px' }}>
                            <div style={S.grid('repeat(auto-fill, minmax(220px, 1fr))')}>
                                <DI label="Lien Certificate / ID" value={l.certificate_number} />
                                <DI label="Parcel / APN" value={l.parcel_number} />
                                <DI label="Lien Filed Date" value={fmtDate(l.lien_date) ? `${fmtDate(l.lien_date)} (${getRelativeTime(l.lien_date)})` : null} />
                                <DI label="Tax Sale Date" value={fmtDate(l.tax_sale_date)} color="#ea580c" bold />
                                <DI label="Buyer at Sale" value={l.buyer_name} />
                                <DI label="Interest Rate / Penalty" value={l.interest_rate} />
                                <DI label="Redemption Period Ends" value={fmtDate(l.redemption_period_end) ? `${fmtDate(l.redemption_period_end)}` : null} color={isExpired ? '#ef4444' : '#1e293b'} bold />
                                <DI label="Last Tax Year Paid" value={l.last_tax_year_paid} />
                            </div>

                            {isExpired && !isPaid && (
                                <div style={{ marginTop: '16px', ...S.pill('#fee2e2', '#ef4444') }}>
                                    <i className="fa-solid fa-circle-xmark" style={{ marginRight: '6px' }} /> REDEMPTION PERIOD HAS EXPIRED
                                </div>
                            )}

                            {l.notes && (
                                <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#334155', borderLeft: '3px solid #cbd5e1' }}>
                                    <strong>Notes:</strong> {l.notes}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 5 — LOAN & DEFAULT DETAILS
══════════════════════════════════════════════════ */
const LoanSection = ({ data }: { data: PropertyDetails }) => {
    const loans = (data as any).loans || [];
    const taxLiens = (data as any).taxLiens || [];
    if (!loans.length) return null;

    const hasForeclosure = loans.some((l: any) => l.total_default_amount > 0 || l.foreclosure_stage);

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-hand-holding-dollar" /> Loans & Foreclosures</h3>

            {hasForeclosure && taxLiens.length > 0 && (
                <div style={S.banner('#fef2f2', '#ef4444')}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '18px' }} />
                    <div>
                        <div style={{ fontWeight: '800' }}>MULTIPLE FINANCIAL DISTRESS SIGNALS</div>
                        <div style={{ fontWeight: '500', marginTop: '4px' }}>Property has both active tax liens and a mortgage default. Tax liens take priority over mortgages.</div>
                    </div>
                </div>
            )}

            {loans.map((l: any, i: number) => (
                <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div style={S.grid()}>
                        <DI label="Lender" value={l.lender_name} bold />
                        <DI label="Loan Amount" value={fmtCurrency(l.loan_amount)} />
                        {l.total_default_amount > 0 && <DI label="Default Amount" value={fmtCurrency(l.total_default_amount)} color="#ef4444" bold />}
                        <DI label="Foreclosure Stage" value={l.foreclosure_stage} color="#f59e0b" />
                        <DI label="Lis Pendens Date" value={fmtDate(l.lis_pendens_date)} />
                        <DI label="Borrower" value={l.borrower_name} />
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 6 — TRUST DEED DETAILS
══════════════════════════════════════════════════ */
const TrustDeedSection = ({ data }: { data: PropertyDetails }) => {
    const td = (data as any).propertyTrustDeed;
    if (!td) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-file-contract" /> Trust Deed Details</h3>
            <div style={S.grid()}>
                <DI label="Lender Name" value={td.lender_name} bold />
                <DI label="Deed Date" value={fmtDate(td.datetime)} />
                <DI label="Deed Book / Page" value={td.deed_book_page} />
                <DI label="Buyer Name (on deed)" value={td.buyer_name} />
                <DI label="First Name" value={td.first_name} />
                <DI label="Last Name" value={td.last_name} />
            </div>
            {td.notes && (
                <div style={{ marginTop: '20px' }}>
                    <span style={S.label}>Notes</span>
                    <div style={S.value}>{td.notes}</div>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 7 — TRUSTEE DETAILS
══════════════════════════════════════════════════ */
const TrusteeSection = ({ data }: { data: PropertyDetails }) => {
    const trustee = (data as any).trustee || {};
    const pa = data.proaddress || {};

    const name = trustee.name || pa.trustee_name;
    const phone = trustee.phone || pa.trustee_phone;
    const tsid = pa.trustee_sale_id;

    if (!name && !phone && !tsid) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-gavel" /> Trustee / Foreclosure Agent</h3>
            <div style={S.grid()}>
                <DI label="Trustee Name" value={name} bold />
                <DI label="Trustee Phone" value={fmtPhone(phone)} />
                <DI label="Trustee Address" value={trustee.address} wide />
                <DI label="Trustee Sale ID" value={tsid} />
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 8 — CODE VIOLATIONS
══════════════════════════════════════════════════ */
const CodeViolationSection = ({ data }: { data: PropertyDetails }) => {
    const violations = (data as any).violations || [];
    const pa = data.proaddress || {};
    const taxLiens = (data as any).taxLiens || [];

    const hasViolations = violations.length > 0 || pa.violation_complaint;
    if (!hasViolations) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-triangle-exclamation" /> Code Violations</h3>

            {taxLiens.length > 0 && (
                <div style={S.banner('#ffedd5', '#ea580c')}>
                    <strong>Advisory:</strong> Property has code violations and tax liens. Municipalities may fast-track tax foreclosures on neglected properties.
                </div>
            )}

            {violations.map((v: any, i: number) => (
                <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#f1f5f9', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <DI label="Complaint" value={v.complaint} bold />
                        <div style={S.pill(v.compliance_status === 'resolved' ? '#dcfce7' : '#fee2e2', v.compliance_status === 'resolved' ? '#166534' : '#ef4444')}>{v.compliance_status || 'OPEN'}</div>
                    </div>
                    <div style={S.grid()}>
                        <DI label="Issue Date" value={fmtDate(v.issue_date)} />
                        <DI label="Fine Amount" value={fmtCurrency(v.fine_amount)} color="#ef4444" />
                        <DI label="Current Situation" value={v.current_situation} />
                    </div>
                </div>
            ))}

            {pa.violation_complaint && !violations.length && (
                <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                    <DI label="Listing Complaint" value={pa.violation_complaint} bold />
                    <DI label="Total Fines" value={pa.violation_total} color="#ef4444" />
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 9 — EVICTION DETAILS
══════════════════════════════════════════════════ */
const EvictionSectionData = ({ data }: { data: PropertyDetails }) => {
    const evictions = (data as any).evictions || [];
    const pa = data.proaddress || {};
    const taxLiens = (data as any).taxLiens || [];

    const hasEviction = evictions.length > 0 || pa.court_docket || pa.court_date;
    if (!hasEviction) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-door-open" /> Tenant Disputes & Evictions</h3>

            {taxLiens.length > 0 && (
                <div style={S.banner('#eff6ff', '#2563eb')}>
                    <strong>Info:</strong> Active evictions combined with tax delinquency often indicate landlord distress or property abandonment.
                </div>
            )}

            {evictions.map((e: any, i: number) => (
                <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#f1f5f9', marginBottom: '12px' }}>
                    <DI label="Plaintiff" value={e.plaintiff_name} bold />
                    <div style={{ marginTop: '12px', ...S.grid() }}>
                        <DI label="Court Date" value={fmtDate(e.court_date)} />
                        <DI label="Docket #" value={e.court_docket} />
                        <DI label="Court Room" value={e.court_room} />
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 10 — TAX AUTHORITY & JURISDICTION
══════════════════════════════════════════════════ */
const AuthoritySection = ({ data }: { data: PropertyDetails }) => {
    const pa = data.proaddress || {};
    const taxLiens = (data as any).taxLiens || [];

    const authMap = new Map();
    taxLiens.forEach((l: any) => {
        if (l.tax_authority) {
            authMap.set(l.tax_authority, (authMap.get(l.tax_authority) || 0) + (Number(l.amount_owed) || 0));
        }
    });

    if (authMap.size === 0 && !pa.county_fixed) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-map-location-dot" /> Jurisdiction Information</h3>
            <div style={S.grid()}>
                <DI label="Property County" value={pa.county_fixed} bold />
                <DI label="City / County Entity" value={pa.city_county} />
                <DI label="State" value={pa.PState} />
            </div>

            {authMap.size > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <span style={S.label}>Owed by Tax Authority</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                        {Array.from(authMap.entries()).map(([auth, amt], i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{auth}</span>
                                <span style={{ fontWeight: 700, color: '#ef4444' }}>{fmtCurrency(amt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '20px', padding: '12px', background: '#f1f5f9', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }} />
                Tax rates and sale procedures vary significantly by local jurisdiction. Always verify with the local tax assessor's office.
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 11 — OWNER DETAILS
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

    const ownerNameDOMPurify = sanitize(getName() || '');
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
                        {(ownerNameDOMPurify || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }} dangerouslySetInnerHTML={{ __html: ownerNameDOMPurify }} />
                        {company && <div style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}><i className="fa-solid fa-building" /> {company}</div>}
                    </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
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
                    <span style={S.label}>Property Location (Encumbered Site)</span>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{propAddr}</div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>{propCity}, {propState} {propZip}</div>
                </div>

                <div style={{ flex: '1 1 300px', padding: '20px', borderRadius: '12px', background: isSame ? '#f0fdf4' : '#fff', border: isSame ? '1px solid #bbf7d0' : '1px solid #f1f5f9' }}>
                    <span style={S.label}>Owner's Mailing Address (Tax Bills Go Here)</span>
                    {isSame ? (
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>
                            <i className="fa-solid fa-house-user" style={{ marginRight: '8px' }} /> Owner receives tax bills at the property address
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
   ROOT — TAX DETAIL VIEW
══════════════════════════════════════════════════ */
const TaxDetailView: React.FC<Props> = ({ data, isMobile }) => {
    return (
        <div style={{ padding: isMobile ? '0' : '8px' }}>
            <TaxSummaryBanner data={data} />
            <MediaSection data={data} />
            <OverviewSection data={data} />
            <ListingSection data={data} />
            <TaxLienDetailsSection data={data} />
            <LoanSection data={data} />
            <TrustDeedSection data={data} />
            <TrusteeSection data={data} />
            <CodeViolationSection data={data} />
            <EvictionSectionData data={data} />
            <OutOfStateOwnerSection data={data} isMobile={isMobile} />
            <OwnerSection data={data} />
            <AuthoritySection data={data} />
        </div>
    );
};

export default TaxDetailView;
