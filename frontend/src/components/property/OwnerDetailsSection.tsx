import React from 'react';
import { PropertyDetails } from '@/components/dashboard/PropertyDetailsPage';

interface OwnerDetailsSectionProps {
    data: PropertyDetails;
    canAccessPremium: boolean;
    maskData: (val: string, type: any) => string;
    isMobile: boolean;
}

const OwnerDetailsSection: React.FC<OwnerDetailsSectionProps> = ({ data, canAccessPremium, maskData, isMobile }) => {
    const prop = data.property || {};
    const proaddr = data.proaddress || {};
    const rawOwner = data.owners && data.owners.length > 0 ? data.owners[0] : null;
    const probates = (data as any).probates || [];
    const isProbate = probates.length > 0;

    const fmtDate = (d: any) => {
        if (!d) return null;
        return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const getRelativeTime = (d: any) => {
        if (!d) return null;
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return null;
        const diff = Math.abs(new Date().getTime() - dt.getTime());
        const days = Math.floor(diff / 86400000);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
        if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const formatPhone = (phone: string | undefined) => {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    const getMasked = (val: any, type: 'name' | 'address' | 'phone' | 'email') => {
        if (!val) return null;
        if (canAccessPremium) return val;
        return maskData(val, type);
    };

    const sectionStyle = {
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #f3f4f6'
    };

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

    // Logic: Owner Name Discovery
    const getOwnerName = () => {
        if (rawOwner && (rawOwner.OFirstName || rawOwner.OLastName)) {
            return `${rawOwner.OFirstName || ''} ${rawOwner.OMiddleName ? rawOwner.OMiddleName + ' ' : ''}${rawOwner.OLastName || ''}`.replace(/\s+/g, ' ').trim();
        }
        if (proaddr.ownername && (proaddr.ownername.PFirstName || proaddr.ownername.PLastName)) {
            return `${proaddr.ownername.PFirstName || ''} ${proaddr.ownername.PMiddleName ? proaddr.ownername.PMiddleName + ' ' : ''}${proaddr.ownername.PLastName || ''}`.replace(/\s+/g, ' ').trim();
        }
        if (proaddr.PFirstName || proaddr.PLastName) {
            return `${proaddr.PFirstName || ''} ${proaddr.PMiddleName ? proaddr.PMiddleName + ' ' : ''}${proaddr.PLastName || ''}`.replace(/\s+/g, ' ').trim();
        }
        if (proaddr.owner_name) return proaddr.owner_name;
        if (data.owner?.name && data.owner.name !== 'Unknown') return data.owner.name;
        return null;
    };

    const ownerName = getOwnerName();
    const companyName = proaddr.ownername?.PcompanyName || proaddr.PcompayName || null;

    // Address Logic
    const mailingStreet = data.owner?.mailingAddress || proaddr.owner_mailing_address || null;
    const isOutOfState = rawOwner?.is_out_of_state === true || (data.owner?.mailingState && data.owner?.mailingState !== prop.state);

    // Check for owner occupancy
    const propStreetLine = prop.address?.toLowerCase();
    const isOwnerOccupied = mailingStreet && propStreetLine && mailingStreet.toLowerCase().includes(propStreetLine);

    return (
        <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-user-tie" style={{ color: '#1e40af' }}></i>
                    OWNER DETAILS
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {isOwnerOccupied && <Badge text="Owner Occupied" color="#166534" />}
                    {isOutOfState && <Badge text="Out of State" color="#ea580c" />}
                </div>
            </div>

            {/* Deceased Owner Detail (Probate Only) */}
            {isProbate && (
                <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <div style={{ display: 'inline-flex', padding: '4px 12px', background: '#fee2e2', color: '#ef4444', borderRadius: '999px', fontSize: '11px', fontWeight: '800', marginBottom: '12px' }}>DECEASED OWNER</div>
                            <h4 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: '0 0 4px' }}>Estate of {ownerName || 'Decedent'}</h4>
                            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '700' }}>
                                <i className="fa-solid fa-calendar-xmark" style={{ marginRight: '6px' }}></i>
                                Date of Passing: {fmtDate(probates[0].date_of_death) || 'Unknown'}
                                <span style={{ fontWeight: '500', marginLeft: '6px' }}>({getRelativeTime(probates[0].date_of_death)})</span>
                            </div>
                        </div>
                        <div style={{ flex: '0 0 auto', background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Mailing Context</span>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>Decedent resided in {proaddr.owner_current_state || '—'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Mailing Address used for Legal Notice</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Owner Header / Profile Card */}
            <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '24px',
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                flexWrap: isMobile ? 'wrap' : 'nowrap'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#1e40af',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: '800',
                    flexShrink: 0,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    {(ownerName || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e40af', marginBottom: '4px' }}>
                        {getMasked(ownerName, 'name') || 'Unknown Owner'}
                    </div>
                    {companyName && (
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-building" style={{ fontSize: '12px' }}></i>
                            {companyName}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', borderLeft: isMobile ? 'none' : '1px solid #e2e8f0', paddingLeft: isMobile ? '0' : '20px' }}>
                    <DetailItem label="Direct Phone" value={formatPhone(getMasked(data.owner?.phone || proaddr.owner_phone, 'phone')) || 'N/A'} isBold />
                    <DetailItem label="Email Address" value={getMasked(data.owner?.email || rawOwner?.email, 'email') || 'N/A'} isBold />
                </div>
            </div>

            {/* Address Comparison Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                <div style={{ padding: '20px', borderRadius: '12px', background: '#fff', border: '1px solid #f3f4f6' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <i className="fa-solid fa-location-dot" style={{ marginRight: '8px' }}></i>
                        Subject Property
                    </h4>
                    <DetailItem label="Street Address" value={prop.address} isBold />
                    <DetailItem label="City" value={prop.city} />
                    <DetailItem label="State / Zip" value={`${prop.state || ''} ${prop.zip || ''}`} />
                    <DetailItem label="County" value={prop.county} />
                </div>

                <div style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: isOutOfState ? '#fff7ed' : '#f0fdf4',
                    border: isOutOfState ? '1px solid #fed7aa' : '1px solid #bbf7d0',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '800', color: isOutOfState ? '#9a3412' : '#166534', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <i className="fa-solid fa-envelope" style={{ marginRight: '8px' }}></i>
                        Owner's Mailing Address
                    </h4>

                    {isOwnerOccupied ? (
                        <div style={{
                            padding: '20px',
                            background: 'rgba(255,255,255,0.7)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#166534',
                            fontWeight: '600',
                            textAlign: 'center',
                            border: '1px dashed #bbf7d0',
                            marginTop: '10px'
                        }}>
                            <i className="fa-solid fa-house-user" style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}></i>
                            Owner resides at the subject property address.<br />
                            <span style={{ fontSize: '12px', fontWeight: '400', opacity: 0.8 }}>(Owner Occupied)</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <DetailItem label="Mailing Street" value={getMasked(data.owner?.mailingAddress, 'address') || 'N/A'} isBold color={isOutOfState ? '#9a3412' : '#166534'} />
                            <DetailItem label="Mailing City" value={data.owner?.mailingCity || 'N/A'} />
                            <DetailItem label="State / Zip" value={`${data.owner?.mailingState || ''} ${data.owner?.mailingZip || ''}`} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerDetailsSection;
