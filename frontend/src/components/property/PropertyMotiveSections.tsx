/**
 * Motive-Specific Property Detail Sections
 * Reusable components for displaying property information based on motive type
 */

import React from 'react';
import styles from '@/components/search/styles/dashboard.module.scss';

// Helper function to format currency
const formatCurrency = (value: number | string | undefined) => {
    if (!value) return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(numValue);
};

// Helper function to format date
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};

// ============================================================================
// TRUSTEE SECTION - For Pre-foreclosure, Foreclosure, Probate
// ============================================================================
interface TrusteeSectionProps {
    trustee?: any;
    proaddress?: any; // Fallback to proaddress fields
}

export const TrusteeSection: React.FC<TrusteeSectionProps> = ({ trustee, proaddress }) => {
    // Use trustee data if available, otherwise fall back to proaddress embedded fields
    const trusteeName = trustee?.TTrusteeName || proaddress?.trusteename || 'N/A';
    const trusteeAddress = trustee?.TTrusteeAddress || proaddress?.trusteeaddress || 'N/A';
    const trusteeCity = trustee?.TTRUSTEECity || proaddress?.trusteecity || '';
    const trusteeState = trustee?.TTRUSTEEState || proaddress?.trusteestate || '';
    const trusteeZip = trustee?.TTRUSTEEZip || proaddress?.trusteezip || '';
    const trusteePhone = trustee?.TTrusteePhone || proaddress?.trusteephone || 'N/A';
    const trusteeEmail = trustee?.TTrusteeEmail || proaddress?.trusteeemail || 'N/A';
    const trusteeWebsite = trustee?.TTrusteeWebSite || proaddress?.trusteewebsite || 'N/A';
    const trusteeType = trustee?.type || proaddress?.trusteetype || 'N/A';

    const fullAddress = `${trusteeAddress}${trusteeCity ? ', ' + trusteeCity : ''}${trusteeState ? ', ' + trusteeState : ''}${trusteeZip ? ' ' + trusteeZip : ''}`;

    return (
        <div className={styles.detailsSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ background: '#3b82f615', color: '#3b82f6' }}>
                    <i className="fa-solid fa-user-tie"></i>
                </div>
                <div>
                    <h3 className={styles.sectionTitle}>Trustee Information</h3>
                    <p className={styles.sectionSubtitle}>Legal representative and contact details</p>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                    <span className={styles.detailLabel}>Trustee Name</span>
                    <strong className={styles.detailValue}>{trusteeName}</strong>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Trustee Type</span>
                    <span className={styles.detailValue}>{trusteeType}</span>
                </div>
                <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                    <span className={styles.detailLabel}>Address</span>
                    <span className={styles.detailValue}>{fullAddress}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Phone</span>
                    <span className={styles.detailValue}>{trusteePhone}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email</span>
                    <span className={styles.detailValue}>{trusteeEmail}</span>
                </div>
                {trusteeWebsite !== 'N/A' && (
                    <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                        <span className={styles.detailLabel}>Website</span>
                        <a href={trusteeWebsite.startsWith('http') ? trusteeWebsite : `https://${trusteeWebsite}`} target="_blank" rel="noopener noreferrer" className={styles.detailValue} style={{ color: '#3b82f6' }}>
                            {trusteeWebsite}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// AUCTION SECTION - For Foreclosure, Auction
// ============================================================================
interface AuctionSectionProps {
    auctions?: any[];
    proaddress?: any; // Fallback to proaddress fields
    auctioneer?: any;
}

export const AuctionSection: React.FC<AuctionSectionProps> = ({ auctions, proaddress, auctioneer }) => {
    // Use auction records if available, otherwise fall back to proaddress embedded fields
    const hasAuctionRecords = auctions && auctions.length > 0;

    return (
        <div className={styles.detailsSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ background: '#ef444415', color: '#ef4444' }}>
                    <i className="fa-solid fa-gavel"></i>
                </div>
                <div>
                    <h3 className={styles.sectionTitle}>Auction Details</h3>
                    <p className={styles.sectionSubtitle}>Scheduled auction information and location</p>
                </div>
            </div>

            {hasAuctionRecords ? (
                <div className={styles.usageItems}>
                    {auctions!.map((auction, idx) => (
                        <div key={idx} className={styles.loanCard} style={{ borderLeft: '4px solid #ef4444' }}>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Auction Date</span>
                                    <strong className={styles.detailValue}>{formatDate(auction.AAuctionDateTime)}</strong>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Auction Time</span>
                                    <span className={styles.detailValue}>{auction.AAuctionTime || 'TBD'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Opening Bid</span>
                                    <strong className={styles.detailValue} style={{ color: '#ef4444' }}>
                                        {formatCurrency(auction.AOpeningBid)}
                                    </strong>
                                </div>
                                <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                    <span className={styles.detailLabel}>Location</span>
                                    <span className={styles.detailValue}>{auction.AAuctionPlace || proaddress?.auctionplace || 'TBD'}</span>
                                </div>
                                {auction.AAuctionDescription && (
                                    <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                        <span className={styles.detailLabel}>Description</span>
                                        <p className={styles.detailValue}>{auction.AAuctionDescription}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : proaddress?.auctiondatetime ? (
                // Fallback to proaddress embedded auction data
                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Auction Date</span>
                        <strong className={styles.detailValue}>{formatDate(proaddress.auctiondatetime)}</strong>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Opening Bid</span>
                        <strong className={styles.detailValue} style={{ color: '#ef4444' }}>
                            {formatCurrency(proaddress.auction_amt)}
                        </strong>
                    </div>
                    <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                        <span className={styles.detailLabel}>Location</span>
                        <span className={styles.detailValue}>{proaddress.auctionplace || 'TBD'}</span>
                    </div>
                    {proaddress.auctiondescription && (
                        <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                            <span className={styles.detailLabel}>Description</span>
                            <p className={styles.detailValue}>{proaddress.auctiondescription}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.empty_state}>
                    <div className={styles.empty_icon}><i className="fa-solid fa-gavel"></i></div>
                    <h3>No Auction Scheduled</h3>
                    <p>No auction information available for this property.</p>
                </div>
            )}

            {/* Auctioneer Information */}
            {auctioneer && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                    <h4 className={styles.subSectionTitle}>Auctioneer Contact</h4>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Company</span>
                            <strong className={styles.detailValue}>{auctioneer.ACompanyName || 'N/A'}</strong>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Contact Name</span>
                            <span className={styles.detailValue}>{auctioneer.AContactName || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Phone</span>
                            <span className={styles.detailValue}>{auctioneer.APhone || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Email</span>
                            <span className={styles.detailValue}>{auctioneer.AEmail || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// LOAN SECTION - For Pre-foreclosure, Foreclosure
// ============================================================================
interface LoanSectionProps {
    loans?: any[];
}

export const LoanSection: React.FC<LoanSectionProps> = ({ loans }) => {
    if (!loans || loans.length === 0) {
        return (
            <div className={styles.detailsSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Loan Information</h3>
                </div>
                <div className={styles.empty_state}>
                    <div className={styles.empty_icon}><i className="fa-solid fa-file-invoice-dollar"></i></div>
                    <h3>No Loan Records</h3>
                    <p>No loan information available for this property.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.detailsSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ background: '#f59e0b15', color: '#f59e0b' }}>
                    <i className="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <div>
                    <h3 className={styles.sectionTitle}>Loan Information</h3>
                    <p className={styles.sectionSubtitle}>Outstanding debt and lender details</p>
                </div>
            </div>

            <div className={styles.usageItems}>
                {loans.map((loan, idx) => (
                    <div key={idx} className={styles.loanCard}>
                        <div className={styles.loanHeader}>
                            <span className={styles.loanAmount}>{formatCurrency(loan.loan_amount)}</span>
                        </div>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Lender</span>
                                <strong className={styles.detailValue}>{loan.lender_name || 'Unknown'}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Default Amount</span>
                                <strong className={styles.detailValue} style={{ color: '#ef4444' }}>{formatCurrency(loan.total_default_amount)}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Stage</span>
                                <span className={styles.badge_primary}>{loan.foreclosure_stage || 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Arrears</span>
                                <span className={styles.detailValue}>{formatCurrency(loan.arrears_amount)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Status</span>
                                <span className={styles.detailValue} style={{ color: '#ef4444' }}>{loan.default_status || 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Lis Pendens Date</span>
                                <span className={styles.detailValue}>{formatDate(loan.lis_pendens_date)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Recorded Date</span>
                                <span className={styles.detailValue}>{formatDate(loan.datetime || loan.loan_date)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Deed ID</span>
                                <span className={styles.detailValue}>{loan.deed_id || 'N/A'}</span>
                            </div>
                            {loan.lender_address && (
                                <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                    <span className={styles.detailLabel}>Lender Address</span>
                                    <span className={styles.detailValue}>{loan.lender_address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// PROBATE SECTION - For Probate motive type
// ============================================================================
interface ProbateSectionProps {
    probates?: any[];
}

export const ProbateSection: React.FC<ProbateSectionProps> = ({ probates }) => {
    if (!probates || probates.length === 0) {
        return null;
    }

    const probate = probates[0]; // Usually one probate case per property

    return (
        <div className={styles.detailsSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ background: '#6366f115', color: '#6366f1' }}>
                    <i className="fa-solid fa-balance-scale"></i>
                </div>
                <div>
                    <h3 className={styles.sectionTitle}>Probate Case Details</h3>
                    <p className={styles.sectionSubtitle}>Estate proceedings and executor information</p>
                </div>
            </div>

            <div className={styles.alertBox} style={{ borderColor: '#6366f1', background: '#6366f108' }}>
                <i className="fa-solid fa-balance-scale" style={{ color: '#6366f1' }}></i>
                <div>
                    <strong>Probate Estate</strong>
                    <p>This property is part of a probate estate proceeding.</p>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Case Number</span>
                    <strong className={styles.detailValue}>{probate.case_number || 'N/A'}</strong>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Filing Date</span>
                    <span className={styles.detailValue}>{formatDate(probate.filing_date)}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Probate Court</span>
                    <span className={styles.detailValue}>{probate.probate_court || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Estate Type</span>
                    <span className={styles.detailValue}>{probate.estate_type || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Executor Name</span>
                    <strong className={styles.detailValue}>{probate.executor_name || 'N/A'}</strong>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date of Death</span>
                    <span className={styles.detailValue}>{formatDate(probate.date_of_death)}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Probate Court County</span>
                    <span className={styles.detailValue}>{probate.probate_court_county || probate.probate_court || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Estate Value</span>
                    <strong className={styles.detailValue} style={{ color: '#10b981' }}>
                        {formatCurrency(probate.estate_value)}
                    </strong>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Status</span>
                    <span className={styles.badge_primary}>{probate.status || 'Pending'}</span>
                </div>
                {probate.notes && (
                    <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                        <span className={styles.detailLabel}>Notes</span>
                        <p className={styles.detailValue}>{probate.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// VIOLATION SECTION - For Code Violation motive type
// ============================================================================
interface ViolationSectionProps {
    violations?: any[];
}

export const ViolationSection: React.FC<ViolationSectionProps> = ({ violations }) => {
    if (!violations || violations.length === 0) {
        return null;
    }

    return (
        <div className={styles.detailsSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ background: '#dc262615', color: '#dc2626' }}>
                    <i className="fa-solid fa-file-contract"></i>
                </div>
                <div>
                    <h3 className={styles.sectionTitle}>Code Violations</h3>
                    <p className={styles.sectionSubtitle}>Property code violations and compliance status</p>
                </div>
            </div>

            <div className={styles.alertBox} style={{ borderColor: '#dc2626', background: '#dc262608' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: '#dc2626' }}></i>
                <div>
                    <strong>{violations.length} Active Violation{violations.length > 1 ? 's' : ''}</strong>
                    <p>This property has outstanding code violations.</p>
                </div>
            </div>

            <div className={styles.usageItems}>
                {violations.map((violation, idx) => (
                    <div key={idx} className={styles.loanCard} style={{ borderLeft: '4px solid #dc2626' }}>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Violation Type</span>
                                <strong className={styles.detailValue}>{violation.types || 'N/A'}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Fine Amount</span>
                                <strong className={styles.detailValue} style={{ color: '#dc2626' }}>{formatCurrency(violation.fine_amount)}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Remediation Deadline</span>
                                <strong className={styles.detailValue} style={{ color: '#dc2626' }}>{formatDate(violation.remediation_deadline)}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Complaint Number</span>
                                <span className={styles.detailValue}>{violation.complaint || 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Current Situation</span>
                                <span className={styles.badge_primary}>{violation.current_situation || 'Pending'}</span>
                            </div>
                            {violation.short_desc && (
                                <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                    <span className={styles.detailLabel}>Description</span>
                                    <p className={styles.detailValue}>{violation.short_desc}</p>
                                </div>
                            )}
                            {violation.details && (
                                <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                    <span className={styles.detailLabel}>Details</span>
                                    <p className={styles.detailValue}>{violation.details}</p>
                                </div>
                            )}
                            {violation.compliance_status && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Compliance Status</span>
                                    <span className={styles.detailValue}>{violation.compliance_status}</span>
                                </div>
                            )}
                            {violation.resolution_date && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Resolution Date</span>
                                    <span className={styles.detailValue}>{formatDate(violation.resolution_date)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// EVICTION SECTION - For Eviction motive type
// ============================================================================
interface EvictionSectionProps {
    evictions?: any[];
}

export const EvictionSection: React.FC<EvictionSectionProps> = ({ evictions }) => {
    if (!evictions || evictions.length === 0) {
        return null;
    }

    return (
        <div className={styles.detailsSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ background: '#ea580c15', color: '#ea580c' }}>
                    <i className="fa-solid fa-door-open"></i>
                </div>
                <div>
                    <h3 className={styles.sectionTitle}>Eviction History</h3>
                    <p className={styles.sectionSubtitle}>Court proceedings and eviction details</p>
                </div>
            </div>

            <div className={styles.alertBox} style={{ borderColor: '#ea580c', background: '#ea580c08' }}>
                <i className="fa-solid fa-door-open" style={{ color: '#ea580c' }}></i>
                <div>
                    <strong>{evictions.length} Eviction Record{evictions.length > 1 ? 's' : ''}</strong>
                    <p>This property has eviction proceedings on record.</p>
                </div>
            </div>

            <div className={styles.usageItems}>
                {evictions.map((eviction, idx) => (
                    <div key={idx} className={styles.loanCard} style={{ borderLeft: '4px solid #ea580c' }}>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Court Date</span>
                                <strong className={styles.detailValue}>{formatDate(eviction.court_date)}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Docket Number</span>
                                <span className={styles.detailValue}>{eviction.court_docket || 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Plaintiff Name</span>
                                <strong className={styles.detailValue}>{eviction.plaintiff_name || 'N/A'}</strong>
                            </div>
                            {eviction.court_room && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Court Room</span>
                                    <span className={styles.detailValue}>{eviction.court_room}</span>
                                </div>
                            )}
                            {eviction.court_desc && (
                                <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                    <span className={styles.detailLabel}>Description</span>
                                    <p className={styles.detailValue}>{eviction.court_desc}</p>
                                </div>
                            )}
                            {eviction.details && (
                                <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                    <span className={styles.detailLabel}>Details</span>
                                    <p className={styles.detailValue}>{eviction.details}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// DIVORCE SECTION - For Divorce motive type
// ============================================================================
interface DivorceSectionProps {
    divorces?: any[];
    owners?: any[];
}

export const DivorceSection: React.FC<DivorceSectionProps> = ({ divorces, owners }) => {
    if (!divorces || divorces.length === 0) {
        return null;
    }

    const divorce = divorces[0]; // Usually one divorce case per property

    return (
        <div className={styles.detailsSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ background: '#ec489915', color: '#ec4899' }}>
                    <i className="fa-solid fa-heart-broken"></i>
                </div>
                <div>
                    <h3 className={styles.sectionTitle}>Divorce Proceedings</h3>
                    <p className={styles.sectionSubtitle}>Divorce case details and parties involved</p>
                </div>
            </div>

            <div className={styles.alertBox} style={{ borderColor: '#ec4899', background: '#ec489908' }}>
                <i className="fa-solid fa-heart-broken" style={{ color: '#ec4899' }}></i>
                <div>
                    <strong>Divorce Settlement Property</strong>
                    <p>This property is involved in divorce proceedings.</p>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Case Number</span>
                    <strong className={styles.detailValue}>{divorce.case_number || 'N/A'}</strong>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Filing Date</span>
                    <span className={styles.detailValue}>{formatDate(divorce.filing_date)}</span>
                </div>
                <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                    <span className={styles.detailLabel}>Court</span>
                    <span className={styles.detailValue}>{divorce.court_name || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Attorney Name</span>
                    <strong className={styles.detailValue}>{divorce.attorney_name || 'N/A'}</strong>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Legal Filing Date</span>
                    <span className={styles.detailValue}>{formatDate(divorce.legal_filing_date)}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Status</span>
                    <span className={styles.badge_primary}>{divorce.status || 'Pending'}</span>
                </div>
                {divorce.settlement_date && (
                    <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Settlement Date</span>
                        <span className={styles.detailValue}>{formatDate(divorce.settlement_date)}</span>
                    </div>
                )}
                {divorce.notes && (
                    <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                        <span className={styles.detailLabel}>Notes</span>
                        <p className={styles.detailValue}>{divorce.notes}</p>
                    </div>
                )}
            </div>

            {/* Show both owners if available */}
            {owners && owners.length >= 2 && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                    <h4 className={styles.subSectionTitle}>Property Owners</h4>
                    <div className={styles.usageItems}>
                        {owners.slice(0, 2).map((owner, idx) => (
                            <div key={idx} className={styles.loanCard}>
                                <div className={styles.detailsGrid}>
                                    <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                        <span className={styles.detailLabel}>Owner {idx + 1}</span>
                                        <strong className={styles.detailValue}>
                                            {`${owner.OFirstName || ''} ${owner.OMiddleName || ''} ${owner.OLastName || ''}`.trim() || 'N/A'}
                                        </strong>
                                    </div>
                                    <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                        <span className={styles.detailLabel}>Address</span>
                                        <span className={styles.detailValue}>
                                            {`${owner.OStreetAddr1 || ''}, ${owner.OCity || ''}, ${owner.OState || ''} ${owner.OZip || ''}`.replace(/,\s*,/g, ',').trim()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// TAX LIEN SECTION - For Unpaid Taxes motive type
// ============================================================================
interface TaxLienSectionProps {
    taxLiens?: any[];
}

export const TaxLienSection: React.FC<TaxLienSectionProps> = ({ taxLiens }) => {
    if (!taxLiens || taxLiens.length === 0) {
        return null;
    }

    const totalOwed = taxLiens.reduce((sum, lien) => sum + (parseFloat(lien.amount_owed) || 0), 0);

    return (
        <div className={styles.detailsSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ background: '#10b98115', color: '#10b981' }}>
                    <i className="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <div>
                    <h3 className={styles.sectionTitle}>Tax Lien Details</h3>
                    <p className={styles.sectionSubtitle}>Unpaid property taxes and lien information</p>
                </div>
            </div>

            <div className={styles.alertBox} style={{ borderColor: '#10b981', background: '#10b98108' }}>
                <i className="fa-solid fa-file-invoice-dollar" style={{ color: '#10b981' }}></i>
                <div>
                    <strong>Total Amount Owed: {formatCurrency(totalOwed)}</strong>
                    <p>{taxLiens.length} tax lien{taxLiens.length > 1 ? 's' : ''} on record.</p>
                </div>
            </div>

            <div className={styles.usageItems}>
                {taxLiens.map((lien, idx) => (
                    <div key={idx} className={styles.loanCard} style={{ borderLeft: '4px solid #10b981' }}>
                        <div className={styles.loanHeader}>
                            <span className={styles.loanAmount} style={{ color: '#10b981' }}>{formatCurrency(lien.amount_owed)}</span>
                        </div>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Tax Year</span>
                                <strong className={styles.detailValue}>{lien.tax_year || 'N/A'}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Lien Date</span>
                                <span className={styles.detailValue}>{formatDate(lien.lien_date)}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Tax Authority</span>
                                <span className={styles.detailValue}>{lien.tax_authority || 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Last Tax Year Paid</span>
                                <strong className={styles.detailValue}>{lien.last_tax_year_paid || 'N/A'}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Lien Number</span>
                                <span className={styles.detailValue}>{lien.lien_number || 'N/A'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Status</span>
                                <span className={styles.badge_primary}>{lien.status || 'Active'}</span>
                            </div>
                            {lien.sale_date && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Tax Sale Date</span>
                                    <strong className={styles.detailValue} style={{ color: '#ef4444' }}>
                                        {formatDate(lien.sale_date)}
                                    </strong>
                                </div>
                            )}
                            {lien.redemption_period_end && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Redemption Period Ends</span>
                                    <span className={styles.detailValue}>{formatDate(lien.redemption_period_end)}</span>
                                </div>
                            )}
                            {lien.notes && (
                                <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                    <span className={styles.detailLabel}>Notes</span>
                                    <p className={styles.detailValue}>{lien.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// OUT OF STATE SECTION - For Out of State motive type
// ============================================================================
interface OutOfStateSectionProps {
    owners?: any[];
    propertyState?: string;
    proaddress?: any;
}

export const OutOfStateSection: React.FC<OutOfStateSectionProps> = ({ owners, propertyState, proaddress }) => {
    const outOfStateOwners = owners?.filter(owner => owner.is_out_of_state || owner.OState !== propertyState);

    return (
        <div className={styles.detailsSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon} style={{ background: '#3b82f615', color: '#3b82f6' }}>
                    <i className="fa-solid fa-map-marker-alt"></i>
                </div>
                <div>
                    <h3 className={styles.sectionTitle}>Out-of-State Owner</h3>
                    <p className={styles.sectionSubtitle}>Owner resides outside the property state</p>
                </div>
            </div>

            <div className={styles.alertBox} style={{ borderColor: '#3b82f6', background: '#3b82f608' }}>
                <i className="fa-solid fa-map-marker-alt" style={{ color: '#3b82f6' }}></i>
                <div>
                    <strong>Absentee Owner Opportunity</strong>
                    <p>Owner lives out of state, potentially motivated to sell.</p>
                </div>
            </div>

            <div className={styles.usageItems}>
                {/* Specific Proaddress Mailing Info (Highest accuracy for motive) */}
                {(proaddress?.owner_mailing_address || proaddress?.owner_current_state) && (
                    <div className={styles.loanCard} style={{ borderLeft: '4px solid #3b82f6', marginBottom: '16px', background: '#f8fafc' }}>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                <span className={styles.detailLabel}>Mailing Address (Motive Detail)</span>
                                <strong className={styles.detailValue}>{proaddress.owner_mailing_address || 'N/A'}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Current State</span>
                                <strong className={styles.detailValue}>{proaddress.owner_current_state || 'N/A'}</strong>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Motive ID</span>
                                <span className={styles.badge_primary}>Verified OUT</span>
                            </div>
                        </div>
                    </div>
                )}

                {outOfStateOwners?.map((owner, idx) => (
                    <div key={idx} className={styles.loanCard} style={{ borderLeft: '4px solid #3b82f6' }}>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                <span className={styles.detailLabel}>Owner Name</span>
                                <strong className={styles.detailValue}>
                                    {`${owner.OFirstName || ''} ${owner.OMiddleName || ''} ${owner.OLastName || ''}`.trim() || 'N/A'}
                                </strong>
                            </div>
                            <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                <span className={styles.detailLabel}>Owner Location</span>
                                <span className={styles.detailValue}>
                                    {`${owner.OCity || ''}, ${owner.OState || ''} ${owner.OZip || ''}`.replace(/,\s*,/g, ',').trim()}
                                </span>
                            </div>
                            <div className={styles.detailItem} style={{ gridColumn: 'span 2' }}>
                                <span className={styles.detailLabel}>Mailing Address</span>
                                <span className={styles.detailValue}>
                                    {`${owner.OStreetAddr1 || ''}, ${owner.OCity || ''}, ${owner.OState || ''} ${owner.OZip || ''}`.replace(/,\s*,/g, ',').trim()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
