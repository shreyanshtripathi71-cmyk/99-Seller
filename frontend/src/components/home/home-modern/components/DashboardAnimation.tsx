"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/homepage.module.scss";

// US States for dropdown - showing subset with Texas visible
// Texas is the 8th item (index 7) so it's clearly visible when dropdown opens
const US_STATES_VISIBLE = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming"
];

// Distress/Motive Types for dropdown
const DISTRESS_TYPES = [
    "All Types",
    "Foreclosure",
    "Pre-Foreclosure",
    "Probate",
    "Divorce",
    "Tax Lien",
    "Bankruptcy",
    "Vacant Property",
    "Absentee Owner",
    "High Equity",
    "Tired Landlord",
    "Code Violation",
    "Inherited Property"
];

// Sample leads data for initial display
const SAMPLE_LEADS = [
    {
        id: 1,
        address: "1024 Elm Street",
        city: "Austin, TX",
        zip: "78701",
        type: "Foreclosure",
        status: "Active",
        beds: 4,
        baths: 3,
        sqft: 2450,
        yearBuilt: 2005,
        appraisedValue: "$485,000",
        equity: "$160,000",
        equityPercent: "33%",
        county: "Travis",
        parcelNumber: "0123456789",
        propertyType: "Single Family",
        zoning: "Residential",
        ownerName: "John Smith",
        ownerPhone: "(555) 123-4567",
        auctionDate: "2026-02-14",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
    },
    {
        id: 2,
        address: "892 Oak Avenue",
        city: "Dallas, TX",
        zip: "75201",
        type: "Pre-Foreclosure",
        status: "Active",
        beds: 3,
        baths: 2,
        sqft: 1850,
        equity: "$95,000",
        equityPercent: "28%",
        ownerName: "Sarah Johnson",
        ownerPhone: "(555) 234-5678",
        auctionDate: "2026-02-28",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
    },
    {
        id: 3,
        address: "456 Pine Road",
        city: "Houston, TX",
        zip: "77001",
        type: "Probate",
        status: "Active",
        beds: 5,
        baths: 4,
        sqft: 3200,
        equity: "$220,000",
        equityPercent: "41%",
        ownerName: "Michael Brown",
        ownerPhone: "(555) 345-6789",
        auctionDate: "2026-03-10",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
    },
    {
        id: 4,
        address: "223 Maple Lane",
        city: "San Antonio, TX",
        zip: "78201",
        type: "Divorce",
        status: "Active",
        beds: 3,
        baths: 2,
        sqft: 1650,
        equity: "$85,000",
        equityPercent: "25%",
        ownerName: "Emily Davis",
        ownerPhone: "(555) 456-7890",
        auctionDate: "2026-03-15",
        image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600",
    },
];

