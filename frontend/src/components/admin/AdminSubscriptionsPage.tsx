"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/services/api";
import {
  Users,
  CreditCard,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap,
  Shield,
  Layers,
  Download,
  Database,
  Loader2
} from "lucide-react";

interface PlanFeatures {
  searchLimit: number;
  exportLimit: number;
  apiCallsPerDay: number;
  fullDataAccess: boolean;
  advancedSearch: boolean;
  exportEnabled: boolean;
  apiAccess: boolean;
}

interface Plan {
  subscriptionId: number;
  planName: string;
  price: number;
  duration: string;
  features: PlanFeatures;
  description: string;
  status: string;
  popular?: boolean;
}

interface SubscriptionRecord {
  Username: string;
  planName: string;
  status: string;
  price: number;
  duration: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  paymentStatus: string;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  trialingSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  conversionRate: number;
}

const THEME = {
  bg: "#f1f5f9",
  cardBg: "rgba(255, 255, 255, 0.9)",
  cardBorder: "rgba(0, 0, 0, 0.08)",
  accent1: "#3b82f6", // Blue
  accent2: "#10b981", // Green
  accent3: "#8b5cf6", // Purple
  accent4: "#f59e0b", // Amber
  textMain: "#0f172a",
  textMuted: "#64748b",
  glassBlur: "blur(12px)",
};

