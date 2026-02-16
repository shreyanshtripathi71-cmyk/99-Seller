"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/services/api";
import PropertyFormByMotiveType from "./PropertyFormByMotiveType";
import { getMotiveTypeConfig } from "@/config/motiveTypeConfig";

interface Property {
  id: number;
  local_image_path?: string;
  motive_type_id?: number;
  motiveType?: {
    code: string;
    name: string;
  };
  proaddress?: {
    PStreetNum?: string;
    PStreetName?: string;
    Pcity?: string;
    PState?: string;
    Pzip?: string;
    beds?: string;
    baths?: string;
    price?: number | string;
    proptype?: string;
    square_feet?: number;
    trusteename?: string;
    trusteephone?: string;
    trusteeaddress?: string;
    trusteeemail?: string;
    auctionplace?: string;
    auction_amt?: number;
    owner_current_state?: string;
    owner_mailing_address?: string;
  };
  owners?: Array<{
    OFirstName?: string;
    OLastName?: string;
  }>;
  status?: string;
  createdAt?: string;
  // Motive specific arrays/objects
  trustee?: any;
  auctions?: any[];
  loans?: any[];
  probates?: any[];
  violations?: any[];
  evictions?: any[];
  divorces?: any[];
  taxLiens?: any[];
  auctioneer?: any;
}