const DashboardAnimation: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [animationKey, setAnimationKey] = useState(0);
    const [typedZip, setTypedZip] = useState("");
    const [cursorPos, setCursorPos] = useState({ x: 580, y: 320 });
    const [isInView, setIsInView] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Refs for all interactive elements so cursor lands exactly on them
    const sectionRef = useRef<HTMLElement>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);
    const filtersBtnRef = useRef<HTMLButtonElement>(null);
    const stateSelectRef = useRef<HTMLDivElement>(null);
    const texasItemRef = useRef<HTMLDivElement>(null);
    const zipFieldRef = useRef<HTMLDivElement>(null);
    const distressSelectRef = useRef<HTMLDivElement>(null);
    const foreclosureItemRef = useRef<HTMLDivElement>(null);
    const applyBtnRef = useRef<HTMLButtonElement>(null);
    const leadRowRef = useRef<HTMLDivElement>(null);
    const exportBtnRef = useRef<HTMLButtonElement>(null);
    const stateDropdownRef = useRef<HTMLDivElement>(null);

    const ANIMATION_DURATION = 22;
    const steps = [
        { time: 0, action: "show-leads" },           // Show initial leads
        { time: 1.5, action: "move-to-filters" },    // Move cursor to Filters button
        { time: 2.0, action: "click-filters" },      // Click Filters button to expand
        { time: 2.8, action: "show-filter-panel" },  // Filter panel expands
        { time: 3.5, action: "move-to-state" },      // Move to State dropdown
        { time: 4.0, action: "click-state" },        // Open State dropdown
        { time: 4.3, action: "show-state-dropdown" }, // Show dropdown with all states
        { time: 5.0, action: "hover-texas" },        // Hover over Texas
        { time: 5.5, action: "select-texas" },       // Select Texas
        { time: 6.2, action: "move-to-zip" },        // Move to Zip Code field
        { time: 6.5, action: "click-zip" },          // Click on zip field
        { time: 6.8, action: "type-zip-1" },         // Type 7
        { time: 7.0, action: "type-zip-2" },         // Type 8
        { time: 7.2, action: "type-zip-3" },         // Type 7
        { time: 7.4, action: "type-zip-4" },         // Type 0
        { time: 7.6, action: "type-zip-5" },         // Type 1
        { time: 8.2, action: "move-to-distress" },   // Move to Distress Type
        { time: 8.7, action: "click-distress" },     // Click distress dropdown
        { time: 9.0, action: "show-distress-dropdown" }, // Show motive types
        { time: 9.8, action: "hover-foreclosure" },  // Hover over Foreclosure
        { time: 10.3, action: "select-foreclosure" }, // Select Foreclosure
        { time: 11.0, action: "move-to-apply" },     // Move to Apply Filters
        { time: 11.5, action: "click-apply" },       // Click Apply Filters
        { time: 12.0, action: "filter-results" },    // Results filter down to 1
        { time: 13.0, action: "move-to-lead" },      // Move to the lead row
        { time: 13.5, action: "hover-lead" },        // Hover over lead
        { time: 14.0, action: "click-lead" },        // Click lead
        { time: 14.5, action: "show-details" },      // Show property details
        { time: 16.0, action: "move-to-export" },    // Move to Export button
        { time: 16.5, action: "hover-export" },      // Hover Export
        { time: 17.0, action: "click-export" },      // Click Export
        { time: 17.5, action: "show-success" },      // Show success toast
        { time: 20.0, action: "reset" },             // Reset animation
    ];

    // Intersection Observer to detect when section is scrolled into view
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasStarted) {
                        // Reset animation state and start fresh
                        setCurrentStep(0);
                        setTypedZip("");
                        setAnimationKey(prev => prev + 1);
                        setIsInView(true);
                        setHasStarted(true);
                    }
                });
            },
            { threshold: 0.3 } // Start when 30% of section is visible
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [hasStarted]);

    // Animation loop - only runs when in view
    useEffect(() => {
        if (!isInView) return;

        const interval = setInterval(() => {
            setAnimationKey((prev) => prev + 1);
            setCurrentStep(0);
            setTypedZip("");
        }, ANIMATION_DURATION * 1000);

        const stepTimers: NodeJS.Timeout[] = [];
        steps.forEach((step, index) => {
            const timer = setTimeout(() => {
                setCurrentStep(index);
                // Handle zip typing
                if (step.action === "type-zip-1") setTypedZip("7");
                if (step.action === "type-zip-2") setTypedZip("78");
                if (step.action === "type-zip-3") setTypedZip("787");
                if (step.action === "type-zip-4") setTypedZip("7870");
                if (step.action === "type-zip-5") setTypedZip("78701");
            }, step.time * 1000);
            stepTimers.push(timer);
        });

        return () => {
            clearInterval(interval);
            stepTimers.forEach((t) => clearTimeout(t));
        };
    }, [animationKey, isInView]);

    const action = steps[currentStep]?.action || "show-leads";

    // Derived states
    const showFilterPanel = !["show-leads", "move-to-filters", "click-filters"].includes(action);
    const stateDropdownOpen = ["show-state-dropdown", "hover-texas"].includes(action);
    const stateSelected = steps.findIndex(s => s.action === "select-texas") <= currentStep;
    const distressDropdownOpen = ["show-distress-dropdown", "hover-foreclosure"].includes(action);
    const distressSelected = steps.findIndex(s => s.action === "select-foreclosure") <= currentStep;
    const filtersApplied = steps.findIndex(s => s.action === "filter-results") <= currentStep;
    const showDetailsPage = ["show-details", "move-to-export", "hover-export", "click-export", "show-success"].includes(action);
    const showSuccess = action === "show-success";
    const leadHovered = ["hover-lead", "click-lead"].includes(action);
    const zipFocused = action.includes("type-zip") || action === "click-zip";
    const hoveringTexas = action === "hover-texas";
    const hoveringForeclosure = action === "hover-foreclosure";

    // Helper: get the center of a ref element relative to the dashboard container
    const getRefCenter = useCallback((ref: React.RefObject<HTMLElement | null>) => {
        if (!ref.current || !dashboardRef.current) return null;
        const dashRect = dashboardRef.current.getBoundingClientRect();
        const elRect = ref.current.getBoundingClientRect();
        return {
            x: elRect.left - dashRect.left + elRect.width / 2,
            y: elRect.top - dashRect.top + elRect.height / 2,
        };
    }, []);

    // Update cursor position whenever step changes or layout changes
    useEffect(() => {
        // Use a short timeout so that newly rendered DOM (dropdowns) + scroll is settled
        const delay = (action === "hover-texas" || action === "select-texas") ? 200 : 50;
        const timer = setTimeout(() => {
            const pos = computeCursorPos();
            if (pos) setCursorPos(pos);
        }, delay);
        return () => clearTimeout(timer);
    }, [currentStep, showFilterPanel, stateDropdownOpen, distressDropdownOpen, showDetailsPage]);

    // Auto-scroll the state dropdown to show Texas when it opens
    useEffect(() => {
        if (stateDropdownOpen && texasItemRef.current) {
            // Wait for the dropdown animation, then scroll Texas into view
            const timer = setTimeout(() => {
                if (texasItemRef.current) {
                    const parent = texasItemRef.current.parentElement;
                    if (parent) {
                        // Scroll the dropdown container so Texas is visible
                        const itemTop = texasItemRef.current.offsetTop;
                        const parentHeight = parent.clientHeight;
                        const itemHeight = texasItemRef.current.offsetHeight;
                        parent.scrollTop = itemTop - parentHeight / 2 + itemHeight / 2;
                    }
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [stateDropdownOpen]);

    const computeCursorPos = (): { x: number; y: number } | null => {
        switch (action) {
            case "show-leads":
                return { x: 580, y: 320 }; // idle center
            case "move-to-filters":
            case "click-filters":
                return getRefCenter(filtersBtnRef) ?? { x: 910, y: 80 };
            case "show-filter-panel":
                return getRefCenter(stateSelectRef) ?? { x: 300, y: 180 };
            case "move-to-state":
            case "click-state":
                return getRefCenter(stateSelectRef) ?? { x: 240, y: 185 };
            case "show-state-dropdown":
                // Position inside the dropdown, near the top to begin scrolling
                return getRefCenter(stateDropdownRef) ?? { x: 240, y: 250 };
            case "hover-texas":
            case "select-texas":
                return getRefCenter(texasItemRef) ?? { x: 240, y: 328 };
            case "move-to-zip":
            case "click-zip":
            case "type-zip-1":
            case "type-zip-2":
            case "type-zip-3":
            case "type-zip-4":
            case "type-zip-5":
                return getRefCenter(zipFieldRef) ?? { x: 400, y: 185 };
            case "move-to-distress":
            case "click-distress":
                return getRefCenter(distressSelectRef) ?? { x: 560, y: 185 };
            case "show-distress-dropdown":
                return getRefCenter(distressSelectRef) ?? { x: 560, y: 240 };
            case "hover-foreclosure":
            case "select-foreclosure":
                return getRefCenter(foreclosureItemRef) ?? { x: 560, y: 258 };
            case "move-to-apply":
            case "click-apply":
                return getRefCenter(applyBtnRef) ?? { x: 890, y: 280 };
            case "filter-results":
                return getRefCenter(leadRowRef) ?? { x: 580, y: 360 };
            case "move-to-lead":
            case "hover-lead":
            case "click-lead":
                return getRefCenter(leadRowRef) ?? { x: 350, y: 405 };
            case "show-details":
                return { x: 580, y: 200 };
            case "move-to-export":
            case "hover-export":
            case "click-export":
            case "show-success":
                return getRefCenter(exportBtnRef) ?? { x: 865, y: 50 };
            default:
                return { x: 580, y: 300 };
        }
    };

    const isClicking = action.includes("click") || action.includes("select");
    const isHovering = action.includes("hover");

    // Get visible leads based on filter state
    const visibleLeads = filtersApplied ? [SAMPLE_LEADS[0]] : SAMPLE_LEADS;
    const selectedProperty = SAMPLE_LEADS[0];

    return (
        <section ref={sectionRef} className={styles.dashboard_animation_section}>
            {/* Section Heading */}
            <motion.div
                className={styles.section_heading_centered}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <h2 className={styles.section_title}>Find Your Next Deal in <span style={{ color: '#2563eb' }}>Seconds</span></h2>
                <p className={styles.section_subtitle}>
                    Search, filter, and export motivated seller leads with our intuitive dashboard
                </p>
            </motion.div>

            <motion.div
                className={styles.dashboard_animation_wrapper}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                {/* Browser Chrome */}
                <div className={styles.browser_chrome}>
                    <div className={styles.browser_dots}>
                        <span className={styles.dot_red}></span>
                        <span className={styles.dot_yellow}></span>
                        <span className={styles.dot_green}></span>
                    </div>
                    <div className={styles.browser_url}>
                        <i className="fa-solid fa-lock" style={{ fontSize: 10, marginRight: 6, color: "#10b981" }}></i>
                        {showDetailsPage ? "99sellers.com/property/1" : "99sellers.com/search"}
                    </div>
                </div>

                {/* Dashboard Container */}
                <div className={styles.mock_dashboard_v2} ref={dashboardRef}>
                    {/* Dark Sidebar */}
                    <div className={styles.mock_sidebar_dark}>
                        <div className={styles.mock_logo_dark}>
                            <span className={styles.logo_99}>99</span>
                            <span className={styles.logo_sellers}>Sellers</span>
                        </div>

                        <div className={styles.nav_section}>
                            <div className={styles.nav_section_label}>DISCOVER</div>
                            <div className={`${styles.nav_item_dark} ${styles.active}`}>
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <span>Search Leads</span>
                            </div>
                            <div className={styles.nav_item_dark}>
                                <i className="fa-regular fa-bookmark"></i>
                                <span>Saved Leads</span>
                            </div>
                            <div className={styles.nav_item_dark}>
                                <i className="fa-regular fa-folder"></i>
                                <span>Saved Searches</span>
                            </div>
                        </div>

                        <div className={styles.nav_section}>
                            <div className={styles.nav_section_label}>TOOLS</div>
                            <div className={styles.nav_item_dark}>
                                <i className="fa-solid fa-download"></i>
                                <span>Export Data</span>
                            </div>
                        </div>

                        <div className={styles.nav_section}>
                            <div className={styles.nav_section_label}>ACCOUNT</div>
                            <div className={styles.nav_item_dark}>
                                <i className="fa-regular fa-user"></i>
                                <span>Profile</span>
                            </div>
                            <div className={styles.nav_item_dark}>
                                <i className="fa-regular fa-credit-card"></i>
                                <span>Billing</span>
                            </div>
                            <div className={styles.nav_item_dark}>
                                <i className="fa-solid fa-crown"></i>
                                <span>Subscription</span>
                            </div>
                            <div className={styles.nav_item_dark}>
                                <i className="fa-solid fa-gear"></i>
                                <span>Settings</span>
                            </div>
                        </div>

                        <div className={styles.premium_badge_dark}>
                            <span>PREMIUM</span>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className={styles.mock_main_v2}>
                        <AnimatePresence mode="wait">
                            {!showDetailsPage ? (
                                <motion.div
                                    key="search-view"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={styles.list_view_container}
                                >
                                    {/* Header */}
                                    <div className={styles.header_v2}>
                                        <div className={styles.header_left}>
                                            <h2 className={styles.page_title}>Lead Discovery</h2>
                                            <span className={styles.live_badge}>
                                                <span className={styles.live_dot}></span>
                                                Live
                                            </span>
                                        </div>
                                        <div className={styles.user_avatar}>U</div>
                                    </div>

                                    {/* Search Bar */}
                                    <div className={styles.search_row}>
                                        <div className={styles.search_input}>
                                            <i className="fa-solid fa-magnifying-glass"></i>
                                            <span>Search by City, Zip, or Address...</span>
                                        </div>
                                        <div className={styles.search_actions}>
                                            <button className={styles.btn_outline}>
                                                <i className="fa-regular fa-bookmark"></i>
                                                Save Search
                                            </button>
                                            <button className={`${styles.btn_outline} ${action === "click-filters" ? styles.clicked : ""}`} ref={filtersBtnRef}>
                                                <i className="fa-solid fa-sliders"></i>
                                                Filters
                                            </button>
                                        </div>
                                    </div>

                                    {/* Filters Panel - Expandable */}
                                    <AnimatePresence>
                                        {showFilterPanel && (
                                            <motion.div
                                                className={styles.filters_panel}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className={styles.filters_header}>
                                                    <i className="fa-solid fa-filter"></i>
                                                    Filters
                                                </div>
                                                {/* Row 1 */}
                                                <div className={styles.filters_grid_row}>
                                                    {/* State Dropdown */}
                                                    <div className={styles.filter_field}>
                                                        <label>State</label>
                                                        <div ref={stateSelectRef} className={`${styles.filter_select} ${stateSelected ? styles.filled : ""} ${stateDropdownOpen ? styles.open : ""}`}>
                                                            {stateSelected ? "Texas" : "All States"}
                                                            <i className="fa-solid fa-chevron-down"></i>
                                                        </div>
                                                        {/* State Dropdown List */}
                                                        <AnimatePresence>
                                                            {stateDropdownOpen && (
                                                                <motion.div
                                                                    className={styles.dropdown_list}
                                                                    ref={stateDropdownRef}
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                >
                                                                    {US_STATES_VISIBLE.map((state: string, idx: number) => (
                                                                        <div
                                                                            key={state}
                                                                            ref={state === "Texas" ? texasItemRef : undefined}
                                                                            className={`${styles.dropdown_item} ${state === "Texas" && hoveringTexas ? styles.hovered : ""}`}
                                                                        >
                                                                            {state}
                                                                        </div>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    {/* Zip Code */}
                                                    <div className={styles.filter_field}>
                                                        <label>Zip Code</label>
                                                        <div ref={zipFieldRef} className={`${styles.filter_input} ${typedZip ? styles.filled : ""} ${zipFocused ? styles.focused : ""}`}>
                                                            {typedZip || "e.g. 78701"}
                                                            {zipFocused && <span className={styles.cursor_blink}>|</span>}
                                                        </div>
                                                    </div>

                                                    {/* Distress Type Dropdown */}
                                                    <div className={styles.filter_field}>
                                                        <label>Distress Type</label>
                                                        <div ref={distressSelectRef} className={`${styles.filter_select} ${distressSelected ? styles.filled : ""} ${distressDropdownOpen ? styles.open : ""}`}>
                                                            {distressSelected ? "Foreclosure" : "All Types"}
                                                            <i className="fa-solid fa-chevron-down"></i>
                                                        </div>
                                                        {/* Distress Dropdown List */}
                                                        <AnimatePresence>
                                                            {distressDropdownOpen && (
                                                                <motion.div
                                                                    className={styles.dropdown_list}
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                >
                                                                    {DISTRESS_TYPES.map((type) => (
                                                                        <div
                                                                            key={type}
                                                                            ref={type === "Foreclosure" ? foreclosureItemRef : undefined}
                                                                            className={`${styles.dropdown_item} ${type === "Foreclosure" && hoveringForeclosure ? styles.hovered : ""}`}
                                                                        >
                                                                            {type}
                                                                        </div>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    <div className={styles.filter_field}>
                                                        <label>Min Equity %</label>
                                                        <div className={styles.filter_select}>
                                                            Any
                                                            <i className="fa-solid fa-chevron-down"></i>
                                                        </div>
                                                    </div>
                                                    <div className={styles.filter_field}>
                                                        <label>Max Debt</label>
                                                        <div className={styles.filter_input}>e.g. 200000</div>
                                                    </div>
                                                </div>
                                                {/* Row 2 */}
                                                <div className={styles.filters_grid_row}>
                                                    <div className={styles.filter_field}>
                                                        <label>Bedrooms</label>
                                                        <div className={styles.filter_select}>
                                                            Any
                                                            <i className="fa-solid fa-chevron-down"></i>
                                                        </div>
                                                    </div>
                                                    <div className={styles.filter_field}>
                                                        <label>Bathrooms</label>
                                                        <div className={styles.filter_select}>
                                                            Any
                                                            <i className="fa-solid fa-chevron-down"></i>
                                                        </div>
                                                    </div>
                                                    <div className={styles.filter_field}>
                                                        <label>Min Sq Ft</label>
                                                        <div className={styles.filter_input}>e.g. 1500</div>
                                                    </div>
                                                    <div className={styles.filter_field}>
                                                        <label>Year Built After</label>
                                                        <div className={styles.filter_input}>e.g. 2000</div>
                                                    </div>
                                                    <div className={styles.filter_field_empty}></div>
                                                </div>
                                                <div className={styles.filters_actions}>
                                                    <button className={styles.btn_reset}>Reset</button>
                                                    <button ref={applyBtnRef} className={`${styles.btn_apply} ${action === "click-apply" ? styles.clicked : ""}`}>
                                                        Apply Filters
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Results */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className={styles.results_row}>
                                            <span>Found <strong>{visibleLeads.length}</strong> {visibleLeads.length === 1 ? "property" : "properties"}</span>
                                            <div className={styles.view_toggle}>
                                                <span className={styles.active}><i className="fa-solid fa-list"></i></span>
                                                <span><i className="fa-solid fa-grip"></i></span>
                                            </div>
                                        </div>

                                        <div className={styles.table_v2}>
                                            <div className={styles.table_header_v2}>
                                                <span className={styles.col_property}>PROPERTY</span>
                                                <span className={styles.col_type}>TYPE</span>
                                                <span className={styles.col_owner}>OWNER INFO</span>
                                                <span className={styles.col_details}>DETAILS</span>
                                                <span className={styles.col_equity}>EQUITY</span>
                                                <span className={styles.col_auction}>AUCTION</span>
                                                <span className={styles.col_actions}></span>
                                            </div>

                                            {/* Lead Rows */}
                                            <AnimatePresence>
                                                {visibleLeads.map((lead, index) => (
                                                    <motion.div
                                                        key={lead.id}
                                                        ref={index === 0 ? leadRowRef : undefined}
                                                        className={`${styles.table_row_v2} ${index === 0 && leadHovered ? styles.row_hovered : ""}`}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: -20, height: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <div className={styles.col_property}>
                                                            <img src={lead.image} alt="" />
                                                            <div>
                                                                <div className={styles.address}>{lead.address.replace("Street", "St")}</div>
                                                                <div className={styles.city}>{lead.city} {lead.zip}</div>
                                                            </div>
                                                        </div>
                                                        <div className={styles.col_type}>
                                                            <span className={`${styles.type_tag} ${styles["type_" + lead.type.toLowerCase().replace("-", "_")]}`}>
                                                                {lead.type}
                                                            </span>
                                                        </div>
                                                        <div className={styles.col_owner}>
                                                            <div>{lead.ownerName}</div>
                                                            <div className={styles.phone}>{lead.ownerPhone}</div>
                                                        </div>
                                                        <div className={styles.col_details}>
                                                            {lead.beds} bd • {lead.baths} ba • {lead.sqft.toLocaleString()} sqft
                                                        </div>
                                                        <div className={styles.col_equity}>
                                                            <div className={styles.equity_amount}>{lead.equity}</div>
                                                            <div className={styles.equity_pct}>{lead.equityPercent} equity</div>
                                                        </div>
                                                        <div className={styles.col_auction}>{lead.auctionDate}</div>
                                                        <div className={styles.col_actions}>
                                                            <span className={styles.action_icon}><i className="fa-solid fa-heart" style={{ color: "#ef4444" }}></i></span>
                                                            <span className={styles.action_icon}><i className="fa-solid fa-arrow-up-right-from-square"></i></span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="details-view"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={styles.details_view_v2}
                                >
                                    {/* Details Header */}
                                    <div className={styles.details_header_v2}>
                                        <div className={styles.details_title}>
                                            <span className={styles.page_label}>Property Details</span>
                                            <span className={styles.property_badge}>
                                                <span className={styles.badge_dot}></span>
                                                {selectedProperty.address}, {selectedProperty.city}
                                            </span>
                                        </div>
                                        <div className={styles.details_header_actions}>
                                            <button className={styles.btn_back}>
                                                <i className="fa-solid fa-arrow-left"></i>
                                                Back to Search
                                            </button>
                                            <button className={styles.btn_saved}>
                                                <i className="fa-solid fa-bookmark"></i>
                                                Saved
                                            </button>
                                            <button ref={exportBtnRef} className={`${styles.btn_export_v2} ${action === "hover-export" ? styles.hovered : ""} ${action === "click-export" ? styles.clicked : ""}`}>
                                                <i className="fa-solid fa-download"></i>
                                                Export
                                            </button>
                                            <div className={styles.user_avatar_small}>PU</div>
                                        </div>
                                    </div>

                                    {/* Property Content */}
                                    <div className={styles.details_content}>
                                        {/* Left - Image */}
                                        <div className={styles.property_image_section}>
                                            <div className={styles.main_image}>
                                                <div className={styles.image_badges}>
                                                    <span className={styles.badge_foreclosure}>
                                                        <i className="fa-solid fa-tag"></i>
                                                        {selectedProperty.type}
                                                    </span>
                                                    <span className={styles.badge_active}>{selectedProperty.status}</span>
                                                </div>
                                                <img src={selectedProperty.image} alt="" />
                                            </div>
                                            <div className={styles.image_thumbnails}>
                                                <img src={selectedProperty.image} alt="" className={styles.thumb_active} />
                                                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100" alt="" />
                                                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100" alt="" />
                                                <img src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=100" alt="" />
                                            </div>
                                        </div>

                                        {/* Right - Property Info */}
                                        <div className={styles.property_info_section}>
                                            <div className={styles.appraised_value}>
                                                <span className={styles.label}>Appraised Value</span>
                                                <span className={styles.value}>{selectedProperty.appraisedValue}</span>
                                            </div>

                                            <div className={styles.property_specs}>
                                                <div className={styles.spec}>
                                                    <i className="fa-solid fa-bed"></i>
                                                    <span>{selectedProperty.beds} Beds</span>
                                                </div>
                                                <div className={styles.spec}>
                                                    <i className="fa-solid fa-bath"></i>
                                                    <span>{selectedProperty.baths} Baths</span>
                                                </div>
                                                <div className={styles.spec}>
                                                    <i className="fa-solid fa-ruler-combined"></i>
                                                    <span>{selectedProperty.sqft.toLocaleString()} sqft</span>
                                                </div>
                                                <div className={styles.spec}>
                                                    <i className="fa-solid fa-calendar"></i>
                                                    <span>Built {selectedProperty.yearBuilt}</span>
                                                </div>
                                            </div>

                                            <div className={styles.equity_card}>
                                                <div className={styles.equity_header}>
                                                    <span>Estimated Equity</span>
                                                    <span className={styles.equity_value_lg}>{selectedProperty.equity}</span>
                                                </div>
                                                <div className={styles.equity_bar}>
                                                    <div className={styles.equity_fill} style={{ width: selectedProperty.equityPercent }}></div>
                                                </div>
                                                <span className={styles.equity_pct_label}>{selectedProperty.equityPercent} equity</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className={styles.details_tabs}>
                                        <button className={`${styles.tab} ${styles.active}`}>
                                            <i className="fa-solid fa-house"></i>
                                            Property Overview
                                        </button>
                                        <button className={styles.tab}>
                                            <i className="fa-solid fa-user"></i>
                                            Owner Details
                                        </button>
                                        <button className={styles.tab}>
                                            <i className="fa-solid fa-file-invoice-dollar"></i>
                                            Loan Details
                                        </button>
                                        <button className={styles.tab}>
                                            <i className="fa-solid fa-gavel"></i>
                                            Foreclosure Details
                                        </button>
                                    </div>

                                    {/* Property Information Grid */}
                                    <div className={styles.property_info_grid}>
                                        <div className={styles.info_header}>
                                            <i className="fa-solid fa-house"></i>
                                            <div>
                                                <strong>Property Information</strong>
                                                <span>Complete property details and specifications</span>
                                            </div>
                                        </div>
                                        <div className={styles.info_fields}>
                                            <div className={styles.info_field}>
                                                <span className={styles.field_label}>FULL ADDRESS</span>
                                                <span className={styles.field_value}>{selectedProperty.address}, {selectedProperty.city}</span>
                                            </div>
                                            <div className={styles.info_field}>
                                                <span className={styles.field_label}>COUNTY</span>
                                                <span className={styles.field_value}>{selectedProperty.county}</span>
                                            </div>
                                            <div className={styles.info_field}>
                                                <span className={styles.field_label}>PARCEL NUMBER</span>
                                                <span className={styles.field_value}>{selectedProperty.parcelNumber}</span>
                                            </div>
                                            <div className={styles.info_field}>
                                                <span className={styles.field_label}>PROPERTY TYPE</span>
                                                <span className={styles.field_value}>{selectedProperty.propertyType}</span>
                                            </div>
                                            <div className={styles.info_field}>
                                                <span className={styles.field_label}>ZONING</span>
                                                <span className={styles.field_value}>{selectedProperty.zoning}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Export Success Toast */}
                                    <AnimatePresence>
                                        {showSuccess && (
                                            <motion.div
                                                className={styles.export_toast}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                            >
                                                <i className="fa-solid fa-check-circle"></i>
                                                Lead exported successfully!
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Animated Cursor */}
                    <motion.div
                        className={`${styles.cursor_v2} ${isClicking ? styles.cursor_clicking : ""} ${isHovering ? styles.cursor_hover : ""}`}
                        animate={{
                            x: cursorPos.x,
                            y: cursorPos.y,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 150,
                            damping: 25,
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z"
                                fill="#2563EB"
                                stroke="#fff"
                                strokeWidth="1.5"
                            />
                        </svg>
                        {isClicking && <div className={styles.click_ripple_v2}></div>}
                    </motion.div>
                </div>
            </motion.div>

            {/* Caption */}
            <motion.p
                className={styles.dashboard_animation_caption}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
            >
                Search, filter, and export motivated seller leads in seconds
            </motion.p>
        </section>
    );
};

export default DashboardAnimation;
