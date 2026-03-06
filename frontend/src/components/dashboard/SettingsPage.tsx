"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/modules/UserSearchLayout_Module";
import styles from "@/components/search/styles/dashboard.module.scss";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const SettingsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPasswordForm = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setPasswordSuccess("");
    setShowPasswordModal(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // Import authAPI dynamically or assume it's available via context/import
      const { authAPI } = await import("@/services/api");
      const result = await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (result.success) {
        setPasswordSuccess("Password changed successfully");
        setTimeout(() => {
          resetPasswordForm();
        }, 2000);
      } else {
        setPasswordError(result.error || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell title="Settings" subtitle="Manage your account settings">
      <div className={styles.pageContent}>
        {/* Helper for Modal - ideally should be a reusable component */}
        {showPasswordModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              backgroundColor: 'white', padding: '2rem', borderRadius: '12px',
              width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Change Password</h3>

              {passwordError && (
                <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div style={{ padding: '0.75rem', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {passwordSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={resetPasswordForm}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#2563EB', color: 'white', border: 'none', opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className={styles.settingsSection}>
          <div className={styles.settingsSectionHeader}>
            <h3 className={styles.settingsSectionTitle}>
              <i className="fa-solid fa-user me-2" style={{ color: "#2563EB" }}></i>
              Profile Information
            </h3>
            <p className={styles.settingsSectionDesc}>
              View and update your profile details
            </p>
          </div>
          <div className={styles.settingsSectionBody}>
            <div className={styles.settingsItem}>
              <div className={styles.settingsItemInfo}>
                <span className={styles.settingsItemLabel}>Name</span>
                <span className={styles.settingsItemDesc}>{user?.name || "Not set"}</span>
              </div>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => router.push("/dashboard/profile")}
              >
                <i className="fa-solid fa-pen me-2"></i>
                Edit Profile
              </button>
            </div>
            <div className={styles.settingsItem}>
              <div className={styles.settingsItemInfo}>
                <span className={styles.settingsItemLabel}>Email</span>
                <span className={styles.settingsItemDesc}>{user?.email || "Not set"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className={styles.settingsSection}>
          <div className={styles.settingsSectionHeader}>
            <h3 className={styles.settingsSectionTitle}>
              <i className="fa-solid fa-lock me-2" style={{ color: "#8B5CF6" }}></i>
              Password
            </h3>
            <p className={styles.settingsSectionDesc}>
              Keep your account secure
            </p>
          </div>
          <div className={styles.settingsSectionBody}>
            <div className={styles.settingsItem}>
              <div className={styles.settingsItemInfo}>
                <span className={styles.settingsItemLabel}>Change Password</span>
                <span className={styles.settingsItemDesc}>
                  Update your password to keep your account secure
                </span>
              </div>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setShowPasswordModal(true)}
              >
                <i className="fa-solid fa-key me-2"></i>
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className={styles.settingsSection}>
          <div className={styles.settingsSectionHeader}>
            <h3 className={styles.settingsSectionTitle}>
              <i className="fa-solid fa-bell me-2" style={{ color: "#10B981" }}></i>
              Notifications
            </h3>
            <p className={styles.settingsSectionDesc}>
              Manage your email notifications
            </p>
          </div>
          <div className={styles.settingsSectionBody}>
            <div className={styles.settingsItem}>
              <div className={styles.settingsItemInfo}>
                <span className={styles.settingsItemLabel}>Email Notifications</span>
                <span className={styles.settingsItemDesc}>
                  Receive email updates about new leads and activity
                </span>
              </div>
              <div
                className={`${styles.toggle} ${emailNotifications ? styles.active : ""}`}
                onClick={() => setEmailNotifications(!emailNotifications)}
              >
                <div className={styles.toggleKnob}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default SettingsPage;
