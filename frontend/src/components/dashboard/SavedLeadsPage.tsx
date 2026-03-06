"use client";
import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/modules/UserSearchLayout_Module";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/search/styles/dashboard.module.scss";
import {
  getSavedLeads,
  removeSavedLead,
  SavedLead
} from "../../services/savedLeadsService";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const SavedLeadsPage = () => {
  const { canAccessPremium, isTrialActive } = useAuth();
  const isPro = canAccessPremium() || isTrialActive();

  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved leads on mount
  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      const data = await getSavedLeads();
      setLeads(data);
      setIsLoading(false);
    };
    fetchLeads();
  }, []);

  // Listen for real-time updates from other components
  useEffect(() => {
    const handleUpdate = (e: CustomEvent<SavedLead[]>) => {
      setLeads(e.detail);
    };

    window.addEventListener("savedLeadsUpdated", handleUpdate as EventListener);
    return () => {
      window.removeEventListener("savedLeadsUpdated", handleUpdate as EventListener);
    };
  }, []);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemove = async (id: number) => {
    const success = await removeSavedLead(id);
    if (success) {
      setLeads(prev => prev.filter(l => l.id !== id));
    }
  };

  // Masking helpers for free users
  const maskAddress = (address: string) => {
    if (isPro) return address;
    const parts = address.split(" ");
    return parts[0].replace(/\d/g, "*") + " " + parts.slice(1).join(" ");
  };

  return (
    <DashboardShell title="Saved Leads" subtitle="Your saved properties for quick access">
      {/* Search Bar */}
      <div className={styles.search_container}>
        <div className={styles.search_bar}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search saved leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.search_actions}>
          <a href="/dashboard/export" className={styles.btn_secondary}>
            <i className="fa-solid fa-download"></i>
            Export All
          </a>
        </div>
      </div>

      {/* Results Header */}
      <div className={styles.results_header}>
        <div className={styles.results_count}>
          <strong>{filteredLeads.length}</strong> saved leads
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 12 }}></i>
          <p>Loading saved leads...</p>
        </div>
      ) : filteredLeads.length > 0 ? (
        <div className={styles.table_container}>
          <table className={styles.table}>
            <thead className={styles.table_header}>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Details</th>
                <th>Value</th>
                <th>Equity</th>
                <th>Saved On</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const equity = lead.appraised - lead.debt;
                const equityPercent = Math.round((equity / lead.appraised) * 100);

                return (
                  <tr key={lead.id} className={styles.table_row} onClick={() => window.location.href = `/property/${lead.id}`} style={{ cursor: "pointer" }}>
                    <td>
                      <div className={styles.table_address}>
                        <img src={lead.image} alt="" className={styles.address_image} />
                        <div className={styles.address_text}>
                          <span className={styles.address_line}>
                            {maskAddress(lead.address)}
                            {!isPro && (
                              <i
                                className="fa-solid fa-lock"
                                style={{ marginLeft: 6, fontSize: 9, color: "#9CA3AF" }}
                                title="Upgrade to see full address"
                              ></i>
                            )}
                          </span>
                          <span className={styles.address_city}>
                            {lead.city}, {lead.state} {lead.zip}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${styles.badge_primary}`}>
                        {lead.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#4B5563", fontSize: 13 }}>
                        {lead.beds} bd • {lead.baths} ba • {lead.sqft?.toLocaleString()} sqft
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(lead.appraised)}</span>
                    </td>
                    <td>
                      <div className={styles.table_equity}>
                        <span className={styles.equity_value}>{formatCurrency(equity)}</span>
                        <span className={styles.equity_percent}>{equityPercent}% equity</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>{lead.savedOn}</span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className={styles.table_actions}>
                        <a href={`/property/${lead.id}`} className={styles.btn_icon} title="View details">
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                        <button
                          className={styles.btn_icon}
                          title="Remove"
                          onClick={() => handleRemove(lead.id)}
                          style={{ color: "#EF4444" }}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.empty_state}>
          <div className={styles.empty_icon}>
            <i className="fa-regular fa-bookmark"></i>
          </div>
          <h3>No saved leads yet</h3>
          <p>
            When you save leads from the search page, they will appear here for quick access.
          </p>
          <a href="/search" className={styles.btn_primary}>
            Start Searching
          </a>
        </div>
      )}
    </DashboardShell>
  );
};

export default SavedLeadsPage;
