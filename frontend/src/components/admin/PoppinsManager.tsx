"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { adminAPI } from "@/services/api";

interface Poppin {
  id: string;
  name: string;
  type: "banner" | "modal" | "toast" | "slide-in" | "fullscreen" | "floating-bar" | "email-capture" | "social-proof" | "countdown" | "sidebar";
  title: string;
  message: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  accentColor?: string;
  position: "top" | "bottom" | "center" | "bottom-right" | "bottom-left" | "left" | "right";
  trigger: "page-load" | "scroll" | "exit-intent" | "time-delay" | "click";
  triggerValue?: number;
  pages: string[];
  startDate?: string;
  endDate?: string;
  countdownEnd?: string;
  isActive: boolean;
  priority: number;
  showOnMobile: boolean;
  showOnDesktop: boolean;
  dismissable: boolean;
  showOnce: boolean;
  emailPlaceholder?: string;
  successMessage?: string;
  createdAt: string;
}

const DEFAULT_POPPINS: Poppin[] = [
  {
    id: "1",
    name: "Welcome Offer Modal",
    type: "modal",
    title: "🎉 Welcome to 99Sellers!",
    message: "Start your 7-day FREE trial and get 20% off your first month. Access unlimited motivated seller leads!",
    buttonText: "Start Free Trial",
    buttonLink: "/dashboard/subscription",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    accentColor: "#1d4ed8",
    position: "center",
    trigger: "time-delay",
    triggerValue: 5,
    pages: ["/"],
    isActive: true,
    priority: 1,
    showOnMobile: true,
    showOnDesktop: true,
    dismissable: true,
    showOnce: true,
    createdAt: "2026-02-05",
  },
  {
    id: "2",
    name: "Exit Intent Saver",
    type: "fullscreen",
    title: "Wait! Don't Leave Empty-Handed",
    message: "Get instant access to 10,000+ motivated seller leads with full contact info. Start your FREE trial today!",
    buttonText: "Start 7-Day Free Trial",
    buttonLink: "/dashboard/subscription",
    secondaryButtonText: "No thanks, I'll pass",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    accentColor: "#1d4ed8",
    position: "center",
    trigger: "exit-intent",
    pages: ["/search", "/pricing"],
    isActive: true,
    priority: 2,
    showOnMobile: false,
    showOnDesktop: true,
    dismissable: true,
    showOnce: true,
    createdAt: "2026-02-05",
  },
  {
    id: "3",
    name: "Newsletter Scroll Popup",
    type: "email-capture",
    title: "Get Exclusive Deals!",
    message: "Subscribe to receive weekly updates on the hottest distressed properties and motivated seller leads.",
    buttonText: "Subscribe Now",
    emailPlaceholder: "Enter your email address",
    successMessage: "Welcome! Check your inbox for exclusive deals.",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    accentColor: "#1d4ed8",
    position: "center",
    trigger: "scroll",
    triggerValue: 50,
    pages: ["*"],
    isActive: false,
    priority: 3,
    showOnMobile: true,
    showOnDesktop: true,
    dismissable: true,
    showOnce: true,
    createdAt: "2026-02-05",
  },
  {
    id: "4",
    name: "Free Trial Banner",
    type: "floating-bar",
    title: "🔥 Limited Time Offer",
    message: "Get 7 days FREE + 20% off your first month",
    buttonText: "Claim Now",
    buttonLink: "/dashboard/subscription",
    backgroundColor: "#059669",
    textColor: "#ffffff",
    accentColor: "#047857",
    position: "top",
    trigger: "page-load",
    pages: ["/search", "/dashboard"],
    isActive: true,
    priority: 4,
    showOnMobile: true,
    showOnDesktop: true,
    dismissable: true,
    showOnce: false,
    createdAt: "2026-02-05",
  },
  {
    id: "5",
    name: "Feature Discovery Toast",
    type: "toast",
    title: "💡 Did you know?",
    message: "You can export leads to CSV with one click. Upgrade to Pro for unlimited exports!",
    buttonText: "Learn More",
    buttonLink: "/dashboard/subscription",
    backgroundColor: "#1e293b",
    textColor: "#ffffff",
    position: "bottom-right",
    trigger: "time-delay",
    triggerValue: 15,
    pages: ["/search"],
    isActive: false,
    priority: 5,
    showOnMobile: false,
    showOnDesktop: true,
    dismissable: true,
    showOnce: true,
    createdAt: "2026-02-05",
  },
  {
    id: "6",
    name: "Social Proof Notification",
    type: "social-proof",
    title: "",
    message: "",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    accentColor: "#1d4ed8",
    position: "bottom-left",
    trigger: "time-delay",
    triggerValue: 8,
    pages: ["/", "/pricing"],
    isActive: true,
    priority: 6,
    showOnMobile: false,
    showOnDesktop: true,
    dismissable: true,
    showOnce: false,
    createdAt: "2026-02-05",
  },
  {
    id: "7",
    name: "Premium Upgrade Sidebar",
    type: "sidebar",
    title: "Unlock Full Access",
    message: "Get unlimited searches, full contact info, and CSV exports.",
    buttonText: "Upgrade to Pro",
    buttonLink: "/dashboard/subscription",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    accentColor: "#1d4ed8",
    position: "right",
    trigger: "scroll",
    triggerValue: 75,
    pages: ["/pricing"],
    isActive: false,
    priority: 7,
    showOnMobile: false,
    showOnDesktop: true,
    dismissable: true,
    showOnce: true,
    createdAt: "2026-02-05",
  },
];

