"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { feedbackAPI } from "@/services/api";
import ReCAPTCHA from "react-google-recaptcha";

/** ==========================================
 *  COMPONENT: ProtectedRoute
 *  ========================================== */
export interface ProtectedRouteProps {
    children: React.ReactNode;
    requireSubscription?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireSubscription = false
}) => {
    const { isAuthenticated, isLoading, canAccessPremium } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
        }

        if (!isLoading && isAuthenticated && requireSubscription && !canAccessPremium()) {
            router.push("/dashboard/subscription");
        }
    }, [isAuthenticated, isLoading, requireSubscription, canAccessPremium, router]);

    if (isLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8fafc" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <div style={{
                        width: 48, height: 48, border: "4px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    }} />
                    <span style={{ color: "#64748b", fontSize: 14 }}>Loading...</span>
                    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;
    if (requireSubscription && !canAccessPremium()) return null;

    return <>{children}</>;
};

/** ==========================================
 *  COMPONENT: ReCaptcha
 *  ========================================== */
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

export interface ReCaptchaProps {
    onChange?: (token: string | null) => void;
    onExpired?: () => void;
    size?: "normal" | "compact" | "invisible";
    theme?: "light" | "dark";
}

export interface ReCaptchaRef {
    getValue: () => string | null;
    reset: () => void;
    execute: () => void;
}

export const ReCaptchaComponent = forwardRef<ReCaptchaRef, ReCaptchaProps>(
    ({ onChange, onExpired, size = "normal", theme = "light" }, ref) => {
        const recaptchaRef = useRef<ReCAPTCHA>(null);
        const isRecaptchaEnabled = process.env.NEXT_PUBLIC_ENABLE_RECAPTCHA !== 'false';

        useEffect(() => {
            if (!isRecaptchaEnabled && onChange) {
                onChange("DISABLED_BY_CONFIG");
            }
        }, [isRecaptchaEnabled, onChange]);

        useImperativeHandle(ref, () => ({
            getValue: () => recaptchaRef.current?.getValue() || (isRecaptchaEnabled ? null : "DISABLED_BY_CONFIG"),
            reset: () => recaptchaRef.current?.reset(),
            execute: () => recaptchaRef.current?.execute(),
        }));

        const handleChange = (token: string | null) => { if (onChange) onChange(token); };
        const handleExpired = () => { if (onExpired) onExpired(); if (onChange) onChange(null); };

        if (!isRecaptchaEnabled) return null;

        return (
            <div style={{ marginTop: 16, marginBottom: 8 }}>
                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleChange}
                    onExpired={handleExpired}
                    onErrored={() => console.error("reCAPTCHA Error: Please check your site key and domain authorization.")}
                    size={size}
                    theme={theme}
                />
            </div>
        );
    }
);
ReCaptchaComponent.displayName = "ReCaptchaComponent";

/** ==========================================
 *  COMPONENT: SocialProofToast
 *  ========================================== */
