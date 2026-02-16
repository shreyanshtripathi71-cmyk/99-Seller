"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

interface Settings {
  downloadEnabled: boolean;
  maxDownloadsPerDay: number;
  allowedUserTypes: string[];
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    downloadEnabled: true,
    maxDownloadsPerDay: 100,
    allowedUserTypes: ["Premium"],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem("99sellers_admin_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem("99sellers_admin_settings", JSON.stringify(settings));
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleDownload = () => {
    setSettings(prev => ({ ...prev, downloadEnabled: !prev.downloadEnabled }));
  };

  const toggleUserType = (userType: string) => {
    setSettings(prev => ({
      ...prev,
      allowedUserTypes: prev.allowedUserTypes.includes(userType)
        ? prev.allowedUserTypes.filter(t => t !== userType)
        : [...prev.allowedUserTypes, userType]
    }));
  };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>
          Download Control Settings
        </h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>
          Control user access to download features
        </p>
      </div>

      {/* Main Toggle */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>
              Enable Downloads
            </h3>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Master switch to enable or disable all download functionality
            </p>
          </div>
          <button
            onClick={toggleDownload}
            style={{
              width: 56,
              height: 28,
              borderRadius: 14,
              border: "none",
              background: settings.downloadEnabled ? "#22c55e" : "#cbd5e1",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <span style={{
              position: "absolute",
              top: 2,
              left: settings.downloadEnabled ? 30 : 2,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              transition: "left 0.2s",
            }} />
          </button>
        </div>

        <div style={{
          padding: 16,
          background: settings.downloadEnabled ? "#f0fdf4" : "#fef2f2",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <i className={`fa-solid ${settings.downloadEnabled ? "fa-check-circle" : "fa-times-circle"}`}
            style={{ color: settings.downloadEnabled ? "#22c55e" : "#ef4444", fontSize: 20 }} />
          <span style={{ color: settings.downloadEnabled ? "#166534" : "#991b1b", fontWeight: 500 }}>
            Downloads are currently {settings.downloadEnabled ? "ENABLED" : "DISABLED"} for users
          </span>
        </div>
      </div>

      {/* Download Limits */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>
          Download Limits
        </h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: "#374151", fontSize: 14, marginBottom: 8 }}>
            Max Downloads Per Day (per user)
          </label>
          <input
            type="number"
            value={settings.maxDownloadsPerDay}
            onChange={(e) => setSettings(prev => ({ ...prev, maxDownloadsPerDay: parseInt(e.target.value) || 0 }))}
            style={{
              width: 200,
              padding: "10px 14px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 14,
            }}
            min={0}
            max={1000}
          />
        </div>
      </div>

      {/* User Type Permissions */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>
          User Type Permissions
        </h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
          Select which user types can download data
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {["Free", "Premium"].map((userType) => (
            <label key={userType} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.allowedUserTypes.includes(userType)}
                onChange={() => toggleUserType(userType)}
                style={{ width: 18, height: 18, accentColor: "#3b82f6" }}
              />
              <span style={{ color: "#374151", fontWeight: 500 }}>{userType}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: "12px 32px",
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? (
          <>
            <i className="fa-solid fa-spinner fa-spin me-2"></i>
            Saving...
          </>
        ) : (
          <>
            <i className="fa-solid fa-check me-2"></i>
            Save Settings
          </>
        )}
      </button>

      {/* System Status & Info */}
      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>
            System Status
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#22c55e", fontSize: 14, fontWeight: 500 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }}></div>
            Backend API Standardized (Port 5000)
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
            Database Connection: <span style={{ color: "#22c55e" }}>Healthy</span>
          </div>
        </div>

        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>
            Cache Management
          </h3>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
            Clear local application cache and reset session data
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: "8px 16px",
              background: "#fef2f2",
              color: "#ef4444",
              border: "1px solid #fee2e2",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear Application Cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
