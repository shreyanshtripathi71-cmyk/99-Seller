"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface Loan {
  id: number;
  lender_name?: string;
  loan_amount?: number;
  loan_type?: string;
  interest_rate?: number;
  maturity_date?: string;
  recording_date?: string;
  property_id?: number;
  property_address?: string;
  status?: string;
}

const AdminLoansPage = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>(null);

  const getToken = () => localStorage.getItem("99sellers_token");

  useEffect(() => {
    fetchLoans();
    fetchStats();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/loans`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLoans(data.loans || []);
      } else {
        setError("Failed to fetch loans");
      }
    } catch (err) {
      setError("Failed to fetch loans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/loans/stats`, {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredLoans = loans.filter((loan) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      loan.lender_name?.toLowerCase().includes(searchLower) ||
      loan.property_address?.toLowerCase().includes(searchLower) ||
      loan.loan_type?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px" }}>
        <div style={{ color: "#64748b" }}>Loading loans...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#0f172a", margin: 0 }}>Loans Management</h2>
          <p style={{ color: "#64748b", margin: 0, marginTop: 4 }}>View and manage property loans</p>
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
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Total Loans</p>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "8px 0 0" }}>{stats.total?.toLocaleString() || 0}</h3>
          </div>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Total Value</p>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: "#10b981", margin: "8px 0 0" }}>
              {formatCurrency(stats.totalValue || 0)}
            </h3>
          </div>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Average Loan</p>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6", margin: "8px 0 0" }}>
              {formatCurrency(stats.avgAmount || 0)}
            </h3>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ background: "#fff", padding: 16, borderRadius: 12, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            placeholder="Search by lender, property, or loan type..."
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
            onClick={fetchLoans}
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
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Lender</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Amount</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Type</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Rate</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Maturity</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                  No loans found
                </td>
              </tr>
            ) : (
              filteredLoans.slice(0, 50).map((loan) => (
                <tr key={loan.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14 }}>{loan.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500 }}>
                    {loan.lender_name || "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#10b981" }}>
                    {loan.loan_amount ? formatCurrency(loan.loan_amount) : "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                    {loan.loan_type || "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                    {loan.interest_rate ? `${loan.interest_rate}%` : "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                    {loan.maturity_date ? new Date(loan.maturity_date).toLocaleDateString() : "-"}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14 }}>
                    <span style={{
                      background: loan.status === "active" ? "#dcfce7" : "#fef3c7",
                      color: loan.status === "active" ? "#16a34a" : "#d97706",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 12
                    }}>
                      {loan.status || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {filteredLoans.length > 50 && (
          <div style={{ padding: "12px 16px", background: "#f8fafc", textAlign: "center", color: "#64748b", fontSize: 14 }}>
            Showing 50 of {filteredLoans.length} loans
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoansPage;
