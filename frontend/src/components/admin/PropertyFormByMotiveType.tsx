import React from 'react';

interface PropertyFormByMotiveTypeProps {
    motiveCode: string;
    data: any;
    onChange: (field: string, value: any, section?: string, index?: number) => void;
}

const PropertyFormByMotiveType: React.FC<PropertyFormByMotiveTypeProps> = ({ motiveCode, data, onChange }) => {

    // Helper to handle nested changes
    const handleChange = (section: string, field: string, value: any, index: number = 0) => {
        onChange(field, value, section, index);
    };

    const renderTrusteeFields = (prefix: string = 'trustee') => (
        <div style={{ marginTop: 16, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>Trustee Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Name</label>
                    <input
                        type="text"
                        value={data[prefix]?.TTrusteeName || data.proaddress?.trusteename || ''}
                        onChange={(e) => handleChange(prefix, 'TTrusteeName', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Phone</label>
                    <input
                        type="text"
                        value={data[prefix]?.TTrusteePhone || data.proaddress?.trusteephone || ''}
                        onChange={(e) => handleChange(prefix, 'TTrusteePhone', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                    />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Address</label>
                    <input
                        type="text"
                        value={data[prefix]?.TTrusteeAddress || data.proaddress?.trusteeaddress || ''}
                        onChange={(e) => handleChange(prefix, 'TTrusteeAddress', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Email</label>
                    <input
                        type="text"
                        value={data[prefix]?.TTrusteeEmail || data.proaddress?.trusteeemail || ''}
                        onChange={(e) => handleChange(prefix, 'TTrusteeEmail', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                    />
                </div>
            </div>
        </div>
    );

    const renderAuctionFields = (prefix: string = 'auctions', index: number = 0) => {
        const auction = data[prefix]?.[index] || {};
        return (
            <div style={{ marginTop: 16, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>Auction Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Date & Time</label>
                        <input
                            type="datetime-local"
                            value={auction.AAuctionDateTime ? new Date(auction.AAuctionDateTime).toISOString().slice(0, 16) : ''}
                            onChange={(e) => handleChange(prefix, 'AAuctionDateTime', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Place</label>
                        <input
                            type="text"
                            value={auction.AAuctionPlace || data.proaddress?.auctionplace || ''}
                            onChange={(e) => handleChange(prefix, 'AAuctionPlace', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Opening Bid</label>
                        <input
                            type="number"
                            value={auction.AOpeningBid || data.proaddress?.auction_amt || ''}
                            onChange={(e) => handleChange(prefix, 'AOpeningBid', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderLoanFields = (prefix: string = 'loans', index: number = 0) => {
        const loan = data[prefix]?.[index] || {};
        return (
            <div style={{ marginTop: 16, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>Loan Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Lender</label>
                        <input
                            type="text"
                            value={loan.lender_name || ''}
                            onChange={(e) => handleChange(prefix, 'lender_name', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Loan Amount</label>
                        <input
                            type="number"
                            value={loan.loan_amount || ''}
                            onChange={(e) => handleChange(prefix, 'loan_amount', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Recorded Date</label>
                        <input
                            type="date"
                            value={loan.datetime ? new Date(loan.datetime).toISOString().slice(0, 10) : ''}
                            onChange={(e) => handleChange(prefix, 'datetime', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Lis Pendens Date</label>
                        <input
                            type="date"
                            value={loan.lis_pendens_date ? new Date(loan.lis_pendens_date).toISOString().slice(0, 10) : ''}
                            onChange={(e) => handleChange(prefix, 'lis_pendens_date', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderProbateFields = (prefix: string = 'probates', index: number = 0) => {
        const probate = data[prefix]?.[index] || {};
        return (
            <div style={{ marginTop: 16, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>Probate Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Case Number</label>
                        <input
                            type="text"
                            value={probate.case_number || ''}
                            onChange={(e) => handleChange(prefix, 'case_number', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Court</label>
                        <input
                            type="text"
                            value={probate.probate_court || ''}
                            onChange={(e) => handleChange(prefix, 'probate_court', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Executor Name</label>
                        <input
                            type="text"
                            value={probate.executor_name || ''}
                            onChange={(e) => handleChange(prefix, 'executor_name', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Date of Death</label>
                        <input
                            type="date"
                            value={probate.date_of_death ? new Date(probate.date_of_death).toISOString().slice(0, 10) : ''}
                            onChange={(e) => handleChange(prefix, 'date_of_death', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderViolationFields = (prefix: string = 'violations', index: number = 0) => {
        const violation = data[prefix]?.[index] || {};
        return (
            <div style={{ marginTop: 16, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>Code Violation</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Type</label>
                        <input
                            type="text"
                            value={violation.types || ''}
                            onChange={(e) => handleChange(prefix, 'types', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Issue Date</label>
                        <input
                            type="date"
                            value={violation.issue_date || ''}
                            onChange={(e) => handleChange(prefix, 'issue_date', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Details</label>
                        <textarea
                            value={violation.details || ''}
                            onChange={(e) => handleChange(prefix, 'details', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1', minHeight: 60 }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderEvictionFields = (prefix: string = 'evictions', index: number = 0) => {
        const eviction = data[prefix]?.[index] || {};
        return (
            <div style={{ marginTop: 16, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>Eviction Record</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Court Date</label>
                        <input
                            type="date"
                            value={eviction.court_date ? new Date(eviction.court_date).toISOString().slice(0, 10) : ''}
                            onChange={(e) => handleChange(prefix, 'court_date', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Docket #</label>
                        <input
                            type="text"
                            value={eviction.court_docket || ''}
                            onChange={(e) => handleChange(prefix, 'court_docket', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderDivorceFields = (prefix: string = 'divorces', index: number = 0) => {
        const divorce = data[prefix]?.[index] || {};
        return (
            <div style={{ marginTop: 16, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>Divorce Case</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Case Number</label>
                        <input
                            type="text"
                            value={divorce.case_number || ''}
                            onChange={(e) => handleChange(prefix, 'case_number', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Filing Date</label>
                        <input
                            type="date"
                            value={divorce.filing_date ? new Date(divorce.filing_date).toISOString().slice(0, 10) : ''}
                            onChange={(e) => handleChange(prefix, 'filing_date', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderTaxLienFields = (prefix: string = 'taxLiens', index: number = 0) => {
        const lien = data[prefix]?.[index] || {};
        return (
            <div style={{ marginTop: 16, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>Tax Lien</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Amount Owed</label>
                        <input
                            type="number"
                            value={lien.amount_owed || ''}
                            onChange={(e) => handleChange(prefix, 'amount_owed', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Tax Year</label>
                        <input
                            type="text"
                            value={lien.tax_year || ''}
                            onChange={(e) => handleChange(prefix, 'tax_year', e.target.value, index)}
                            style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    switch (motiveCode) {
        case 'PRE':
            return (
                <div>
                    {renderTrusteeFields()}
                    {renderLoanFields()}
                </div>
            );
        case 'FOR':
            return (
                <div>
                    {renderAuctionFields()}
                    {renderTrusteeFields()}
                    {renderLoanFields()}
                </div>
            );
        case 'AUC':
            return (
                <div>
                    {renderAuctionFields()}
                </div>
            );
        case 'PRO':
            return (
                <div>
                    {renderProbateFields()}
                    {renderTrusteeFields()}
                </div>
            );
        case 'COD':
            return (
                <div>
                    {renderViolationFields()}
                </div>
            );
        case 'EVI':
            return (
                <div>
                    {renderEvictionFields()}
                </div>
            );
        case 'DIV':
            return (
                <div>
                    {renderDivorceFields()}
                </div>
            );
        case 'TAX':
            return (
                <div>
                    {renderTaxLienFields()}
                </div>
            );
        case 'OUT':
            return (
                <div style={{ marginTop: 16, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>Out of State Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Owner State</label>
                            <input
                                type="text"
                                value={data.proaddress?.owner_current_state || ''}
                                onChange={(e) => onChange('owner_current_state', e.target.value, 'proaddress')}
                                style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                                placeholder="e.g. CA"
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Mailing Address</label>
                            <input
                                type="text"
                                value={data.proaddress?.owner_mailing_address || ''}
                                onChange={(e) => onChange('owner_mailing_address', e.target.value, 'proaddress')}
                                style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
                                placeholder="Full mailing address"
                            />
                        </div>
                    </div>
                </div>
            );
        default:
            return null;
    }
};

export default PropertyFormByMotiveType;
