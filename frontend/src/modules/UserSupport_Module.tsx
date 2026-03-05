"use client"
import React, { useState } from "react";
import Link from "next/link";
import { authAPI } from "@/services/api";

/** ==========================================
 *  DATA: FAQ Data (Home)
 *  ========================================== */
export interface HomeFaqDataType { id: number; page: string; question: string; answer: string; showAnswer: boolean; }
export const faq_data: HomeFaqDataType[] = [
    { id: 1, page: "home_2_faq_1", question: "Advance Search", answer: "It only takes 5 minutes. Set-up is smooth & simple, with fully customisable filter to the right one.", showAnswer: false },
    { id: 2, page: "home_2_faq_1", question: "Exert Agents for any help", answer: "It only takes 5 minutes. Set-up is smooth & simple, with fully customisable filter to the right one.", showAnswer: false },
    { id: 3, page: "home_2_faq_1", question: "Protected payments, every time", answer: "It only takes 5 minutes. Set-up is smooth & simple, with fully customisable filter to the right one.", showAnswer: false },
    { id: 1, page: "home_2_faq_2", question: "How does the free trial work?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commo consequat. Duis aute in voluptate nulla pariatur.", showAnswer: false },
    { id: 2, page: "home_2_faq_2", question: "How find different criteria in your process?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commo consequat. Duis aute in voluptate nulla pariatur.", showAnswer: false },
    { id: 3, page: "home_2_faq_2", question: "What do you look for in a founding team?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commo consequat. Duis aute in voluptate nulla pariatur.", showAnswer: false },
    { id: 4, page: "home_2_faq_2", question: "Do you recommend Pay as you go or Pre pay?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commo consequat. Duis aute in voluptate nulla pariatur.", showAnswer: false },
    { id: 1, page: "home_six", question: "Who we are?", answer: "Our founders Dustin Moskovitz and Justin Rosenstein met while leading Engineering .", showAnswer: false },
    { id: 2, page: "home_six", question: "What’s our goal", answer: "Our founders Dustin Moskovitz and Justin Rosenstein met while leading Engineering .", showAnswer: false },
    { id: 3, page: "home_six", question: "Our vision", answer: "Our founders Dustin Moskovitz and Justin Rosenstein met while leading Engineering .", showAnswer: false }
];

/** ==========================================
 *  DATA: FAQ Data (Inner)
 *  ========================================== */
