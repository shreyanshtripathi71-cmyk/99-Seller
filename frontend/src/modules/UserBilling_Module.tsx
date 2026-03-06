"use client";

import React, { useState, useEffect } from "react";
import styles from "@/components/search/styles/dashboard.module.scss";
import { billingAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

/** ==========================================
 *  COMPONENT: AddPaymentMethodModal
 *  ========================================== */
export interface AddPaymentMethodModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ onClose, onSuccess }) => {
    const [type, setType] = useState<"card" | "paypal">("card");
    const [formData, setFormData] = useState({ cardNumber: "", expiry: "", cvc: "", brand: "Visa", email: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError("");
        try {
            let payload: any = { type };
            if (type === "card") {
                if (formData.cardNumber.length < 12) throw new Error("Invalid card number");
                const [month, year] = formData.expiry.split("/");
                if (!month || !year) throw new Error("Invalid expiry date (MM/YY)");
                payload = { ...payload, last4: formData.cardNumber.slice(-4), brand: formData.brand, expiryMonth: parseInt(month), expiryYear: parseInt("20" + year) };
            } else {
                if (!formData.email) throw new Error("PayPal email is required");
                payload = { ...payload, email: formData.email };
            }
            const res = await billingAPI.addPaymentMethod(payload);
            if (res.success) { onSuccess(); onClose(); } else { setError(res.error || "Failed to add payment method"); }
        } catch (err: any) { setError(err.message || "An error occurred"); } finally { setLoading(false); }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Add Payment Method</h3>
                    <button onClick={onClose} className={styles.closeBtn}><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className={styles.modalBody}>
                    {error && <div className={styles.errorMessage} style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                    <div className={styles.tabNav} style={{ marginBottom: '20px' }}>
                        <button type="button" className={`${styles.tabBtn} ${type === 'card' ? styles.active : ''}`} onClick={() => setType("card")}><i className="fa-solid fa-credit-card"></i> Card</button>
                        <button type="button" className={`${styles.tabBtn} ${type === 'paypal' ? styles.active : ''}`} onClick={() => setType("paypal")}><i className="fa-brands fa-paypal"></i> PayPal</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        {type === "card" ? (
                            <>
                                <div className={styles.formGroup}><label>Card Number</label><input type="text" placeholder="0000 0000 0000 0000" value={formData.cardNumber} onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })} className={styles.input} required /></div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className={styles.formGroup} style={{ flex: 1 }}><label>Expiry (MM/YY)</label><input type="text" placeholder="MM/YY" value={formData.expiry} onChange={(e) => setFormData({ ...formData, expiry: e.target.value })} className={styles.input} required /></div>
                                    <div className={styles.formGroup} style={{ flex: 1 }}><label>CVC</label><input type="text" placeholder="123" value={formData.cvc} onChange={(e) => setFormData({ ...formData, cvc: e.target.value })} className={styles.input} required /></div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.formGroup}><label>PayPal Email</label><input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={styles.input} required /></div>
                        )}
                        <div className={styles.modalActions} style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>{loading ? "Adding..." : "Add Method"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

/** ==========================================
 *  COMPONENT: UpdateBillingAddressModal
 *  ========================================== */
export interface UpdateBillingAddressModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const UpdateBillingAddressModal: React.FC<UpdateBillingAddressModalProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ address: "", city: "", state: "", pin: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) { setFormData({ address: user.address || "", city: user.city || "", state: user.state || "", pin: user.pin || "" }); }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError("");
        try {
            const res = await billingAPI.updateBillingAddress(formData);
            if (res.success) { onSuccess(); onClose(); } else { setError(res.error || "Failed to update address"); }
        } catch (err: any) { setError(err.message || "An error occurred"); } finally { setLoading(false); }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Update Billing Address</h3>
                    <button onClick={onClose} className={styles.closeBtn}><i className="fa-solid fa-xmark"></i></button>
                </div>
                <div className={styles.modalBody}>
                    {error && <div className={styles.errorMessage} style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}><label>Address</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={styles.input} placeholder="123 Main St" required /></div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}><label>City</label><input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={styles.input} required /></div>
                            <div className={styles.formGroup} style={{ flex: 1 }}><label>State</label><input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className={styles.input} required /></div>
                        </div>
                        <div className={styles.formGroup}><label>ZIP / Postal Code</label><input type="text" value={formData.pin} onChange={(e) => setFormData({ ...formData, pin: e.target.value })} className={styles.input} style={{ width: '50%' }} required /></div>
                        <div className={styles.modalActions} style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>{loading ? "Saving..." : "Save Address"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

/** ==========================================
 *  COMPONENT: StripePaymentForm
 *  ========================================== */
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || 'pk_test_placeholder');

const CheckoutForm = ({ amount, clientSecret, onSuccess, onCancel }: { amount: number, clientSecret: string, onSuccess: () => void, onCancel: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        setIsProcessing(true);
        const { error, paymentIntent } = await stripe.confirmPayment({ elements, confirmParams: { return_url: window.location.href }, redirect: 'if_required' });
        if (error) { setErrorMessage(error.message || 'An unexpected error occurred.'); setIsProcessing(false); }
        else if (paymentIntent && paymentIntent.status === 'succeeded') { onSuccess(); }
        else { setErrorMessage('Payment status: ' + (paymentIntent?.status || 'unknown')); setIsProcessing(false); }
    };

    return (
        <form onSubmit={handleSubmit} style={{ minWidth: '400px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>Complete Payment</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>Total Amount: <strong>${(amount / 100).toFixed(2)}</strong></p>
            </div>
            <PaymentElement />
            {errorMessage && <div style={{ color: '#ef4444', marginTop: '10px', fontSize: '14px' }}>{errorMessage}</div>}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={onCancel} disabled={isProcessing} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={!stripe || isProcessing} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: isProcessing ? '#93c5fd' : '#2563eb', color: '#fff', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>{isProcessing ? 'Processing...' : 'Pay Now'}</button>
            </div>
        </form>
    );
};

export interface StripePaymentFormProps {
    clientSecret: string;
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ clientSecret, amount, onSuccess, onCancel }) => {
    const options = { clientSecret, appearance: { theme: 'stripe' as const } };

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            {clientSecret && !clientSecret.startsWith('mock_secret') ? (
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm amount={amount} clientSecret={clientSecret} onSuccess={onSuccess} onCancel={onCancel} />
                </Elements>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                        <i className="fa-solid fa-flask" style={{ color: '#ea580c', fontSize: '24px', marginBottom: '10px', display: 'block' }}></i>
                        <h4 style={{ color: '#9a3412', marginBottom: '4px' }}>Test Environment</h4>
                        <p style={{ color: '#c2410c', fontSize: '13px' }}>Stripe is currently in <strong>Mock Mode</strong>. No real payment will be processed.</p>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Amount to Simulate:</p>
                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>${(amount / 100).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: '600', color: '#64748b' }}>Cancel</button>
                        <button onClick={onSuccess} style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: '700', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>Simulate Payment Success</button>
                    </div>
                </div>
            )}
        </div>
    );
};