const AdminSubscriptionsPage = () => {
  const [activeTab, setActiveTab] = useState<"plans" | "subscriptions">("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const defaultPlanForm = {
    planName: "",
    price: 0,
    duration: "monthly",
    description: "",
    status: "active",
    popular: false,
    searchLimit: 50,
    exportLimit: 100,
    apiCallsPerDay: 100,
    fullDataAccess: false,
    advancedSearch: false,
    exportEnabled: true,
    apiAccess: false,
  };

  const [planForm, setPlanForm] = useState(defaultPlanForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes, statsRes] = await Promise.all([
        adminAPI.subscriptions.getPlans(),
        adminAPI.subscriptions.getAll(),
        adminAPI.subscriptions.getStats(),
      ]);

      if (plansRes.success && plansRes.data) {
        const plansData = (plansRes.data as any).plans || plansRes.data;
        setPlans(Array.isArray(plansData) ? plansData : []);
      }

      if (subsRes.success && subsRes.data) {
        const subsData = (subsRes.data as any).subscriptions || subsRes.data;
        setSubscriptions(Array.isArray(subsData) ? subsData : []);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data as SubscriptionStats);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm(defaultPlanForm);
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      planName: plan.planName,
      price: plan.price,
      duration: plan.duration,
      description: plan.description || "",
      status: plan.status || "active",
      popular: plan.popular || false,
      searchLimit: plan.features?.searchLimit || 50,
      exportLimit: plan.features?.exportLimit || 100,
      apiCallsPerDay: plan.features?.apiCallsPerDay || 100,
      fullDataAccess: plan.features?.fullDataAccess || false,
      advancedSearch: plan.features?.advancedSearch || false,
      exportEnabled: plan.features?.exportEnabled || true,
      apiAccess: plan.features?.apiAccess || false,
    });
    setShowPlanModal(true);
  };

  const handleSavePlan = async () => {
    if (!planForm.planName) {
      alert("Please fill in Plan Name");
      return;
    }

    setSaving(true);
    try {
      const planData = {
        ...(editingPlan ? { subscriptionId: editingPlan.subscriptionId } : {}),
        planName: planForm.planName,
        price: planForm.price,
        duration: planForm.duration,
        description: planForm.description,
        status: planForm.status,
        features: {
          searchLimit: planForm.searchLimit,
          exportLimit: planForm.exportLimit,
          apiCallsPerDay: planForm.apiCallsPerDay,
          fullDataAccess: planForm.fullDataAccess,
          advancedSearch: planForm.advancedSearch,
          exportEnabled: planForm.exportEnabled,
          apiAccess: planForm.apiAccess,
        },
      };

      const response = await adminAPI.subscriptions.createOrUpdatePlan(planData);
      if (response.success) {
        setShowPlanModal(false);
        fetchData();
      } else {
        alert(response.error || "Failed to save plan");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred while saving the plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (subscriptionId: number) => {
    if (!confirm("Are you sure you want to delete this plan? This cannot be undone.")) return;

    try {
      const response = await adminAPI.subscriptions.deletePlan(subscriptionId);
      if (response.success) {
        fetchData();
      } else {
        alert(response.error || "Failed to delete plan");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting the plan");
    }
  };

  const handleCancelSubscription = async (Username: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;

    try {
      const response = await adminAPI.subscriptions.cancel(Username);
      if (response.success) {
        fetchData();
      } else {
        alert(response.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("An error occurred");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return { bg: "#dcfce7", color: "#166534" };
      case "trialing": return { bg: "#dbeafe", color: "#1e40af" };
      case "cancelled": return { bg: "#fee2e2", color: "#991b1b" };
      case "expired": return { bg: "#f3f4f6", color: "#4b5563" };
      default: return { bg: "#f3f4f6", color: "#4b5563" };
    }
  };

  const getPlanTypeColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("free")) return "#10b981";
    if (n.includes("premium")) return "#3b82f6";
    return "#64748b";
  };

  return (
    <div style={{ padding: isMobile ? 16 : 32, backgroundColor: THEME.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Subscription Management
        </h1>
        <p style={{ color: "#64748b", marginTop: 4 }}>
          Manage subscription plans and connect them to Stripe for billing
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, marginBottom: 32 }}>
          <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 24, border: `1px solid ${THEME.cardBorder}`, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: THEME.textMuted, marginBottom: 8 }}>Active Subscriptions</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: THEME.accent2 }}>{stats.activeSubscriptions}</div>
          </div>
          <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 24, border: `1px solid ${THEME.cardBorder}`, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: THEME.textMuted, marginBottom: 8 }}>Trialing</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: THEME.accent1 }}>{stats.trialingSubscriptions}</div>
          </div>
          <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 24, border: `1px solid ${THEME.cardBorder}`, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: THEME.textMuted, marginBottom: 8 }}>Monthly Revenue</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: THEME.textMain }}>${stats.monthlyRevenue?.toLocaleString() || "0.00"}</div>
          </div>
          <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 24, border: `1px solid ${THEME.cardBorder}`, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: THEME.textMuted, marginBottom: 8 }}>Conversion Rate</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: THEME.accent4 }}>{stats.conversionRate?.toFixed(1) || 0}%</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: 24, borderBottom: "2px solid #e2e8f0" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { key: "plans", label: "Subscription Plans", icon: CreditCard },
            { key: "subscriptions", label: "Active Subscriptions", icon: Users },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: "12px 24px",
                border: "none",
                background: "transparent",
                borderBottom: activeTab === tab.key ? `3px solid ${THEME.accent1}` : "3px solid transparent",
                color: activeTab === tab.key ? THEME.accent1 : THEME.textMuted,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div>
          <div style={{
            marginBottom: 24,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 16 : 0
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", margin: 0 }}>Pricing Plans</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                Create plans and link them to Stripe Price IDs for automatic billing
              </p>
            </div>
            <button
              onClick={handleCreatePlan}
              style={{
                width: isMobile ? "100%" : "auto",
                justifyContent: "center",
                padding: "10px 20px",
                background: `linear-gradient(135deg, ${THEME.accent1}, #2563eb)`,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Plus size={18} />
              Add Plan
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 48 }}>
              <Loader2 className="animate-spin" size={32} style={{ color: THEME.accent1, margin: "0 auto" }} />
            </div>
          ) : plans.length === 0 ? (
            <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 48, textAlign: "center", border: `1px solid ${THEME.cardBorder}` }}>
              <CreditCard size={48} style={{ color: "#d1d5db", marginBottom: 16, margin: "0 auto" }} />
              <p style={{ color: THEME.textMuted, fontSize: 16, marginBottom: 8 }}>No subscription plans yet</p>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Create your first plan to start managing subscriptions</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
              {plans.map((plan) => (
                <div
                  key={plan.subscriptionId}
                  style={{
                    background: THEME.cardBg,
                    borderRadius: 20,
                    padding: 32,
                    border: plan.popular ? `2px solid ${THEME.accent1}` : `1px solid ${THEME.cardBorder}`,
                    boxShadow: plan.popular ? "0 20px 25px -5px rgb(59 130 246 / 0.1)" : "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                    position: "relative",
                    transition: "transform 0.2s ease",
                    backdropFilter: THEME.glassBlur,
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "#fff",
                      padding: "6px 16px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}>
                      MOST POPULAR
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{
                      padding: "4px 12px",
                      background: `${getPlanTypeColor(plan.planName)}15`,
                      color: getPlanTypeColor(plan.planName),
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}>
                      {plan.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 24, fontWeight: 800, color: THEME.textMain, margin: "8px 0" }}>{plan.planName}</h3>

                  <div style={{ marginBottom: 20 }}>
                    <span style={{ fontSize: 42, fontWeight: 800, color: THEME.textMain }}>${plan.price}</span>
                    <span style={{ fontSize: 16, color: THEME.textMuted }}>/{plan.duration === "monthly" ? "mo" : "yr"}</span>
                  </div>

                  <p style={{ fontSize: 14, color: THEME.textMuted, marginBottom: 24, minHeight: 44, lineHeight: 1.6 }}>
                    {plan.description || "Comprehensive tools for market analysis and lead generation."}
                  </p>

                  {/* Features */}
                  <div style={{ borderTop: `1px solid ${THEME.cardBorder}`, paddingTop: 24, marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, marginBottom: 16, letterSpacing: "0.05em" }}>PLAN FEATURES</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ fontSize: 14, color: THEME.textMain, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${THEME.accent1}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Search size={12} style={{ color: THEME.accent1 }} />
                        </div>
                        {plan.features?.searchLimit === -1 ? "Unlimited" : plan.features?.searchLimit || 0} Searches
                      </div>
                      <div style={{ fontSize: 14, color: THEME.textMain, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${THEME.accent1}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Download size={12} style={{ color: THEME.accent1 }} />
                        </div>
                        {plan.features?.exportLimit === -1 ? "Unlimited" : plan.features?.exportLimit || 0} Exports
                      </div>
                      {plan.features?.advancedSearch && (
                        <div style={{ fontSize: 14, color: THEME.textMain, display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${THEME.accent2}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Zap size={12} style={{ color: THEME.accent2 }} />
                          </div>
                          Advanced Search
                        </div>
                      )}
                      {plan.features?.fullDataAccess && (
                        <div style={{ fontSize: 14, color: THEME.textMain, display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${THEME.accent2}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Database size={12} style={{ color: THEME.accent2 }} />
                          </div>
                          Full Data Access
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={() => handleEditPlan(plan)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#fff",
                        color: THEME.accent1,
                        border: `1px solid ${THEME.accent1}30`,
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.subscriptionId)}
                      style={{
                        width: 48,
                        height: 48,
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", margin: 0, marginBottom: 24 }}>
            Active Subscriptions
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: 48 }}>
              <Loader2 className="animate-spin" size={32} style={{ color: THEME.accent1, margin: "0 auto" }} />
            </div>
          ) : subscriptions.length === 0 ? (
            <div style={{ background: THEME.cardBg, borderRadius: 16, padding: 48, textAlign: "center", border: `1px solid ${THEME.cardBorder}` }}>
              <Users size={48} style={{ color: "#d1d5db", marginBottom: 16, margin: "0 auto" }} />
              <p style={{ color: THEME.textMuted, fontSize: 16 }}>No active subscriptions found</p>
            </div>
          ) : (
            <div style={{ background: THEME.cardBg, borderRadius: 20, overflow: "hidden", border: `1px solid ${THEME.cardBorder}`, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(248, 250, 252, 0.8)", borderBottom: `1px solid ${THEME.cardBorder}` }}>
                    <th style={{ textAlign: "left", padding: "18px 24px", fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer</th>
                    <th style={{ textAlign: "left", padding: "18px 24px", fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Plan</th>
                    <th style={{ textAlign: "left", padding: "18px 24px", fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "18px 24px", fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment</th>
                    <th style={{ textAlign: "left", padding: "18px 24px", fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Term</th>
                    <th style={{ textAlign: "right", padding: "18px 24px", fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub, idx) => (
                    <tr key={sub.Username + idx} style={{ borderBottom: `1px solid ${THEME.cardBorder}`, transition: "background 0.2s ease" }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: 700, color: THEME.textMain, fontSize: 14 }}>{sub.Username}</div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: 600, color: THEME.textMain, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: getPlanTypeColor(sub.planName) }}></span>
                          {sub.planName}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <span style={{
                          padding: "6px 14px",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          background: getStatusColor(sub.status).bg,
                          color: getStatusColor(sub.status).color,
                          textTransform: "capitalize",
                        }}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: sub.paymentStatus === 'paid' ? THEME.accent2 : THEME.accent4 }}>
                          {sub.paymentStatus.toUpperCase()}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ color: THEME.textMain, fontSize: 13, fontWeight: 500 }}>
                          {new Date(sub.subscriptionStart).toLocaleDateString()} - {new Date(sub.subscriptionEnd).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        {sub.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancelSubscription(sub.Username)}
                            style={{
                              padding: "8px 16px",
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "none",
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Plan Modal */}
      {showPlanModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowPlanModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 640,
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  {editingPlan ? "Edit Plan" : "Create New Plan"}
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Configure pricing and connect to Stripe
                </p>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", fontSize: 16 }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>Basic Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: THEME.textMain }}>Plan Name *</label>
                    <input
                      type="text"
                      value={planForm.planName}
                      onChange={(e) => setPlanForm({ ...planForm, planName: e.target.value })}
                      placeholder="e.g., Premium Plus"
                      style={{ width: "100%", padding: "12px 16px", background: "#f8fafc", border: `1px solid ${THEME.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 600, color: THEME.textMain }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: THEME.textMain }}>Plan Status</label>
                    <select
                      value={planForm.status}
                      onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}
                      style={{ width: "100%", padding: "12px 16px", background: "#f8fafc", border: `1px solid ${THEME.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 500, color: THEME.textMain }}
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: THEME.textMain }}>Billing Cycle</label>
                    <select
                      value={planForm.duration}
                      onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })}
                      style={{ width: "100%", padding: "12px 16px", background: "#f8fafc", border: `1px solid ${THEME.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 500, color: THEME.textMain }}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>Description</label>
                    <textarea
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      placeholder="Describe what's included..."
                      rows={2}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24, padding: 24, background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderRadius: 16, border: `1px solid ${THEME.cardBorder}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, marginBottom: 20, letterSpacing: "0.05em" }}>PRICING CONFIGURATION</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: THEME.textMain }}>Price (USD) *</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: THEME.textMuted, fontWeight: 600 }}>$</span>
                      <input
                        type="number"
                        value={planForm.price}
                        onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                        placeholder="29.99"
                        step="0.01"
                        style={{ width: "100%", padding: "12px 16px 12px 32px", background: "#fff", border: `1px solid ${THEME.cardBorder}`, borderRadius: 12, fontSize: 14, fontWeight: 600 }}
                      />
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: planForm.popular ? `${THEME.accent1}10` : "transparent", padding: "12px 16px", borderRadius: 12, border: `1px solid ${planForm.popular ? THEME.accent1 : THEME.cardBorder}`, transition: "all 0.2s ease" }}>
                      <input
                        type="checkbox"
                        checked={planForm.popular}
                        onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                        style={{ width: 20, height: 20, cursor: "pointer", accentColor: THEME.accent1 }}
                      />
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, display: "block" }}>Highlight as Popular</span>
                        <span style={{ fontSize: 12, color: THEME.textMuted }}>Display a "Most Popular" badge on this plan card</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>Usage Limits</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>Search Limit</label>
                    <input
                      type="number"
                      value={planForm.searchLimit}
                      onChange={(e) => setPlanForm({ ...planForm, searchLimit: Number(e.target.value) })}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                    />
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>-1 = unlimited</p>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>Export Limit</label>
                    <input
                      type="number"
                      value={planForm.exportLimit}
                      onChange={(e) => setPlanForm({ ...planForm, exportLimit: Number(e.target.value) })}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                    />
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>-1 = unlimited</p>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>API Calls/Day</label>
                    <input
                      type="number"
                      value={planForm.apiCallsPerDay}
                      onChange={(e) => setPlanForm({ ...planForm, apiCallsPerDay: Number(e.target.value) })}
                      style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                    />
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>-1 = unlimited</p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>Feature Toggles</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { key: "fullDataAccess", label: "Full Data Access" },
                    { key: "advancedSearch", label: "Advanced Search" },
                    { key: "exportEnabled", label: "Export Enabled" },
                    { key: "apiAccess", label: "API Access" },
                  ].map((feature) => (
                    <label
                      key={feature.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        background: (planForm as any)[feature.key] ? "#f0fdf4" : "#f8fafc",
                        borderRadius: 8,
                        border: `1px solid ${(planForm as any)[feature.key] ? "#86efac" : "#e2e8f0"}`,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(planForm as any)[feature.key]}
                        onChange={(e) => setPlanForm({ ...planForm, [feature.key]: e.target.checked })}
                        style={{ width: 18, height: 18, cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 28px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setShowPlanModal(false)}
                style={{ padding: "10px 20px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                disabled={saving}
                style={{
                  padding: "10px 24px",
                  background: saving ? "#94a3b8" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {saving && <span>...</span>}
                {editingPlan ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionsPage;