export interface InnerFaqDataType { id: number; id_name: string; title: string; md_pt?: boolean; faq: { id: number; question: string; answer: string; }[]; }
export const inner_faq_data: InnerFaqDataType[] = [
    {
        id: 1, id_name: "Selling", title: "SELLING", md_pt: true, faq: [
            { id: 1, question: "How does the free trial work?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 2, question: "How do you weigh different criteria in your process?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 3, question: "What’s the process of selling property?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 4, question: "Refund & Frauds", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." }
        ]
    },
    {
        id: 2, id_name: "Renting", title: "RENTING", faq: [
            { id: 5, question: "Can a home depreciate in value?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 6, question: "Is an older home as good a value as a new home?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 7, question: "What is a broker?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 8, question: "Can I pay my own taxes and insurance?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." }
        ]
    },
    {
        id: 3, id_name: "Buying", title: "BUYING", faq: [
            { id: 9, question: "How does the free trial work?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 10, question: "How do you weigh different criteria in your process?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 11, question: "Refund & Frauds", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." }
        ]
    },
    {
        id: 4, id_name: "Payments", title: "PAYMENTS", faq: [
            { id: 12, question: "Which payment method is supported?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 13, question: "Is my card is secure here?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 14, question: "Can I provide cheque to my client for payment?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." }
        ]
    },
    {
        id: 5, id_name: "Terms", title: "TERMS & CONDITIONS", faq: [
            { id: 15, question: "How does the free trial work?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 16, question: "How do you weigh different criteria in your process?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." }
        ]
    },
    {
        id: 6, id_name: "Account", title: "ACCOUNT", faq: [
            { id: 17, question: "Can a home depreciate in value?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." },
            { id: 18, question: "Is an older home as good a value as a new home?", answer: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo..." }
        ]
    }
];

/** ==========================================
 *  DATA: Menu Data
 *  ========================================== */
export interface MenuItem { id: number; title: string; link: string; has_dropdown: boolean; sub_menus?: { link: string; title: string }[]; }
export const menu_data: MenuItem[] = [
    { id: 1, title: "Home", link: "/", has_dropdown: false },
    { id: 2, title: "Features", link: "/#features", has_dropdown: false },
    { id: 3, title: "Pricing", link: "/#pricing", has_dropdown: false },
    { id: 4, title: "Data Coverage", link: "/data-coverage", has_dropdown: false }
];

/** ==========================================
 *  DATA: Footer Data
 *  ========================================== */
export interface FooterDataType { id: number; page: string; widget_title: string; widget_class?: string; widget_class2?: string; footer_link: { link: string; link_title: string; }[]; }
export const footer_data: FooterDataType[] = [
    { id: 1, page: "home_1", widget_class: "xs-mt-50", widget_title: "Links", footer_link: [{ link: "/", link_title: "Home" }, { link: "/dashboard/membership", link_title: "Membership" }, { link: "/about_us_01", link_title: "About Company" }, { link: "/blog_01", link_title: "Blog" }, { link: "/blog_02", link_title: "Explore Careers" }, { link: "/pricing_02", link_title: "Pricing" }, { link: "/search", link_title: "Dashboard" }] },
    { id: 2, widget_class: "xs-mt-30", page: "home_1", widget_title: "Legal", footer_link: [{ link: "/faq", link_title: "Terms & conditions" }, { link: "/faq", link_title: "Cookie" }, { link: "/faq", link_title: "Privacy policy" }, { link: "/faq", link_title: "Faq’s" }] },
    { id: 3, widget_class: "xs-mt-30", page: "home_1", widget_title: "New Listing", footer_link: [{ link: "/listing_01", link_title: "​Buy Apartments" }, { link: "/listing_02", link_title: "Buy Condos" }, { link: "listing_03", link_title: "Rent Houses" }, { link: "listing_04", link_title: "Rent Industrial" }, { link: "/listing_05", link_title: "Buy Villas" }, { link: "/listing_06", link_title: "Rent Office" }] },
    { id: 1, page: "home_3", widget_title: "Links", footer_link: [{ link: "/", link_title: "Home" }, { link: "/dashboard/membership", link_title: "Membership" }, { link: "/about_us_01", link_title: "About Company" }, { link: "/blog_01", link_title: "Blog" }, { link: "/blog_02", link_title: "Explore Careers" }, { link: "/pricing_02", link_title: "Pricing" }, { link: "/search", link_title: "Dashboard" }] },
    { id: 2, widget_class: "col-xxl-3 col-xl-4", page: "home_3", widget_title: "Legal", footer_link: [{ link: "/faq", link_title: "Terms & conditions" }, { link: "/faq", link_title: "Cookie" }, { link: "/faq", link_title: "Privacy policy" }, { link: "/faq", link_title: "Faq’s" }] },
    { id: 3, page: "home_3", widget_title: "New Listing", footer_link: [{ link: "/listing_01", link_title: "​Buy Apartments" }, { link: "/listing_02", link_title: "Buy Condos" }, { link: "listing_03", link_title: "Rent Houses" }, { link: "listing_04", link_title: "Rent Industrial" }, { link: "/listing_05", link_title: "Buy Villas" }, { link: "/listing_06", link_title: "Rent Office" }] },
    { id: 1, page: "home_4", widget_class: "col-lg-2", widget_title: "Links", footer_link: [{ link: "/", link_title: "Home" }, { link: "/dashboard/membership", link_title: "Membership" }, { link: "/about_us_01", link_title: "About Company" }, { link: "/blog_01", link_title: "Blog" }] },
    { id: 2, widget_class: "col-xl-2 col-lg-3", page: "home_4", widget_title: "New Listing", footer_link: [{ link: "/listing_01", link_title: "​Buy Apartments" }, { link: "/listing_02", link_title: "Buy Condos" }, { link: "listing_03", link_title: "Rent Houses" }, { link: "listing_04", link_title: "Rent Industrial" }, { link: "/listing_05", link_title: "Buy Villas" }, { link: "/listing_06", link_title: "Rent Office" }] },
    { id: 3, widget_class: "col-xl-2 col-lg-3", page: "home_4", widget_title: "Legal", footer_link: [{ link: "/faq", link_title: "Terms & conditions" }, { link: "/faq", link_title: "Cookie" }, { link: "/faq", link_title: "Privacy policy" }, { link: "/faq", link_title: "Faq’s" }] },
    { id: 1, page: "home_5", widget_class: "col-lg-3 ms-auto", widget_class2: "ps-xl-5", widget_title: "Links", footer_link: [{ link: "/", link_title: "Home" }, { link: "/dashboard/membership", link_title: "Membership" }, { link: "/about_us_01", link_title: "About Company" }, { link: "/blog_01", link_title: "Blog" }, { link: "/blog_02", link_title: "Explore Careers" }, { link: "/pricing_02", link_title: "Pricing" }, { link: "/search", link_title: "Dashboard" }] },
    { id: 2, widget_class: "col-lg-3", page: "home_5", widget_title: "Legal", footer_link: [{ link: "/faq", link_title: "Terms & conditions" }, { link: "/faq", link_title: "Cookie" }, { link: "/faq", link_title: "Privacy policy" }, { link: "/faq", link_title: "Faq’s" }] },
    { id: 3, widget_class: "col-lg-2", page: "home_5", widget_title: "New Listing", footer_link: [{ link: "/listing_01", link_title: "​Buy Apartments" }, { link: "/listing_02", link_title: "Buy Condos" }, { link: "listing_03", link_title: "Rent Houses" }, { link: "listing_04", link_title: "Rent Industrial" }, { link: "/listing_05", link_title: "Buy Villas" }, { link: "/listing_06", link_title: "Rent Office" }] }
];

/** ==========================================
 *  MODAL: DeleteModal
 *  ========================================== */
export const DeleteModal = () => {
    return (
        <div className="modal fade" id="deleteModal" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="container">
                    <div className="remove-account-popup text-center modal-content">
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <i className="fa-solid fa-trash" style={{ fontSize: 32, color: '#ef4444' }}></i>
                        </div>
                        <h2>Are you sure?</h2>
                        <p>Are you sure to delete your account? All data will be lost.</p>
                        <div className="button-group d-inline-flex justify-content-center align-items-center pt-15">
                            <Link href="#" className="confirm-btn fw-500 tran3s me-3">Yes</Link>
                            <button type="button" className="btn-close fw-500 ms-3" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** ==========================================
 *  MODAL: ChangePasswordModal
 *  ========================================== */
export interface ChangePasswordModalProps { onClose: () => void; }
export const ChangePasswordModal = ({ onClose }: ChangePasswordModalProps) => {
    const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError(""); setSuccess("");
        if (formData.newPassword !== formData.confirmPassword) { setError("New passwords do not match"); return; }
        if (formData.newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
        setIsLoading(true);
        try {
            const result = await authAPI.changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
            if (result.success) {
                setSuccess("Password changed successfully!");
                setTimeout(() => onClose(), 2000);
            } else { setError(result.error || "Failed to change password"); }
        } catch (err) { setError("An error occurred. Please try again."); } finally { setIsLoading(false); }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                    <div className="modal-header border-bottom-0 pb-0 ps-4 pe-4 pt-4">
                        <h5 className="modal-title fw-bold text-dark">Change Password</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close" disabled={isLoading}></button>
                    </div>
                    <div className="modal-body px-4 pb-4 pt-2">
                        <p className="text-muted small mb-4">Enter your current password and a new secure password.</p>
                        {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
                        {success && <div className="alert alert-success py-2 small" role="alert">{success}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="small fw-bold text-dark mb-1">Current Password</label>
                                <input type="password" name="currentPassword" className="form-control" style={{ height: '45px', borderRadius: '8px' }} value={formData.currentPassword} onChange={handleChange} required disabled={isLoading} />
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold text-dark mb-1">New Password</label>
                                <input type="password" name="newPassword" className="form-control" style={{ height: '45px', borderRadius: '8px' }} value={formData.newPassword} onChange={handleChange} required disabled={isLoading} />
                            </div>
                            <div className="mb-4">
                                <label className="small fw-bold text-dark mb-1">Confirm New Password</label>
                                <input type="password" name="confirmPassword" className="form-control" style={{ height: '45px', borderRadius: '8px' }} value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} />
                            </div>
                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-light flex-fill rounded-pill fw-bold" onClick={onClose} disabled={isLoading}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-fill rounded-pill fw-bold" style={{ backgroundColor: '#10B981', borderColor: '#10B981' }} disabled={isLoading}>
                                    {isLoading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : null} Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** ==========================================
 *  MODAL: SaveSearchModal
 *  ========================================== */
export interface SaveSearchModalProps { onClose: () => void; onSave: (name: string) => void; filters?: any; }
export const SaveSearchModal = ({ onClose, onSave, filters }: SaveSearchModalProps) => {
    const [searchName, setSearchName] = useState("");
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (searchName.trim()) { onSave(searchName); } };
    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                    <div className="modal-header border-bottom-0 pb-0 ps-4 pe-4 pt-4">
                        <h5 className="modal-title fw-bold text-dark">Save this Search</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body px-4 pb-4 pt-2">
                        <p className="text-muted small mb-4">Name this search to receive email alerts when new properties match these criteria.</p>
                        <form onSubmit={handleSubmit}>
                            <div className="dash-input-wrapper mb-3">
                                <label htmlFor="searchName" className="small fw-bold text-dark mb-1">Search Name</label>
                                <input type="text" id="searchName" className="form-control" style={{ height: '50px', borderRadius: '8px' }} placeholder="e.g. Austin Foreclosures < $300k" value={searchName} onChange={(e) => setSearchName(e.target.value)} autoFocus />
                            </div>
                            {filters && (
                                <div className="p-3 bg-light rounded-3 mb-4 border border-light">
                                    <div className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: '10px' }}>Active Filters</div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {Object.entries(filters).map(([key, value]) => (
                                            (value && value !== 'All' && value !== 'Any' && value !== '0') ? (
                                                <span key={key} className="badge bg-white text-dark border fw-normal shadow-sm">{key}: {String(value)}</span>
                                            ) : null
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="d-flex gap-2 mt-2">
                                <button type="button" className="btn btn-light flex-fill rounded-pill fw-bold" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-fill rounded-pill fw-bold" style={{ backgroundColor: '#2563EB', borderColor: '#2563EB' }}>Save Search</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
