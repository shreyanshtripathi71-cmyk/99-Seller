"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/services/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface CrawlerRun {
  id: number;
  site_name?: string;
  county?: string;
  state?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  records_found?: number;
  records_added?: number;
  error_count?: number;
}

interface CrawlerError {
  id: number;
  run_id?: number;
  error_type?: string;
  error_message?: string;
  url?: string;
  created_at?: string;
}

const AdminCrawlerPage = () => {
  const [runs, setRuns] = useState<CrawlerRun[]>([]);
  const [errors, setErrors] = useState<CrawlerError[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"runs" | "errors">("runs");

  const getToken = () => localStorage.getItem("99sellers_token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchRuns(), fetchErrors()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRuns = async () => {
    try {
      const result = await adminAPI.crawler.getRuns();
      if (result.success) {
        setRuns(Array.isArray(result.data) ? result.data : []);
      }
    } catch (err) {
      console.error("Error fetching runs:", err);
    }
  };

  const fetchErrors = async () => {
    try {
      const result = await adminAPI.crawler.getErrors();
      if (result.success) {
        setErrors(Array.isArray(result.data) ? result.data : []);
      }
    } catch (err) {
      console.error("Error fetching errors:", err);
    }
  };

  const formatDuration = (start: string, end: string) => {
    if (!start || !end) return "-";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px" }}>
        <div style={{ color: "#64748b" }}>Loading crawler data...</div>
      </div>
    );
  }

  const recentRuns = runs.slice(0, 20);
  const recentErrors = errors.slice(0, 20);
  const successfulRuns = runs.filter(r => r.status === "completed" || r.status === "success").length;
  const totalRecords = runs.reduce((acc, r) => acc + (r.records_added || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#0f172a", margin: 0 }}>Crawler Status</h2>
          <p style={{ color: "#64748b", margin: 0, marginTop: 4 }}>Monitor web crawler runs and errors</p>
        </div>
        <button
          onClick={fetchData}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <i className="fa-solid fa-arrows-rotate" style={{ marginRight: 8 }}></i>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Total Runs</p>
          <h3 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: "8px 0 0" }}>{runs.length}</h3>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Successful Runs</p>
          <h3 style={{ fontSize: 28, fontWeight: 700, color: "#10b981", margin: "8px 0 0" }}>{successfulRuns}</h3>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Total Records Added</p>
          <h3 style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6", margin: "8px 0 0" }}>{totalRecords.toLocaleString()}</h3>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Total Errors</p>
          <h3 style={{ fontSize: 28, fontWeight: 700, color: "#ef4444", margin: "8px 0 0" }}>{errors.length}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab("runs")}
          style={{
            padding: "10px 20px",
            background: activeTab === "runs" ? "#0f172a" : "#f1f5f9",
            color: activeTab === "runs" ? "#fff" : "#64748b",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Crawler Runs ({runs.length})
        </button>
        <button
          onClick={() => setActiveTab("errors")}
          style={{
            padding: "10px 20px",
            background: activeTab === "errors" ? "#0f172a" : "#f1f5f9",
            color: activeTab === "errors" ? "#fff" : "#64748b",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Errors ({errors.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "runs" && (
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>ID</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Site</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>County</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Started</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Duration</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Records</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                    No crawler runs found
                  </td>
                </tr>
              ) : (
                recentRuns.map((run) => (
                  <tr key={run.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>{run.id}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500 }}>
                      {run.site_name || "-"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                      {run.county ? `${run.county}, ${run.state || ""}` : "-"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                      {run.start_time ? new Date(run.start_time).toLocaleString() : "-"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                      {run.start_time && run.end_time ? formatDuration(run.start_time, run.end_time) : "-"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>+{run.records_added || 0}</span>
                      <span style={{ color: "#94a3b8" }}> / {run.records_found || 0}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>
                      <span style={{
                        background: run.status === "completed" || run.status === "success" ? "#dcfce7" :
                          run.status === "running" ? "#dbeafe" : "#fee2e2",
                        color: run.status === "completed" || run.status === "success" ? "#16a34a" :
                          run.status === "running" ? "#2563eb" : "#dc2626",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12
                      }}>
                        {run.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "errors" && (
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>ID</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Run ID</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Type</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Message</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentErrors.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                    No errors found - Great job!
                  </td>
                </tr>
              ) : (
                recentErrors.map((err) => (
                  <tr key={err.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>{err.id}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>{err.run_id || "-"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14 }}>
                      <span style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12
                      }}>
                        {err.error_type || "Error"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {err.error_message || "-"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#64748b" }}>
                      {err.created_at ? new Date(err.created_at).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCrawlerPage;
