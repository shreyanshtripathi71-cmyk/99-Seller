// Property Details Page — Redesigned to match Dashboard Animation
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/modules/UserSearchLayout_Module";
import { ProtectedRoute } from "@/modules/CommonUI_Module";
import { useAuth } from "@/context/AuthContext";
import { toggleSavedLead } from "@/services/savedLeadsService";
import { FeatureGatePopup } from "@/modules/CommonUI_Module";
import axios from "axios";
import { toast } from "react-toastify";
import { getMotiveTypeConfig } from "@/config/motiveTypeConfig";
import {
  TrusteeSection,
  AuctionSection,
  LoanSection,
  ProbateSection,
  ViolationSection,
  EvictionSection,
  DivorceSection,
  TaxLienSection,
  OutOfStateSection
} from "@/components/property/PropertyMotiveSections";
import ForeclosureDetailView from "@/components/property/ForeclosureDetailView";
import PreforeclosureDetailView from "@/components/property/PreforeclosureDetailView";
import PropertyOverviewSection from "@/components/property/PropertyOverviewSection";
import OwnerDetailsSection from "@/components/property/OwnerDetailsSection";
import LoanDetailsSection from "@/components/property/LoanDetailsSection";
import AuctionDetailView from "@/components/property/AuctionDetailView";
import ProbateDetailView from "@/components/property/ProbateDetailView";
import ViolationDetailView from "@/components/property/ViolationDetailView";
import EvictionDetailView from "@/components/property/EvictionDetailView";
import DivorceDetailView from "@/components/property/DivorceDetailView";
import OutOfStateDetailView from "@/components/property/OutOfStateDetailView";
import TaxDetailView from "@/components/property/TaxDetailView";

// Extended Lead interface with all details
export interface PropertyDetails {
  id: number;
  type: string;
  status?: string;
  publishedOn: string;
  saved?: boolean;
  motiveTypeCode?: string;
  motiveType?: {
    id: number;
    code: string;
    name: string;
  };
  property: {
    image: string;
    images: string[];
    address: string;
    city: string;
    state: string;
    zip: string;
    county: string;
    parcelNumber: string;
    legalDescription: string;
    beds: number;
    baths: number;
    sqft: number;
    lotSize: number;
    yearBuilt: number;
    propertyType: string;
    zoning: string;
    appraisedValue: number;
    taxAssessedValue: number;
    lastSalePrice: number;
    lastSaleDate: string | null;
    local_image_path?: string;
    comments?: string;
    PLandBuilding?: string;
    PBase?: string | number;
    PAppraisedBuildingAmt?: number;
    PAppraisedLandAmt?: number;
    PTotLandArea?: string | number;
    PTotBuildingArea?: string | number;
    PLastSoldAmt?: string | number;
    PLastSoldDate?: string;
    PListingID?: string;
    PDateFiled?: string;
    PTotAppraisedAmt?: string | number;
  };
  owner: {
    name: string;
    mailingAddress: string;
    mailingCity: string;
    mailingState: string;
    mailingZip: string;
    phone?: string;
    email?: string;
    ownershipType: string;
    yearsOwned: number;
    isAbsentee: boolean;
    isCorporate: boolean;
    is_out_of_state?: boolean;
  };
  owners?: any[];
  loans?: any[];
  financials: {
    totalDebt: number;
    estimatedEquity: number;
    equityPercent: number;
    monthlyRent?: number;
    hoaFees?: number;
    propertyTaxes: number;
    taxDelinquent: boolean;
    taxDelinquentAmount?: number;
  };
  foreclosure?: {
    status: string;
    filingDate?: string;
    auctionDate: string;
    auctionTime: string;
    auctionLocation?: string;
    defaultAmount: number;
    trustee?: string;
    trusteePhone?: string;
    documentNumber?: string;
  };
  propertyTrustDeed?: any;
  trustee?: any;
  proaddress?: any;
  auctions?: any[];
  auctioneer?: any;
  probates?: any[];
  probate?: any;
  divorces?: any[];
  divorce?: any;
  evictions?: any[];
  eviction?: any;
  violations?: any[];
  codeViolation?: any;
  taxLiens?: any[];
  taxLien?: any;
  bankruptcy?: any;
}

interface PropertyDetailsPageProps {
  propertyId?: number;
}

