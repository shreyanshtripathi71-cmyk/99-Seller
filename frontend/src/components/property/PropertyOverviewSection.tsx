import React from 'react';
import { PropertyDetails } from '@/components/dashboard/PropertyDetailsPage';

interface PropertyOverviewSectionProps {
    data: PropertyDetails;
    isMobile: boolean;
}

const PropertyOverviewSection: React.FC<PropertyOverviewSectionProps> = ({ data, isMobile }) => {
    const prop = (data.property || {}) as any;
    const proaddr = (data.proaddress || {}) as any;

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

    return (
        <div style={sectionStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-house-circle-check" style={{ color: '#3b82f6' }}></i>
                PROPERTY OVERVIEW
            </h3>

            {/* Part 1: Record & Context */}
            <div style={{ marginBottom: '24px', borderRadius: '12px', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h5 style={{ color: '#1e40af', margin: '0 0 15px 0', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-file-invoice" style={{ marginRight: '10px' }}></i>
                    Record & Case Information
                </h5>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '20px'
                }}>
                    <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                        <DetailItem
                            label="Full Address"
                            value={`${prop.address || proaddr.PStreetNum + ' ' + proaddr.PStreetName}${prop.city ? ', ' + prop.city : ''}${prop.state ? ', ' + prop.state : ''} ${prop.zip || ''}${prop.county ? ' (' + prop.county + ' County)' : ''}`}
                            isBold
                        />
                    </div>
                    <DetailItem label="Listing Price" value={formatCurrency(proaddr.price)} color="#10b981" isBold />
                    <DetailItem label="Case Number" value={proaddr.case_number || 'N/A'} isBold />
                    <DetailItem label="Parcel Number (APN)" value={prop.parcelNumber || proaddr.listing_id} />
                    <DetailItem label="Deed Book / Page" value={proaddr.deed_book_page} />
                    <DetailItem label="Zoning" value={prop.zoning || 'Residential'} />
                    <DetailItem label="County" value={prop.county || proaddr.counties} />
                    <DetailItem label="Last Sale Date" value={formatDate(prop.PLastSoldDate)} />
                    <DetailItem label="Last Sale Amount" value={formatCurrency(prop.PLastSoldAmt)} />
                </div>
            </div>

            {/* Part 2: Building Specs */}
            <div style={{ marginBottom: '24px', borderRadius: '12px', padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <h5 style={{ color: '#1e40af', margin: '0 0 15px 0', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-building" style={{ marginRight: '10px' }}></i>
                    Building Specifications
                </h5>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px'
                }}>
                    <DetailItem label="Property Type" value={prop.propertyType || proaddr.proptype} />
                    <DetailItem label="Year Built" value={prop.PYearBuilt || prop.yearBuilt || proaddr.PYearBuilt} />
                    <DetailItem label="Beds / Baths" value={`${prop.beds || proaddr.beds || '—'} Beds, ${prop.baths || proaddr.baths || '—'} Baths`} />
                    <DetailItem label="Total Sq Footage" value={(prop.sqft || proaddr.square_feet) ? `${(prop.sqft || proaddr.square_feet).toLocaleString()} sqft` : null} />
                    <DetailItem label="Building Area" value={prop.PTotBuildingArea || 'N/A'} />
                    <DetailItem label="Land/Lot Area" value={prop.PTotLandArea || proaddr.lot_size || 'N/A'} />
                    <DetailItem label="Floors" value={prop.PBase || proaddr.floors || '1'} />
                    <DetailItem label="Garage Size" value={proaddr.garage_size} />
                    <DetailItem label="School District" value={proaddr.school_district} />
                </div>
            </div>

            {/* Part 3: Valuation & Assets */}
            <div style={{ marginBottom: '24px', borderRadius: '12px', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h5 style={{ color: '#10b981', margin: '0 0 15px 0', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-chart-line" style={{ marginRight: '10px' }}></i>
                    Valuation & Assets
                </h5>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '20px'
                }}>
                    <DetailItem label="Total Appraised Amount" value={formatCurrency(prop.PTotAppraisedAmt)} isBold />
                    <DetailItem label="Appraised Building" value={formatCurrency(prop.PAppraisedBuildingAmt)} />
                    <DetailItem label="Appraised Land" value={formatCurrency(prop.PAppraisedLandAmt)} />
                </div>
            </div>

            {/* Part 4: Details & Comments */}
            <div style={{ borderRadius: '12px', padding: '20px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <h5 style={{ color: '#4b5563', margin: '0 0 15px 0', fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    <i className="fa-solid fa-comments" style={{ marginRight: '10px' }}></i>
                    Details & Comments
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {proaddr.amenities && (
                        <div>
                            <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Amenities</span>
                            <span style={{ fontSize: '14px', color: '#111827' }}>{proaddr.amenities}</span>
                        </div>
                    )}
                    {proaddr.comments && (
                        <div>
                            <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Staff Comments</span>
                            <span style={{ fontSize: '14px', fontStyle: 'italic', color: '#4b5563' }}>{proaddr.comments}</span>
                        </div>
                    )}
                    {prop.legalDescription && (
                        <div>
                            <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Legal Description</span>
                            <span style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>{prop.legalDescription}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyOverviewSection;