const NAMES = ["James", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Ashley", "William", "Amanda", "Christopher", "Nicole", "Daniel", "Lauren", "Matthew", "Stephanie"];
const LOCATIONS = ["Austin, TX", "Miami, FL", "Denver, CO", "Seattle, WA", "Chicago, IL", "Phoenix, AZ", "Nashville, TN", "Atlanta, GA", "Dallas, TX", "Tampa, FL", "Charlotte, NC", "Las Vegas, NV", "Houston, TX", "San Diego, CA"];
const ACTIONS = [
    { text: "just closed a deal", icon: "fa-check-circle", color: "#10B981" },
    { text: "upgraded their membership", icon: "fa-arrow-up", color: "#3B82F6" },
    { text: "started their free trial", icon: "fa-play-circle", color: "#8B5CF6" },
];
const TIMES = ["just now", "1 min ago", "2 mins ago", "5 mins ago"];

export const SocialProofToast: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [proofData, setProofData] = useState({ name: "", location: "", action: ACTIONS[0], time: "just now" });
    const pathname = usePathname();
    const { isAuthenticated, user, subscription } = useAuth();

    const shouldShowSocialProof = () => {
        if (!isAuthenticated) return true;
        const userType = user?.userType?.toLowerCase() || "";
        const plan = subscription?.plan?.toLowerCase() || "";
        if (userType === "admin") return false;
        if (userType === "premium") return false;
        if (plan === "premium" || plan === "pro") return false;
        return true;
    };

    useEffect(() => {
        if (pathname !== "/") return;
        if (!shouldShowSocialProof()) return;

        const showRandomProof = () => {
            setProofData({
                name: NAMES[Math.floor(Math.random() * NAMES.length)],
                location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
                action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
                time: TIMES[Math.floor(Math.random() * TIMES.length)],
            });
            setIsVisible(true);
            setTimeout(() => setIsVisible(false), 5000);
        };

        const initialTimer = setTimeout(showRandomProof, 10000);
        const interval = setInterval(showRandomProof, 30000);
        return () => { clearTimeout(initialTimer); clearInterval(interval); };
    }, [pathname, isAuthenticated, user, subscription]);

    if (!isVisible) return null;

    return (
        <>
            <div style={{ position: "fixed", bottom: 20, left: 20, background: "#fff", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 9999, animation: "slideInUp 0.35s ease", maxWidth: 280, border: "1px solid #e2e8f0" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.4 }}>
                        <strong>{proofData.name}</strong> from {proofData.location} {proofData.action.text}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{proofData.time}</div>
                </div>
                <button onClick={() => setIsVisible(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 2, fontSize: 12, lineHeight: 1 }}>×</button>
            </div>
            <style jsx global>{`@keyframes slideInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </>
    );
};

/** ==========================================
 *  COMPONENT: FloatingFeedbackButton
 *  ========================================== */
export const FloatingFeedbackButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", type: "suggestion", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSubmitting(true);
        try {
            const res = await feedbackAPI.submit(formData);
            if (res.success) {
                setIsSubmitting(false); setSubmitted(true);
                setTimeout(() => { setSubmitted(false); setIsOpen(false); setFormData({ name: "", email: "", type: "suggestion", message: "" }); }, 2000);
            } else { setIsSubmitting(false); }
        } catch (error) { setIsSubmitting(false); }
    };

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(37, 99, 235, 0.4)", zIndex: 9990, transition: "transform 0.2s, box-shadow 0.2s" }} title="Give Feedback">
                <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-comment-dots"}`} style={{ fontSize: 22 }}></i>
            </button>
            {isOpen && (
                <>
                    <div onClick={() => setIsOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.3)", zIndex: 9991 }} />
                    <div style={{ position: "fixed", bottom: 90, right: 24, width: 340, background: "#0f172a", borderRadius: 16, boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)", zIndex: 9992, overflow: "hidden", animation: "slideUp 0.2s ease-out" }}>
                        <div style={{ background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", padding: "20px 24px", color: "#fff" }}>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#ffffff" }}><i className="fa-solid fa-comment-dots me-2" style={{ color: "#ffffff" }}></i>Send Feedback</h3>
                            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9, color: "#ffffff" }}>Help us improve your experience</p>
                        </div>
                        {submitted ? (
                            <div style={{ padding: 40, textAlign: "center" }}>
                                <div style={{ width: 56, height: 56, background: "#ECFDF5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                                    <i className="fa-solid fa-check" style={{ color: "#10B981", fontSize: 24 }}></i>
                                </div>
                                <h4 style={{ margin: "0 0 8px", color: "#111827" }}>Thank You!</h4>
                                <p style={{ margin: 0, color: "#6B7280", fontSize: 14 }}>Your feedback has been submitted.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#ffffff", marginBottom: 6 }}>Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" style={{ width: "100%", padding: "10px 12px", border: "1px solid #334155", borderRadius: 8, fontSize: 14, outline: "none", background: "#1e293b", color: "#ffffff" }} required />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#ffffff", marginBottom: 6 }}>Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@example.com" style={{ width: "100%", padding: "10px 12px", border: "1px solid #334155", borderRadius: 8, fontSize: 14, outline: "none", background: "#1e293b", color: "#ffffff" }} required />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#ffffff", marginBottom: 6 }}>Feedback Type</label>
                                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #334155", borderRadius: 8, fontSize: 14, outline: "none", background: "#1e293b", color: "#ffffff" }}>
                                        <option value="suggestion">Suggestion</option>
                                        <option value="bug">Bug Report</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#ffffff", marginBottom: 6 }}>Message</label>
                                    <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us what you think..." rows={4} style={{ width: "100%", padding: "10px 12px", border: "1px solid #334155", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical", background: "#1e293b", color: "#ffffff" }} required />
                                </div>
                                <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "12px 16px", background: isSubmitting ? "#9CA3AF" : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                    {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i>Sending...</> : <><i className="fa-solid fa-paper-plane"></i>Submit Feedback</>}
                                </button>
                            </form>
                        )}
                    </div>
                    <style jsx global>{`@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                </>
            )}
        </>
    );
};

/** ==========================================
 *  COMPONENT: FeatureGatePopup
 *  ========================================== */
export interface FeatureGatePopupProps {
    isOpen: boolean; onClose: () => void; title?: string; message?: string; imageUrl?: string; featureName?: string; onStartTrial?: () => void; onUpgrade?: () => void; showTrialButton?: boolean;
}

export const FeatureGatePopup: React.FC<FeatureGatePopupProps> = ({
    isOpen, onClose, title = "Unlock Premium Features", message = "Upgrade to Pro to access this feature and unlock the full potential of 99Sellers.", imageUrl, featureName, onStartTrial, onUpgrade, showTrialButton = true,
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = () => { if (onUpgrade) { onUpgrade(); } else { router.push("/dashboard/subscription"); } onClose(); };
    const handleTrial = async () => { setIsLoading(true); if (onStartTrial) { await onStartTrial(); } else { router.push("/dashboard/subscription?trial=true"); } setIsLoading(false); onClose(); };

    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)", zIndex: 9998, animation: "fadeIn 0.2s ease-out" }} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 9999, width: "100%", maxWidth: imageUrl ? 520 : 420, animation: "slideIn 0.3s ease-out" }}>
                <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
                    <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(0, 0, 0, 0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, transition: "background 0.2s" }}>
                        <i className="fa-solid fa-xmark" style={{ color: "#64748B", fontSize: 14 }}></i>
                    </button>
                    {imageUrl && (
                        <div style={{ width: "100%", height: 180, background: `linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(29, 78, 216, 0.9) 100%), url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: 80, height: 80, background: "rgba(255, 255, 255, 0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
                                <i className="fa-solid fa-crown" style={{ color: "#fff", fontSize: 36 }}></i>
                            </div>
                        </div>
                    )}
                    <div style={{ padding: imageUrl ? "24px 32px 32px" : "40px 32px 32px" }}>
                        {!imageUrl && (
                            <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 10px 30px rgba(37, 99, 235, 0.35)" }}>
                                <i className="fa-solid fa-download" style={{ color: "#fff", fontSize: 32 }}></i>
                            </div>
                        )}
                        {featureName && (
                            <div style={{ display: "inline-block", padding: "4px 12px", background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#2563EB", marginBottom: 12 }}>
                                <i className="fa-solid fa-lock me-1" style={{ fontSize: 10 }}></i>{featureName}
                            </div>
                        )}
                        <h2 style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 700, color: "#1E1B4B", textAlign: "center" }}>{title}</h2>
                        <p style={{ margin: "0 0 24px", fontSize: 15, color: "#64748B", lineHeight: 1.6, textAlign: "center" }}>{message}</p>
                        <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16, marginBottom: 24 }}>
                            {["Full property addresses & contact info", "Unlimited data exports (CSV, Excel, JSON)", "Detailed financial & loan information", "Priority customer support"].map((feature, index) => (
                                <div key={index} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: index < 3 ? 10 : 0 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <i className="fa-solid fa-check" style={{ color: "#10B981", fontSize: 10 }}></i>
                                    </div>
                                    <span style={{ fontSize: 13, color: "#475569" }}>{feature}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
                            <button onClick={handleUpgrade} style={{ width: "100%", padding: "14px 24px", background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)", transition: "transform 0.2s, box-shadow 0.2s" }}>
                                <i className="fa-solid fa-bolt"></i>Upgrade to Pro
                            </button>
                            {showTrialButton && (
                                <button onClick={handleTrial} disabled={isLoading} style={{ width: "100%", padding: "14px 24px", background: "#fff", color: "#2563EB", border: "2px solid #BFDBFE", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: isLoading ? 0.7 : 1, transition: "background 0.2s, border-color 0.2s" }}>
                                    {isLoading ? <><i className="fa-solid fa-spinner fa-spin"></i>Starting Trial...</> : <><i className="fa-solid fa-rocket"></i>Start 7-Day Free Trial</>}
                                </button>
                            )}
                        </div>
                        <p style={{ marginTop: 16, fontSize: 12, color: "#94A3B8", textAlign: "center" }}><i className="fa-solid fa-shield-check me-1"></i>No credit card required for trial</p>
                    </div>
                </div>
            </div >
            <style jsx global>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideIn { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }`}</style>
        </>
    );
};
