'use client';

import React, { useState } from 'react';

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [settings, setSettings] = useState({
    siteName: '99Sellers',
    siteEmail: 'admin@99sellers.com',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maxUploadSize: '10',
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: '60',
    maxLoginAttempts: '5',
    twoFactorAuth: false,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: 'fa-solid fa-gear' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-solid fa-bell' },
    { id: 'security', label: 'Security', icon: 'fa-solid fa-shield-halved' },
    { id: 'backup', label: 'Backup', icon: 'fa-solid fa-database' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    transition: 'all 0.2s',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 8,
  };

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: active ? '#3b82f6' : '#d1d5db',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  });

  const toggleDotStyle = (active: boolean): React.CSSProperties => ({
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: '#fff',
    position: 'absolute',
    top: 2,
    left: active ? 26 : 2,
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  });

  return (
    <div style={{ padding: isMobile ? 16 : 32, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Settings
        </h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Manage your application settings and preferences
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24 }}>
        {/* Sidebar Tabs */}
        <div style={{
          width: isMobile ? '100%' : 240,
          backgroundColor: '#fff',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          padding: 16,
          height: 'fit-content',
        }}>
          {isMobile ? (
            <div style={{ display: 'flex', overflowX: 'auto', gap: 8, paddingBottom: 4 }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    border: 'none',
                    borderRadius: 10,
                    backgroundColor: activeTab === tab.id ? '#eff6ff' : 'transparent',
                    color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  border: 'none',
                  borderRadius: 10,
                  backgroundColor: activeTab === tab.id ? '#eff6ff' : 'transparent',
                  color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  marginBottom: 4,
                  transition: 'all 0.2s',
                }}
              >
                <i className={tab.icon} style={{ width: 18 }}></i>
                {tab.label}
              </button>
            ))
          )}
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1 }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            padding: isMobile ? 20 : 32,
          }}>
            {/* General Settings */}
            {activeTab === 'general' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 24 }}>
                  General Settings
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={labelStyle}>Site Name</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Admin Email</label>
                    <input
                      type="email"
                      value={settings.siteEmail}
                      onChange={e => setSettings({ ...settings, siteEmail: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Date Format</label>
                    <select
                      value={settings.dateFormat}
                      onChange={e => setSettings({ ...settings, dateFormat: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>Maintenance Mode</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Temporarily disable public access to the site</div>
                    </div>
                    <div
                      style={toggleStyle(settings.maintenanceMode)}
                      onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    >
                      <div style={toggleDotStyle(settings.maintenanceMode)}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>Allow New Registrations</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Allow new users to create accounts</div>
                    </div>
                    <div
                      style={toggleStyle(settings.allowRegistration)}
                      onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                    >
                      <div style={toggleDotStyle(settings.allowRegistration)}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 24 }}>
                  Notification Settings
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>Email Notifications</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Receive notifications via email</div>
                    </div>
                    <div
                      style={toggleStyle(settings.emailNotifications)}
                      onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                    >
                      <div style={toggleDotStyle(settings.emailNotifications)}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>SMS Notifications</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Receive notifications via SMS</div>
                    </div>
                    <div
                      style={toggleStyle(settings.smsNotifications)}
                      onClick={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
                    >
                      <div style={toggleDotStyle(settings.smsNotifications)}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 24 }}>
                  Security Settings
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={labelStyle}>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={e => setSettings({ ...settings, sessionTimeout: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={e => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>Require Email Verification</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Users must verify their email before accessing the account</div>
                    </div>
                    <div
                      style={toggleStyle(settings.requireEmailVerification)}
                      onClick={() => setSettings({ ...settings, requireEmailVerification: !settings.requireEmailVerification })}
                    >
                      <div style={toggleDotStyle(settings.requireEmailVerification)}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>Two-Factor Authentication</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Require 2FA for all admin users</div>
                    </div>
                    <div
                      style={toggleStyle(settings.twoFactorAuth)}
                      onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                    >
                      <div style={toggleDotStyle(settings.twoFactorAuth)}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 24 }}>
                  Backup Settings
                </h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, marginBottom: 24 }}>
                  <div>
                    <div style={{ fontWeight: 500, color: '#0f172a' }}>Automatic Backup</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Automatically backup your database</div>
                  </div>
                  <div
                    style={toggleStyle(settings.autoBackup)}
                    onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                  >
                    <div style={toggleDotStyle(settings.autoBackup)}></div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={labelStyle}>Backup Frequency</label>
                    <select
                      value={settings.backupFrequency}
                      onChange={e => setSettings({ ...settings, backupFrequency: e.target.value })}
                      style={inputStyle}
                      disabled={!settings.autoBackup}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Max Upload Size (MB)</label>
                    <input
                      type="number"
                      value={settings.maxUploadSize}
                      onChange={e => setSettings({ ...settings, maxUploadSize: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 24, padding: 20, backgroundColor: '#fef3c7', borderRadius: 12, border: '1px solid #f59e0b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b', fontSize: 20 }}></i>
                    <div>
                      <div style={{ fontWeight: 600, color: '#92400e' }}>Last Backup</div>
                      <div style={{ fontSize: 13, color: '#a16207' }}>Database was last backed up on January 15, 2024 at 3:00 AM</div>
                    </div>
                  </div>
                </div>

                <button
                  style={{
                    marginTop: 24,
                    padding: '12px 24px',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <i className="fa-solid fa-download"></i>
                  Create Manual Backup
                </button>
              </div>
            )}

            {/* Save Button */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
