"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/modules/UserSearchLayout_Module";
import { useAuth } from "@/context/AuthContext";
import { savedLeadsAPI, exportAPI } from "@/services/api";

const EXPORT_FORMATS = [
  {
    id: "csv",
    name: "CSV",
    description: "Opens in Excel, Google Sheets & most tools",
    icon: "fa-solid fa-file-csv",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    id: "excel",
    name: "Excel",
    description: "Native .xlsx format with formatting",
    icon: "fa-solid fa-file-excel",
    color: "#059669",
    bg: "#F0FDF4",
  },
  {
    id: "json",
    name: "JSON",
    description: "For developers & API integrations",
    icon: "fa-solid fa-code",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
];

interface ExportHistoryItem {
  exportId: number;
  username: string;
  filename: string;
  recordCount: number;
  format: string;
  status: string;
  url: string;
  createdAt: string;
}

interface UsageData {
  usage: number;
  limit: number;
  remaining: number;
  userType: string;
  resetDate: string;
}

const ExportDataPage = () => {
  const { user, subscription, canAccessPremium, isTrialActive } = useAuth();
  const router = useRouter();

  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [exportType, setExportType] = useState<"saved" | "search">("saved");
  const [isExporting, setIsExporting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [savedLeadsCount, setSavedLeadsCount] = useState(0);
  const [lastSearchCount, setLastSearchCount] = useState(0);
  const [lastSearchFilters, setLastSearchFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const isPremium =
    canAccessPremium() || isTrialActive() || (usageData && usageData.userType !== "free");

  const exportsUsed = usageData?.usage || 0;
  const exportLimit = usageData?.limit || 0;
  const exportsRemaining = exportLimit >= 900000 ? "Unlimited" : Math.max(0, exportLimit - exportsUsed);
  const usagePercent = exportLimit >= 900000 ? 5 : exportLimit > 0 ? Math.round((exportsUsed / exportLimit) * 100) : 0;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const savedLeadsRes = await savedLeadsAPI.getAll();
      if (savedLeadsRes.success && savedLeadsRes.data) {
        setSavedLeadsCount(Array.isArray(savedLeadsRes.data) ? savedLeadsRes.data.length : 0);
      }
      const historyRes = await exportAPI.getHistory();
      if (historyRes.success && historyRes.data) setExportHistory(historyRes.data);
      const usageRes = await exportAPI.getUsage();
      if (usageRes.success && usageRes.data) setUsageData(usageRes.data);
    } catch (error) {
      console.error("Failed to load export data:", error);
    } finally {
      setLoading(false);
    }
    const terms = localStorage.getItem("99sellers_export_terms_accepted");
    if (terms === "true") setTermsAccepted(true);
    const lastSearch = localStorage.getItem("99sellers_last_search_count");
    if (lastSearch) setLastSearchCount(parseInt(lastSearch, 10));
    const lastFilters = localStorage.getItem("99sellers_last_search_filters");
    if (lastFilters) { try { setLastSearchFilters(JSON.parse(lastFilters)); } catch {} }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!selectedFormat || !isPremium) return;
    if (usageData && usageData.limit < 900000 && usageData.usage >= usageData.limit) {
      alert("You have reached your monthly export limit. Upgrade your plan for more exports.");
      return;
    }
    if (!termsAccepted) { setShowTermsModal(true); return; }

    setIsExporting(true);
    setExportSuccess(null);
    try {
      const result = await exportAPI.exportSavedLeads(
        selectedFormat as "csv" | "json" | "excel",
        exportType,
        exportType === "search" ? lastSearchFilters : {}
      );
      if (!result.success || !result.data) throw new Error(result.error || "Export failed");
      const { content, filename, mimeType, recordCount } = result.data;
      downloadFile(content, filename, mimeType);
      setExportSuccess(`Successfully exported ${recordCount} leads as ${selectedFormat?.toUpperCase()}`);
      await loadData();
      setTimeout(() => setExportSuccess(null), 5000);
    } catch (error: any) {
      console.error("Export failed:", error);
      alert(error.message || "Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    localStorage.setItem("99sellers_export_terms_accepted", "true");
    setShowTermsModal(false);
    handleExport();
  };

  const activeCount = exportType === "saved" ? savedLeadsCount : lastSearchCount;

  // ── Style helpers ──
  const S: Record<string, React.CSSProperties> = {
    page: { maxWidth: 960, margin: "0 auto" },
    hero: { background: "linear-gradient(135deg,#0F172A,#1E293B)", borderRadius: 14, padding: "28px 32px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" },
    heroLeft: { display: "flex", alignItems: "center", gap: 16 },
    heroIcon: { width: 48, height: 48, borderRadius: 12, background: "rgba(37,99,235,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    heroTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: "#fff" },
    heroSub: { margin: "2px 0 0", fontSize: 13, color: "#94A3B8" },
    usagePill: { background: "rgba(255,255,255,.08)", borderRadius: 10, padding: "12px 20px", minWidth: 170 },
    usageRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    usageBar: { height: 4, borderRadius: 2, background: "rgba(255,255,255,.1)", overflow: "hidden" },
    success: { background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#065F46", fontWeight: 500 },
    card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, marginBottom: 16, overflow: "hidden" },
    cardHead: { padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" },
    cardHeadLeft: { display: "flex", alignItems: "center", gap: 10 },
    stepNum: { width: 22, height: 22, borderRadius: "50%", background: "#2563EB", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
    cardLabel: { fontSize: 14, fontWeight: 600, color: "#1E293B" },
    cardBody: { padding: "16px 20px" },
    exportBar: { background: "#F8FAFC", borderTop: "1px solid #E2E8F0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
    exportInfo: { fontSize: 13, color: "#475569" },
    gate: { background: "linear-gradient(135deg,#0F172A,#1E293B)", borderRadius: 14, padding: "48px 32px", textAlign: "center", marginBottom: 20 },
    gateIcon: { width: 64, height: 64, borderRadius: 16, background: "rgba(37,99,235,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" },
    gateTitle: { margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#fff" },
    gateSub: { color: "#94A3B8", fontSize: 14, lineHeight: 1.6, maxWidth: 420, margin: "0 auto 24px" },
    gateBtnRow: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" },
    gatePrimary: { background: "#2563EB", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
    gateSecondary: { background: "transparent", color: "#94A3B8", border: "1px solid #334155", padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 999, backdropFilter: "blur(2px)" },
    modal: { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 14, padding: "28px 28px 24px", maxWidth: 440, width: "92%", zIndex: 1000, boxShadow: "0 20px 40px rgba(0,0,0,.2)" },
  };

  const usageFill = (pct: number): React.CSSProperties => ({ height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: 2, background: pct > 80 ? "#F59E0B" : "#3B82F6", transition: "width .4s ease" });
  const sourceBtn = (on: boolean): React.CSSProperties => ({ flex: 1, padding: "14px 16px", borderRadius: 10, border: on ? "2px solid #2563EB" : "1px solid #E2E8F0", background: on ? "#EFF6FF" : "#fff", cursor: "pointer", transition: "all .15s", display: "flex", alignItems: "center", gap: 12 });
  const srcIcon = (on: boolean): React.CSSProperties => ({ width: 38, height: 38, borderRadius: 8, background: on ? "#2563EB" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 });
  const srcCount = (on: boolean): React.CSSProperties => ({ marginLeft: "auto", background: on ? "#2563EB" : "#F1F5F9", color: on ? "#fff" : "#475569", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 });
  const fmtCard = (on: boolean): React.CSSProperties => ({ padding: "18px 14px", borderRadius: 10, border: on ? "2px solid #2563EB" : "1px solid #E2E8F0", background: on ? "#EFF6FF" : "#FAFBFC", cursor: "pointer", transition: "all .15s", textAlign: "center", position: "relative" });
  const fmtIcon = (bg: string, fg: string): React.CSSProperties => ({ width: 44, height: 44, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 20, color: fg });
  const exportBtn = (ready: boolean): React.CSSProperties => ({ padding: "10px 28px", borderRadius: 8, border: "none", background: ready ? "linear-gradient(135deg,#2563EB,#1D4ED8)" : "#CBD5E1", color: "#fff", fontSize: 14, fontWeight: 600, cursor: ready ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 8, boxShadow: ready ? "0 2px 8px rgba(37,99,235,.3)" : "none" });
  const histRow = (even: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", padding: "10px 20px", background: even ? "#FAFBFC" : "#fff", gap: 12, fontSize: 13 });
  const histBadge = (fmt: string): React.CSSProperties => {
    const m: Record<string, { bg: string; fg: string }> = { csv: { bg: "#ECFDF5", fg: "#059669" }, excel: { bg: "#F0FDF4", fg: "#047857" }, json: { bg: "#EFF6FF", fg: "#2563EB" } };
    const c = m[fmt] || m.csv;
    return { padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: c.bg, color: c.fg, textTransform: "uppercase" };
  };
  const cardDot = (c: string): React.CSSProperties => ({ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 });

  return (
    <DashboardShell title="Export Data" subtitle="Download your leads">
      <div style={S.page}>
        {/* Premium Gate */}
        {!isPremium && (
          <div style={S.gate}>
            <div style={S.gateIcon}><i className="fa-solid fa-download" style={{ fontSize: 26, color: "#3B82F6" }} /></div>
            <h3 style={S.gateTitle}>Unlock Export Features</h3>
            <p style={S.gateSub}>Export leads with full addresses, owner contact info, financial details, and distress data — in CSV, Excel, or JSON.</p>
            <div style={S.gateBtnRow}>
              <button style={S.gatePrimary} onClick={() => router.push("/dashboard/subscription")}><i className="fa-solid fa-bolt" style={{ marginRight: 6 }} />Upgrade to Premium</button>
              <button style={S.gateSecondary} onClick={() => router.push("/dashboard/subscription")}>Start Free Trial</button>
            </div>
          </div>
        )}

        {/* Hero Bar */}
        {isPremium && (
          <div style={S.hero}>
            <div style={S.heroLeft}>
              <div style={S.heroIcon}><i className="fa-solid fa-download" style={{ fontSize: 20, color: "#3B82F6" }} /></div>
              <div>
                <h2 style={S.heroTitle}>Export Your Leads</h2>
                <p style={S.heroSub}>Download as CSV, Excel, or JSON &mdash; ready for any CRM</p>
              </div>
            </div>
            <div style={S.usagePill}>
              <div style={S.usageRow}>
                <span style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}>Monthly Usage</span>
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{exportsUsed} / {exportLimit >= 900000 ? "∞" : exportLimit}</span>
              </div>
              <div style={S.usageBar}><div style={usageFill(usagePercent)} /></div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {exportSuccess && (
          <div style={S.success}><i className="fa-solid fa-circle-check" style={{ color: "#10B981", fontSize: 16 }} />{exportSuccess}</div>
        )}

        {/* Main Export Card */}
        <div style={{ ...S.card, opacity: isPremium ? 1 : 0.5, pointerEvents: isPremium ? "auto" : "none" }}>
          {/* Step 1: Data Source */}
          <div style={S.cardHead}>
            <div style={S.cardHeadLeft}><span style={S.stepNum}>1</span><span style={S.cardLabel}>Choose Data Source</span></div>
          </div>
          <div style={S.cardBody}>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={sourceBtn(exportType === "saved")} onClick={() => setExportType("saved")}>
                <div style={srcIcon(exportType === "saved")}><i className="fa-solid fa-bookmark" style={{ fontSize: 14, color: exportType === "saved" ? "#fff" : "#64748B" }} /></div>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>Saved Leads</div><div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>Your bookmarked properties</div></div>
                <span style={srcCount(exportType === "saved")}>{savedLeadsCount}</span>
              </button>
              <button style={sourceBtn(exportType === "search")} onClick={() => setExportType("search")}>
                <div style={srcIcon(exportType === "search")}><i className="fa-solid fa-magnifying-glass" style={{ fontSize: 14, color: exportType === "search" ? "#fff" : "#64748B" }} /></div>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>Last Search</div><div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>Results from your last query</div></div>
                <span style={srcCount(exportType === "search")}>{lastSearchCount}</span>
              </button>
            </div>
          </div>

          {/* Step 2: Format */}
          <div style={S.cardHead}>
            <div style={S.cardHeadLeft}><span style={S.stepNum}>2</span><span style={S.cardLabel}>Select Format</span></div>
          </div>
          <div style={S.cardBody}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {EXPORT_FORMATS.map((fmt) => (
                <div key={fmt.id} style={fmtCard(selectedFormat === fmt.id)} onClick={() => setSelectedFormat(fmt.id)}>
                  {selectedFormat === fmt.id && <i className="fa-solid fa-circle-check" style={{ position: "absolute", top: 8, right: 8, color: "#2563EB", fontSize: 16 }} />}
                  <div style={fmtIcon(fmt.bg, fmt.color)}><i className={fmt.icon} /></div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1E293B", margin: "0 0 2px" }}>{fmt.name}</div>
                  <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.4 }}>{fmt.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div style={S.exportBar}>
            <div style={S.exportInfo}>
              {activeCount > 0 ? (<><strong>{activeCount}</strong> leads ready to export{selectedFormat && <> as <strong>{selectedFormat.toUpperCase()}</strong></>}</>) : (
                <span style={{ color: "#94A3B8" }}>{exportType === "saved" ? "No saved leads yet — bookmark some from Lead Discovery" : "Run a search first to export results"}</span>
              )}
            </div>
            <button style={exportBtn(!!(selectedFormat && activeCount > 0 && !isExporting))} onClick={handleExport} disabled={!selectedFormat || activeCount === 0 || isExporting}>
              {isExporting ? (<><i className="fa-solid fa-spinner fa-spin" /> Exporting&hellip;</>) : (<><i className="fa-solid fa-download" /> Export Now</>)}
            </button>
          </div>
        </div>

        {/* What’s Included */}
        <div style={S.card}>
          <div style={S.cardHead}><div style={S.cardHeadLeft}><span style={cardDot("#2563EB")} /><span style={S.cardLabel}>What&apos;s Included in Your Export</span></div></div>
          <div style={{ ...S.cardBody, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
            {[{ icon: "fa-location-dot", label: "Full Address" },{ icon: "fa-user", label: "Owner Name" },{ icon: "fa-phone", label: "Phone Number" },{ icon: "fa-envelope", label: "Email Address" },{ icon: "fa-home", label: "Property Details" },{ icon: "fa-dollar-sign", label: "Equity & Debt" },{ icon: "fa-gavel", label: "Auction Date" },{ icon: "fa-chart-line", label: "Appraised Value" }].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 13, color: "#334155" }}>
                <i className={`fa-solid ${item.icon}`} style={{ width: 16, textAlign: "center", color: "#2563EB", fontSize: 12 }} />{item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Export History */}
        {exportHistory.length > 0 && (
          <div style={S.card}>
            <div style={S.cardHead}><div style={S.cardHeadLeft}><span style={cardDot("#10B981")} /><span style={S.cardLabel}>Export History</span></div><span style={{ fontSize: 12, color: "#64748B" }}>{exportHistory.length} exports</span></div>
            <div>
              <div style={{ display: "flex", padding: "8px 20px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.3 }}>
                <span style={{ flex: 2 }}>File</span><span style={{ flex: 1 }}>Format</span><span style={{ flex: 1 }}>Records</span><span style={{ flex: 1 }}>Date</span><span style={{ flex: 1, textAlign: "right" }}>Status</span>
              </div>
              {exportHistory.map((item, idx) => (
                <div key={item.exportId} style={histRow(idx % 2 === 0)}>
                  <span style={{ flex: 2, fontWeight: 500, color: "#1E293B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <i className={`fa-solid ${item.format === "csv" ? "fa-file-csv" : item.format === "excel" ? "fa-file-excel" : "fa-code"}`} style={{ marginRight: 8, color: item.format === "csv" ? "#10B981" : item.format === "excel" ? "#059669" : "#2563EB" }} />{item.filename}
                  </span>
                  <span style={{ flex: 1, color: "#64748B", fontSize: 12 }}><span style={histBadge(item.format)}>{item.format}</span></span>
                  <span style={{ flex: 1, color: "#64748B", fontSize: 12 }}>{item.recordCount.toLocaleString()}</span>
                  <span style={{ flex: 1, color: "#64748B", fontSize: 12 }}>{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span style={{ flex: 1, textAlign: "right" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#059669" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} />{item.status}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <>
          <div style={S.overlay} onClick={() => setShowTermsModal(false)} />
          <div style={S.modal}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EFF6FF", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><i className="fa-solid fa-file-contract" style={{ fontSize: 22, color: "#2563EB" }} /></div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Export Terms of Use</h3>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: 8, padding: 16, marginBottom: 20, fontSize: 13, color: "#475569", lineHeight: 1.7, maxHeight: 180, overflow: "auto" }}>
              <p style={{ margin: "0 0 10px", fontWeight: 600 }}>By exporting data you agree to:</p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>Data is for your personal or business use only.</li>
                <li>No reselling, redistributing, or sharing with third parties.</li>
                <li>Exports are watermarked with your account info.</li>
                <li>Violations may result in account suspension.</li>
              </ul>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowTermsModal(false)} style={{ flex: 1, padding: "11px 20px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAcceptTerms} style={{ flex: 1, padding: "11px 20px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Accept & Export</button>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
};

export default ExportDataPage;
