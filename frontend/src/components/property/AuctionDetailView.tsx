"use client";
import React, { useState, useEffect } from 'react';
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
const fmtDateTime = (d: any) => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    return dt.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const fmtPhone = (p: any) => {
    if (!p) return null;
    const c = String(p).replace(/\D/g, '');
    return c.length === 10 ? `(${c.slice(0, 3)}) ${c.slice(3, 6)}-${c.slice(6)}` : String(p);
};
const notEmpty = (v: any) => v !== null && v !== undefined && v !== '';
const sanitize = (html: string) => typeof window === 'undefined' ? html : DOMPurify.sanitize(html);

/* ── style tokens ── */
const card: React.CSSProperties = {
    background: '#fff', borderRadius: '12px', padding: '20px',
    marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0'
};
const cardHead = (color = '#111827'): React.CSSProperties => ({
    fontSize: '13px', fontWeight: '800', color, letterSpacing: '0.6px',
    textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
});
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' };
const label: React.CSSProperties = { display: 'block', fontSize: '10px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '2px' };
const value: React.CSSProperties = { fontSize: '14px', fontWeight: '500', color: '#111827' };
const pill = (bg: string, color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
    background: bg, color, borderRadius: '999px', fontSize: '11px', fontWeight: '700'
});
const linkBtn = (bg: string, color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
    background: bg, color, borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
});

