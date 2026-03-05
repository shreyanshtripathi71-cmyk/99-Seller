import React from 'react';
import { PropertyDetails } from '@/components/dashboard/PropertyDetailsPage';
import OutOfStateOwnerSection from '@/components/property/OutOfStateOwnerSection';

interface PreforeclosureDetailViewProps {
    data: PropertyDetails;
    isMobile: boolean;
}

const PreforeclosureDetailView: React.FC<PreforeclosureDetailViewProps> = ({ data, isMobile }) => {
    // --- HELPERS ---
    const formatCurrency = (val: any) => {
        if (val === null || val === undefined || val === '') return null;
        const num = typeof val === 'string' ? parseFloat(val.replace(/[$,]/g, '')) : val;
        if (isNaN(num)) return null;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
    };

    const formatDate = (dateStr: any) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const formatPhone = (phone: string | undefined) => {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    const sectionStyle = {
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #f3f4f6'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px'
    };

    // --- DATA EXTRACTION ---
    const proaddr = data.proaddress || {};
    const rawLoans = data.loans || [];
    const loan = rawLoans.length > 0 ? rawLoans[0] : {};
    const trustDeed = data.propertyTrustDeed || {};
    const trusteeModel = data.trustee || {}; // Original Trustee model if joined

    // --- LOGIC: TRUSTEE FALLBACK (Section 5) ---
    const getTrusteeField = (fieldA: any, fieldB: any) => fieldA || fieldB || null;

    const trusteeInfo = {
        name: getTrusteeField(proaddr.trusteename, trusteeModel.TTrusteeName),
        company: proaddr.trusteecompanyname || null,
        address: getTrusteeField(proaddr.trusteeaddress, trusteeModel.TTrusteeAddress),
        city: getTrusteeField(proaddr.trusteecity, trusteeModel.TTRUSTEECity),
        state: getTrusteeField(proaddr.trusteestate, trusteeModel.TTRUSTEEState),
        zip: getTrusteeField(proaddr.trusteezip, trusteeModel.TTRUSTEEZip),
        phone: getTrusteeField(proaddr.trusteephone, trusteeModel.TTrusteePhone),
        email: getTrusteeField(proaddr.trusteeemail, trusteeModel.TTrusteeEmail),
        website: getTrusteeField(proaddr.trusteewebsite, trusteeModel.TTrusteeWebSite),
        type: proaddr.trusteetype || null
    };

    const hasTrusteeData = Object.values(trusteeInfo).some(v => v !== null);

    // --- SECTION COMPONENTS ---

    const DetailItem = ({ label, value, color, isBold }: { label: string, value: any, color?: string, isBold?: boolean }) => {
        if (value === null || value === undefined || value === '') return null;
        return (
            <div style={{ marginBottom: '12px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{label}</span>
                <span style={{ fontSize: '14px', fontWeight: isBold ? '700' : '500', color: color || '#111827' }}>{value}</span>
            </div>
        );
    };

    const Badge = ({ text, color = '#3b82f6' }: { text: string, color?: string }) => (
        <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '800',
            background: `${color}15`,
            color: color,
            textTransform: 'uppercase',
            border: `1px solid ${color}30`
        }}>
            {text}
        </span>
    );

    const getStageColor = (stage: string) => {
        const s = stage?.toLowerCase() || '';
        if (s.includes('active') || s.includes('pending')) return '#f59e0b'; // Yellow
        if (s.includes('filed') || s.includes('notice')) return '#ea580c';   // Orange
        if (s.includes('default')) return '#ef4444';                       // Red
        return '#6b7280';                                                  // Grey
    };

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('current')) return '#10b981'; // Green
        if (s.includes('delinquent') || s.includes('default')) return '#ef4444'; // Red
        return '#6b7280'; // Grey
    };

    const SummaryBar = () => {
        const foreclosure = (data as any).foreclosure;
        const stage = foreclosure?.status || loan?.foreclosure_stage;
        const defaultAmt = foreclosure?.defaultAmount || loan?.total_default_amount;
        const filingDate = loan?.lis_pendens_date || loan?.datetime;

        return (
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '25px',
                borderRadius: '16px',
                marginBottom: '25px',
                color: '#fff',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px', color: '#ea580c' }}></i>
                    Critical Pre-Foreclosure Highlights
                </h4>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                        <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Current Priority</span>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: '#ea580c' }}>AT RISK</span>
                    </div>
                    {filingDate && (
                        <div style={{ flex: '1', minWidth: '150px', borderLeft: isMobile ? 'none' : '1px solid #334155', paddingLeft: isMobile ? '0' : '20px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Lis Pendens Date</span>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{formatDate(filingDate)}</span>
                        </div>
                    )}
                    {defaultAmt && (
                        <div style={{ flex: '1', minWidth: '150px', borderLeft: isMobile ? 'none' : '1px solid #334155', paddingLeft: isMobile ? '0' : '20px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Balance in Default</span>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>{formatCurrency(defaultAmt)}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '0 20px' }}>
            <SummaryBar />

            {/* SECTION: PREFORECLOSURE / DEFAULT DETAILS */}
            <div style={{ ...sectionStyle, borderLeft: '6px solid #ea580c' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ea580c' }}></i>
                    PREFORECLOSURE / DEFAULT DETAILS
                </h3>
                <div style={gridStyle}>
                    <div>
                        <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Foreclosure Stage</span>
                        {loan.foreclosure_stage ? <Badge text={loan.foreclosure_stage} color={getStageColor(loan.foreclosure_stage)} /> : <span style={{ fontSize: '14px', color: '#6b7280' }}>Not Populated</span>}
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Default Status</span>
                        {loan.default_status ? <Badge text={loan.default_status} color={getStatusColor(loan.default_status)} /> : <span style={{ fontSize: '14px', color: '#6b7280' }}>Not Available</span>}
                    </div>
                    <DetailItem label="Lis Pendens Date" value={formatDate(loan.lis_pendens_date)} color="#ea580c" isBold />
                    <DetailItem label="Expect Sale Date" value={formatDate(proaddr.sale_date)} />
                    <DetailItem label="Expect Sale Time" value={proaddr.sale_time} />
                </div>
            </div>

            {/* SECTION: LEGAL NOTICE & LIS PENDENS */}
            <div style={{
                marginBottom: '24px',
                borderRadius: '12px',
                padding: '20px',
                background: '#fffdfa',
                border: '1px solid #fef3c7',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
                <h5 style={{ color: '#92400e', marginBottom: '16px', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-file-shield" style={{ marginRight: '10px' }}></i>
                    LEGAL NOTICE & LIS PENDENS
                </h5>
                <div style={gridStyle}>
                    <DetailItem label="Lis Pendens Date" value={formatDate(loan.lis_pendens_date)} color="#ea580c" isBold />
                    <DetailItem label="Instrument Number" value={loan.deed_id || proaddr.case_number} />
                    <DetailItem label="Lender on Notice" value={loan.lender_name} isBold />
                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                        <DetailItem label="Lender Notice Address" value={loan.lender_address} />
                    </div>
                </div>
            </div>

            {/* SECTION 5: TRUSTEE DETAILS */}
            {hasTrusteeData && (
                <div style={{
                    marginBottom: '24px',
                    borderRadius: '12px',
                    padding: '20px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}>
                    <h5 style={{ color: '#1e40af', marginBottom: '16px', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        <i className="fa-solid fa-gavel" style={{ marginRight: '10px' }}></i>
                        TRUSTEE DETAILS
                    </h5>
                    <div style={gridStyle}>
                        <DetailItem label="Trustee Representative" value={trusteeInfo.name} isBold />
                        <DetailItem label="Law Firm / Company" value={trusteeInfo.company} />
                        <DetailItem label="Trustee Type" value={trusteeInfo.type} />
                        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                            <DetailItem
                                label="Notice Submission Address"
                                value={`${trusteeInfo.address || ''}${trusteeInfo.city ? ', ' + trusteeInfo.city : ''}${trusteeInfo.state ? ', ' + trusteeInfo.state : ''} ${trusteeInfo.zip || ''}`.replace(/^,/, '').trim()}
                            />
                        </div>
                        <DetailItem label="Trustee Phone" value={formatPhone(trusteeInfo.phone)} />
                        <DetailItem label="Trustee Email" value={trusteeInfo.email} />
                        <div>
                            <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Trustee Website</span>
                            {trusteeInfo.website ? (
                                <a href={trusteeInfo.website.startsWith('http') ? trusteeInfo.website : `https://${trusteeInfo.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#3b82f6', textDecoration: 'none' }}>
                                    Visit Website <i className="fa-solid fa-external-link" style={{ fontSize: '11px' }}></i>
                                </a>
                            ) : <span style={{ fontSize: '14px', color: '#6b7280' }}>N/A</span>}
                        </div>
                    </div>
                </div>
            )}
            <OutOfStateOwnerSection data={data} isMobile={isMobile} />
        </div>
    );
};

export default PreforeclosureDetailView;
