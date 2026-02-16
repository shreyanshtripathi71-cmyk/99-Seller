"use client";
import React from "react";
import Link from "next/link";
import styles from "../styles/dashboard.module.scss";

export interface Lead {
  id: number;
  image: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  appraised: number;
  debt: number;
  sqft: number;
  year: number;
  auctionDate: string;
  publishedOn: string;
  saved: boolean;
  // Owner information
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  // Motive specific data
  motiveTypeCode?: string;
  motiveType?: {
    code: string;
    name: string;
  };
  auctions?: any[];
  loans?: any[];
  probates?: any[];
  violations?: any[];
  evictions?: any[];
  divorces?: any[];
  taxLiens?: any[];
  proaddress?: any;
}

interface LeadTableProps {
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

const maskPhone = (phone: string | undefined, isPremium: boolean): string => {
  if (!phone) return "---";
  if (isPremium) return phone;
  return "(***) ***-" + phone.slice(-4);
};

const maskEmail = (email: string | undefined, isPremium: boolean): string => {
  if (!email) return "---";
  if (isPremium) return email;
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return "****@****.com";
  return email[0] + "****" + email.substring(atIndex);
};

const LeadTableView: React.FC<LeadTableProps> = ({
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
    <div className="responsive-table-outer">
      <table className={styles.table}>
        <thead className={styles.table_header}>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Owner Info</th>
            <th>Details</th>
            <th>Equity</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const equity = lead.appraised - lead.debt;
            const equityPercent = Math.round((equity / lead.appraised) * 100);

            return (
              <tr key={lead.id} className={styles.table_row} onClick={() => window.location.href = `/property/${lead.id}`} style={{ cursor: "pointer" }}>
                {/* Property */}
                <td>
                  <div className={styles.table_address}>
                    <img
                      src={lead.image || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4YiI+PHBhdGggZD0iTTEyIDNMMiAxMmgzdjhoNnYtNmgydjZoNnYtOGgzTDEyIDN6Ii8+PC9zdmc+'}
                      alt=""
                      loading="lazy"
                      className={styles.address_image}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4YiI+PHBhdGggZD0iTTEyIDNMMiAxMmgzdjhoNnYtNmgydjZoNnYtOGgzTDEyIDN6Ii8+PC9zdmc+';
                      }}
                    />
                    <div className={styles.address_text}>
                      <span className={styles.address_line}>
                        {getAddress(lead)}
                        {!isPremium && (
                          <i
                            className="fa-solid fa-lock"
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              color: "#9CA3AF",
                              verticalAlign: "middle"
                            }}
                            title="Upgrade to Premium to see full address"
                          ></i>
                        )}
                      </span>
                      <span className={styles.address_city}>
                        {lead.city}, {lead.state} {lead.zip}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td>
                  <span className={`${styles.badge} ${styles.badge_primary}`}>
                    {lead.type}
                  </span>
                </td>

                {/* Owner Info */}
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontWeight: 500, color: "var(--notion-text-primary)", fontSize: 13 }}>
                      {maskOwnerName(lead.ownerName || "John Smith", isPremium)}
                      {!isPremium && (
                        <i
                          className="fa-solid fa-lock"
                          style={{
                            marginLeft: 6,
                            fontSize: 9,
                            color: "#9CA3AF"
                          }}
                        ></i>
                      )}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--notion-text-secondary)" }}>
                      {maskPhone(lead.ownerPhone || "(555) 123-4567", isPremium)}
                    </span>
                  </div>
                </td>

                {/* Details */}
                <td>
                  <span style={{ color: "var(--notion-text-secondary)", fontSize: 13 }}>
                    {lead.beds} bd • {lead.baths} ba • {lead.sqft.toLocaleString()} sqft
                  </span>
                </td>

                {/* Equity */}
                <td>
                  <div className={styles.table_equity}>
                    <span className={styles.equity_value}>
                      {formatCurrency(equity)}
                    </span>
                    <span className={styles.equity_percent}>
                      {equityPercent}% equity
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td onClick={(e) => e.stopPropagation()}>
                  <div className={styles.table_actions}>
                    <button
                      className={`${styles.save_btn} ${lead.saved ? styles.saved : ""}`}
                      onClick={() => onToggleSave(lead.id)}
                      title={lead.saved ? "Remove from saved" : "Save lead"}
                    >
                      <i className={lead.saved ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                    </button>
                    <Link href={`/property/${lead.id}`} className={styles.btn_icon} title="View details">
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Upgrade prompt for free users */}
      {
        !isPremium && (
          <div style={{
            background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
            borderRadius: 8,
            padding: "clamp(1rem, 3vw, 1.5rem)",
            marginTop: 16,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
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
                textDecoration: "none",
                textAlign: "center",
                flex: "1 1 auto"
              }}
            >
              Upgrade Now
            </Link>
          </div>
        )
      }
    </div >
  );
};

export default LeadTableView;
