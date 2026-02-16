"use client";
import React from "react";
import Link from "next/link";
import styles from "../styles/dashboard.module.scss";
import type { Lead } from "./LeadTableView";

interface LeadGridProps {
  leads: Lead[];
  onToggleSave: (id: number) => void;
  getAddress: (lead: Lead) => string;
  userPlan: "Free" | "Premium";
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

// Mask owner data for free users
const maskOwnerName = (name: string | undefined, isPremium: boolean): string => {
  if (!name) return "---";
  if (isPremium) return name;
  const parts = name.split(" ");
  return parts.map(part => part[0] + "****").join(" ");
};

const LeadGridView: React.FC<LeadGridProps> = ({
  leads,
  onToggleSave,
  getAddress,
  userPlan,
}) => {
  const isPremium = userPlan === "Premium";

  if (leads.length === 0) {
    return (
      <div className={styles.empty_state}>
        <div className={styles.empty_icon}>
          <i className="fa-solid fa-house-circle-xmark"></i>
        </div>
        <h3>No properties found</h3>
        <p>Try adjusting your filters or search query to find more leads.</p>
        <button className={styles.btn_primary}>Clear Filters</button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.grid_container}>
        {leads.map((lead) => {
          const equity = lead.appraised - lead.debt;
          const equityPercent = Math.round((equity / lead.appraised) * 100);

          return (
            <Link href={`/property/${lead.id}`} key={lead.id} className={styles.grid_card}>
              {/* Image */}
              <div className={styles.card_image}>
                <img src={lead.image} alt={getAddress(lead)} />

                <span className={`${styles.card_badge} ${styles.badge} ${styles.badge_primary}`}>
                  {lead.type}
                </span>

                <button
                  className={`${styles.card_save} ${lead.saved ? styles.saved : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSave(lead.id);
                  }}
                >
                  <i className={lead.saved ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                </button>

                {/* Lock overlay for free users */}
                {!isPremium && (
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                    padding: "24px 12px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <i className="fa-solid fa-lock" style={{ color: "#fff", fontSize: 10 }}></i>
                    <span style={{ color: "#fff", fontSize: 10, fontWeight: 500 }}>
                      Upgrade for full details
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={styles.card_content}>
                <h3 className={styles.card_title}>
                  {getAddress(lead)}
                  {!isPremium && (
                    <i
                      className="fa-solid fa-lock"
                      style={{
                        marginLeft: 6,
                        fontSize: 10,
                        color: "#9CA3AF"
                      }}
                    ></i>
                  )}
                </h3>
                <p className={styles.card_location}>
                  {lead.city}, {lead.state} {lead.zip}
                </p>

                {/* Owner info */}
                <div style={{
                  marginTop: 8,
                  padding: "8px 0",
                  borderTop: "1px solid #E5E7EB",
                  borderBottom: "1px solid #E5E7EB"
                }}>
                  <span style={{ fontSize: 11, color: "#6B7280", display: "block", marginBottom: 2 }}>
                    Owner
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                    {maskOwnerName(lead.ownerName || "John Smith", isPremium)}
                    {!isPremium && (
                      <i
                        className="fa-solid fa-lock"
                        style={{
                          marginLeft: 4,
                          fontSize: 9,
                          color: "#9CA3AF"
                        }}
                      ></i>
                    )}
                  </span>
                </div>

                <div className={styles.card_stats}>
                  <div className={styles.stat}>
                    <span className={styles.stat_label}>Value</span>
                    <span className={styles.stat_value}>
                      {formatCurrency(lead.appraised)}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.stat_label}>Equity</span>
                    <span className={styles.stat_value} style={{ color: "#10B981" }}>
                      {formatCurrency(equity)}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.stat_label}>Details</span>
                    <span className={styles.stat_value}>
                      {lead.beds}bd/{lead.baths}ba
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Upgrade prompt for free users */}
      {!isPremium && (
        <div style={{
          background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
          borderRadius: 8,
          padding: "12px 16px",
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid #BFDBFE"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className="fa-solid fa-lock" style={{ color: "#2563EB" }}></i>
            <span style={{ fontSize: 13, color: "#1E40AF", fontWeight: 500 }}>
              Some data is hidden. Upgrade to Premium to see full addresses, owner contacts, and more.
            </span>
          </div>
          <Link
            href="/dashboard/subscription"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none"
            }}
          >
            Upgrade Now
          </Link>
        </div>
      )}
    </>
  );
};

export default LeadGridView;
