"use client";
import React from 'react';
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

const getRelativeTime = (d: any, suffix: string = "ago") => {
    if (!d) return null;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return null;
    const now = new Date();
    const diff = Math.abs(now.getTime() - dt.getTime());
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ${suffix}`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ${suffix}`;
    return `${days} day${days > 1 ? 's' : ''} ${suffix}`;
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
    heroCard: { background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)', borderRadius: '16px', padding: '28px', marginBottom: '20px', border: '1px solid #fee2e2', position: 'relative' } as React.CSSProperties,
    sectionHead: { fontSize: '14px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' } as React.CSSProperties,
    grid: (cols = 'repeat(auto-fill, minmax(200px, 1fr))') => ({ display: 'grid', gridTemplateColumns: cols, gap: '20px' } as React.CSSProperties),
    label: { display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '6px' } as React.CSSProperties,
    value: { fontSize: '15px', fontWeight: '600', color: '#0f172a', wordBreak: 'break-word' } as React.CSSProperties,
    pill: (bg: string, color: string) => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', background: bg, color, borderRadius: '9999px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' } as React.CSSProperties),
    banner: (bg: string, color: string) => ({ padding: '14px 18px', borderRadius: '12px', background: bg, color, fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${color}20` } as React.CSSProperties),
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

/* ══════════════════════════════════════════════════
   COMPONENT 1 — PROBATE CASE HERO
══════════════════════════════════════════════════ */
const ProbateHero = ({ data }: { data: PropertyDetails }) => {
    const probates = (data as any).probates || [];
    if (!probates.length) return null;
    const p = probates[0];

    const getStatusStyles = (s: string = '') => {
        const lower = s.toLowerCase();
        if (['open', 'active', 'pending'].includes(lower)) return { bg: '#fff7ed', text: '#c2410c' };
        if (['closed', 'settled'].includes(lower)) return { bg: '#f0fdf4', text: '#15803d' };
        return { bg: '#f1f5f9', text: '#475569' };
    };
    const ss = getStatusStyles(p.status);

    return (
        <div style={S.heroCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 300px' }}>
                    <div style={{ ...S.pill('#fee2e2', '#ef4444'), marginBottom: '12px' }}>PROBATE FILING</div>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{p.case_number}</h2>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444', margin: '0 0 16px' }}>{p.probate_court}</p>

                    <div style={S.grid('repeat(auto-fill, minmax(130px, 1fr))')}>
                        <DI label="Filing Date" value={fmtDate(p.filing_date)} bold />
                        <DI label="Estate Type" value={p.estate_type} color="#64748b" />
                        <DI label="Estimated Value" value={fmtCurrency(p.estate_value)} color="#059669" bold />
                    </div>
                </div>

                <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                    {p.status && <div style={{ ...S.pill(ss.bg, ss.text), fontSize: '13px', padding: '6px 16px', marginBottom: '12px' }}>{p.status}</div>}
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Filed {getRelativeTime(p.filing_date)}</div>
                </div>
            </div>

            <div style={{ marginTop: '28px', borderTop: '2px dashed #fcdada', paddingTop: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#ef4444' }}>
                    <i className="fa-solid fa-user-tie" />
                </div>
                <div style={{ flex: '1' }}>
                    <span style={S.label}>Executor / Personal Representative</span>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{p.executor_name || 'TBD'}</div>
                    <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700', marginTop: '4px' }}>Decision Maker for Property Sale</div>
                </div>
                {p.executor_contact && (
                    <div style={{ background: '#fff', padding: '12px 20px', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                        <span style={S.label}>Contact Detail</span>
                        {p.executor_contact.includes('@') ? (
                            <a href={`mailto:${p.executor_contact}`} style={{ ...S.value, color: '#3b82f6', textDecoration: 'underline' }}>{p.executor_contact}</a>
                        ) : (
                            <a href={`tel:${p.executor_contact.replace(/\D/g, '')}`} style={{ ...S.value, color: '#3b82f6', fontWeight: '800' }}>{fmtPhone(p.executor_contact)}</a>
                        )}
                    </div>
                )}
            </div>

            {p.notes && (
                <div style={{ marginTop: '20px', background: '#fefce8', padding: '16px', borderRadius: '12px', border: '1px solid #fef08a' }}>
                    <span style={S.label}>Legal Notes</span>
                    <p style={{ ...S.value, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{p.notes}</p>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   COMPONENT 2 — LEGAL & FINANCIAL HAZARDS
══════════════════════════════════════════════════ */
const LegalHazards = ({ data }: { data: PropertyDetails }) => {
    const liens = (data as any).taxLiens || [];
    const viols = (data as any).violations || [];
    const evs = (data as any).evictions || [];
    const hasAny = liens.length > 0 || viols.length > 0 || evs.length > 0;
    if (!hasAny) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }} /> Encumbrances & Legal Issues</h3>

            {liens.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <div style={S.banner('#fef2f2', '#b91c1c')}>
                        <i className="fa-solid fa-building-columns" /> <strong>Active Tax Liens:</strong> Outstanding debt must be satisfied at closing.
                    </div>
                    <div style={S.grid()}>
                        {liens.map((l: any, i: number) => (
                            <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#b91c1c' }}>{l.tax_year} LIEN</span>
                                    <span style={S.pill('#fee2e2', '#b91c1c')}>{l.status || 'Active'}</span>
                                </div>
                                <DI label="Amount Owed" value={fmtCurrency(l.amount_owed)} bold color="#b91c1c" />
                                <DI label="Tax Authority" value={l.tax_authority} />
                                <DI label="Redemption Ends" value={fmtDate(l.redemption_period_end)} color="#c2410c" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {viols.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <div style={S.banner('#fffbeb', '#92400e')}>
                        <i className="fa-solid fa-hammer" /> <strong>Code Violations:</strong> Estate may not have remediated these issues.
                    </div>
                    <div style={S.grid()}>
                        {viols.map((v: any, i: number) => (
                            <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fef3c7' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#92400e' }}>{v.types}</span>
                                    {v.compliance_status && <span style={S.pill('#fef3c7', '#92400e')}>{v.compliance_status}</span>}
                                </div>
                                <p style={{ fontSize: '12px', color: '#78350f', margin: '0 0 12px' }}>{v.complaint}</p>
                                <DI label="Fine Amount" value={fmtCurrency(v.fine_amount)} />
                                <DI label="Deadline" value={fmtDate(v.remediation_deadline)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {evs.length > 0 && (
                <div>
                    <div style={S.banner('#f5f3ff', '#5b21b6')}>
                        <i className="fa-solid fa-people-group" /> <strong>Active Evictions:</strong> Occupancy status uncertain. Buyer assumes responsibility.
                    </div>
                    {evs.map((e: any, i: number) => (
                        <div key={i} style={{ padding: '16px', borderRadius: '12px', background: '#f5f3ff', border: '1px solid #ddd6fe', marginBottom: '10px' }}>
                            <div style={S.grid()}>
                                <DI label="Plaintiff" value={e.plaintiff_name} bold />
                                <DI label="Court Date" value={fmtDate(e.court_date)} color="#7c3aed" bold />
                                <DI label="Docket #" value={e.court_docket} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   COMPONENT 3 — TITLE & FINANCIAL RECORDS
══════════════════════════════════════════════════ */
const TitleFinancialRecords = ({ data }: { data: PropertyDetails }) => {
    const td = (data as any).propertyTrustDeed;
    const loans = (data as any).loans || [];
    if (!td && !loans.length) return null;

    return (
        <div style={S.card}>
            <h3 style={S.sectionHead}><i className="fa-solid fa-file-shield" style={{ color: '#059669' }} /> Title & Financial Records</h3>

            {td && (
                <div style={{ marginBottom: '24px', borderBottom: loans.length ? '1px solid #f1f5f9' : 'none', paddingBottom: loans.length ? '20px' : '0' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '16px' }}>TRUST DEED / RECORDED OWNER</div>
                    <div style={S.grid()}>
                        <DI label="Owner on Deed" value={td.owner_name} bold />
                        <DI label="Lender on Deed" value={td.lender_name} />
                        <DI label="Loan Amount" value={fmtCurrency(td.loan_amount)} bold color="#059669" />
                        <DI label="Deed Date" value={fmtDate(td.datetime)} />
                        <DI label="Trustee" value={td.trustee_name} wide />
                    </div>
                </div>
            )}

            {loans.length > 0 && (
                <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginBottom: '16px' }}>MORTGAGE & DEBT STATUS</div>
                    {loans.map((l: any, i: number) => (
                        <div key={i} style={{ marginBottom: i < loans.length - 1 ? '20px' : '0', padding: '16px', borderRadius: '12px', background: '#f8fafc' }}>
                            {l.total_default_amount > 0 && (
                                <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <i className="fa-solid fa-circle-exclamation" /> OUTSTANDING DEFAULT BALANCE: {fmtCurrency(l.total_default_amount)}
                                </div>
                            )}
                            <div style={S.grid()}>
                                <DI label="Lender" value={l.lender_name} />
                                <DI label="Orig. Loan" value={fmtCurrency(l.loan_amount)} />
                                <DI label="Default Amt" value={fmtCurrency(l.total_default_amount)} color={l.total_default_amount > 0 ? '#ef4444' : '#64748b'} />
                                <DI label="Foreclosure Stage" value={l.foreclosure_stage} color="#c2410c" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════
   COMPONENT 4 — OWNER / DECEASED IDENTITY
══════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════ */
const ProbateDetailView: React.FC<Props> = ({ data, isMobile }) => {
    return (
        <div style={{ padding: isMobile ? '0' : '8px' }}>
            <ProbateHero data={data} />
            <LegalHazards data={data} />
            <TitleFinancialRecords data={data} />
            <OutOfStateOwnerSection data={data} isMobile={isMobile} />

            {/* Media & Docs (Bottom) */}
            {(data as any).filesUrls?.length > 0 && (
                <div style={S.card}>
                    <h3 style={S.sectionHead}><i className="fa-solid fa-paperclip" /> Supporting Documents</h3>
                    <div style={S.grid()}>
                        {(data as any).filesUrls.map((f: any, i: number) => (
                            <a key={i} href={f.url || f.property_card} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', textDecoration: 'none' }}>
                                <i className="fa-regular fa-file-pdf" style={{ fontSize: '20px', color: '#ef4444' }} />
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{f.url ? 'Case Document' : 'Property Card'}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{f.parsed ? '✓ VERIFIED DATA' : 'View Scan'}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProbateDetailView;