const TRIGGER_OPTIONS = [
  { value: "page-load", label: "Page Load", icon: "fa-file" },
  { value: "scroll", label: "Scroll Depth", icon: "fa-arrows-down-to-line" },
  { value: "exit-intent", label: "Exit Intent", icon: "fa-arrow-right-from-bracket" },
  { value: "time-delay", label: "Time Delay", icon: "fa-clock" },
  { value: "click", label: "On Click", icon: "fa-mouse-pointer" },
];

const TYPE_OPTIONS = [
  { value: "banner", label: "Banner", icon: "fa-rectangle-wide", description: "Full-width banner" },
  { value: "modal", label: "Modal", icon: "fa-window-maximize", description: "Center popup" },
  { value: "toast", label: "Toast", icon: "fa-message", description: "Corner notification" },
  { value: "slide-in", label: "Slide-in", icon: "fa-arrow-right-to-arc", description: "Sliding panel" },
  { value: "fullscreen", label: "Fullscreen", icon: "fa-expand", description: "Full overlay" },
  { value: "floating-bar", label: "Floating Bar", icon: "fa-bars", description: "Sticky bar" },
  { value: "email-capture", label: "Email Capture", icon: "fa-envelope", description: "Lead form" },
  { value: "social-proof", label: "Social Proof", icon: "fa-users", description: "Activity feed" },
  { value: "countdown", label: "Countdown", icon: "fa-clock", description: "Timer popup" },
  { value: "sidebar", label: "Sidebar", icon: "fa-sidebar", description: "Side panel" },
];

