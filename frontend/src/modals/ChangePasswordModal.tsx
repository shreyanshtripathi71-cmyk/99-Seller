"use client"
import React, { useState } from "react";
import { authAPI } from "@/services/api";

interface ChangePasswordModalProps {
    onClose: () => void;
}

const ChangePasswordModal = ({ onClose }: ChangePasswordModalProps) => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            const result = await authAPI.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (result.success) {
                setSuccess("Password changed successfully!");
                setTimeout(() => onClose(), 2000);
            } else {
                setError(result.error || "Failed to change password");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
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
                        <p className="text-muted small mb-4">
                            Enter your current password and a new secure password.
                        </p>

                        {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
                        {success && <div className="alert alert-success py-2 small" role="alert">{success}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="small fw-bold text-dark mb-1">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    className="form-control"
                                    style={{ height: '45px', borderRadius: '8px' }}
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="small fw-bold text-dark mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    className="form-control"
                                    style={{ height: '45px', borderRadius: '8px' }}
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="small fw-bold text-dark mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-control"
                                    style={{ height: '45px', borderRadius: '8px' }}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-light flex-fill rounded-pill fw-bold" onClick={onClose} disabled={isLoading}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-fill rounded-pill fw-bold" style={{ backgroundColor: '#10B981', borderColor: '#10B981' }} disabled={isLoading}>
                                    {isLoading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : null}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
