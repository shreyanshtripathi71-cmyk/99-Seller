"use client";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar, Header } from "@/modules/UserSearchLayout_Module";
import { FilterPanel, type Filters } from "@/modules/UserSearchData_Module";
import { LeadTableView, type Lead } from "@/modules/UserSearchData_Module";
import { LeadGridView } from "@/modules/UserSearchData_Module";
import { SaveSearchModal } from "@/modules/UserSupport_Module";
import { toggleSavedLead, getSavedLeads } from "@/services/savedLeadsService";
import { savedSearchesAPI, authAPI } from "@/services/api";
import styles from "./styles/dashboard.module.scss";

import axios from "axios";

const initialFilters: Filters = {
  state: "All",
  county: "All",
  zipCode: "",
  motive: "All",
  minEquity: "0",
  maxEquity: "100",
  minDebt: "0",
  maxDebt: "1000000",
  minBeds: "Any",
  minBaths: "Any",
  minSqft: "",
  minYear: "",
  auctionDateStart: "",
};

const LeadDiscovery = () => {
  // Auth context for user info and premium access
  const { user, logout, canAccessPremium, isTrialActive, subscription } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const savedSearchId = searchParams.get('saved');

  // Determine user plan based on auth
  const userPlan = canAccessPremium() || isTrialActive() ? "Premium" : "Free";

  // State
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<number>>(new Set());

  // Load saved properties on mount
  useEffect(() => {
    const loadSavedProperties = async () => {
      try {
        const savedLeads = await getSavedLeads();
        const ids = new Set(savedLeads.map(lead => lead.id));
        setSavedPropertyIds(ids);
      } catch (error) {
        console.error("Error loading saved properties:", error);
      }
    };
    loadSavedProperties();
  }, []);

  // Load saved search if ID is present
  useEffect(() => {
    if (savedSearchId) {
      const loadSavedSearch = async () => {
        setIsLoading(true);
        try {
          const result = await savedSearchesAPI.getById(savedSearchId);
          if (result.success && result.data) {
            setFilters(result.data.filters);
          }
        } catch (error) {
          console.error("Error loading saved search:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadSavedSearch();
    }
  }, [savedSearchId]);

  // Fetch leads from backend
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const params = {
        state: filters.state,
        zip: filters.zipCode,
        motive: filters.motive,
        minEquity: filters.minEquity,
        maxEquity: filters.maxEquity,
        minDebt: filters.minDebt !== "0" ? filters.minDebt : undefined,
        maxDebt: filters.maxDebt !== "1000000" ? filters.maxDebt : undefined,
        minBeds: filters.minBeds,
        minBaths: filters.minBaths,
        minSqft: filters.minSqft,
        minYear: filters.minYear,
        q: searchQuery
      };

      const token = authAPI.getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/properties`, { params, headers });

      if (response.data.success) {
        const fetchedLeads = response.data.data.map((lead: any) => ({
          ...lead,
          saved: lead.saved || savedPropertyIds.has(lead.id)
        }));
        setLeads(fetchedLeads);

        // Save count and filters for Export page
        if (typeof window !== 'undefined') {
          localStorage.setItem('99sellers_last_search_count', fetchedLeads.length.toString());
          localStorage.setItem('99sellers_last_search_filters', JSON.stringify(filters));
          localStorage.setItem('99sellers_last_search_query', searchQuery);
        }
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when filters/search changes
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Fire immediately on first mount, debounce subsequent changes
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchLeads();
      return;
    }

    const timer = setTimeout(() => {
      fetchLeads();
    }, 300); // Debounce only user-driven changes

    return () => clearTimeout(timer);
  }, [filters, searchQuery]);

  // Lead results (no longer needs useMemo for filtering as backend handles it)
  const filteredLeads = leads;

  // Handlers
  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setSearchQuery("");
  };

  const handleToggleSave = async (id: number) => {
    const lead = leads.find(l => l.id === id);
    if (lead) {
      // Optimistic update
      const wasSaved = lead.saved;
      setLeads(leads.map((l) => (l.id === id ? { ...l, saved: !wasSaved } : l)));

      try {
        const result = await toggleSavedLead(lead);
        // Update the saved IDs set
        const newSavedIds = new Set(savedPropertyIds);
        if (result.saved) {
          newSavedIds.add(id);
        } else {
          newSavedIds.delete(id);
        }
        setSavedPropertyIds(newSavedIds);

        // Confirm state matches backend
        if (result.saved !== !wasSaved) {
          setLeads(leads.map((l) => (l.id === id ? { ...l, saved: result.saved } : l)));
        }
      } catch (err) {
        // Revert on error
        setLeads(leads.map((l) => (l.id === id ? { ...l, saved: wasSaved } : l)));
      }
    }
  };

  // Mask sensitive data for free users
  const getAddress = (lead: Lead) => {
    if (userPlan === "Premium") return lead.address;
    // Show partial address with masked street number
    const parts = lead.address.split(" ");
    if (parts.length > 1) {
      const streetNum = parts[0];
      const maskedNum = streetNum.substring(0, 1) + "***";
      return maskedNum + " " + parts.slice(1).join(" ");
    }
    return "*** " + lead.address.substring(3);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return user.firstName[0].toUpperCase() + user.lastName[0].toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <div className={styles.dashboard_root}>
      {/* Save Search Modal */}
      {showSaveModal && (
        <SaveSearchModal
          onClose={() => setShowSaveModal(false)}
          onSave={async (name) => {
            try {
              const result = await savedSearchesAPI.create(name, filters);
              if (result.success) {
                alert(`Search saved successfully!`);
              } else {
                alert(`Failed to save search: ${result.error}`);
              }
            } catch (err) {
              console.error(err);
              alert('Error saving search');
            }
            setShowSaveModal(false);
          }}
          filters={filters}
        />
      )}

      <Sidebar
        userPlan={userPlan}
        onUpgrade={() => router.push("/dashboard/subscription")}
        subscription={subscription}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className={`${styles.main_content} ${isSidebarOpen ? styles.sidebar_open : ""}`}>
        {/* Overlay for mobile */}
        <div
          className={`${styles.sidebar_overlay} ${isSidebarOpen ? styles.show : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        <Header
          title="Lead Discovery"
          subtitle={isTrialActive() ? "Trial Active" : "Real-time Leads"}
          userPlan={userPlan}
          userName={user?.name}
          userEmail={user?.email}
          userInitials={getUserInitials()}
          onLogout={logout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />



        <main className={styles.content_area}>
          {/* Search Bar */}
          <div className={styles.search_container}>
            <div className={styles.search_bar}>
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search by City, Zip, or Address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.search_actions}>
              <button
                className={styles.btn_secondary}
                onClick={() => setShowSaveModal(true)}
              >
                <i className="fa-regular fa-bookmark"></i>
                Save Search
              </button>

              <button
                className={`${styles.btn_secondary} ${showFilters ? styles.active : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fa-solid fa-sliders"></i>
                Filters
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            onApply={() => setShowFilters(false)}
            isOpen={showFilters}
          />

          {/* Results Header */}
          <div className={styles.results_header}>
            <div className={styles.results_count}>
              Found <strong>{filteredLeads.length}</strong> properties
              {searchQuery && ` matching "${searchQuery}"`}
            </div>

            <div className={styles.view_toggle}>
              <button
                className={`${styles.view_btn} ${viewMode === "list" ? styles.active : ""}`}
                onClick={() => setViewMode("list")}
              >
                <i className="fa-solid fa-bars"></i>
              </button>
              <button
                className={`${styles.view_btn} ${viewMode === "grid" ? styles.active : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <i className="fa-solid fa-grid-2"></i>
              </button>
            </div>
          </div>

          {/* Lead List/Grid */}
          {viewMode === "list" ? (
            <LeadTableView
              leads={filteredLeads}
              onToggleSave={handleToggleSave}
              getAddress={getAddress}
              userPlan={userPlan}
            />
          ) : (
            <LeadGridView
              leads={filteredLeads}
              onToggleSave={handleToggleSave}
              getAddress={getAddress}
              userPlan={userPlan}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default LeadDiscovery;