const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ propertyId }) => {
  const { canAccessPremium, maskData, startTrial } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "owner" | "loans" | "distress">("overview");
  const [isSaved, setIsSaved] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) { setLoading(false); return; }
      try {
        setLoading(true);
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/properties/${propertyId}`;
        const token = typeof window !== 'undefined' ? localStorage.getItem('99sellers_token') : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(url, { headers });
        if (response.data.success) {
          setProperty(response.data.data);
          setIsSaved(response.data.data.saved || false);
        } else {
          setError("Property not found");
        }
      } catch {
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const handleSaveLead = async () => {
    if (!property) return;
    setIsSaved(!isSaved);
    try {
      const result = await toggleSavedLead({
        id: property.id,
        address: property.property.address,
        city: property.property.city,
        state: property.property.state,
        zip: property.property.zip,
        saved: isSaved,
      } as any);
      setIsSaved(result.saved);
    } catch {
      setIsSaved(isSaved);
    }
  };

  const getMaskedOrReal = (value: string | undefined, type: "name" | "address" | "phone" | "email" = "name") => {
    if (!value) return "N/A";
    if (canAccessPremium()) return value;
    return maskData(value, type);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const handleExport = () => {
    if (!canAccessPremium()) { setShowPremiumModal(true); return; }
    setShowExportModal(true);
  };

  const downloadPropertyData = (format: "csv" | "excel" | "json") => {
    if (!property) return;
    const timestamp = Date.now();
    const exportData = {
      property: property.property || {},
      owner: { ...(property.owner || {}), phone: canAccessPremium() ? property.owner?.phone : "REDACTED" },
      financials: property.financials || {},
      loans: property.loans || [],
      distressType: property.type,
      ...(property.foreclosure && { foreclosure: property.foreclosure }),
    };
    if (format === "json") {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `property-${property.id}-export-${timestamp}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const formatCurrencyLocal = (val: any) => val != null && !isNaN(val) ? `$${Number(val).toLocaleString()}` : "N/A";
      const formatDateLocal = (val: any) => val ? new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";
      const formatBoolLocal = (val: any) => val === true || val === 1 ? "Yes" : (val === false || val === 0 ? "No" : "N/A");

      const rows: string[][] = [
        ["==== PROPERTY OVERVIEW ====", ""],
        ["Property Address", property.property?.address || "N/A"],
        ["City", property.property?.city || "N/A"],
        ["State", property.property?.state || "N/A"],
        ["ZIP", property.property?.zip || "N/A"],
        ["County", property.property?.county || "N/A"],
        ["Parcel Number", property.property?.parcelNumber || "N/A"],
        ["Property Type", property.property?.propertyType || "N/A"],
        ["Zoning", property.property?.zoning || "N/A"],
        ["Beds", String(property.property?.beds ?? "N/A")],
        ["Baths", String(property.property?.baths ?? "N/A")],
        ["Sqft", String(property.property?.sqft ?? "N/A")],
        ["Lot Size Area", property.property?.PTotLandArea ? String(property.property.PTotLandArea) : "N/A"],
        ["Year Built", String(property.property?.yearBuilt ?? "N/A")],

        ["", ""],
        ["==== FINANCIAL & VALUATION ====", ""],
        ["Appraised Value", formatCurrencyLocal(property.property?.appraisedValue)],
        ["Tax Assessed Value", formatCurrencyLocal(property.property?.taxAssessedValue)],
        ["Base Value", formatCurrencyLocal(property.property?.PBase)],
        ["Land Amount", formatCurrencyLocal(property.property?.PAppraisedLandAmt)],
        ["Building Amount", formatCurrencyLocal(property.property?.PAppraisedBuildingAmt)],
        ["Last Sale Date", formatDateLocal(property.property?.lastSaleDate || property.property?.PLastSoldDate)],
        ["Last Sale Price", formatCurrencyLocal(property.property?.lastSalePrice || property.property?.PLastSoldAmt)],
        ["Monthly Rent", formatCurrencyLocal(property.financials?.monthlyRent)],
        ["Property Taxes", formatCurrencyLocal(property.financials?.propertyTaxes)],
        ["Total Debt", formatCurrencyLocal(property.financials?.totalDebt)],
        ["Estimated Equity", formatCurrencyLocal(property.financials?.estimatedEquity)],
        ["Equity Percent", property.financials?.equityPercent != null ? `${property.financials.equityPercent}%` : "N/A"],

        ["", ""],
        ["==== OWNER INFORMATION ====", ""],
        ["Owner Name", property.owner?.name || "N/A"],
        ["Company Name", property.proaddress?.PcompanyName ? String(property.proaddress.PcompanyName) : "N/A"],
        ["Owner Phone", canAccessPremium() ? (property.owner?.phone || "N/A") : "REDACTED"],
        ["Owner Email", property.owner?.email || "N/A"],
        ["Mailing Address", property.owner?.mailingAddress || "N/A"],
        ["Mailing City", property.owner?.mailingCity || "N/A"],
        ["Mailing State", property.owner?.mailingState || "N/A"],
        ["Mailing ZIP", property.owner?.mailingZip || "N/A"],
        ["Out of State Owner?", formatBoolLocal(property.owner?.isAbsentee || property.owner?.is_out_of_state)],
        ["Corporate Owned?", formatBoolLocal(property.owner?.isCorporate)],
        ["Ownership Type", property.owner?.ownershipType || "N/A"],
        ["Years Owned", String(property.owner?.yearsOwned ?? "N/A")],

        ["", ""],
        ["==== DISTRESS / MOTIVATION ====", ""],
        ["Primary Distress Type", property.type || property.motiveType?.name || "N/A"],
        ["Motive Code", property.motiveTypeCode || property.motiveType?.code || "N/A"],
        ["Published On", formatDateLocal(property.publishedOn)],
      ];

      if (property.foreclosure) {
        rows.push(["", ""]);
        rows.push(["==== FORECLOSURE DETAILS ====", ""]);
        rows.push(["Status", property.foreclosure.status || "N/A"]);
        rows.push(["Auction Date", formatDateLocal(property.foreclosure.auctionDate)]);
        rows.push(["Auction Time", property.foreclosure.auctionTime || "N/A"]);
        rows.push(["Auction Location", property.foreclosure.auctionLocation || "N/A"]);
        rows.push(["Default Amount", formatCurrencyLocal(property.foreclosure.defaultAmount)]);
        rows.push(["Trustee", property.foreclosure.trustee || "N/A"]);
        rows.push(["Trustee Phone", property.foreclosure.trusteePhone || "N/A"]);
        rows.push(["Document Number", property.foreclosure.documentNumber || "N/A"]);
      }

      if (property.taxLiens && property.taxLiens.length > 0) {
        rows.push(["", ""]);
        rows.push(["==== TAX LIENS ====", ""]);
        rows.push(["Total Tax Liens", String(property.taxLiens.length)]);
        property.taxLiens.forEach((lien: any, index: number) => {
          rows.push([`Tax Lien #${index + 1} Authority`, lien.tax_authority || "N/A"]);
          rows.push([`Tax Lien #${index + 1} Amount Owed`, formatCurrencyLocal(lien.amount_owed || lien.amount)]);
          rows.push([`Tax Lien #${index + 1} Delinquency Year`, String(lien.delinquency_tax_year || "N/A")]);
          rows.push([`Tax Lien #${index + 1} Redemption Date`, formatDateLocal(lien.redemption_expiration_date)]);
        });
      }

      if (property.violations && property.violations.length > 0) {
        rows.push(["", ""]);
        rows.push(["==== CODE VIOLATIONS ====", ""]);
        rows.push(["Total Code Violations", String(property.violations.length)]);
        property.violations.forEach((violation: any, index: number) => {
          rows.push([`Violation #${index + 1} Type`, violation.violation_type || "N/A"]);
          rows.push([`Violation #${index + 1} Fine Amount`, formatCurrencyLocal(violation.fine_amount)]);
          rows.push([`Violation #${index + 1} Description`, violation.description || "N/A"]);
          rows.push([`Violation #${index + 1} Status`, violation.compliance_status || "N/A"]);
        });
      }

      if (property.evictions && property.evictions.length > 0) {
        rows.push(["", ""]);
        rows.push(["==== EVICTIONS ====", ""]);
        rows.push(["Total Evictions", String(property.evictions.length)]);
        property.evictions.forEach((eviction: any, index: number) => {
          rows.push([`Eviction #${index + 1} File Date`, formatDateLocal(eviction.file_date)]);
          rows.push([`Eviction #${index + 1} Amount Owed`, formatCurrencyLocal(eviction.amount_owed)]);
          rows.push([`Eviction #${index + 1} Case Number`, eviction.case_number || "N/A"]);
          rows.push([`Eviction #${index + 1} Plaintiff Name`, eviction.plaintiff_name || "N/A"]);
        });
      }
      let csvContent = "\uFEFF";
      csvContent += ["Field", "Value"].join(",") + "\n";
      rows.forEach(r => { csvContent += r.map(c => `"${c}"`).join(",") + "\n"; });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `property-${property.id}-export-${timestamp}.${format === "excel" ? "xlsx.csv" : "csv"}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    toast.success(`Exported ${format.toUpperCase()} successfully! Check your downloads box.`, { position: "bottom-right", autoClose: 3000 });
    setShowExportModal(false);
  };

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    const result = await startTrial();
    setIsStartingTrial(false);
    if (result.success) setShowPremiumModal(false);
    else alert(result.message);
  };

  const getDistressColor = (type: string) => {
    const map: Record<string, string> = { Auction: "#EF4444", "Tax Default": "#F59E0B", "Tax Lien": "#8B5CF6", Probate: "#10B981", Divorce: "#EC4899", "Code Violation": "#6366F1" };
    return map[type] || "#2563EB";
  };
  const getDistressIcon = (type: string) => {
    const map: Record<string, string> = { Auction: "fa-solid fa-gavel", "Tax Default": "fa-solid fa-file-invoice-dollar", "Tax Lien": "fa-solid fa-building-columns", Probate: "fa-solid fa-file-signature", Divorce: "fa-solid fa-user-slash", "Code Violation": "fa-solid fa-triangle-exclamation" };
    return map[type] || "fa-solid fa-tag";
  };

  const renderDistressDetails = () => {
    if (!property) return null;
    const motiveTypeCode = property.motiveTypeCode || property.motiveType?.code || property.type;
    const motiveConfig = getMotiveTypeConfig(motiveTypeCode);

    if (!canAccessPremium()) {
      return (
        <div style={{ position: 'relative' }}>
          <div style={sx.lockMessage}>
            <i className="fa-solid fa-lock" style={{ fontSize: 28, color: '#9ca3af', marginBottom: 8 }}></i>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Premium Data Locked</h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 14px' }}>
              Upgrade to view detailed {motiveConfig?.name || 'motive'} information.
            </p>
            <button style={sx.btnPrimary} onClick={() => setShowPremiumModal(true)}>Upgrade to Unlock</button>
          </div>
          <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{ ...sx.fieldsGrid, padding: 20 }}>
              {[1, 2, 3].map(i => (
                <div key={i}><span style={sx.fieldLabel}>••••••••</span><span style={sx.fieldValue}>••••••••</span></div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {(motiveTypeCode === 'PRE' || motiveTypeCode === 'Pre-foreclosure') && (
          <PreforeclosureDetailView
            data={property}
            isMobile={isMobile}
          />
        )}
        {(motiveTypeCode === 'FOR' || motiveTypeCode === 'Foreclosure') && (
          <ForeclosureDetailView
            data={property}
            isMobile={isMobile}
          />
        )}
        {(motiveTypeCode === 'AUC' || motiveTypeCode === 'Auction') && (<AuctionDetailView data={property} isMobile={isMobile} />)}
        {(motiveTypeCode === 'PRO' || motiveTypeCode === 'Probate') && (<ProbateDetailView data={property} isMobile={isMobile} />)}
        {(motiveTypeCode === 'COD' || motiveTypeCode === 'Code Violation') && (<ViolationDetailView data={property} isMobile={isMobile} />)}
        {(motiveTypeCode === 'EVI' || motiveTypeCode === 'Eviction') && (<EvictionDetailView data={property} isMobile={isMobile} />)}
        {(motiveTypeCode === 'DIV' || motiveTypeCode === 'Divorce') && (<DivorceDetailView data={property} isMobile={isMobile} />)}
        {(motiveTypeCode === 'TAX' || motiveTypeCode === 'Unpaid Taxes' || motiveTypeCode === 'Tax Default') && (<TaxDetailView data={property} isMobile={isMobile} />)}
        {(motiveTypeCode === 'OOS') && (<OutOfStateDetailView data={property} isMobile={isMobile} />)}
        {(motiveTypeCode === 'OUT' || motiveTypeCode === 'Out of State') && (<OutOfStateSection owners={property.owners} propertyState={property.property?.state} proaddress={property.proaddress} />)}
        {!['PRE', 'FOR', 'AUC', 'PRO', 'COD', 'EVI', 'DIV', 'TAX', 'OOS', 'OUT', 'Pre-foreclosure', 'Foreclosure', 'Auction', 'Probate', 'Code Violation', 'Eviction', 'Divorce', 'Unpaid Taxes', 'Out of State', 'Tax Default'].includes(motiveTypeCode) && (
          <>
            <div style={sx.infoHeader}>
              <div style={{ ...sx.infoIconBox, background: `${getDistressColor(property.type)}15`, color: getDistressColor(property.type) }}>
                <i className={getDistressIcon(property.type)}></i>
              </div>
              <div>
                <h3 style={sx.infoTitle}>{property.type} Details</h3>
                <p style={sx.infoSubtitle}>Context and legal filings for this motivation</p>
              </div>
            </div>
            <div style={sx.fieldsGrid}>
              <div><span style={sx.fieldLabel}>Filing Status</span><span style={{ ...sx.fieldValue, fontWeight: 700 }}>Active</span></div>
              <div><span style={sx.fieldLabel}>Published On</span><span style={sx.fieldValue}>{formatDate(property.publishedOn)}</span></div>
            </div>
          </>
        )}
      </>
    );
  };

  /* ─── LOADING / ERROR ─── */
  if (loading) return (
    <ProtectedRoute><DashboardShell title="Property Details">
      <div style={sx.centerMsg}><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>Loading property details...</div>
    </DashboardShell></ProtectedRoute>
  );
  if (error || !property) return (
    <ProtectedRoute><DashboardShell title="Property Details">
      <div style={{ ...sx.centerMsg, color: '#ef4444' }}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }}></i>{error || "Property not found"}</div>
    </DashboardShell></ProtectedRoute>
  );

  const images = property.property.images?.length ? property.property.images : [property.property.image];
  const currentImage = images[activeImageIndex] || property.property.image;

  const tabs: { key: typeof activeTab; label: string; icon: string }[] = [
    { key: "overview", label: "Property Overview", icon: "fa-solid fa-house" },
    { key: "owner", label: "Owner Details", icon: "fa-solid fa-user" },
    { key: "loans", label: "Loan Details", icon: "fa-solid fa-file-invoice-dollar" },
    { key: "distress", label: `${property.type} Details`, icon: getDistressIcon(property.type) },
  ];

  return (
    <ProtectedRoute>
      <DashboardShell title="Property Details" subtitle={property.property.address}>
        <div style={sx.page}>

          {/* ══════ HEADER BAR ══════ */}
          <div style={sx.headerBar}>
            <div style={sx.headerLeft}>
              <h2 style={sx.pageLabel}>Property Details</h2>
              <div style={sx.addressBadge}>
                <span style={sx.dot}></span>
                {property.property.address}, {property.property.city}, {property.property.state} {property.property.zip}
              </div>
            </div>
            <div style={sx.headerRight}>
              <Link href="/search" style={sx.btnOutline}>
                <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }}></i>
                Back to Search
              </Link>
              <button
                style={isSaved ? sx.btnSaved : sx.btnOutline}
                onClick={handleSaveLead}
              >
                <i className={isSaved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}></i>
                {isSaved ? "Saved" : "Save Lead"}
              </button>
              <button style={sx.btnPrimary} onClick={handleExport}>
                <i className="fa-solid fa-download" style={{ fontSize: 12 }}></i>
                Export
              </button>
            </div>
          </div>

          {/* ══════ HERO — image + info side-by-side ══════ */}
          <div style={isMobile ? { ...sx.heroCard, flexDirection: 'column', margin: '12px 12px' } : sx.heroCard}>
            {/* Image col */}
            <div style={isMobile ? { width: '100%' } : { width: 400, flexShrink: 0 }}>
              <div style={sx.mainImage}>
                <div style={sx.imageBadges}>
                  <span style={sx.badgeBlue}>
                    <i className={getDistressIcon(property.type)} style={{ fontSize: 10 }}></i>
                    {property.type}
                  </span>
                  {property.status && <span style={sx.badgeGreen}>{property.status}</span>}
                </div>
                <Image src={currentImage} alt="Property" fill style={{ objectFit: "cover" }} priority />
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {images.slice(0, 5).map((img, idx) => (
                    <img key={idx} src={img} alt={`Thumb ${idx + 1}`}
                      style={activeImageIndex === idx ? { ...sx.thumb, border: '2px solid #3b82f6' } : sx.thumb}
                      onClick={() => setActiveImageIndex(idx)} />
                  ))}
                </div>
              )}
            </div>

            {/* Info col */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
              {/* Appraised value */}
              <div>
                <span style={sx.labelSmall}>Appraised Value</span>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#111827', lineHeight: 1.15 }}>
                  {formatCurrency(property.property.appraisedValue)}
                </div>
              </div>

              {/* Specs 2x2 */}
              <div style={isMobile ? { ...sx.specsGrid, gridTemplateColumns: 'repeat(2, 1fr)' } : sx.specsGrid}>
                {[
                  { icon: 'fa-solid fa-bed', text: `${property.property.beds} Beds` },
                  { icon: 'fa-solid fa-bath', text: `${property.property.baths} Baths` },
                  { icon: 'fa-solid fa-ruler-combined', text: `${property.property.sqft?.toLocaleString()} sqft` },
                  { icon: 'fa-solid fa-calendar', text: `Built ${property.property.yearBuilt}` },
                ].map((s, i) => (
                  <div key={i} style={sx.specCard}>
                    <i className={s.icon} style={{ fontSize: 14, color: '#9ca3af' }}></i>
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>

              {/* Equity bar */}
              <div style={sx.equityCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#4b5563' }}>Estimated Equity</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{formatCurrency(property.financials.estimatedEquity)}</span>
                </div>
                <div style={sx.equityBarTrack}>
                  <div style={{ ...sx.equityBarFill, width: `${Math.min(property.financials.equityPercent, 100)}%` }}></div>
                </div>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{property.financials.equityPercent}% equity</span>
              </div>

              {/* Quick financials */}
              <div style={isMobile ? { ...sx.finRow, gridTemplateColumns: '1fr' } : sx.finRow}>
                {[
                  { label: 'Total Debt', val: formatCurrency(property.financials.totalDebt) },
                  { label: 'Property Tax', val: formatCurrency(property.financials.propertyTaxes) },
                  { label: 'Tax Assessed', val: formatCurrency(property.property.taxAssessedValue) },
                ].map((f, i) => (
                  <div key={i} style={sx.finCard}>
                    <span style={sx.labelSmall}>{f.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{f.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══════ TAB BAR ══════ */}
          <div style={{ display: 'flex', gap: 6, padding: '0 28px', margin: '0 20px 16px', overflowX: 'auto' }}>
            {tabs.map(t => (
              <button key={t.key}
                style={activeTab === t.key ? sx.tabActive : sx.tab}
                onClick={() => setActiveTab(t.key)}>
                <i className={t.icon} style={{ fontSize: 13 }}></i>
                {t.label}
              </button>
            ))}
          </div>

          {/* ══════ TAB CONTENT ══════ */}

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <PropertyOverviewSection data={property} isMobile={isMobile} />
          )}

          {/* OWNER */}
          {activeTab === "owner" && (
            <OwnerDetailsSection
              data={property}
              canAccessPremium={canAccessPremium()}
              maskData={maskData}
              isMobile={isMobile}
            />
          )}

          {/* LOANS */}
          {activeTab === "loans" && (
            <LoanDetailsSection data={property} isMobile={isMobile} />
          )}

          {/* DISTRESS */}
          {activeTab === "distress" && (
            <div style={sx.card}>
              {renderDistressDetails()}
            </div>
          )}

          {/* ══════ MODALS ══════ */}
          {showPremiumModal && (
            <FeatureGatePopup
              isOpen={showPremiumModal}
              featureName="Premium Property Details"
              onClose={() => setShowPremiumModal(false)}
              onStartTrial={handleStartTrial}
            />
          )}

          {showExportModal && (
            <div style={sx.modalOverlay} onClick={() => setShowExportModal(false)}>
              <div style={sx.modalContent} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>Export Property Data</h3>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>Select format to download:</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { fmt: 'csv' as const, icon: 'fa-solid fa-file-csv', label: 'CSV' },
                    { fmt: 'excel' as const, icon: 'fa-solid fa-file-excel', label: 'Excel' },
                    { fmt: 'json' as const, icon: 'fa-solid fa-file-code', label: 'JSON' },
                  ].map(e => (
                    <button key={e.fmt} style={sx.exportBtn} onClick={() => downloadPropertyData(e.fmt)}>
                      <i className={e.icon} style={{ marginRight: 6 }}></i>{e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute >
  );
};

/* ═══════════════════════════════════════════════════════
   Inline style constants — matches DashboardAnimation look
   ═══════════════════════════════════════════════════════ */
const sx: Record<string, React.CSSProperties> = {
  page: { background: '#f8fafc', minHeight: '100%', paddingBottom: 40 },

  /* header */
  headerBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: '#fff', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', gap: 12 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  pageLabel: { fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 },
  addressBadge: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#3b82f6', fontWeight: 500 },
  dot: { width: 7, height: 7, background: '#3b82f6', borderRadius: '50%', flexShrink: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },

  /* buttons */
  btnOutline: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#4b5563', cursor: 'pointer', transition: 'all .15s', textDecoration: 'none' },
  btnSaved: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#eff6ff', border: '1px solid #3b82f6', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#2563eb', cursor: 'pointer' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'all .15s' },

  /* hero card */
  heroCard: { display: 'flex', gap: 24, padding: '20px 28px', background: '#fff', margin: '16px 20px', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  mainImage: { position: 'relative', borderRadius: 12, overflow: 'hidden', height: 250, background: '#f3f4f6' },
  imageBadges: { position: 'absolute', top: 10, left: 10, display: 'flex', gap: 8, zIndex: 2 },
  badgeBlue: { display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#fff' },
  badgeGreen: { padding: '5px 10px', background: 'rgba(16,185,129,0.9)', borderRadius: 6, fontSize: 11, fontWeight: 500, color: '#fff' },
  thumb: { width: 64, height: 46, borderRadius: 8, objectFit: 'cover', border: '2px solid transparent', cursor: 'pointer', transition: 'border-color .15s' },

  /* specs */
  labelSmall: { display: 'block', fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  specsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  specCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', border: '1px solid #f3f4f6', borderRadius: 8, fontSize: 13, color: '#111827', fontWeight: 500 },

  /* equity */
  equityCard: { padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #f3f4f6' },
  equityBarTrack: { height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  equityBarFill: { height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', borderRadius: 4, transition: 'width .5s ease' },

  /* financials row */
  finRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  finCard: { padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f3f4f6' },

  /* tabs */
  tab: { display: 'flex', alignItems: 'center', gap: 7, padding: '11px 18px', background: '#fff', border: '1px solid #f3f4f6', borderRadius: 10, fontSize: 13, fontWeight: 500, color: '#4b5563', cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' },
  tabActive: { display: 'flex', alignItems: 'center', gap: 7, padding: '11px 18px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: '1px solid transparent', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' },

  /* card & info header */
  card: { background: '#fff', margin: '0 20px 16px', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  infoHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f3f4f6' },
  infoIconBox: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  infoTitle: { fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 },
  infoSubtitle: { fontSize: 12, color: '#9ca3af', margin: 0 },

  /* fields */
  fieldsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18 },
  fieldLabel: { display: 'block', fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  fieldValue: { fontSize: 14, fontWeight: 500, color: '#111827', display: 'block' },

  /* owner */
  ownerCard: { display: 'flex', alignItems: 'center', gap: 18, padding: 20, background: 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)', borderRadius: 12, border: '1px solid #eff6ff' },
  ownerAvatar: { width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0 },
  ownerName: { fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 },
  tag: { padding: '3px 8px', background: 'rgba(156,163,175,0.12)', borderRadius: 4, fontSize: 11, fontWeight: 500, color: '#6b7280' },

  /* loan summary */
  loanSummaryRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 },
  summaryBox: { textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #f3f4f6' },
  loanCard: { padding: 18, background: '#f8fafc', borderRadius: 12, border: '1px solid #f3f4f6', marginBottom: 12 },
  loanCardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #e5e7eb' },
  posBadge: { fontSize: 12, fontWeight: 600, color: '#2563eb', padding: '4px 10px', background: 'rgba(37,99,235,0.1)', borderRadius: 6 },

  /* lock */
  lockMessage: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.85)', borderRadius: 14, zIndex: 2, textAlign: 'center', padding: 24 },

  /* center msg */
  centerMsg: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, fontSize: 15, color: '#9ca3af' },

  /* export modal */
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 14, padding: '28px 32px', minWidth: 320, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' },
  exportBtn: { flex: 1, padding: '10px 0', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#111827', cursor: 'pointer', transition: 'all .15s' },
};

export default PropertyDetailsPage;
