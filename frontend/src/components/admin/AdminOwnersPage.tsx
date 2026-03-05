"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mailing_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  property_count?: number;
  createdAt?: string;
}

const AdminOwnersPage = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>(null);

  const getToken = () => localStorage.getItem("99sellers_token");

  useEffect(() => {
    fetchOwners();
    fetchStats();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/owners`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOwners(data.owners || []);
      } else {
        setError("Failed to fetch owners");
      }
    } catch (err) {
      setError("Failed to fetch owners");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/owners/stats`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const filteredOwners = owners.filter((owner) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      owner.first_name?.toLowerCase().includes(searchLower) ||
      owner.last_name?.toLowerCase().includes(searchLower) ||
      owner.email?.toLowerCase().includes(searchLower) ||
      owner.mailing_address?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px" }}>
        <div style={{ color: "#64748b" }}>Loading owners...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#0f172a", margin: 0 }}>Owners Management</h2>
          <p style={{ color: "#64748b", margin: 0, marginTop: 4 }}>View and manage property owners</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: "right", background: "none", border: "none", cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Total Owners</p>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "8px 0 0" }}>{stats.total?.toLocaleString() || 0}</h3>
          </div>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>With Email</p>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: "#10b981", margin: "8px 0 0" }}>{stats.withEmail?.toLocaleString() || 0}</h3>
          </div>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>With Phone</p>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6", margin: "8px 0 0" }}>{stats.withPhone?.toLocaleString() || 0}</h3>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ background: "#fff", padding: 16, borderRadius: 12, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            placeholder="Search by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 16px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          <button
            onClick={fetchOwners}
            style={{
              padding: "10px 20px",
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              color: "#64748b",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <i className="fa-solid fa-arrows-rotate" style={{ marginRight: 8 }}></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>ID</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Name</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Email</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Phone</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Address</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Properties</th>
            </tr>
          </thead>
          <tbody>
            {filteredOwners.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                  No owners found
                </td>
              </tr>
            ) : (
              filteredOwners.slice(0, 50).map((owner) => (
                <tr key={owner.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14 }}>{owner.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500 }}>
                    {owner.first_name} {owner.last_name}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                    {owner.email || "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                    {owner.phone || "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                    {owner.mailing_address ? `${owner.mailing_address}, ${owner.city || ""} ${owner.state || ""} ${owner.zip || ""}` : "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14 }}>
                    <span style={{
                      background: "#eff6ff",
                      color: "#3b82f6",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 12
                    }}>
                      {owner.property_count || 0}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {filteredOwners.length > 50 && (
          <div style={{ padding: "12px 16px", background: "#f8fafc", textAlign: "center", color: "#64748b", fontSize: 14 }}>
            Showing 50 of {filteredOwners.length} owners
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOwnersPage;
