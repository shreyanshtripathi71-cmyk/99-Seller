"use client";
import React from 'react';
import { PropertyDetails } from '@/components/dashboard/PropertyDetailsPage';
import OutOfStateOwnerSection from '@/components/property/OutOfStateOwnerSection';

interface Props { data: PropertyDetails; isMobile: boolean; }

/* ── helpers ── */
const fmtCurrency = (v: any): string | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'string' ? parseFloat(v.replace(/[$,]/g, '')) : Number(v);
    if (isNaN(n)) return null;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};
const fmtDate = (d: any): string | null => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};
const fmtPhone = (p: any): string | null => {
    if (!p) return null;
    const c = String(p).replace(/\D/g, '');
    return c.length === 10 ? `(${c.slice(0, 3)}) ${c.slice(3, 6)}-${c.slice(6)}` : String(p);
};
const getRelativeTime = (d: any): string | null => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    const days = Math.floor(Math.abs(new Date().getTime() - dt.getTime()) / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
};
const notEmpty = (v: any): boolean => v !== null && v !== undefined && v !== '' && String(v).trim() !== '';

/* ── style tokens ── */
const S = {
    card: { background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' } as React.CSSProperties,
    sectionHead: { fontSize: '14px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' } as React.CSSProperties,
    grid: (cols = 'repeat(auto-fill, minmax(200px, 1fr))') => ({ display: 'grid', gridTemplateColumns: cols, gap: '20px' } as React.CSSProperties),
    label: { display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px' } as React.CSSProperties,
    value: { fontSize: '15px', fontWeight: '600', color: '#0f172a', wordBreak: 'break-word' } as React.CSSProperties,
    pill: (bg: string, color: string) => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: bg, color, borderRadius: '9999px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' } as React.CSSProperties),
    banner: (bg: string, color: string) => ({ padding: '14px 18px', borderRadius: '12px', background: bg, color, fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${color}30` } as React.CSSProperties),
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

/* ── SECTION 1 — MEDIA ── */
const MediaSection = ({ data }: { data: PropertyDetails }) => {
    const prop: any = data.property || {};
    const pa: any = data.proaddress || {};
    const files: any[] = (data as any).filesUrls || [];
    const oosFiles = files.filter((f: any) => f.PMotiveType === 'OOS');
    const hasMedia = prop.local_image_path || pa.contact_image || oosFiles.length > 0;
    if (!hasMedia) return null;
    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-camera" /> Property Media & Documents</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: oosFiles.length ? '24px' : '0' }}>
                {prop.local_image_path && (
                    <div style={{ flex: '1 1 280px' }}>
                        <span style={S.label}>Property Photo</span>
                        <img src={prop.local_image_path} alt="Property" style={{ width: '100%', borderRadius: '12px', height: '220px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                    </div>
                )}
                {pa.contact_image && (
                    <div style={{ flex: '1 1 280px' }}>
                        <span style={S.label}>Contact Photo</span>
                        <img src={pa.contact_image} alt="Contact" style={{ width: '100%', borderRadius: '12px', height: '220px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                    </div>
                )}
            </div>
            {oosFiles.length > 0 && (
                <div style={S.grid()}>
                    {oosFiles.map((f: any, i: number) => (
                        <div key={i} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i className="fa-regular fa-file-lines" style={{ fontSize: '20px', color: '#1e293b' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>
                                    {f.property_card ? 'Property Card' : 'Document'}
                                    {f.parsed && <span style={{ marginLeft: '6px', color: '#10b981', fontSize: '10px' }}>✓ VERIFIED</span>}
                                </div>
                                <a href={f.url || f.property_card} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#3b82f6', textDecoration: 'underline' }}>View Document</a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ── SECTION 2 — PROPERTY OVERVIEW ── */
const OverviewSection = ({ data }: { data: PropertyDetails }) => {
    const prop: any = data.property || {};
    const pa: any = data.proaddress || {};
    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-house" /> Property Overview</h3>
            <div style={S.grid()}>
                <DI label="Bedrooms" value={prop.beds} />
                <DI label="Bathrooms" value={prop.baths} />
                <DI label="Total Sq Ft" value={prop.sqft?.toLocaleString()} />
                <DI label="Year Built" value={prop.yearBuilt} />
                <DI label="Property Type" value={prop.propertyType} />
                <DI label="Land / Building" value={(prop as any).PLandBuilding} />
                <DI label="Base Value" value={fmtCurrency((prop as any).PBase)} />
                <DI label="Land Area" value={(prop as any).PTotLandArea} />
                <DI label="Building Area" value={(prop as any).PTotBuildingArea} />
            </div>
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                <div style={S.grid()}>
                    <DI label="Last Sold Price" value={fmtCurrency((prop as any).PLastSoldAmt)} bold />
                    <DI label="Last Sold Date" value={fmtDate((prop as any).PLastSoldDate)} />
                    <DI label="Appraised Value" value={fmtCurrency(prop.appraisedValue)} bold color="#10b981" />
                    <DI label="Listing ID" value={(prop as any).PListingID} />
                    <DI label="Date Filed" value={fmtDate((prop as any).PDateFiled)} />
                </div>
            </div>
            {prop.comments && (
                <div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <span style={S.label}>Comments</span>
                    <p style={{ ...S.value, fontSize: '13px', fontStyle: 'italic', margin: 0 }}>{prop.comments}</p>
                </div>
            )}
            <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11px', color: '#94a3b8' }}>
                {pa.DATE_TIMEOFEXTRACTION && <span>Data Last Updated: {fmtDate(pa.DATE_TIMEOFEXTRACTION)}</span>}
                {pa.site && <a href={pa.site.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Source</a>}
            </div>
        </div>
    );
};

/* ── SECTION 3 — LISTING DETAILS ── */
const ListingSection = ({ data }: { data: PropertyDetails }) => {
    const pa: any = data.proaddress || {};
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
                <DI label="Amenities" value={pa.amenities} wide />
                <DI label="Comments" value={pa.comments} wide />
                <DI label="Counties" value={pa.counties} />
            </div>
            {pa.url && (
                <div style={{ marginTop: '16px' }}>
                    <a href={pa.url} target="_blank" rel="noopener noreferrer" style={{ ...S.pill('#eff6ff', '#3b82f6'), textDecoration: 'none' }}>
                        <i className="fa-solid fa-external-link" style={{ marginRight: '6px' }} /> Listing URL
                    </a>
                </div>
            )}
        </div>
    );
};

/* ── SECTION 5 — LOAN & DEFAULT ── */
const LoanSection = ({ data }: { data: PropertyDetails }) => {
    const loans: any[] = (data as any).loans || [];
    if (!loans.length) return null;
    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-file-invoice-dollar" /> Loan & Default Details</h3>
            {loans.map((l: any, i: number) => {
                const inDef = Number(l.total_default_amount) > 0 || l.default_status?.toLowerCase().includes('default') || l.default_status?.toLowerCase().includes('delinquent');
                return (
                    <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                        {inDef && <div style={S.banner('#fef2f2', '#ef4444')}><i className="fa-solid fa-circle-exclamation" /> <strong>⚠ Loan in Default — Outstanding balance affects equity</strong></div>}
                        {l.foreclosure_stage && <div style={S.banner('#fff7ed', '#f97316')}><i className="fa-solid fa-house-fire" /> <strong>Foreclosure Stage: {l.foreclosure_stage}</strong></div>}
                        <div style={S.grid()}>
                            <DI label="Borrower" value={l.borrower_name} bold />
                            <DI label="Lender" value={l.lender_name} />
                            <DI label="Lender Address" value={l.lender_address} wide />
                            <DI label="Original Loan" value={fmtCurrency(l.loan_amount)} />
                            <DI label="Total Default" value={fmtCurrency(l.total_default_amount)} color="#ef4444" bold />
                            <DI label="Arrears" value={fmtCurrency(l.arrears_amount)} />
                            <DI label="Foreclosure Stage" value={l.foreclosure_stage} />
                            <DI label="Lis Pendens Filed" value={fmtDate(l.lis_pendens_date)} />
                            <DI label="Default Status" value={l.default_status} color={inDef ? '#ef4444' : '#10b981'} />
                            <DI label="Origination Date" value={fmtDate(l.datetime)} />
                            <DI label="Deed Reference ID" value={l.deed_id} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

/* ── SECTION 6 — TRUST DEED ── */
const TrustDeedSection = ({ data }: { data: PropertyDetails }) => {
    const td: any = (data as any).propertyTrustDeed || {};
    if (!td.deed_id && !td.property_address) return null;
    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-stamp" /> Trust Deed Details</h3>
            <div style={S.grid()}>
                <DI label="Deed ID" value={td.deed_id} />
                <DI label="Owner on Deed" value={td.owner_name} />
                <DI label="Borrower on Deed" value={td.borrower_name} />
                <DI label="Lender on Deed" value={td.lender_name} />
                <DI label="Lender Address" value={td.lender_address} />
                <DI label="Trustee on Deed" value={td.trustee_name} />
                <DI label="Trustee Address" value={td.trustee_address} />
                <DI label="Loan Amount on Deed" value={fmtCurrency(td.loan_amount)} />
                <DI label="County on Deed" value={td.county} />
                <DI label="Address on Deed" value={td.property_address} />
                <DI label="Deed Date" value={fmtDate(td.datetime)} />
            </div>
        </div>
    );
};

/* ── SECTION 7 — TRUSTEE ── */
const TrusteeSection = ({ data }: { data: PropertyDetails }) => {
    const pa: any = data.proaddress || {};
    const trustee: any = (data as any).trustee || {};
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
                        {company && <div style={{ fontWeight: '800' }}>{company}</div>}
                        {name && <div style={{ fontSize: '16px' }}>{name}</div>}
                        {addr && <div>{addr}</div>}
                        {(city || state || zip) && <div>{city}{city && state ? ', ' : ''}{state} {zip}</div>}
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <DI label="Trustee Phone" value={phone ? <a href={`tel:${phone}`} style={{ color: '#3b82f6' }}>{fmtPhone(phone)}</a> : null} />
                    <DI label="Trustee Email" value={email ? <a href={`mailto:${email}`} style={{ color: '#3b82f6' }}>{email}</a> : null} />
                    <DI label="Trustee Website" value={website ? <a href={website} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Visit Site</a> : null} />
                    <DI label="Trustee Type" value={pa.trusteetype} />
                </div>
            </div>
        </div>
    );
};

/* ── SECTION 8 — TAX LIENS ── */
const TaxLienSection = ({ data }: { data: PropertyDetails }) => {
    const liens: any[] = (data as any).taxLiens || [];
    if (!liens.length) return null;
    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-building-columns" style={{ color: '#ef4444' }} /> Tax Lien Records</h3>
            <div style={S.banner('#fef2f2', '#b91c1c')}><i className="fa-solid fa-triangle-exclamation" /> <strong>⚠ Outstanding tax liens. Buyer assumes all financial encumbrances at closing.</strong></div>
            <div style={S.grid()}>
                {liens.map((l: any, i: number) => {
                    const isExpired = l.redemption_period_end && new Date(l.redemption_period_end) < new Date();
                    return (
                        <div key={i} style={{ padding: '18px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ fontWeight: '800', color: '#1e293b' }}>{l.tax_year} LIEN</span>
                                <span style={S.pill(l.status === 'Paid' ? '#f0fdf4' : '#fee2e2', l.status === 'Paid' ? '#10b981' : '#ef4444')}>{l.status || 'Active'}</span>
                            </div>
                            <DI label="Amount Owed" value={fmtCurrency(l.amount_owed)} bold color="#ef4444" />
                            <DI label="Lien Filed" value={fmtDate(l.lien_date)} />
                            <DI label="Tax Authority" value={l.tax_authority} />
                            <div>
                                <span style={S.label}>Redemption Period Ends</span>
                                <div style={{ ...S.value, color: isExpired ? '#ef4444' : '#f59e0b' }}>
                                    {fmtDate(l.redemption_period_end)}
                                    {isExpired ? <span style={{ ...S.pill('#fee2e2', '#ef4444'), marginLeft: '8px' }}>EXPIRED</span> : <span style={{ fontSize: '11px', fontWeight: 700, marginLeft: '8px' }}>Expires {getRelativeTime(l.redemption_period_end)}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ── SECTION 9 — CODE VIOLATIONS ── */
const ViolationsSection = ({ data }: { data: PropertyDetails }) => {
    const violations: any[] = (data as any).violations || [];
    const pa: any = data.proaddress || {};
    if (!violations.length && !pa.violation_complaint) return null;
    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b' }} /> Code Violations</h3>
            <div style={S.banner('#fef2f2', '#b91c1c')}><i className="fa-solid fa-circle-exclamation" /> <strong>⚠ Property has code violations. Buyer should review before purchase.</strong></div>
            {violations.map((v: any, i: number) => (
                <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ ...S.value, color: '#1e293b' }}>{v.complaint}</div>
                        <span style={S.pill('#fff7ed', '#f97316')}>{v.compliance_status || 'Open'}</span>
                    </div>
                    <div style={S.grid()}>
                        <DI label="Issue Date" value={fmtDate(v.issue_date)} />
                        <DI label="Deadline" value={fmtDate(v.remediation_deadline)} />
                        <DI label="Fine" value={fmtCurrency(v.fine_amount)} bold color="#ef4444" />
                        <DI label="Types" value={v.types} />
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ── SECTION 10 — EVICTION DETAILS ── */
const EvictionSection = ({ data }: { data: PropertyDetails }) => {
    const evictions: any[] = (data as any).evictions || [];
    if (!evictions.length) return null;
    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-gavel" /> Eviction Details</h3>
            {evictions.map((e: any, i: number) => (
                <div key={i} style={{ padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                    <div style={S.grid()}>
                        <DI label="Plaintiff" value={e.plaintiff_name} bold />
                        <DI label="Court Date" value={fmtDate(e.court_date)} />
                        <DI label="Docket #" value={e.court_docket} />
                        <DI label="Court" value={`${e.court_desc || ''}${e.court_room ? ` — Room ${e.court_room}` : ''}`} />
                    </div>
                    {e.details && <div style={{ marginTop: '10px', fontSize: '13px', color: '#475569' }}>{e.details}</div>}
                </div>
            ))}
        </div>
    );
};

/* ── SECTION 11 — OWNER DETAILS ── */
const OwnerSection = ({ data }: { data: PropertyDetails }) => {
    const owners: any[] = (data as any).owners || [];
    const owner: any = owners[0] || {};
    const oname: any = (data as any).ownername || {};
    const pa: any = data.proaddress || {};

    const name = [owner.OFirstName, owner.OMiddleName, owner.OLastName].filter(Boolean).join(' ')
        || [oname.PFirstName, oname.PMiddleName, oname.PLastName].filter(Boolean).join(' ')
        || pa.owner_name || 'Unknown Owner';

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-user-tie" /> Owner Details</h3>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#1e293b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', flexShrink: 0 }}>
                    {name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{name}</div>
                    {(oname.PcompanyName || pa.PcompayName) && <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>{oname.PcompanyName || pa.PcompayName}</div>}
                </div>
            </div>
            <div style={S.grid()}>
                <DI label="Owner Phone" value={pa.owner_phone ? <a href={`tel:${pa.owner_phone}`} style={{ color: '#3b82f6' }}>{fmtPhone(pa.owner_phone)}</a> : null} />
                <DI label="Owner Email" value={owner.email ? <a href={`mailto:${owner.email}`} style={{ color: '#3b82f6' }}>{owner.email}</a> : null} />
                <DI label="Mailing Address" value={owner.OStreetAddr1 || pa.owner_mailing_address} wide />
                {notEmpty(owner.OCity) && <DI label="Mailing City/State/Zip" value={`${owner.OCity}, ${owner.OState} ${owner.OZip}`} />}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   ROOT — OUT OF STATE DETAIL VIEW
   ══════════════════════════════════════════════════ */
const OutOfStateDetailView: React.FC<Props> = ({ data, isMobile }) => {
    return (
        <div style={{ padding: isMobile ? '0' : '8px' }}>
            <MediaSection data={data} />
            <OverviewSection data={data} />
            <ListingSection data={data} />
            {/* OOS Hero Section — the primary motive content */}
            <OutOfStateOwnerSection data={data} isMobile={isMobile} />
            <LoanSection data={data} />
            <TrustDeedSection data={data} />
            <TrusteeSection data={data} />
            <TaxLienSection data={data} />
            <ViolationsSection data={data} />
            <EvictionSection data={data} />
            <OwnerSection data={data} />
        </div>
    );
};

export default OutOfStateDetailView;
