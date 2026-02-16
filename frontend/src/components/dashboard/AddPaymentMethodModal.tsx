"use client";

import React, { useState } from "react";
import styles from "@/components/search/styles/dashboard.module.scss";
import { billingAPI } from "@/services/api";

interface AddPaymentMethodModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ onClose, onSuccess }) => {
    const [type, setType] = useState<"card" | "paypal">("card");
    const [formData, setFormData] = useState({
        cardNumber: "",
        expiry: "",
        cvc: "",
        brand: "Visa", // Default
        email: "" // For PayPal
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Basic validation and formatting
            let payload: any = { type };

            if (type === "card") {
                if (formData.cardNumber.length < 12) throw new Error("Invalid card number");
                const [month, year] = formData.expiry.split("/");
                if (!month || !year) throw new Error("Invalid expiry date (MM/YY)");

                payload = {
                    ...payload,
                    last4: formData.cardNumber.slice(-4),
                    brand: formData.brand,
                    expiryMonth: parseInt(month),
                    expiryYear: parseInt("20" + year)
                };
            } else {
                if (!formData.email) throw new Error("PayPal email is required");
                payload = { ...payload, email: formData.email };
            }

            const res = await billingAPI.addPaymentMethod(payload);
            if (res.success) {
                onSuccess();
                onClose();
            } else {
                setError(res.error || "Failed to add payment method");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>Add Payment Method</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div className={styles.modalBody}>
                    {error && <div className={styles.errorMessage} style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                    <div className={styles.tabNav} style={{ marginBottom: '20px' }}>
                        <button
                            type="button"
                            className={`${styles.tabBtn} ${type === 'card' ? styles.active : ''}`}
                            onClick={() => setType("card")}
                        >
                            <i className="fa-solid fa-credit-card"></i> Card
                        </button>
                        <button
                            type="button"
                            className={`${styles.tabBtn} ${type === 'paypal' ? styles.active : ''}`}
                            onClick={() => setType("paypal")}
                        >
                            <i className="fa-brands fa-paypal"></i> PayPal
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {type === "card" ? (
                            <>
                                <div className={styles.formGroup}>
                                    <label>Card Number</label>
                                    <input
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        value={formData.cardNumber}
                                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label>Expiry (MM/YY)</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={formData.expiry}
                                            onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label>CVC</label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            value={formData.cvc}
                                            onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.formGroup}>
                                <label>PayPal Email</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        )}

                        <div className={styles.modalActions} style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>
                                Cancel
                            </button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>
                                {loading ? "Adding..." : "Add Method"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddPaymentMethodModal;
