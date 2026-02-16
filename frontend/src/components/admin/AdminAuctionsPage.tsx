"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/services/api";
import styles from "./admin.module.scss";

interface Auction {
  AAuctionID: number;
  APropertyID: number;
  AAuctionDateTime: string;
  AAuctionPlace: string;
  AAuctionCity: string;
  AAuctionState: string;
  AAuctionDescription: string;
  minimum_bid: string;
  status: string;
  property?: {
    id: number;
    PStreetNum: string;
    PStreetName: string;
    Pcity: string;
    Pstate: string;
    PStreetAddr1?: string;
    proaddress?: {
      id: number;
      PStreetNum: string;
      PStreetName: string;
      price: number;
      Pcity: string;
      PState: string;
    };
  };
}

const AdminAuctionsPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    APropertyID: "",
    AAuctionDateTime: "",
    AAuctionPlace: "",
    AAuctionCity: "",
    AAuctionState: "",
    minimum_bid: "",
    AAuctionDescription: ""
  });

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    APropertyID: "",
    AAuctionDateTime: "",
    AAuctionPlace: "",
    AAuctionCity: "",
    AAuctionState: "",
    minimum_bid: "",
    AAuctionDescription: ""
  });

  useEffect(() => {
    fetchAuctions();
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await adminAPI.properties.getAll();
      if (response.success && response.data) {
        setProperties(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch properties", err);
    }
  };

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.auctions.getAll();
      if (response.success && response.data) {
        setAuctions(response.data);
      } else {
        setError(response.error || "Failed to fetch auctions");
      }
    } catch (err) {
      setError("Failed to fetch auctions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.APropertyID || !createFormData.AAuctionDateTime || !createFormData.minimum_bid) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await adminAPI.auctions.create(createFormData);
      if (response.success) {
        alert("Auction created successfully");
        setShowCreateModal(false);
        setCreateFormData({
          APropertyID: "",
          AAuctionDateTime: "",
          AAuctionPlace: "",
          AAuctionCity: "",
          AAuctionState: "",
          minimum_bid: "",
          AAuctionDescription: ""
        });
        fetchAuctions();
      } else {
        alert(response.error || "Failed to create auction");
      }
    } catch (err) {
      console.error("Error creating auction:", err);
      alert("Failed to create auction");
    }
  };

  const handleEditClick = (auction: Auction) => {
    setEditFormData({
      id: auction.AAuctionID.toString(),
      APropertyID: auction.APropertyID.toString(),
      AAuctionDateTime: auction.AAuctionDateTime ? new Date(auction.AAuctionDateTime).toISOString().slice(0, 16) : "",
      AAuctionPlace: auction.AAuctionPlace || "",
      AAuctionCity: auction.AAuctionCity || "",
      AAuctionState: auction.AAuctionState || "",
      minimum_bid: auction.minimum_bid.toString(),
      AAuctionDescription: auction.AAuctionDescription || ""
    });
    setShowEditModal(true);
  };

  const handleUpdateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id || !editFormData.APropertyID || !editFormData.AAuctionDateTime || !editFormData.minimum_bid) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await adminAPI.auctions.update(editFormData.id, editFormData);
      if (response.success) {
        alert("Auction updated successfully");
        setShowEditModal(false);
        fetchAuctions();
      } else {
        alert(response.error || "Failed to update auction");
      }
    } catch (err) {
      console.error("Error updating auction:", err);
      alert("Failed to update auction");
    }
  };

  const handleDeleteAuction = async (auctionId: number | undefined) => {
    if (!auctionId) return;
    if (!confirm("Are you sure you want to delete this auction?")) return;
    try {
      const response = await adminAPI.auctions.delete(auctionId);
      if (response.success) {
        await fetchAuctions();
      } else {
        setError(response.error || "Failed to delete auction");
      }
    } catch (err) {
      setError("Failed to delete auction");
      console.error(err);
    }
  };

  const filteredAuctions = auctions.filter((auction) => {
    const prop = auction.property;
    const address = ((prop?.proaddress?.PStreetNum || "") + " " + (prop?.proaddress?.PStreetName || prop?.PStreetAddr1 || "") + " " + (prop?.Pcity || "")).toLowerCase();
    const matchesSearch = address.includes(searchTerm.toLowerCase()) ||
      (auction.AAuctionPlace || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || auction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price?: number | string) => {
    if (!price) return "N/A";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status?: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "active": return styles.badgeSuccess;
      case "upcoming": return styles.badgeWarning;
      case "ended": return styles.badgeDefault;
      case "cancelled": return styles.badgeDanger;
      default: return "";
    }
  };

  // Stats
  const totalAuctions = auctions.length;
  const activeAuctions = auctions.filter(a => a.status === "active").length;
  const upcomingAuctions = auctions.filter(a => a.status === "upcoming").length;

  return (
    <div className={styles.adminPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Auctions Management</h1>
          <p>Manage property auctions and bidding</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.btnPrimary}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px" }}
          >
            <i className="fa-solid fa-plus"></i>
            Create Auction
          </button>
          <button
            onClick={fetchAuctions}
            className={styles.btnSecondary}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px" }}
          >
            <i className="fa-solid fa-arrows-rotate"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.stats}>
        <div className={styles.statCard} style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", color: "#fff" }}>
          <h3>Total Auctions</h3>
          <p className={styles.statValue} style={{ color: "#fff" }}>{totalAuctions}</p>
        </div>
        <div className={styles.statCard} style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff" }}>
          <h3>Active</h3>
          <p className={styles.statValue} style={{ color: "#fff" }}>{activeAuctions}</p>
        </div>
        <div className={styles.statCard} style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff" }}>
          <h3>Upcoming</h3>
          <p className={styles.statValue} style={{ color: "#fff" }}>{upcomingAuctions}</p>
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>Create New Auction</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <i className="fa-solid fa-times" style={{ fontSize: 18 }}></i>
              </button>
            </div>
            <form onSubmit={handleCreateAuction} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Property <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  value={createFormData.APropertyID}
                  onChange={(e) => setCreateFormData({ ...createFormData, APropertyID: e.target.value })}
                  required
                >
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.proaddress ? `${p.proaddress.PStreetNum} ${p.proaddress.PStreetName}, ${p.proaddress.Pcity}` : `Property #${p.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Date & Time <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="datetime-local"
                    value={createFormData.AAuctionDateTime}
                    onChange={(e) => setCreateFormData({ ...createFormData, AAuctionDateTime: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Minimum Bid ($) <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="number"
                    value={createFormData.minimum_bid}
                    onChange={(e) => setCreateFormData({ ...createFormData, minimum_bid: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Auction Place</label>
                <input
                  type="text"
                  value={createFormData.AAuctionPlace}
                  onChange={(e) => setCreateFormData({ ...createFormData, AAuctionPlace: e.target.value })}
                  placeholder="e.g. County Courthouse Steps"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    value={createFormData.AAuctionCity}
                    onChange={(e) => setCreateFormData({ ...createFormData, AAuctionCity: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>State</label>
                  <input
                    type="text"
                    value={createFormData.AAuctionState}
                    onChange={(e) => setCreateFormData({ ...createFormData, AAuctionState: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={createFormData.AAuctionDescription}
                  onChange={(e) => setCreateFormData({ ...createFormData, AAuctionDescription: e.target.value })}
                  style={{ minHeight: "80px" }}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                >
                  Create Auction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>Edit Auction</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <i className="fa-solid fa-times" style={{ fontSize: 18 }}></i>
              </button>
            </div>
            <form onSubmit={handleUpdateAuction} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Property <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  value={editFormData.APropertyID}
                  onChange={(e) => setEditFormData({ ...editFormData, APropertyID: e.target.value })}
                  style={{ background: "#f1f5f9" }}
                  required
                  disabled
                >
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.proaddress ? `${p.proaddress.PStreetNum} ${p.proaddress.PStreetName}, ${p.proaddress.Pcity}` : `Property #${p.id}`}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Property cannot be changed once auction is created.</div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Date & Time <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="datetime-local"
                    value={editFormData.AAuctionDateTime}
                    onChange={(e) => setEditFormData({ ...editFormData, AAuctionDateTime: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Minimum Bid ($) <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="number"
                    value={editFormData.minimum_bid}
                    onChange={(e) => setEditFormData({ ...editFormData, minimum_bid: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Auction Place</label>
                <input
                  type="text"
                  value={editFormData.AAuctionPlace}
                  onChange={(e) => setEditFormData({ ...editFormData, AAuctionPlace: e.target.value })}
                  placeholder="e.g. County Courthouse Steps"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    value={editFormData.AAuctionCity}
                    onChange={(e) => setEditFormData({ ...editFormData, AAuctionCity: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>State</label>
                  <input
                    type="text"
                    value={editFormData.AAuctionState}
                    onChange={(e) => setEditFormData({ ...editFormData, AAuctionState: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={editFormData.AAuctionDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, AAuctionDescription: e.target.value })}
                  style={{ minHeight: "80px" }}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                >
                  Update Auction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div style={{ position: "relative", flex: 1 }}>
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
            className={styles.searchInput}
            placeholder="Search by address or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
          style={{ width: 200 }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="ended">Ended</option>
          <option value="cancelled">Cancelled</option>
        </select>
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
          Loading auctions...
        </div>
      ) : (
        /* Auctions Table */
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Property</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Min Bid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuctions.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    No auctions found
                  </td>
                </tr>
              ) : (
                filteredAuctions.slice(0, 50).map((auction, idx) => {
                  const statusClass = getStatusColor(auction.status);
                  const prop = auction.property;
                  return (
                    <tr key={auction.AAuctionID}>
                      <td>{auction.AAuctionID}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {prop ? (
                            (prop.proaddress?.PStreetNum || "") + " " + (prop.proaddress?.PStreetName || prop.PStreetAddr1 || "Unnamed Street")
                          ) : (
                            <span style={{ color: "#94a3b8" }}>No property linked</span>
                          )}
                        </div>
                        {prop?.Pcity && (
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            {prop.Pcity}, {prop.Pstate}
                          </div>
                        )}
                      </td>
                      <td>{formatDate(auction.AAuctionDateTime)}</td>
                      <td>
                        {auction.AAuctionPlace || "-"}
                        {auction.AAuctionCity && (
                          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                            {auction.AAuctionCity}, {auction.AAuctionState}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: "#1e293b" }}>{formatPrice(auction.minimum_bid)}</td>
                      <td>
                        <span className={`${styles.badge} ${statusClass}`}>
                          {auction.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <a
                            href={"/property/" + auction.APropertyID}
                            target="_blank"
                            className={styles.btnView}
                            title="View Property"
                            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, padding: 0 }}
                          >
                            <i className="fa-solid fa-eye" style={{ fontSize: 12 }}></i>
                          </a>
                          <button
                            onClick={() => handleEditClick(auction)}
                            className={styles.btnEdit}
                            title="Edit"
                            style={{ width: 32, height: 32, padding: 0 }}
                          >
                            <i className="fa-solid fa-pen" style={{ fontSize: 12 }}></i>
                          </button>
                          <button
                            onClick={() => handleDeleteAuction(auction.AAuctionID)}
                            className={styles.btnDelete}
                            title="Delete"
                            style={{ width: 32, height: 32, padding: 0 }}
                          >
                            <i className="fa-solid fa-trash" style={{ fontSize: 12 }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Showing {Math.min(filteredAuctions.length, 50)} of {filteredAuctions.length} auctions
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuctionsPage;
