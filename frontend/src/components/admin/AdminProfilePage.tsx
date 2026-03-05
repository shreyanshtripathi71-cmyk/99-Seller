"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/services/api";
import { ChangePasswordModal } from "@/modules/UserSupport_Module";

const AdminProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state initialized with user data
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || "",
        address: user?.address || ""
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const result = await authAPI.updateProfile(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setUpdating(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Admin Profile</h1>
                <p style={{ color: '#64748b' }}>Manage your account information and security</p>
            </div>

            {message && (
                <div style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    marginBottom: 24,
                    background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    {message.text}
                </div>
            )}

            <div style={{
                background: '#fff',
                borderRadius: 12,
                padding: 32,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: 24
            }}>
                <form onSubmit={handleUpdateProfile}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 14
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    backgroundColor: '#f8fafc',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Contact Number</label>
                            <input
                                type="text"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 14
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    fontSize: 14
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button
                            type="button"
                            onClick={() => setIsChangePasswordOpen(true)}
                            style={{
                                padding: '10px 20px',
                                background: '#f1f5f9',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            Change Password
                        </button>
                        <button
                            type="submit"
                            disabled={updating}
                            style={{
                                padding: '10px 24px',
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontWeight: 600,
                                cursor: 'pointer',
                                opacity: updating ? 0.7 : 1
                            }}
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {isChangePasswordOpen && (
                <ChangePasswordModal
                    onClose={() => setIsChangePasswordOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminProfilePage;
