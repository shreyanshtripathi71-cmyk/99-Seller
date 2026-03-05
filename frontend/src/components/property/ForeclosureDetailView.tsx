import React from 'react';
import styles from '@/components/search/styles/dashboard.module.scss';
import { PropertyDetails } from '@/components/dashboard/PropertyDetailsPage';
import OutOfStateOwnerSection from '@/components/property/OutOfStateOwnerSection';

interface ForeclosureDetailViewProps {
    data: PropertyDetails;
    isMobile: boolean;
}

const ForeclosureDetailView: React.FC<ForeclosureDetailViewProps> = ({ data, isMobile }) => {
    // Helpers
    const formatCurrency = (val: any) => {
        if (val === null || val === undefined || val === '') return 'N/A';
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
    };

    const formatDate = (dateStr: any) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const formatPhone = (phone: string | undefined) => {
        if (!phone) return 'N/A';
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

    // --- DATA EXTRACTION ---
    const proaddr = data.proaddress || {};
    const loan = (data.loans && data.loans.length > 0) ? data.loans[0] : null;
    const trustDeed = (data as any).propertyTrustDeed || {};
    const auction = (data.auctions && data.auctions.length > 0) ? data.auctions[0] : null;
    const auctioneer = data.auctioneer || {};

    const DetailItem = ({ label, value, color }: { label: string, value: any, color?: string }) => (
        <div style={{ marginBottom: '12px' }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{label}</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: color || '#111827' }}>{value || 'N/A'}</span>
        </div>
    );

    const SummaryBar = () => {
        const foreclosure = (data as any).foreclosure;
        const stage = foreclosure?.status || loan?.foreclosure_stage;
        const defaultAmt = foreclosure?.defaultAmount || loan?.total_default_amount;
        const auctionDate = foreclosure?.auctionDate || proaddr.auctiondatetime;

        if (!stage && !defaultAmt && !auctionDate) return null;

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
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px', color: '#fbbf24' }}></i>
                    Critical Foreclosure Highlights
                </h4>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                        <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Current Status</span>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: stage === 'Foreclosure' ? '#f87171' : '#60a5fa' }}>{stage || 'Pending'}</span>
                    </div>
                    {auctionDate && (
                        <div style={{ flex: '1', minWidth: '150px', borderLeft: isMobile ? 'none' : '1px solid #334155', paddingLeft: isMobile ? '0' : '20px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Auction Date</span>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#fbbf24' }}>{formatDate(auctionDate)}</span>
                        </div>
                    )}
                    {defaultAmt && (
                        <div style={{ flex: '1', minWidth: '150px', borderLeft: isMobile ? 'none' : '1px solid #334155', paddingLeft: isMobile ? '0' : '20px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Target Default Amt</span>
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{formatCurrency(defaultAmt)}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const hasAuctionReached = !!(auction?.AAuctionDateTime || proaddr.auctiondatetime || auction?.minimum_bid || proaddr.auction_amt);

    return (
        <div style={{ padding: '0 20px' }}>
            <SummaryBar />

            {/* FORECLOSURE DETAILS */}
            <div style={sectionStyle}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
                    DETAILED FORECLOSURE INFORMATION
                </h3>

                {/* 1. TRUSTEE & LEGAL CONTACT */}
                <div style={{
                    marginBottom: '24px',
                    borderRadius: '12px',
                    padding: '20px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}>
                    <h5 style={{ color: '#1e40af', marginBottom: '16px', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px' }}>
                        <i className="fa-solid fa-gavel" style={{ marginRight: '10px' }}></i>
                        TRUSTEE & LEGAL CONTACT
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                        <DetailItem label="Trustee Representative" value={proaddr.trusteename} />
                        <DetailItem label="Law Firm / Company" value={proaddr.trusteecompanyname} />
                        <DetailItem label="Trustee Type" value={proaddr.trusteetype} />
                        <DetailItem label="Legal Phone" value={formatPhone(proaddr.trusteephone)} />
                        <DetailItem label="Legal Email" value={proaddr.trusteeemail} />
                        <DetailItem label="Legal Website" value={proaddr.trusteewebsite} />
                        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 3' }}>
                            <DetailItem label="Notice Submission Address" value={`${proaddr.trusteeaddress || ''}, ${proaddr.trusteecity || ''}, ${proaddr.trusteestate || ''} ${proaddr.trusteezip || ''}`.trim().replace(/^,/, '').trim() || 'N/A'} />
                        </div>
                    </div>
                </div>

                {/* 3. AUCTION EVENT LOGISTICS - CONDITIONAL */}
                {hasAuctionReached && (
                    <div style={{
                        marginBottom: '24px',
                        borderRadius: '12px',
                        padding: '20px',
                        background: '#fffdfa',
                        border: '1px solid #fef3c7'
                    }}>
                        <h5 style={{ color: '#92400e', marginBottom: '16px', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px' }}>
                            <i className="fa-solid fa-clock" style={{ marginRight: '10px' }}></i>
                            AUCTION EVENT LOGISTICS
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
                            <DetailItem label="Opening Bid / Min." value={formatCurrency(auction?.minimum_bid || proaddr.auction_amt)} color="#ef4444" />
                            <DetailItem label="Auction Date" value={formatDate(auction?.AAuctionDateTime || proaddr.auctiondatetime)} />
                            <DetailItem label="Local Time" value={proaddr.sale_time || 'Check Legal Notice'} />
                            <DetailItem label="Place of Auction" value={auction?.AAuctionPlace || proaddr.auctionplace} />
                            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                                <DetailItem label="Exact Auction Location" value={`${proaddr.auctionplaceaddr1 || ''} ${proaddr.auctionplaceaddr2 || ''}, ${proaddr.auctioncity || ''}, ${proaddr.auctionstate || ''} ${proaddr.auctionzip || ''}`.trim().replace(/^,/, '').trim() || 'N/A'} />
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. AUCTIONEER PROFESSIONAL INFO - CONDITIONAL */}
                {hasAuctionReached && (
                    <div style={{
                        borderRadius: '12px',
                        padding: '20px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <h5 style={{ color: '#1e40af', marginBottom: '16px', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px' }}>
                            <i className="fa-solid fa-user-tie" style={{ marginRight: '10px' }}></i>
                            AUCTIONEER PROFESSIONAL INFO
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
                            <DetailItem label="Lead Auctioneer" value={auctioneer.name || proaddr.auctioneername} />
                            <DetailItem label="Auction Company" value={proaddr.auctioneercompanyname} />
                            <DetailItem label="Direct Phone" value={formatPhone(auctioneer.phone || proaddr.auctioneerphone)} />
                            <DetailItem label="Professional Email" value={auctioneer.email || proaddr.auctioneeremail} />
                            <DetailItem label="Office Address" value={proaddr.auctioneeraddress} />
                            <DetailItem label="Website / Portal" value={proaddr.auctioneerweb_site} />
                        </div>
                    </div>
                )}
            </div>

            <OutOfStateOwnerSection data={data} isMobile={isMobile} />
        </div>
    );
};

export default ForeclosureDetailView;