const parsePages = (pages: any): string[] => {
  if (Array.isArray(pages)) return pages;
  if (typeof pages === 'string') {
    try { const parsed = JSON.parse(pages); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }
  return [];
};

const PoppinsManager = () => {
  const [poppins, setPoppins] = useState<Poppin[]>(DEFAULT_POPPINS);
  const [editingPoppin, setEditingPoppin] = useState<Poppin | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewPoppin, setPreviewPoppin] = useState<Poppin | null>(null);

  useEffect(() => {
    fetchPoppins();
  }, []);

  const fetchPoppins = async () => {
    const result = await adminAPI.poppins.getAll();
    if (result.success && result.data) {
      setPoppins(result.data);
    }
  };

  const toggleActive = async (id: string) => {
    const poppin = poppins.find(p => p.id === id);
    if (!poppin) return;

    const result = await adminAPI.poppins.update(id, { isActive: !poppin.isActive });
    if (result.success) {
      fetchPoppins();
      toast.success("Poppin status updated!");
    } else {
      toast.error("Failed to update status");
    }
  };

  const deletePoppin = async (id: string) => {
    if (confirm("Are you sure you want to delete this poppin?")) {
      const result = await adminAPI.poppins.delete(id);
      if (result.success) {
        fetchPoppins();
        toast.success("Poppin deleted!");
      } else {
        toast.error("Failed to delete poppin");
      }
    }
  };

  const savePoppin = async (poppin: Poppin) => {
    let result;
    if (poppins.find(p => p.id === poppin.id)) {
      result = await adminAPI.poppins.update(poppin.id, poppin);
    } else {
      // For creation, don't send the temporary ID
      const { id, ...data } = poppin;
      result = await adminAPI.poppins.create(data);
    }

    if (result.success) {
      fetchPoppins();
      setEditingPoppin(null);
      setIsCreating(false);
      toast.success("Poppin saved successfully!");
    } else {
      toast.error("Failed to save poppin");
    }
  };

  const createNewPoppin = (): Poppin => ({
    id: Date.now().toString(),
    name: "",
    type: "banner",
    title: "",
    message: "",
    buttonText: "",
    buttonLink: "",
    secondaryButtonText: "",
    secondaryButtonLink: "",
    imageUrl: "",
    backgroundColor: "#3b82f6",
    textColor: "#ffffff",
    accentColor: "#1d4ed8",
    position: "top",
    trigger: "page-load",
    pages: ["/"],
    isActive: false,
    priority: poppins.length + 1,
    showOnMobile: true,
    showOnDesktop: true,
    dismissable: true,
    showOnce: false,
    emailPlaceholder: "Enter your email",
    successMessage: "Thanks for subscribing!",
    startDate: "",
    endDate: "",
    countdownEnd: "",
    createdAt: new Date().toISOString().split("T")[0],
  });

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>
            Poppins Manager
          </h2>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Create and manage dynamic popups, banners, and notifications
          </p>
        </div>
        <button
          onClick={() => { setEditingPoppin(createNewPoppin()); setIsCreating(true); }}
          style={{
            padding: "12px 24px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <i className="fa-solid fa-plus"></i>
          Create Poppin
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Poppins", value: poppins.length, icon: "fa-layer-group", color: "#3b82f6" },
          { label: "Active", value: poppins.filter(p => p.isActive).length, icon: "fa-check-circle", color: "#22c55e" },
          { label: "Inactive", value: poppins.filter(p => !p.isActive).length, icon: "fa-pause-circle", color: "#94a3b8" },
          { label: "Banners", value: poppins.filter(p => p.type === "banner").length, icon: "fa-rectangle-wide", color: "#f59e0b" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{stat.label}</div>
              </div>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `${stat.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <i className={`fa-solid ${stat.icon}`} style={{ color: stat.color, fontSize: 18 }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Poppins List */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", margin: 0 }}>All Poppins</h3>
        </div>

        {poppins.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <i className="fa-solid fa-message" style={{ fontSize: 48, color: "#cbd5e1", marginBottom: 16 }}></i>
            <div style={{ color: "#64748b" }}>No poppins created yet</div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "12px 24px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Name</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Type</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Trigger</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Pages</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Status</th>
                <th style={{ padding: "12px 24px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#64748b" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {poppins.map((poppin) => (
                <tr key={poppin.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{poppin.name || "Untitled"}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{poppin.title}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      background: "#f1f5f9",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#475569",
                    }}>
                      <i className={`fa-solid ${TYPE_OPTIONS.find(t => t.value === poppin.type)?.icon}`}></i>
                      {poppin.type}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ fontSize: 13, color: "#64748b", textTransform: "capitalize" }}>
                      {poppin.trigger.replace("-", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {parsePages(poppin.pages).slice(0, 2).map((page: string, i: number) => (
                        <span key={i} style={{
                          padding: "2px 6px",
                          background: "#e0e7ff",
                          borderRadius: 4,
                          fontSize: 11,
                          color: "#4338ca",
                        }}>
                          {page}
                        </span>
                      ))}
                      {parsePages(poppin.pages).length > 2 && (
                        <span style={{ fontSize: 11, color: "#64748b" }}>+{parsePages(poppin.pages).length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <button
                      onClick={() => toggleActive(poppin.id)}
                      style={{
                        padding: "4px 12px",
                        background: poppin.isActive ? "#dcfce7" : "#f1f5f9",
                        color: poppin.isActive ? "#166534" : "#64748b",
                        border: "none",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {poppin.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button
                      onClick={() => setPreviewPoppin(poppin)}
                      style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 8 }}
                      title="Preview"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    <button
                      onClick={() => setEditingPoppin(poppin)}
                      style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 8 }}
                      title="Edit"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      onClick={() => deletePoppin(poppin.id)}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 8 }}
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editingPoppin && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 24,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            width: "100%",
            maxWidth: 700,
            maxHeight: "90vh",
            overflow: "auto",
          }}>
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              background: "#fff",
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                {isCreating ? "Create New Poppin" : "Edit Poppin"}
              </h3>
              <button
                onClick={() => { setEditingPoppin(null); setIsCreating(false); }}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Basic Info */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  Poppin Name
                </label>
                <input
                  type="text"
                  value={editingPoppin.name}
                  onChange={(e) => setEditingPoppin({ ...editingPoppin, name: e.target.value })}
                  placeholder="e.g., Summer Sale Banner"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Type Selection */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {TYPE_OPTIONS.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setEditingPoppin({ ...editingPoppin, type: type.value as any })}
                      style={{
                        padding: 12,
                        border: editingPoppin.type === type.value ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                        borderRadius: 8,
                        background: editingPoppin.type === type.value ? "#eff6ff" : "#fff",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <i className={`fa-solid ${type.icon}`} style={{
                        fontSize: 20,
                        color: editingPoppin.type === type.value ? "#3b82f6" : "#64748b",
                        display: "block",
                        marginBottom: 6,
                      }}></i>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingPoppin.title}
                    onChange={(e) => setEditingPoppin({ ...editingPoppin, title: e.target.value })}
                    placeholder="Popup title"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={editingPoppin.buttonText}
                    onChange={(e) => setEditingPoppin({ ...editingPoppin, buttonText: e.target.value })}
                    placeholder="e.g., Learn More"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  Message
                </label>
                <textarea
                  value={editingPoppin.message}
                  onChange={(e) => setEditingPoppin({ ...editingPoppin, message: e.target.value })}
                  placeholder="Popup message content..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Image Upload with Drag & Drop */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  <i className="fa-solid fa-image" style={{ marginRight: 6, color: "#6366F1" }}></i>
                  Popup Image
                </label>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#6366F1";
                    e.currentTarget.style.background = "#f0f0ff";
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.background = editingPoppin.imageUrl ? "transparent" : "#fafafa";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.background = "transparent";

                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith("image/")) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setEditingPoppin({ ...editingPoppin, imageUrl: event.target.result as string });
                          toast.success("Image uploaded successfully!");
                        }
                      };
                      reader.readAsDataURL(file);
                    } else {
                      toast.error("Please drop a valid image file");
                    }
                  }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setEditingPoppin({ ...editingPoppin, imageUrl: event.target.result as string });
                            toast.success("Image uploaded successfully!");
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  style={{
                    border: "2px dashed #d1d5db",
                    borderRadius: 12,
                    padding: editingPoppin.imageUrl ? 0 : 32,
                    textAlign: "center",
                    cursor: "pointer",
                    background: editingPoppin.imageUrl ? "transparent" : "#fafafa",
                    transition: "all 0.2s ease",
                    position: "relative",
                    overflow: "hidden",
                    minHeight: editingPoppin.imageUrl ? 150 : "auto",
                  }}
                >
                  {editingPoppin.imageUrl ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={editingPoppin.imageUrl}
                        alt="Popup preview"
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 10,
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPoppin({ ...editingPoppin, imageUrl: "" });
                        }}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                      <div style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        padding: "8px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                      }}>
                        <i className="fa-solid fa-arrows-rotate" style={{ marginRight: 6 }}></i>
                        Click or drag to replace image
                      </div>
                    </div>
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 32, color: "#9ca3af", marginBottom: 12, display: "block" }}></i>
                      <p style={{ margin: 0, fontSize: 14, color: "#6b7280", fontWeight: 500 }}>
                        Drag & drop an image here
                      </p>
                      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9ca3af" }}>
                        or click to browse files
                      </p>
                    </>
                  )}
                </div>

                {/* URL Input Alternative */}
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Or paste image URL:</p>
                  <input
                    type="text"
                    value={editingPoppin.imageUrl?.startsWith("data:") ? "" : (editingPoppin.imageUrl || "")}
                    onChange={(e) => setEditingPoppin({ ...editingPoppin, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #d1d5db",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>

              {/* Colors */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                    Background Color
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="color"
                      value={editingPoppin.backgroundColor}
                      onChange={(e) => setEditingPoppin({ ...editingPoppin, backgroundColor: e.target.value })}
                      style={{ width: 44, height: 38, border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }}
                    />
                    <input
                      type="text"
                      value={editingPoppin.backgroundColor}
                      onChange={(e) => setEditingPoppin({ ...editingPoppin, backgroundColor: e.target.value })}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                    Text Color
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="color"
                      value={editingPoppin.textColor}
                      onChange={(e) => setEditingPoppin({ ...editingPoppin, textColor: e.target.value })}
                      style={{ width: 44, height: 38, border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }}
                    />
                    <input
                      type="text"
                      value={editingPoppin.textColor}
                      onChange={(e) => setEditingPoppin({ ...editingPoppin, textColor: e.target.value })}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        border: "1px solid #d1d5db",
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Trigger */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 8 }}>
                  Trigger
                </label>
                <select
                  value={editingPoppin.trigger}
                  onChange={(e) => setEditingPoppin({ ...editingPoppin, trigger: e.target.value as any })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    fontSize: 14,
                    background: "#fff",
                  }}
                >
                  {TRIGGER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                {[
                  { key: "isActive", label: "Active" },
                  { key: "dismissable", label: "Dismissable" },
                  { key: "showOnce", label: "Show Once" },
                  { key: "showOnMobile", label: "Show on Mobile" },
                  { key: "showOnDesktop", label: "Show on Desktop" },
                ].map((opt) => (
                  <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={(editingPoppin as any)[opt.key]}
                      onChange={(e) => setEditingPoppin({ ...editingPoppin, [opt.key]: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: "#3b82f6" }}
                    />
                    <span style={{ fontSize: 14, color: "#374151" }}>{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Scheduling & Countdown */}
              <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 }}>
                  Scheduling & Countdown
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Start Date</label>
                    <input
                      type="datetime-local"
                      value={editingPoppin.startDate ? new Date(editingPoppin.startDate).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setEditingPoppin({ ...editingPoppin, startDate: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>End Date</label>
                    <input
                      type="datetime-local"
                      value={editingPoppin.endDate ? new Date(editingPoppin.endDate).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setEditingPoppin({ ...editingPoppin, endDate: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}
                    />
                  </div>
                </div>
                {editingPoppin.type === "countdown" && (
                  <div style={{ marginTop: 16 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Countdown Target Date</label>
                    <input
                      type="datetime-local"
                      value={editingPoppin.countdownEnd ? new Date(editingPoppin.countdownEnd).toISOString().slice(0, 16) : ""}
                      onChange={(e) => setEditingPoppin({ ...editingPoppin, countdownEnd: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}
                    />
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  onClick={() => { setEditingPoppin(null); setIsCreating(false); }}
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
                  onClick={() => savePoppin(editingPoppin)}
                  style={{
                    padding: "10px 24px",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <i className="fa-solid fa-check me-2"></i>
                  Save Poppin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPoppin && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: previewPoppin.position === "top" ? "flex-start" : previewPoppin.position === "bottom" ? "flex-end" : "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: previewPoppin.type === "banner" ? 0 : 24,
        }}>
          <div
            style={{
              background: previewPoppin.backgroundColor,
              color: previewPoppin.textColor,
              padding: previewPoppin.type === "banner" ? "16px 32px" : "32px",
              borderRadius: previewPoppin.type === "banner" ? 0 : 16,
              width: previewPoppin.type === "banner" ? "100%" : "auto",
              maxWidth: previewPoppin.type === "modal" ? 500 : "100%",
              textAlign: "center",
              position: "relative",
            }}
          >
            {previewPoppin.dismissable && (
              <button
                onClick={() => setPreviewPoppin(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: previewPoppin.textColor,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ×
              </button>
            )}
            <h4 style={{ margin: "0 0 8px 0", fontSize: previewPoppin.type === "banner" ? 16 : 20 }}>
              {previewPoppin.title}
            </h4>
            <p style={{ margin: "0 0 16px 0", opacity: 0.9, fontSize: 14 }}>
              {previewPoppin.message}
            </p>
            {previewPoppin.buttonText && (
              <button
                style={{
                  padding: "10px 24px",
                  background: previewPoppin.textColor,
                  color: previewPoppin.backgroundColor,
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {previewPoppin.buttonText}
              </button>
            )}
          </div>
          <button
            onClick={() => setPreviewPoppin(null)}
            style={{
              position: "fixed",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "12px 24px",
              background: "#fff",
              color: "#0f172a",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            Close Preview
          </button>
        </div>
      )}
    </div>
  );
};

export default PoppinsManager;
