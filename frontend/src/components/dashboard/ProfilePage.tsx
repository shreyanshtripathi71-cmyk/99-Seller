"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/modules/UserSearchLayout_Module";
import styles from "@/components/search/styles/dashboard.module.scss";
import { useAuth } from "@/context/AuthContext";
import { ChangePasswordModal } from "@/modules/UserSupport_Module";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.name?.split(" ")[0] || "",
    lastName: user?.lastName || user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    pin: user?.pin || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pin: formData.pin,
    });
    setIsEditing(false);
  };

  const getUserInitials = () => {
    if (formData.firstName && formData.lastName) {
      return formData.firstName[0].toUpperCase() + formData.lastName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <DashboardShell title="Profile" subtitle="Manage your account information">
      <div className={styles.pageContent}>
        {/* Profile Header */}
        <div style={{
          background: "linear-gradient(135deg, #2563EB, #7C3AED)",
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
          }}>
            {getUserInitials()}
          </div>
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: 24, fontWeight: 600 }}>
              {formData.firstName} {formData.lastName}
            </h2>
            <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                {user?.email}
              </p>
              <span style={{
                padding: "2px 8px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: 4,
                color: "#fff",
                fontSize: 11,
                textTransform: "uppercase",
                fontWeight: 600
              }}>
                {user?.userType || "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className={styles.settingsSection}>
          <div className={styles.settingsSectionHeader}>
            <h3 className={styles.settingsSectionTitle}>
              <i className="fa-solid fa-user me-2" style={{ color: "#2563EB" }}></i>
              Personal Information
            </h3>
            <button
              className={`${styles.btn} ${isEditing ? styles.btnPrimary : styles.btnSecondary}`}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              <i className={`fa-solid ${isEditing ? "fa-check" : "fa-pen"} me-2`}></i>
              {isEditing ? "Save Changes" : "Edit"}
            </button>
          </div>
          <div className={styles.settingsSectionBody}>
            <div className={styles.formGrid}>
              <div>
                <label className={styles.formLabel}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className={styles.formInput}
                  style={{ color: "#9CA3AF" }}
                />
                <span style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4, display: "block" }}>
                  Official account email (Read-only)
                </span>
              </div>
              <div>
                <label className={styles.formLabel}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                  className={styles.formInput}
                />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label className={styles.formLabel}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Street address"
                  className={styles.formInput}
                />
              </div>
              <div>
                <label className={styles.formLabel}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="City"
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGrid}>
                <div>
                  <label className={styles.formLabel}>
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="State"
                    className={styles.formInput}
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>
                    Zip Code (Pin)
                  </label>
                  <input
                    type="text"
                    name="pin"
                    value={formData.pin}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Zip code"
                    className={styles.formInput}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className={styles.settingsSection}>
          <div className={styles.settingsSectionHeader}>
            <h3 className={styles.settingsSectionTitle}>
              <i className="fa-solid fa-shield-halved me-2" style={{ color: "#10B981" }}></i>
              Security
            </h3>
          </div>
          <div className={styles.settingsSectionBody}>
            <div className={styles.settingsItem}>
              <div className={styles.settingsItemInfo}>
                <span className={styles.settingsItemLabel}>Password</span>
                <span className={styles.settingsItemDesc}>
                  Update your account password
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

        {/* Change Password Modal */}
        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}

        {/* Account Info */}
        <div className={styles.settingsSection}>
          <div className={styles.settingsSectionHeader}>
            <h3 className={styles.settingsSectionTitle}>
              <i className="fa-solid fa-circle-info me-2" style={{ color: "#8B5CF6" }}></i>
              Administrative Information
            </h3>
          </div>
          <div className={styles.settingsSectionBody}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ padding: 16, background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
                <span style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>
                  Account Created
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1F2937" }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div style={{ padding: 16, background: "#F9FAFB", borderRadius: 8, border: "1px solid #E5E7EB" }}>
                <span style={{ fontSize: 12, color: "#6B7280", display: "block", marginBottom: 4 }}>
                  Account Type
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1F2937" }}>
                  {user?.userType || "Standard User"}
                </span>
              </div>
            </div>
            <p style={{ marginTop: 12, fontSize: 12, color: "#9CA3AF" }}>
              Note: Administrative information is managed by the system and cannot be edited.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};


export default ProfilePage;
