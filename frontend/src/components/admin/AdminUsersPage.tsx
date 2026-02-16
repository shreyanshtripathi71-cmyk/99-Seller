"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { adminAPI } from "@/services/api";

interface User {
  id: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Contact?: string;
  UserType: string;
  createdAt?: string;
  subscription?: {
    planType: string;
    status: string;
  };
}

const AdminUsersPage = () => {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Contact: "",
    UserType: "free",
    Password: "",
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchParams?.get("action") === "add") {
      setShowModal(true);
    }
  }, [searchParams]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.users.getAll();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await adminAPI.users.create(formData);
      if (response.success) {
        await fetchUsers();
        setShowModal(false);
        resetForm();
      } else {
        setError(response.error || "Failed to create user");
      }
    } catch (err) {
      setError("Failed to create user");
      console.error(err);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const updateData: any = { ...formData };
      if (!updateData.Password) {
        delete updateData.Password;
      }
      // Using Username (Email) as ID for backend
      const response = await adminAPI.users.update((editingUser as any).Username || editingUser.Email, updateData);
      if (response.success) {
        await fetchUsers();
        setShowModal(false);
        setEditingUser(null);
        resetForm();
      } else {
        setError(response.error || "Failed to update user");
      }
    } catch (err) {
      setError("Failed to update user");
      console.error(err);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await adminAPI.users.delete((user as any).Username || user.Email);
      if (response.success) {
        await fetchUsers();
      } else {
        setError(response.error || "Failed to delete user");
      }
    } catch (err) {
      setError("Failed to delete user");
      console.error(err);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const currentline = lines[i].split(',');
      const obj: any = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j]?.trim();
      }
      result.push(obj);
    }
    return result;
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const parsedUsers = parseCSV(text);

      if (parsedUsers.length === 0) {
        setError("CSV file is empty or invalid");
        return;
      }

      setLoading(true);
      try {
        const response: any = await adminAPI.users.uploadCSV(parsedUsers);
        if (response.success) {
          await fetchUsers();
          alert(response.message || response.data?.message || `Successfully uploaded ${parsedUsers.length} users`);
        } else {
          setError(response.error || "Failed to upload CSV");
        }
      } catch (err) {
        setError("Error during CSV upload");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      FirstName: user.FirstName || "",
      LastName: user.LastName || "",
      Email: user.Email || "",
      Contact: user.Contact || "",
      UserType: user.UserType || "free",
      Password: "",
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      FirstName: "",
      LastName: "",
      Email: "",
      Contact: "",
      UserType: "free",
      Password: "",
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.FirstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.LastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.Email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || user.UserType.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 6,
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 16 : 0
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "var(--notion-text-primary)", margin: 0, marginBottom: 6, letterSpacing: "-0.02em" }}>
              Users Management
            </h1>
            <p style={{ color: "var(--notion-text-secondary)", margin: 0, fontSize: 14 }}>
              Manage all registered users ({users.length} total)
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, width: isMobile ? "100%" : "auto" }}>
            <input
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              id="csv-upload"
              onChange={handleCSVUpload}
            />
            <label
              htmlFor="csv-upload"
              style={{
                flex: isMobile ? 1 : "initial",
                padding: "8px 16px",
                background: "transparent",
                color: "var(--notion-text-primary)",
                border: "1px solid var(--notion-border)",
                borderRadius: "var(--notion-radius)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <i className="fa-solid fa-file-import" style={{ fontSize: 12 }}></i>
              Bulk Upload
            </label>
            <button
              onClick={openCreateModal}
              style={{
                flex: isMobile ? 1 : "initial",
                padding: "8px 16px",
                background: "var(--notion-blue)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--notion-radius)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <i className="fa-solid fa-plus" style={{ fontSize: 12 }}></i>
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          padding: 16,
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: 8,
          color: "#991B1B",
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#991B1B" }}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: "var(--notion-bg)",
        borderRadius: "var(--notion-radius)",
        padding: 16,
        marginBottom: 24,
        border: "1px solid var(--notion-border)",
        boxShadow: "var(--notion-shadow)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 200px 140px",
          gap: 16
        }}>
          <div style={{ position: "relative" }}>
            <i className="fa-solid fa-search" style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: 14,
            }}></i>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "12px 16px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="all">All Users</option>
            <option value="admin">Admin</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
          <button
            onClick={fetchUsers}
            style={{
              padding: "12px 16px",
              background: "#f1f5f9",
              color: "#475569",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <i className="fa-solid fa-arrows-rotate"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 48,
          color: "#64748b",
        }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
          Loading users...
        </div>
      ) : (
        /* Users Table */
        <div style={{
          background: "var(--notion-bg)",
          borderRadius: "var(--notion-radius)",
          border: "1px solid var(--notion-border)",
          boxShadow: "var(--notion-shadow)",
          overflow: "hidden",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={user.id} style={{ borderTop: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b" }}>{user.id}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: user.UserType === "Admin" ? "#ef4444" : "#3b82f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 600,
                          }}>
                            {(user.FirstName?.[0] || "U").toUpperCase()}
                          </div>
                          <span style={{ fontSize: 14, color: "#0f172a", fontWeight: 500 }}>
                            {user.FirstName} {user.LastName}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b" }}>{user.Email}</td>
                      <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b" }}>{user.Contact || "-"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "4px 10px",
                          background: user.UserType === "Admin" ? "#fef2f2" : "#f1f5f9",
                          color: user.UserType === "Admin" ? "#dc2626" : "#475569",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 500,
                        }}>
                          {user.UserType}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => openEditModal(user)}
                            style={{
                              width: 32,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#eff6ff",
                              color: "#3b82f6",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen" style={{ fontSize: 12 }}></i>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            style={{
                              width: 32,
                              height: 32,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#fef2f2",
                              color: "#ef4444",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash" style={{ fontSize: 12 }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: isMobile ? 20 : 32,
            width: isMobile ? "90%" : "100%",
            maxWidth: 500,
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                {editingUser ? "Edit User" : "Create New User"}
              </h3>
              <button
                onClick={() => { setShowModal(false); setEditingUser(null); resetForm(); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 20 }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  value={formData.FirstName}
                  onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                  style={inputStyle}
                  placeholder="John"
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  value={formData.LastName}
                  onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                  style={inputStyle}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                style={inputStyle}
                placeholder="john@example.com"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={formData.Contact}
                onChange={(e) => setFormData({ ...formData, Contact: e.target.value })}
                style={inputStyle}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>User Type</label>
                <select
                  value={formData.UserType}
                  onChange={(e) => setFormData({ ...formData, UserType: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{editingUser ? "New Password (optional)" : "Password"}</label>
                <input
                  type="password"
                  value={formData.Password}
                  onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                  style={inputStyle}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowModal(false); setEditingUser(null); resetForm(); }}
                style={{
                  padding: "10px 20px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
                style={{
                  padding: "10px 20px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {editingUser ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