const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [motiveTypes, setMotiveTypes] = useState<any[]>([]);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchProperties();
    fetchMotiveTypes();
  }, []);

  const fetchMotiveTypes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/admin/motive-types`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('99sellers_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMotiveTypes(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch motive types", err);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.properties.getAll();
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        setError(response.error || "Failed to fetch properties");
      }
    } catch (err) {
      setError("Failed to fetch properties");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (property: Property) => {
    try {
      const response = await adminAPI.properties.getById(property.id);
      if (response.success && response.data) {
        setEditingProperty({
          ...response.data,
          // Ensure nested objects exist for form
          proaddress: response.data.proaddress || {},
          owners: response.data.owners || [],
          loans: response.data.loans || [],
          auctions: response.data.auctions || [],
          violations: response.data.violations || [],
          probates: response.data.probates || [],
          evictions: response.data.evictions || [],
          divorces: response.data.divorces || [],
          taxLiens: response.data.taxLiens || []
        });
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch property details", err);
    }
  };

  const handleCreateClick = () => {
    const newProperty: any = {
      id: 0, // 0 indicates new
      proaddress: { proptype: 'Single Family' },
      motive_type_id: motiveTypes[0]?.id || 1,
      motiveType: motiveTypes[0] || { code: 'UNK', name: 'Unknown' },
      owners: [{ OFirstName: '', OLastName: '' }],
      auctions: [],
      loans: [],
      violations: [],
      probates: [],
      evictions: [],
      divorces: [],
      taxLiens: []
    };
    setEditingProperty(newProperty);
    setIsModalOpen(true);
  };

  const handleSaveProperty = async () => {
    if (!editingProperty) return;
    setSaving(true);
    try {
      // Prepare payload to match backend validation requirements
      const payload = { ...editingProperty };

      // Merge trustee info into proaddress if present
      if (payload.trustee) {
        payload.proaddress = {
          ...(payload.proaddress || {}),
          trusteename: payload.trustee.TTrusteeName || payload.proaddress?.trusteename,
          trusteephone: payload.trustee.TTrusteePhone || payload.proaddress?.trusteephone,
          trusteeaddress: payload.trustee.TTrusteeAddress || payload.proaddress?.trusteeaddress,
          trusteeemail: payload.trustee.TTrusteeEmail || payload.proaddress?.trusteeemail
        };
      }

      // Ensure arrays are valid for validation if they exist but are empty or just need to be ensured
      // (The backend validator checks existence of array, frontend state maintains it)

      const response = editingProperty.id === 0
        ? await adminAPI.properties.create(payload)
        : await adminAPI.properties.update(editingProperty.id, payload);
      if (response.success) {
        await fetchProperties();
        setIsModalOpen(false);
        setEditingProperty(null);
        if (response.warnings && response.warnings.length > 0) {
          alert(`Saved with warnings:\n${response.warnings.join('\n')}`);
        }
      } else {
        alert(response.error || "Failed to save property");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      const response = await adminAPI.properties.delete(propertyId);
      if (response.success) {
        await fetchProperties();
      } else {
        setError(response.error || "Failed to delete property");
      }
    } catch (err) {
      setError("Failed to delete property");
      console.error(err);
    }
  };

  const getPropertyImage = (property: Property) => {
    if (property.local_image_path) {
      return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/uploads/${property.local_image_path}`;
    }
    // Robust SVG fallback
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4YiI+PHBhdGggZD0iTTEyIDNMMiAxMmgzdjhoNnYtNmgydjZoNnYtOGgzTDEyIDN6Ii8+PC9zdmc+';
  };

  const handleMotiveFieldChange = (field: string, value: any, section?: string, index: number = 0) => {
    if (!editingProperty) return;

    const updatedProperty = { ...editingProperty };

    if (section) {
      // Handle array or nested object updates
      if (Array.isArray(updatedProperty[section as keyof Property])) {
        const array = [...(updatedProperty[section as keyof Property] as any[])];
        if (!array[index]) array[index] = {};
        array[index] = { ...array[index], [field]: value };
        (updatedProperty as any)[section] = array;
      } else {
        // Handle object update (e.g. trustee)
        (updatedProperty as any)[section] = {
          ...(updatedProperty[section as keyof Property] || {}),
          [field]: value
        };
      }
    } else {
      // Direct property update doesn't usually happen via this helper, but supported
      (updatedProperty as any)[field] = value;
    }

    setEditingProperty(updatedProperty);
  };

  const filteredProperties = properties.filter((property) => {
    const addr = property.proaddress;
    const address = ((addr?.PStreetNum || "") + " " + (addr?.PStreetName || "") + " " + (addr?.Pcity || "")).toLowerCase();
    const ownerName = (property.owners?.[0] ? property.owners[0].OFirstName + " " + property.owners[0].OLastName : "").toLowerCase();

    const matchesSearch = address.includes(searchTerm.toLowerCase()) || ownerName.includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || addr?.proptype === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price?: string | number) => {
    if (!price) return "N/A";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const propertyTypes = ["all", "Single Family", "Multi Family", "Condo", "Townhouse", "Commercial", "Land"];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 16 : 0
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color: "#0f172a", margin: 0, marginBottom: 8 }}>
              Properties Management
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: 15 }}>
              Manage all properties in the system ({properties.length} total)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, width: isMobile ? "100%" : "auto" }}>
            <button
              onClick={handleCreateClick}
              style={{
                flex: 1,
                padding: "10px 20px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <i className="fa-solid fa-plus"></i>
              Add Property
            </button>
            <button
              onClick={fetchProperties}
              style={{
                flex: 1,
                padding: "10px 20px",
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <i className="fa-solid fa-arrows-rotate"></i>
              Refresh
            </button>
          </div>
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

      {/* Filters */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 200px",
          gap: 16
        }}>
          <div style={{ position: "relative" }}>
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
              placeholder="Search by address, owner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "12px 16px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {propertyTypes.map(type => (
              <option key={type} value={type}>
                {type === "all" ? "All Property Types" : type}
              </option>
            ))}
          </select>
        </div>
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
          Loading properties...
        </div>
      ) : (
        /* Properties Table */
        <div style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>ID</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Address/Motive</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Owner</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Beds/Baths</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Motive Detail</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Price</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                      No properties found
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((property, idx) => {
                    const addr = property.proaddress;
                    const primaryOwner = property.owners?.[0];
                    const motiveCode = property.motiveType?.code || "UNK";
                    const motiveConfig = getMotiveTypeConfig(motiveCode);

                    return (
                      <tr key={property.id} style={{ borderTop: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b" }}>{property.id}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#0f172a", fontWeight: 500 }}>
                          {addr?.PStreetNum} {addr?.PStreetName}<br />
                          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>{addr?.Pcity}, {addr?.PState} {addr?.Pzip}</span>
                          {motiveConfig && (
                            <div style={{ marginTop: 4 }}>
                              <span style={{
                                fontSize: 11, padding: '2px 6px',
                                borderRadius: 4, background: motiveConfig.color + '20', color: motiveConfig.color
                              }}>
                                {motiveConfig.name}
                              </span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b" }}>
                          {primaryOwner ? `${primaryOwner.OFirstName} ${primaryOwner.OLastName}` : "-"}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#64748b" }}>
                          {addr?.beds || "0"} / {addr?.baths || "0"}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13 }}>
                          {(() => {
                            const motiveCode = property.motiveType?.code || "UNK";
                            const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : "N/A";

                            switch (motiveCode) {
                              case 'AUC':
                              case 'FOR':
                                return <span><i className="fa-solid fa-gavel" style={{ fontSize: 11, marginRight: 4, color: '#ef4444' }}></i> {formatDate(property.auctions?.[0]?.AAuctionDateTime)}</span>;
                              case 'PRE':
                                return <span><i className="fa-solid fa-clock" style={{ fontSize: 11, marginRight: 4, color: '#f59e0b' }}></i> {formatDate(property.loans?.[0]?.lis_pendens_date)}</span>;
                              case 'PRO':
                                return <span><i className="fa-solid fa-file-signature" style={{ fontSize: 11, marginRight: 4, color: '#10b981' }}></i> {formatDate(property.probates?.[0]?.date_of_death)}</span>;
                              case 'COD':
                                return <span><i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 11, marginRight: 4, color: '#6366f1' }}></i> {formatDate(property.violations?.[0]?.remediation_deadline)}</span>;
                              case 'EVI':
                                return <span><i className="fa-solid fa-door-open" style={{ fontSize: 11, marginRight: 4, color: '#8b5cf6' }}></i> {formatDate(property.evictions?.[0]?.court_date)}</span>;
                              case 'DIV':
                                return <span><i className="fa-solid fa-user-slash" style={{ fontSize: 11, marginRight: 4, color: '#ec4899' }}></i> {formatDate(property.divorces?.[0]?.legal_filing_date)}</span>;
                              case 'TAX':
                                return <span><i className="fa-solid fa-file-invoice-dollar" style={{ fontSize: 11, marginRight: 4, color: '#f59e0b' }}></i> Paid: {property.taxLiens?.[0]?.last_tax_year_paid || "N/A"}</span>;
                              case 'OUT':
                                return <span><i className="fa-solid fa-map-location-dot" style={{ fontSize: 11, marginRight: 4, color: '#3b82f6' }}></i> {property.proaddress?.owner_current_state || "Out of State"}</span>;
                              default:
                                return <span style={{ color: '#94a3b8' }}>No Detail</span>;
                            }
                          })()}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            padding: "4px 10px",
                            background: "#dbeafe",
                            color: "#1d4ed8",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 500,
                          }}>
                            {addr?.proptype || "Unknown"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#0f172a", fontWeight: 600 }}>
                          {formatPrice(addr?.price)}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => handleEditClick(property)}
                              style={{
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#eff6ff",
                                color: "#3b82f6",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                              }}
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen-to-square" style={{ fontSize: 12 }}></i>
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(property.id)}
                              style={{
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#fef2f2",
                                color: "#ef4444",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                              }}
                              title="Delete"
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
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Showing {filteredProperties.length} properties
            </span>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {isModalOpen && editingProperty && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 24
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            width: "100%",
            maxWidth: 800,
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
          }}>
            <div style={{ padding: 24, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>Edit Property #{editingProperty.id}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 20 }}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Basic Details */}
                <div style={{ gridColumn: "span 2" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 16 }}>Basic Information</h3>
                </div>

                {/* Image Upload */}
                <div style={{ gridColumn: "span 2", marginBottom: 16, padding: 16, border: "1px dashed #cbd5e1", borderRadius: 8 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 8 }}>Property Image</label>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {editingProperty.local_image_path && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ width: 80, height: 80, position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                          <img
                            src={getPropertyImage(editingProperty)}
                            alt="Property"
                            loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4YiI+PHBhdGggZD0iTTEyIDNMMiAxMmgzdjhoNnYtNmgydjZoNnYtOGgzTDEyIDN6Ii8+PC9zdmc+';
                            }}
                          />
                        </div>
                        <button
                          onClick={async () => {
                            if (!confirm("Remove this image?")) return;
                            try {
                              const res = await adminAPI.properties.deleteImage(editingProperty.id);
                              if (res.success) {
                                setEditingProperty(prev => prev ? ({ ...prev, local_image_path: undefined }) : null);
                                await fetchProperties();
                              } else {
                                alert("Failed to remove image: " + res.error);
                              }
                            } catch (err) {
                              console.error(err);
                              alert("Failed to remove image");
                            }
                          }}
                          style={{
                            padding: "4px 8px",
                            background: "#fef2f2",
                            color: "#ef4444",
                            border: "1px solid #fee2e2",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 500,
                            cursor: "pointer"
                          }}
                        >
                          <i className="fa-solid fa-trash-can" style={{ marginRight: 4 }}></i>
                          Remove
                        </button>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (!confirm(`Upload ${file.name}? This will verify immediately.`)) return;

                            try {
                              const res = await adminAPI.properties.uploadImage(editingProperty.id, file);
                              if (res.success) {
                                alert("Image uploaded successfully");
                                setEditingProperty(prev => prev ? ({ ...prev, local_image_path: res.data.imagePath }) : null);
                                await fetchProperties(); // Refresh list to update any thumbnails if we add them later
                              } else {
                                alert("Upload failed: " + res.error);
                              }
                            } catch (err: any) {
                              console.error(err);
                              alert(`Upload failed: ${err.message || err}`);
                            }
                          }
                        }}
                        style={{ fontSize: 13 }}
                      />
                      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Select a file to upload immediately.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Type</label>
                  <select
                    value={editingProperty.proaddress?.proptype || ""}
                    onChange={(e) => setEditingProperty({
                      ...editingProperty,
                      proaddress: { ...editingProperty.proaddress, proptype: e.target.value }
                    })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                  >
                    {propertyTypes.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Price</label>
                  <input
                    type="number"
                    value={editingProperty.proaddress?.price || ""}
                    onChange={(e) => setEditingProperty({
                      ...editingProperty,
                      proaddress: { ...editingProperty.proaddress, price: e.target.value }
                    })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Beds</label>
                  <input
                    type="text"
                    value={editingProperty.proaddress?.beds || ""}
                    onChange={(e) => setEditingProperty({
                      ...editingProperty,
                      proaddress: { ...editingProperty.proaddress, beds: e.target.value }
                    })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Baths</label>
                  <input
                    type="text"
                    value={editingProperty.proaddress?.baths || ""}
                    onChange={(e) => setEditingProperty({
                      ...editingProperty,
                      proaddress: { ...editingProperty.proaddress, baths: e.target.value }
                    })}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                  />
                </div>

                {/* Motive Type Selection */}
                <div style={{ gridColumn: "span 2", marginTop: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 16 }}>Motive Information</h3>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Motive Type</label>
                    <select
                      value={editingProperty.motive_type_id || ""}
                      onChange={(e) => {
                        const typeId = parseInt(e.target.value);
                        const type = motiveTypes.find(t => t.id === typeId);
                        setEditingProperty({
                          ...editingProperty,
                          motive_type_id: typeId,
                          motiveType: type
                        });
                      }}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                    >
                      <option value="">Select Motive Type</option>
                      {motiveTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Form Fields based on Motive Type */}
                  {editingProperty.motiveType?.code && (
                    <PropertyFormByMotiveType
                      motiveCode={editingProperty.motiveType.code}
                      data={editingProperty}
                      onChange={handleMotiveFieldChange}
                    />
                  )}
                </div>

              </div>
            </div>

            <div style={{ padding: 24, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ padding: "10px 20px", background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProperty}
                disabled={saving}
                style={{
                  padding: "10px 20px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertiesPage;