const Row = ({ label: l, value: v, color, bold }: { label: string; value: any; color?: string; bold?: boolean }) => {
    if (!notEmpty(v)) return null;
    return (
        <div style={{ marginBottom: '6px' }}>
            <span style={label}>{l}</span>
            <span style={{ ...value, color: color || '#111827', fontWeight: bold ? '700' : '500' }}>{v}</span>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 1 — AUCTION HERO (gradient card)
══════════════════════════════════════════════════ */
const AuctionHero = ({ data, isMobile }: { data: PropertyDetails; isMobile: boolean }) => {
    const auc = data.auctions?.[0] || {} as any;
    const pa = (data.proaddress || {}) as any;

    const auctionDT: any = auc.AAuctionDateTime || pa.auctiondatetime;
    const minBid = auc.minimum_bid ?? pa.auction_amt;
    const bidDisplay = fmtCurrency(minBid);

    const [countdown, setCountdown] = useState('');
    const [dateState, setDateState] = useState<'future' | 'today' | 'past'>('past');
    const [daysAgo, setDaysAgo] = useState(0);

    useEffect(() => {
        if (!auctionDT) return;
        const target = new Date(auctionDT).getTime();
        const tick = () => {
            const now = Date.now();
            const diff = target - now;
            const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
            const isToday = target >= todayStart.getTime() && target <= todayEnd.getTime();
            if (diff > 0 && !isToday) {
                setDateState('future');
                const days = Math.floor(diff / 86400000);
                const hrs = Math.floor((diff % 86400000) / 3600000);
                const mins = Math.floor((diff % 3600000) / 60000);
                setCountdown(`${days}d ${hrs}h ${mins}m`);
            } else if (isToday) {
                setDateState('today');
                const hrs = Math.max(0, Math.floor(diff / 3600000));
                const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
                setCountdown(`${hrs}h ${mins}m`);
            } else {
                setDateState('past');
                setDaysAgo(Math.floor(-diff / 86400000));
            }
        };
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
    }, [auctionDT]);

    const gradients: Record<string, string> = {
        future: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
        today: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
        past: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    };

    const venueName = auc.AAuctionPlace || pa.auctionplace;
    const addr1 = auc.AAuctionPlaceAddr1 || pa.auctionplaceaddr1;
    const addr2 = auc.AAuctionPlaceAddr2 || pa.auctionplaceaddr2;
    const city = auc.AAuctionCity || pa.auctioncity;
    const state = auc.AAuctionState || pa.auctionstate;
    const zip = auc.AAuctionZip || pa.auctionzip;
    const fullVenueAddr = [venueName, addr1, addr2, [city, state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    const mapsUrl = fullVenueAddr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullVenueAddr)}` : null;

    const calUrl = auctionDT && dateState !== 'past' ? (() => {
        const dt = new Date(auctionDT);
        const pad = (n: number) => String(n).padStart(2, '0');
        const fmt = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
        const end = new Date(dt.getTime() + 3600000);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Property Auction')}&dates=${fmt(dt)}/${fmt(end)}&details=${encodeURIComponent('Auction at ' + fullVenueAddr)}`;
    })() : null;

    const desc = auc.AAuctionDescription || pa.auctiondescription;

    return (
        <div style={{ background: gradients[dateState], borderRadius: '14px', padding: isMobile ? '20px 16px' : '28px', marginBottom: '16px', color: '#fff' }}>
            {/* Status Badge */}
            <div style={{ marginBottom: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {dateState === 'future' && <span style={pill('#22c55e', '#fff')}>🟢 UPCOMING AUCTION</span>}
                {dateState === 'today' && <span style={pill('#fbbf24', '#000')}>🔴 AUCTION TODAY</span>}
                {dateState === 'past' && <span style={pill('#6b7280', '#fff')}>⚫ AUCTION DATE PASSED</span>}
            </div>

            {/* Date + Bid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '4px' }}>⚡ Auction Date & Time</span>
                    <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '900', lineHeight: 1.1 }}>
                        {auctionDT ? fmtDateTime(auctionDT) : 'Date TBD'}
                    </div>
                    {pa.sale_time && <div style={{ fontSize: '13px', color: '#93c5fd', marginTop: '3px' }}>Sale Time: {pa.sale_time}</div>}
                    {dateState !== 'past' && countdown && (
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#fbbf24' }}>⏱ {countdown} remaining</span>
                        </div>
                    )}
                    {dateState === 'past' && daysAgo > 0 && (
                        <div style={{ marginTop: '6px', fontSize: '13px', color: '#94a3b8' }}>{daysAgo} days ago</div>
                    )}
                    {calUrl && (
                        <a href={calUrl} target="_blank" rel="noopener noreferrer" style={{ ...linkBtn('rgba(255,255,255,0.15)', '#fff'), marginTop: '12px', fontSize: '12px' }}>
                            📅 Add to Calendar
                        </a>
                    )}
                </div>

                {bidDisplay && (
                    <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: '700', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '4px' }}>Minimum Bid</span>
                        <div style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: '900', color: '#f87171', lineHeight: 1 }}>{bidDisplay}</div>
                    </div>
                )}
            </div>

            {/* Venue */}
            {(venueName || addr1) && (
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px', marginBottom: desc ? '12px' : '0' }}>
                    <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>📍 Auction Venue</span>
                    {venueName && <div style={{ fontSize: '15px', fontWeight: '700' }}>{venueName}</div>}
                    {addr1 && <div style={{ fontSize: '13px', color: '#cbd5e1' }}>{addr1}{addr2 ? `, ${addr2}` : ''}</div>}
                    {(city || state) && <div style={{ fontSize: '13px', color: '#cbd5e1' }}>{[city, state, zip].filter(Boolean).join(' ')}</div>}
                    {mapsUrl && (
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ ...linkBtn('#2563eb', '#fff'), marginTop: '10px', fontSize: '12px' }}>
                            🗺 Get Directions
                        </a>
                    )}
                </div>
            )}

            {/* Description collapsible */}
            {desc && (
                <details style={{ marginTop: '12px' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.8px', textTransform: 'uppercase', userSelect: 'none' }}>
                        Auction Notice ▸
                    </summary>
                    <div style={{ marginTop: '10px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap', padding: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        {desc}
                    </div>
                </details>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 2 — CONTACTS (Auctioneer + Trustee side-by-side)
══════════════════════════════════════════════════ */
const ContactsSection = ({ data }: { data: PropertyDetails }) => {
    const ae = (data.auctioneer || {}) as any;
    const pa = (data.proaddress || {}) as any;
    const tr = ((data as any).trustee || {}) as any;

    const aeName = ae.name || pa.auctioneername;
    const aeCompany = ae.company || pa.auctioneercompanyname;
    const aePhone = fmtPhone(ae.phone || pa.auctioneerphone);
    const aeEmail = ae.email || pa.auctioneeremail;
    const aeWebsite = ae.website || ae.web_site || pa.auctioneerweb_site;
    const aeAddr = ae.address || pa.auctioneeraddress;
    const aeHtml = ae.html || pa.auctioneerhtml;

    const trName = pa.trusteename || tr.TTrusteeName;
    const trCompany = pa.trusteecompanyname;
    const trPhone = fmtPhone(pa.trusteephone || tr.TTrusteePhone);
    const trEmail = pa.trusteeemail || tr.TTrusteeEmail;
    const trWebsite = pa.trusteewebsite || tr.TTrusteeWebSite;
    const trAddr = [pa.trusteeaddress, [pa.trusteecity, pa.trusteestate, pa.trusteezip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    const trType = pa.trusteetype;

    const hasAE = aeName || aePhone || aeEmail;
    const hasTR = trName || trPhone || trEmail;
    if (!hasAE && !hasTR) return null;

    const ContactCard = ({ title, icon, name, company, addr, type, phone, rawPhone, email, website, html }: any) => (
        <div style={{ flex: 1, background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', minWidth: '220px' }}>
            <div style={cardHead('#1e40af')}><span>{icon}</span>{title}</div>
            {name && <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{name}</div>}
            {company && <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{company}</div>}
            {type && <div style={{ marginBottom: '8px' }}><span style={pill('#eff6ff', '#1d4ed8')}>{type}</span></div>}
            {addr && <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>{addr}</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {phone && <a href={`tel:${(rawPhone || '').replace(/\D/g, '')}`} style={linkBtn('#eff6ff', '#2563eb')}>📞 {phone}</a>}
                {email && <a href={`mailto:${email}`} style={linkBtn('#f0fdf4', '#15803d')}>✉ {email}</a>}
                {website && <a href={website.startsWith('http') ? website : '//' + website} target="_blank" rel="noopener noreferrer" style={linkBtn('#faf5ff', '#7c3aed')}>🌐 Website</a>}
            </div>
            {html && notEmpty(html) && (
                <details style={{ marginTop: '12px' }}>
                    <summary style={{ cursor: 'pointer', fontSize: '11px', color: '#9ca3af', fontWeight: '600', userSelect: 'none' }}>More info ▸</summary>
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#4b5563', padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        dangerouslySetInnerHTML={{ __html: sanitize(html) }} />
                </details>
            )}
        </div>
    );

    return (
        <div style={{ ...card }}>
            <div style={cardHead('#374151')}>👥 Key Contacts</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {hasAE && <ContactCard title="Auctioneer" icon="🔨" name={aeName} company={aeCompany} addr={aeAddr} rawPhone={ae.phone || pa.auctioneerphone} phone={aePhone} email={aeEmail} website={aeWebsite} html={aeHtml} />}
                {hasTR && <ContactCard title="Trustee" icon="⚖️" name={trName} company={trCompany} addr={trAddr} type={trType} rawPhone={pa.trusteephone || tr.TTrusteePhone} phone={trPhone} email={trEmail} website={trWebsite} />}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 3 — TRUST DEED
══════════════════════════════════════════════════ */
const TrustDeedSection = ({ data }: { data: PropertyDetails }) => {
    const td = (data as any).propertyTrustDeed;
    if (!td) return null;
    const hasAny = td.deed_id || td.borrower_name || td.owner_name || td.lender_name || td.loan_amount || td.datetime || td.county;
    if (!hasAny) return null;
    return (
        <div style={card}>
            <div style={cardHead('#059669')}>📜 Trust Deed</div>
            <div style={grid2}>
                <Row label="Deed ID" value={td.deed_id} />
                <Row label="Date" value={fmtDate(td.datetime)} />
                <Row label="County" value={td.county} />
                <Row label="Borrower" value={td.borrower_name} />
                <Row label="Lender" value={td.lender_name} />
                <Row label="Trustee on Deed" value={td.trustee_name} />
                <Row label="Loan Amount" value={fmtCurrency(td.loan_amount)} bold />
            </div>
            {td.lender_address && <div style={{ marginTop: '8px' }}><Row label="Lender Address" value={td.lender_address} /></div>}
            {td.documentUrl && <a href={td.documentUrl} target="_blank" rel="noopener noreferrer" style={{ ...linkBtn('#2563eb', '#fff'), marginTop: '10px' }}>📄 View Document</a>}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   SECTION 4 — ENCUMBRANCES (Tax Liens + Violations + Evictions)
══════════════════════════════════════════════════ */
const EncumbrancesSection = ({ data }: { data: PropertyDetails }) => {
    const liens = data.taxLiens || [];
    const viols = data.violations || [];
    const evs = data.evictions || [];
    const pa = (data.proaddress || {}) as any;

    const hasLien = liens.length > 0;
    const hasViol = viols.length > 0 || pa.violation_complaint;
    const hasEvic = evs.length > 0 || pa.court_docket;

    if (!hasLien && !hasViol && !hasEvic) return null;

    return (
        <div style={card}>
            <div style={cardHead('#dc2626')}>⚠️ Encumbrances & Legal Issues</div>

            {/* Tax Liens */}
            {hasLien && (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏦 Tax Liens ({liens.length})</span>
                    </div>
                    {liens.map((ln: any, i: number) => {
                        const redDate = ln.redemption_period_end ? new Date(ln.redemption_period_end) : null;
                        const redDays = redDate ? Math.floor((redDate.getTime() - Date.now()) / 86400000) : null;
                        return (
                            <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{ln.tax_authority || 'Tax Authority'}</span>
                                    <span style={{ fontWeight: '800', fontSize: '16px', color: '#dc2626' }}>{fmtCurrency(ln.amount_owed)}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', fontSize: '12px' }}>
                                    {ln.tax_year && <div><span style={{ color: '#9ca3af' }}>Tax Year: </span>{ln.tax_year}</div>}
                                    {ln.lien_date && <div><span style={{ color: '#9ca3af' }}>Filed: </span>{fmtDate(ln.lien_date)}</div>}
                                    {ln.status && <div><span style={{ color: '#9ca3af' }}>Status: </span><span style={pill(ln.status.toLowerCase().includes('active') ? '#fef2f2' : '#dcfce7', ln.status.toLowerCase().includes('active') ? '#b91c1c' : '#15803d')}>{ln.status}</span></div>}
                                    {ln.sale_date && <div><span style={{ color: '#9ca3af' }}>Tax Sale: </span><strong>{fmtDate(ln.sale_date)}</strong></div>}
                                </div>
                                {redDate && (
                                    <div style={{ marginTop: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#9ca3af' }}>Redemption ends:</span>
                                        <span>{fmtDate(ln.redemption_period_end)}</span>
                                        {redDays !== null && redDays > 0
                                            ? <span style={pill('#dcfce7', '#15803d')}>{redDays} days left</span>
                                            : <span style={pill('#fef2f2', '#b91c1c')}>Expired</span>
                                        }
                                    </div>
                                )}
                                {ln.notes && <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>{ln.notes}</div>}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Code Violations */}
            {hasViol && (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                        🚧 Code Violations ({viols.length > 0 ? viols.length : 1})
                    </div>
                    {viols.map((v: any, i: number) => {
                        const overdue = v.remediation_deadline && new Date(v.remediation_deadline) < new Date() && !['resolved', 'compliant'].includes(v.compliance_status?.toLowerCase());
                        return (
                            <div key={i} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{v.types || v.short_desc || 'Violation'}</span>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {overdue && <span style={pill('#fef2f2', '#b91c1c')}>OVERDUE</span>}
                                        {v.compliance_status && <span style={pill('#f3f4f6', '#4b5563')}>{v.compliance_status}</span>}
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{v.short_desc}</div>
                                {v.fine_amount && <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>Fine: {fmtCurrency(v.fine_amount)}</div>}
                                {v.remediation_deadline && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Deadline: {fmtDate(v.remediation_deadline)}</div>}
                                {v.details && <details style={{ marginTop: '8px' }}><summary style={{ cursor: 'pointer', fontSize: '11px', color: '#9ca3af', userSelect: 'none' }}>Details ▸</summary><div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>{v.details}</div></details>}
                            </div>
                        );
                    })}
                    {!viols.length && pa.violation_complaint && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>{pa.violation_types || pa.violation_complaint}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{pa.violation_desc}</div>
                            {pa.violation_total && <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '600', marginTop: '4px' }}>Fine: {fmtCurrency(pa.violation_total)}</div>}
                        </div>
                    )}
                </div>
            )}

            {/* Evictions */}
            {hasEvic && (
                <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                        🔨 Eviction Proceedings ({evs.length > 0 ? evs.length : 1})
                    </div>
                    {evs.map((ev: any, i: number) => (
                        <div key={i} style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{ev.plaintiff_name || 'Plaintiff'}</div>
                                    {ev.court_docket && <div style={{ fontSize: '12px', color: '#9ca3af' }}>Docket: {ev.court_docket}</div>}
                                </div>
                                {ev.court_date && <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Court Date</div>
                                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#7c3aed' }}>{fmtDate(ev.court_date)}</div>
                                </div>}
                            </div>
                            {ev.court_desc && <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{ev.court_desc}</div>}
                            {ev.court_room && <div style={{ fontSize: '12px', color: '#9ca3af' }}>Room: {ev.court_room}</div>}
                            {ev.details && <details style={{ marginTop: '8px' }}><summary style={{ cursor: 'pointer', fontSize: '11px', color: '#9ca3af', userSelect: 'none' }}>Details ▸</summary><div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>{ev.details}</div></details>}
                        </div>
                    ))}
                    {!evs.length && pa.court_docket && (
                        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '4px' }}>Docket: {pa.court_docket}</div>
                            {pa.court_date && <div style={{ fontSize: '12px', color: '#7c3aed' }}>Court Date: {fmtDate(pa.court_date)}</div>}
                            {pa.eviction_owner_lawyer_name && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Owner's Lawyer: {pa.eviction_owner_lawyer_name}</div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════ */
const AuctionDetailView: React.FC<Props> = ({ data, isMobile }) => {
    return (
        <div style={{ padding: isMobile ? '0' : '0 4px' }}>
            <AuctionHero data={data} isMobile={isMobile} />
            <ContactsSection data={data} />
            <TrustDeedSection data={data} />
            <EncumbrancesSection data={data} />
            <OutOfStateOwnerSection data={data} isMobile={isMobile} />
        </div>
    );
};

export default AuctionDetailView;
