"use client";

import React, { useState, useEffect } from "react";
import styles from "@/components/search/styles/dashboard.module.scss";
import { billingAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

interface UpdateBillingAddressModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateBillingAddressModal: React.FC<UpdateBillingAddressModalProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        state: "",
        pin: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            setFormData({
                address: user.address || "",
                city: user.city || "",
                state: user.state || "",
                pin: user.pin || ""
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await billingAPI.updateBillingAddress(formData);
            if (res.success) {
                onSuccess();
                onClose();
            } else {
                setError(res.error || "Failed to update address");
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
                    <h3>Update Billing Address</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div className={styles.modalBody}>
                    {error && <div className={styles.errorMessage} style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className={styles.input}
                                placeholder="123 Main St"
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label>City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label>State</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>ZIP / Postal Code</label>
                            <input
                                type="text"
                                value={formData.pin}
                                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                                className={styles.input}
                                style={{ width: '50%' }}
                                required
                            />
                        </div>

                        <div className={styles.modalActions} style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={onClose} className={`${styles.btn} ${styles.btnSecondary}`}>
                                Cancel
                            </button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>
                                {loading ? "Saving..." : "Save Address"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateBillingAddressModal;
