import React from 'react';
import { PropertyDetails } from '@/components/dashboard/PropertyDetailsPage';

interface LoanDetailsSectionProps {
    data: PropertyDetails;
    isMobile: boolean;
}

const LoanDetailsSection: React.FC<LoanDetailsSectionProps> = ({ data, isMobile }) => {
    const property = data;

    const formatCurrency = (val: any) => {
        if (val === null || val === undefined || val === '') return 'N/A';
        const num = typeof val === 'string' ? parseFloat(val.replace(/[$,]/g, '')) : val;
        if (isNaN(num)) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
    };

    const formatDate = (dateStr: any) => {
        if (!dateStr) return 'N/A';
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

    const fieldLabelStyle = { display: 'block', fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '3px' };
    const fieldValueStyle = { fontSize: '14px', fontWeight: 500, color: '#111827', display: 'block' };

    return (
        <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                    <i className="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>FINANCIALS & LOANS</h3>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Detailed debt obligations and equity analysis</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                    <span style={fieldLabelStyle}>Total Debt</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{formatCurrency(property.financials.totalDebt)}</span>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                    <span style={fieldLabelStyle}>Equity Position</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(property.financials.estimatedEquity)}</span>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                    <span style={fieldLabelStyle}>Equity %</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{property.financials.equityPercent}%</span>
                </div>
            </div>

            {property.propertyTrustDeed && (
                <div style={{ marginBottom: '24px', borderRadius: '12px', padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h5 style={{ color: '#1e40af', margin: 0, fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            <i className="fa-solid fa-file-invoice" style={{ marginRight: '10px' }}></i>
                            TRUST DEED & DOCUMENTATION
                        </h5>
                        {(property as any).propertyTrustDeed?.documentUrl && (
                            <a
                                href={(property as any).propertyTrustDeed.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: '#059669',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)',
                                    textTransform: 'uppercase'
                                }}
                            >
                                <i className="fa-solid fa-file-pdf"></i>
                                VIEW DOCUMENT
                            </a>
                        )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        <div><span style={fieldLabelStyle}>Deed ID</span><span style={fieldValueStyle}>{(property as any).propertyTrustDeed.deed_id || 'N/A'}</span></div>
                        <div><span style={fieldLabelStyle}>Recorded Date</span><span style={fieldValueStyle}>{formatDate((property as any).propertyTrustDeed.datetime)}</span></div>
                        <div><span style={fieldLabelStyle}>Lender on Deed</span><span style={fieldValueStyle}>{(property as any).propertyTrustDeed.lender_name || 'N/A'}</span></div>
                        <div><span style={fieldLabelStyle}>Loan Amount on Deed</span><span style={fieldValueStyle}>{formatCurrency((property as any).propertyTrustDeed.loan_amount)}</span></div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Loan History</h4>
                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{property.loans ? property.loans.length : 0} Records</span>
            </div>

            {property.loans && property.loans.length > 0 ? (
                property.loans.map((loan: any, idx: number) => (
                    <div key={idx} style={{ padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f3f4f6', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', padding: '4px 10px', background: 'rgba(37,99,235,0.1)', borderRadius: '6px' }}>{loan.position} Position</span>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {(property.motiveTypeCode === 'FOR' || property.motiveType?.code === 'FOR' || property.motiveTypeCode === 'PRE') && loan.foreclosure_stage && (
                                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>{loan.foreclosure_stage}</span>
                                )}
                                <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{formatCurrency(loan.loanAmount || loan.loan_amount)}</span>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
                            <div><span style={fieldLabelStyle}>Lender</span><span style={fieldValueStyle}>{loan.lender || loan.lender_name || 'Unknown'}</span></div>
                            <div><span style={fieldLabelStyle}>Borrower / Owner</span><span style={fieldValueStyle}>{loan.borrower_name || property.proaddress?.owner_name || 'N/A'}</span></div>
                            <div><span style={fieldLabelStyle}>Recorded Date</span><span style={fieldValueStyle}>{formatDate(loan.loanDate || loan.datetime)}</span></div>
                            <div><span style={fieldLabelStyle}>Interest Rate</span><span style={fieldValueStyle}>{(loan.interestRate ?? 0) > 0 ? `${loan.interestRate}%` : 'Fixed/Unknown'}</span></div>
                            <div><span style={fieldLabelStyle}>Type</span><span style={fieldValueStyle}>{loan.loanType || 'Conventional'}</span></div>

                            {/* Motivation Specific Loan Fields */}
                            {(property.motiveTypeCode === 'FOR' || property.motiveType?.code === 'FOR' || property.motiveTypeCode === 'PRE') && (
                                <>
                                    {loan.total_default_amount && <div><span style={fieldLabelStyle}>Total Default Amount</span><span style={{ ...fieldValueStyle, color: '#ef4444', fontWeight: 700 }}>{formatCurrency(loan.total_default_amount)}</span></div>}
                                    {loan.arrears_amount && <div><span style={fieldLabelStyle}>Arrears Amount</span><span style={fieldValueStyle}>{formatCurrency(loan.arrears_amount)}</span></div>}
                                    {loan.lis_pendens_date && <div><span style={fieldLabelStyle}>Foreclosure Filed</span><span style={fieldValueStyle}>{formatDate(loan.lis_pendens_date)}</span></div>}
                                    {loan.default_status && <div><span style={fieldLabelStyle}>Default Status</span><span style={fieldValueStyle}>{loan.default_status}</span></div>}
                                </>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    <div style={{ fontSize: '36px', marginBottom: '10px', color: '#d1d5db' }}><i className="fa-solid fa-file-invoice-dollar"></i></div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#4b5563', margin: '0 0 4px' }}>No Loans Found</h3>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>No active or historical loan records found for this property.</p>
                </div>
            )}
        </div>
    );
};

export default LoanDetailsSection;
