"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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
}

// Social proof data - realistic first names and cities
const SOCIAL_PROOF_NAMES = [
  "James", "Mary", "Robert", "Patricia", "Michael", "Jennifer", "William", "Linda",
  "David", "Elizabeth", "Richard", "Barbara", "Joseph", "Susan", "Thomas", "Jessica",
  "Christopher", "Sarah", "Charles", "Karen", "Daniel", "Lisa", "Matthew", "Nancy",
  "Anthony", "Betty", "Mark", "Margaret", "Donald", "Sandra", "Steven", "Ashley"
];
const SOCIAL_PROOF_LOCATIONS = [
  "Austin, TX", "Miami, FL", "Denver, CO", "Seattle, WA", "Chicago, IL", "Boston, MA",
  "Phoenix, AZ", "Nashville, TN", "Atlanta, GA", "San Diego, CA", "Dallas, TX", "Portland, OR",
  "Charlotte, NC", "Tampa, FL", "Las Vegas, NV", "Orlando, FL", "Houston, TX", "Minneapolis, MN"
];
const SOCIAL_PROOF_ACTIONS = [
  { text: "just signed up", icon: "fa-user-plus", color: "#10B981" },
  { text: "started their free trial", icon: "fa-rocket", color: "#8B5CF6" },
  { text: "upgraded to Pro", icon: "fa-crown", color: "#F59E0B" },
  { text: "found 12 new leads", icon: "fa-magnifying-glass", color: "#3B82F6" },
  { text: "exported 50+ contacts", icon: "fa-download", color: "#06B6D4" },
  { text: "closed a deal", icon: "fa-handshake", color: "#10B981" },
];
const SOCIAL_PROOF_TIMES = ["just now", "2 minutes ago", "5 minutes ago", "8 minutes ago", "12 minutes ago"];
const SOCIAL_PROOF_IMAGES = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/45.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/22.jpg",
  "https://randomuser.me/api/portraits/women/32.jpg",
  "https://randomuser.me/api/portraits/men/55.jpg",
  "https://randomuser.me/api/portraits/women/17.jpg",
];

// Default pop-ins that auto-initialize for new visitors
const DEFAULT_POPPINS: Poppin[] = [
  {
    id: "welcome-modal-1",
    name: "Welcome Offer Modal",
    type: "modal",
    title: "Unlock 10,000+ Motivated Seller Leads",
    message: "Join thousands of real estate professionals who are closing more deals with verified pre-foreclosure, probate, and divorce leads.",
    buttonText: "Start 7-Day Free Trial",
    buttonLink: "/dashboard/subscription",
    secondaryButtonText: "View Lead Categories",
    secondaryButtonLink: "/search",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
    accentColor: "#2563eb",
    position: "center",
    trigger: "time-delay",
    triggerValue: 8,
    pages: ["/"],
    isActive: true,
    priority: 1,
    showOnMobile: true,
    showOnDesktop: true,
    dismissable: true,
    showOnce: true,
  },
  {
    id: "pricing-exit-2",
    name: "Pricing Exit Intent",
    type: "modal",
    title: "Limited Time: Get 20% Off",
    message: "Don't miss out! Use code SELLER20 at checkout for 20% off your first 3 months. Access unlimited leads with skip-traced contact info.",
    buttonText: "Claim My Discount",
    buttonLink: "/dashboard/subscription",
    imageUrl: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&q=80",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    accentColor: "#2563eb",
    position: "center",
    trigger: "exit-intent",
    pages: ["/pricing"],
    isActive: true,
    priority: 2,
    showOnMobile: false,
    showOnDesktop: true,
    dismissable: true,
    showOnce: true,
  },
  {
    id: "social-proof-3",
    name: "Social Proof Notification",
    type: "social-proof",
    title: "",
    message: "",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    accentColor: "#2563eb",
    position: "bottom-left",
    trigger: "time-delay",
    triggerValue: 15,
    pages: ["/", "/pricing"],
    isActive: true,
    priority: 6,
    showOnMobile: false,
    showOnDesktop: true,
    dismissable: true,
    showOnce: false,
  },
];

const MarketingPopup: React.FC = () => {
  const [activePoppin, setActivePoppin] = useState<Poppin | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [socialProofData, setSocialProofData] = useState({ name: "", location: "", action: { text: "just signed up", icon: "fa-user-plus", color: "#10B981" }, time: "just now", image: "" });
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useAuth();

  const loadPoppins = useCallback(async () => {
    try {
      // Hide pop-ins from logged-in normal users on dashboard pages
      // Only show pop-ins to:
      // 1. Non-authenticated users on public pages
      // 2. Admins on any page
      const isDashboardPage = pathname.startsWith("/dashboard");
      if (isDashboardPage && isAuthenticated && !isAdmin) {
        return; // Don't show pop-ins to normal users in dashboard
      }

      const dismissedIds = JSON.parse(localStorage.getItem("99sellers_dismissed_poppins") || "[]");
      setDismissed(dismissedIds);

      // Fetch live poppins from API
      let poppins: Poppin[] = [];
      try {
        const { poppinsAPI } = require("@/services/api");
        const result = await poppinsAPI.getActive();
        if (result.success && result.data && result.data.length > 0) {
          poppins = result.data;
        } else {
          // Fallback to defaults if API fails or returns no poppins
          poppins = DEFAULT_POPPINS;
        }
      } catch (err) {
        console.warn("Failed to fetch live poppins, using defaults", err);
        poppins = DEFAULT_POPPINS;
      }

      // Filter active poppins for current page
      const applicablePoppins = poppins.filter(p => {
        if (!p.isActive) return false;
        if (dismissedIds.includes(p.id) && p.showOnce) return false;

        // Social proof pop-ins: Show ONLY to:
        // 1. Guest users (not authenticated) on homepage (/)
        // 2. Admins on any page
        if (p.type === "social-proof") {
          const isHomePage = pathname === "/";
          const isGuestOnHomepage = !isAuthenticated && isHomePage;
          const showToAdmin = isAdmin;
          if (!isGuestOnHomepage && !showToAdmin) {
            return false;
          }
        }

        // Check if current page matches
        const matchesPage = p.pages.some(page => {
          if (page === "*" || page === "all") return true;
          if (page === pathname) return true;
          if (pathname.startsWith(page)) return true;
          return false;
        });

        if (!matchesPage) return false;

        // Check dates
        const now = new Date();
        if (p.startDate && new Date(p.startDate) > now) return false;
        if (p.endDate && new Date(p.endDate) < now) return false;

        return true;
      });

      // Sort by priority and get highest
      applicablePoppins.sort((a, b) => a.priority - b.priority);

      if (applicablePoppins.length > 0) {
        const poppin = applicablePoppins[0];

        // Handle different triggers
        if (poppin.trigger === "page-load") {
          setTimeout(() => {
            setActivePoppin(poppin);
            setIsVisible(true);
          }, 500);
        } else if (poppin.trigger === "time-delay") {
          setTimeout(() => {
            setActivePoppin(poppin);
            setIsVisible(true);
          }, (poppin.triggerValue || 5) * 1000);
        } else if (poppin.trigger === "scroll") {
          // Will be handled by scroll listener
          setActivePoppin(poppin);
        } else if (poppin.trigger === "exit-intent") {
          setActivePoppin(poppin);
        } else {
          setActivePoppin(poppin);
          setIsVisible(true);
        }
      }
    } catch (error) {
      console.error("Error loading poppins:", error);
    }
  }, [pathname, isAuthenticated, isAdmin]);

  useEffect(() => {
    loadPoppins();
  }, [loadPoppins]);

  // Exit intent detection
  useEffect(() => {
    if (activePoppin?.trigger === "exit-intent" && !isVisible) {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setIsVisible(true);
          document.removeEventListener("mouseleave", handleMouseLeave);
        }
      };
      document.addEventListener("mouseleave", handleMouseLeave);
      return () => document.removeEventListener("mouseleave", handleMouseLeave);
    }
  }, [activePoppin, isVisible]);

  // Scroll trigger handler
  useEffect(() => {
    if (activePoppin?.trigger === "scroll" && !isVisible) {
      const handleScroll = () => {
        const scrollDepth = activePoppin.triggerValue || 50;
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

        if (scrollPercentage >= scrollDepth) {
          setIsVisible(true);
          window.removeEventListener("scroll", handleScroll);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [activePoppin, isVisible]);

  // Countdown timer
  useEffect(() => {
    if (activePoppin?.type === "countdown" && activePoppin.countdownEnd) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const end = new Date(activePoppin.countdownEnd!).getTime();
        const diff = end - now;

        if (diff > 0) {
          setCountdown({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
          });
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [activePoppin]);

  // Social proof rotation with realistic data
  useEffect(() => {
    if (activePoppin?.type === "social-proof") {
      const showRandomProof = () => {
        const randomAction = SOCIAL_PROOF_ACTIONS[Math.floor(Math.random() * SOCIAL_PROOF_ACTIONS.length)];
        setSocialProofData({
          name: SOCIAL_PROOF_NAMES[Math.floor(Math.random() * SOCIAL_PROOF_NAMES.length)],
          location: SOCIAL_PROOF_LOCATIONS[Math.floor(Math.random() * SOCIAL_PROOF_LOCATIONS.length)],
          action: randomAction,
          time: SOCIAL_PROOF_TIMES[Math.floor(Math.random() * SOCIAL_PROOF_TIMES.length)],
          image: SOCIAL_PROOF_IMAGES[Math.floor(Math.random() * SOCIAL_PROOF_IMAGES.length)],
        });
        setIsVisible(true);

        // Hide after 6 seconds
        setTimeout(() => setIsVisible(false), 6000);
      };

      // Initial delay of 8 seconds before first popup
      const initialTimer = setTimeout(showRandomProof, 8000);
      // Then show every 25 seconds
      const interval = setInterval(showRandomProof, 25000);
      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }
  }, [activePoppin]);

  const handleDismiss = () => {
    if (activePoppin) {
      if (activePoppin.showOnce) {
        const newDismissed = [...dismissed, activePoppin.id];
        setDismissed(newDismissed);
        localStorage.setItem("99sellers_dismissed_poppins", JSON.stringify(newDismissed));
      }
    }
    setIsVisible(false);
    setIsSubmitted(false);
    setEmail("");
    setTimeout(() => setActivePoppin(null), 300);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);

    // Auto-dismiss after success
    setTimeout(handleDismiss, 3000);
  };

  if (!activePoppin || !isVisible) return null;

  // ========== BANNER TYPE ==========
  if (activePoppin.type === "banner") {
    return (
      <div style={{
        position: "fixed",
        top: activePoppin.position === "top" ? 0 : "auto",
        bottom: activePoppin.position === "bottom" ? 0 : "auto",
        left: 0,
        right: 0,
        background: activePoppin.backgroundColor,
        color: activePoppin.textColor,
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        zIndex: 9999,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        animation: "slideIn 0.3s ease",
      }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>
          {activePoppin.title} {activePoppin.message}
        </span>
        {activePoppin.buttonText && activePoppin.buttonLink && (
          <Link
            href={activePoppin.buttonLink}
            style={{
              background: "rgba(255,255,255,0.2)",
              color: activePoppin.textColor,
              padding: "6px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {activePoppin.buttonText}
          </Link>
        )}
        {activePoppin.dismissable && (
          <button
            onClick={handleDismiss}
            style={{
              background: "none",
              border: "none",
              color: activePoppin.textColor,
              cursor: "pointer",
              padding: 4,
              opacity: 0.7,
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        )}
      </div>
    );
  }

  // ========== FLOATING BAR TYPE ==========
  if (activePoppin.type === "floating-bar") {
    return (
      <div style={{
        position: "fixed",
        top: activePoppin.position === "top" ? 0 : "auto",
        bottom: activePoppin.position === "bottom" ? 0 : "auto",
        left: 0,
        right: 0,
        background: `linear-gradient(135deg, ${activePoppin.backgroundColor} 0%, ${activePoppin.accentColor || activePoppin.backgroundColor} 100%)`,
        color: activePoppin.textColor,
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        zIndex: 9999,
        boxShadow: activePoppin.position === "top" ? "0 4px 20px rgba(0,0,0,0.15)" : "0 -4px 20px rgba(0,0,0,0.15)",
        animation: activePoppin.position === "top" ? "slideDown 0.4s ease" : "slideUp 0.4s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <i className="fa-solid fa-fire" style={{ fontSize: 18 }}></i>
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {activePoppin.title}
          </span>
          <span style={{ fontSize: 14, opacity: 0.9 }}>
            {activePoppin.message}
          </span>
        </div>

        {activePoppin.countdownEnd && (
          <div style={{ display: "flex", gap: 8, fontSize: 13, fontWeight: 600 }}>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 4 }}>{countdown.days}d</span>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 4 }}>{countdown.hours}h</span>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 4 }}>{countdown.minutes}m</span>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 4 }}>{countdown.seconds}s</span>
          </div>
        )}

        {activePoppin.buttonText && activePoppin.buttonLink && (
          <Link
            href={activePoppin.buttonLink}
            onClick={handleDismiss}
            style={{
              background: "#fff",
              color: activePoppin.backgroundColor,
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {activePoppin.buttonText}
          </Link>
        )}
        {activePoppin.dismissable && (
          <button
            onClick={handleDismiss}
            style={{
              background: "none",
              border: "none",
              color: activePoppin.textColor,
              cursor: "pointer",
              padding: 4,
              opacity: 0.8,
              marginLeft: 8,
            }}
          >
            <i className="fa-solid fa-times"></i>
          </button>
        )}
        <style jsx global>{`
          @keyframes slideDown { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  // ========== FULLSCREEN OVERLAY TYPE ==========
  if (activePoppin.type === "fullscreen") {
    return (
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: activePoppin.imageUrl
              ? `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%), url(${activePoppin.imageUrl}) center/cover`
              : `linear-gradient(135deg, ${activePoppin.backgroundColor} 0%, ${activePoppin.accentColor || "#1e40af"} 100%)`,
            color: activePoppin.textColor,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <div style={{
            textAlign: "center",
            maxWidth: 600,
            padding: 40,
          }}>
            {activePoppin.dismissable && (
              <button
                onClick={handleDismiss}
                style={{
                  position: "absolute",
                  top: 24,
                  right: 24,
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 12,
                  borderRadius: "50%",
                  fontSize: 18,
                }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}

            <div style={{
              fontSize: 48,
              marginBottom: 24,
              animation: "bounceIn 0.6s ease",
            }}>
              🎉
            </div>

            <h2 style={{
              fontSize: 36,
              fontWeight: 800,
              marginBottom: 16,
              lineHeight: 1.2,
            }}>
              {activePoppin.title}
            </h2>

            <p style={{
              fontSize: 18,
              opacity: 0.9,
              marginBottom: 32,
              lineHeight: 1.6,
            }}>
              {activePoppin.message}
            </p>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {activePoppin.buttonText && activePoppin.buttonLink && (
                <Link
                  href={activePoppin.buttonLink}
                  onClick={handleDismiss}
                  style={{
                    display: "inline-block",
                    background: "#fff",
                    color: activePoppin.backgroundColor,
                    padding: "16px 40px",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    transition: "transform 0.2s",
                  }}
                >
                  {activePoppin.buttonText}
                </Link>
              )}
              {activePoppin.secondaryButtonText && (
                <button
                  onClick={handleDismiss}
                  style={{
                    background: "transparent",
                    border: "2px solid rgba(255,255,255,0.3)",
                    color: "#fff",
                    padding: "14px 32px",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {activePoppin.secondaryButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes bounceIn { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        `}</style>
      </>
    );
  }

  // ========== EMAIL CAPTURE TYPE ==========
  if (activePoppin.type === "email-capture") {
    return (
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9998,
            animation: "fadeIn 0.3s ease",
          }}
          onClick={activePoppin.dismissable ? handleDismiss : undefined}
        />
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          borderRadius: 20,
          maxWidth: 460,
          width: "90%",
          overflow: "hidden",
          zIndex: 9999,
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          animation: "scaleIn 0.3s ease",
        }}>
          {/* Header with gradient */}
          <div style={{
            background: `linear-gradient(135deg, ${activePoppin.backgroundColor} 0%, ${activePoppin.accentColor || "#1d4ed8"} 100%)`,
            padding: "32px 24px",
            textAlign: "center",
            color: "#fff",
          }}>
            {activePoppin.dismissable && (
              <button
                onClick={handleDismiss}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: "50%",
                }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}
            <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{activePoppin.title}</h3>
          </div>

          {/* Content */}
          <div style={{ padding: 24 }}>
            {isSubmitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                  width: 60,
                  height: 60,
                  background: "#ECFDF5",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <i className="fa-solid fa-check" style={{ color: "#10B981", fontSize: 28 }}></i>
                </div>
                <h4 style={{ color: "#111827", marginBottom: 8 }}>Success!</h4>
                <p style={{ color: "#6B7280", fontSize: 14 }}>
                  {activePoppin.successMessage || "You're now subscribed!"}
                </p>
              </div>
            ) : (
              <>
                <p style={{ color: "#64748b", fontSize: 15, marginBottom: 20, textAlign: "center", lineHeight: 1.6 }}>
                  {activePoppin.message}
                </p>

                <form onSubmit={handleEmailSubmit}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activePoppin.emailPlaceholder || "Enter your email"}
                    required
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      border: "2px solid #e2e8f0",
                      borderRadius: 10,
                      fontSize: 15,
                      marginBottom: 12,
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      background: `linear-gradient(135deg, ${activePoppin.backgroundColor} 0%, ${activePoppin.accentColor || "#1d4ed8"} 100%)`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: isSubmitting ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {isSubmitting ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> Subscribing...</>
                    ) : (
                      <>{activePoppin.buttonText || "Subscribe"}</>
                    )}
                  </button>
                </form>

                <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", marginTop: 12 }}>
                  <i className="fa-solid fa-lock me-1"></i>
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
        <style jsx global>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        `}</style>
      </>
    );
  }

  // ========== SOCIAL PROOF TYPE ==========
  if (activePoppin.type === "social-proof") {
    return (
      <div style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        background: "#fff",
        borderRadius: 16,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
        zIndex: 9999,
        animation: "socialProofSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        width: 340,
        overflow: "hidden",
      }}>
        {/* Header with dismiss */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderBottom: "1px solid #e2e8f0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <i className={`fa-solid ${socialProofData.action.icon}`} style={{ fontSize: 12, color: socialProofData.action.color }}></i>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Live Activity
            </span>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: 4,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className="fa-solid fa-times" style={{ fontSize: 11 }}></i>
          </button>
        </div>

        {/* Main content */}
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Profile image */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={socialProofData.image}
              alt=""
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
            <div style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 20,
              height: 20,
              background: socialProofData.action.color,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}>
              <i className={`fa-solid ${socialProofData.action.icon}`} style={{ fontSize: 9, color: "#fff" }}></i>
            </div>
          </div>

          {/* Text content */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 3, lineHeight: 1.4 }}>
              {socialProofData.name} from {socialProofData.location}
            </div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>
              {socialProofData.action.text}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s infinite" }}></span>
              {socialProofData.time}
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div style={{
          padding: "12px 16px",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>
            Start your free trial today
          </span>
          <a
            href="/dashboard/subscription"
            style={{
              background: "#fff",
              color: "#2563eb",
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Try Free <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }}></i>
          </a>
        </div>

        <style jsx global>{`
          @keyframes socialProofSlideIn {
            from { opacity: 0; transform: translateX(-100%) scale(0.9); }
            to { opacity: 1; transform: translateX(0) scale(1); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // ========== SIDEBAR TYPE ==========
  if (activePoppin.type === "sidebar") {
    const isLeft = activePoppin.position === "left";
    return (
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 9998,
            animation: "fadeIn 0.3s ease",
          }}
          onClick={activePoppin.dismissable ? handleDismiss : undefined}
        />
        <div style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          [isLeft ? "left" : "right"]: 0,
          width: 380,
          maxWidth: "90vw",
          background: "#fff",
          zIndex: 9999,
          boxShadow: isLeft ? "4px 0 30px rgba(0,0,0,0.15)" : "-4px 0 30px rgba(0,0,0,0.15)",
          animation: isLeft ? "slideFromLeft 0.3s ease" : "slideFromRight 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${activePoppin.backgroundColor} 0%, ${activePoppin.accentColor || "#1d4ed8"} 100%)`,
            padding: "24px 20px",
            color: "#fff",
          }}>
            {activePoppin.dismissable && (
              <button
                onClick={handleDismiss}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 8,
                  borderRadius: "50%",
                }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            )}
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>{activePoppin.title}</h3>
            <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>{activePoppin.message}</p>
          </div>

          {/* Content */}
          <div style={{ padding: 24, flex: 1 }}>
            <div style={{
              background: "#f8fafc",
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", marginBottom: 12 }}>
                What you&apos;ll get:
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {["Unlimited property searches", "Full owner contact info", "Export to CSV/Excel", "Priority support"].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 14, color: "#475569" }}>
                    <i className="fa-solid fa-check" style={{ color: "#10b981" }}></i>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {activePoppin.buttonText && activePoppin.buttonLink && (
              <Link
                href={activePoppin.buttonLink}
                onClick={handleDismiss}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px 24px",
                  background: `linear-gradient(135deg, ${activePoppin.backgroundColor} 0%, ${activePoppin.accentColor || "#1d4ed8"} 100%)`,
                  color: "#fff",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                {activePoppin.buttonText}
              </Link>
            )}
          </div>
        </div>
        <style jsx global>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideFromLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          @keyframes slideFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}</style>
      </>
    );
  }

  // ========== COUNTDOWN TYPE ==========
  if (activePoppin.type === "countdown") {
    return (
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 9998,
            animation: "fadeIn 0.3s ease",
          }}
          onClick={activePoppin.dismissable ? handleDismiss : undefined}
        />
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `linear-gradient(135deg, ${activePoppin.backgroundColor} 0%, ${activePoppin.accentColor || "#1d4ed8"} 100%)`,
          color: "#fff",
          borderRadius: 24,
          padding: 40,
          textAlign: "center",
          maxWidth: 500,
          width: "90%",
          zIndex: 9999,
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          animation: "scaleIn 0.3s ease",
        }}>
          {activePoppin.dismissable && (
            <button
              onClick={handleDismiss}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: 8,
                borderRadius: "50%",
              }}
            >
              <i className="fa-solid fa-times"></i>
            </button>
          )}

          <div style={{ fontSize: 32, marginBottom: 16 }}>⏰</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{activePoppin.title}</h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 32, lineHeight: 1.5 }}>{activePoppin.message}</p>

          {/* Countdown Timer */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32 }}>
            {[
              { value: countdown.days, label: "Days" },
              { value: countdown.hours, label: "Hours" },
              { value: countdown.minutes, label: "Mins" },
              { value: countdown.seconds, label: "Secs" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: "12px 16px",
                minWidth: 70,
              }}>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{String(item.value).padStart(2, "0")}</div>
                <div style={{ fontSize: 11, textTransform: "uppercase", opacity: 0.8 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {activePoppin.buttonText && activePoppin.buttonLink && (
            <Link
              href={activePoppin.buttonLink}
              onClick={handleDismiss}
              style={{
                display: "inline-block",
                background: "#fff",
                color: activePoppin.backgroundColor,
                padding: "16px 48px",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              {activePoppin.buttonText}
            </Link>
          )}
        </div>
        <style jsx global>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        `}</style>
      </>
    );
  }

  // ========== MODAL TYPE ==========
  if (activePoppin.type === "modal") {
    const hasImage = activePoppin.imageUrl && activePoppin.imageUrl.trim() !== "";

    return (
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 9998,
            animation: "fadeIn 0.3s ease",
          }}
          onClick={activePoppin.dismissable ? handleDismiss : undefined}
        />
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          borderRadius: 24,
          maxWidth: hasImage ? 720 : 480,
          width: "92%",
          zIndex: 9999,
          boxShadow: "0 32px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
          animation: "modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          overflow: "hidden",
          display: hasImage ? "grid" : "block",
          gridTemplateColumns: hasImage ? "1.1fr 1fr" : "1fr",
        }}>
          {/* Image Section with Overlay */}
          {hasImage && (
            <div style={{
              position: "relative",
              backgroundImage: `url(${activePoppin.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: 380,
            }}>
              {/* Gradient overlay */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(135deg, ${activePoppin.accentColor || "#2563eb"}88 0%, ${activePoppin.backgroundColor}ee 100%)`,
              }} />

              {/* Stats floating on image */}
              <div style={{
                position: "absolute",
                bottom: 24,
                left: 24,
                right: 24,
                display: "flex",
                gap: 16,
              }}>
                <div style={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  flex: 1,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>10K+</div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Active Leads</div>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  flex: 1,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>98%</div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>Data Accuracy</div>
                </div>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div style={{ padding: hasImage ? "32px 28px" : "40px 32px", position: "relative" }}>
            {activePoppin.dismissable && (
              <button
                onClick={handleDismiss}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "#f1f5f9",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: 0,
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <i className="fa-solid fa-times" style={{ fontSize: 12 }}></i>
              </button>
            )}

            {/* Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: `linear-gradient(135deg, ${activePoppin.accentColor || "#2563eb"}15 0%, ${activePoppin.accentColor || "#2563eb"}08 100%)`,
              color: activePoppin.accentColor || "#2563eb",
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 16,
            }}>
              <i className="fa-solid fa-bolt"></i>
              Limited Time Offer
            </div>

            <h3 style={{
              fontSize: hasImage ? 22 : 26,
              fontWeight: 800,
              marginBottom: 12,
              paddingRight: 32,
              color: "#0f172a",
              lineHeight: 1.3,
            }}>
              {activePoppin.title}
            </h3>

            <p style={{
              fontSize: 15,
              color: "#475569",
              marginBottom: 24,
              lineHeight: 1.7
            }}>
              {activePoppin.message}
            </p>

            {/* Trust indicators */}
            <div style={{
              display: "flex",
              gap: 16,
              marginBottom: 24,
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b" }}>
                <i className="fa-solid fa-check-circle" style={{ color: "#10b981" }}></i>
                7-Day Free Trial
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b" }}>
                <i className="fa-solid fa-check-circle" style={{ color: "#10b981" }}></i>
                Cancel Anytime
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activePoppin.buttonText && activePoppin.buttonLink && (
                <Link
                  href={activePoppin.buttonLink}
                  onClick={handleDismiss}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: `linear-gradient(135deg, ${activePoppin.accentColor || "#2563eb"} 0%, ${activePoppin.backgroundColor || "#1d4ed8"} 100%)`,
                    color: "#ffffff",
                    padding: "15px 28px",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: "none",
                    textAlign: "center",
                    boxShadow: `0 4px 14px ${activePoppin.accentColor || "#2563eb"}40`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  {activePoppin.buttonText}
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }}></i>
                </Link>
              )}

              {activePoppin.secondaryButtonText && activePoppin.secondaryButtonLink && (
                <Link
                  href={activePoppin.secondaryButtonLink}
                  onClick={handleDismiss}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: "transparent",
                    color: "#64748b",
                    padding: "12px 24px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    textAlign: "center",
                    transition: "color 0.2s",
                  }}
                >
                  <i className="fa-solid fa-play-circle"></i>
                  {activePoppin.secondaryButtonText}
                </Link>
              )}
            </div>

            {/* Social proof */}
            <div style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <div style={{ display: "flex" }}>
                {[0, 1, 2].map(i => (
                  <img
                    key={i}
                    src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${20 + i}.jpg`}
                    alt=""
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "2px solid #fff",
                      marginLeft: i > 0 ? -8 : 0,
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                <strong style={{ color: "#0f172a" }}>2,400+</strong> agents already using 99Sellers
              </div>
            </div>
          </div>
        </div>
        <style jsx global>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalSlideIn { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        `}</style>
      </>
    );
  }

  // ========== TOAST TYPE ==========
  if (activePoppin.type === "toast") {
    const positionStyles: React.CSSProperties = {
      position: "fixed",
      zIndex: 9999,
      ...(activePoppin.position === "bottom-right" && { bottom: 24, right: 24 }),
      ...(activePoppin.position === "bottom-left" && { bottom: 24, left: 24 }),
      ...(activePoppin.position === "top" && { top: 24, right: 24 }),
      ...(activePoppin.position === "bottom" && { bottom: 24, right: 24 }),
    };

    return (
      <div style={{
        ...positionStyles,
        background: "#fff",
        padding: 0,
        borderRadius: 16,
        maxWidth: 380,
        boxShadow: "0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
        animation: "toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        overflow: "hidden",
      }}>
        {/* Accent bar */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, ${activePoppin.accentColor || "#2563eb"} 0%, ${activePoppin.backgroundColor || "#1d4ed8"} 100%)`,
        }} />

        <div style={{ padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
          {/* Icon */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${activePoppin.accentColor || "#2563eb"}15 0%, ${activePoppin.accentColor || "#2563eb"}05 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <i className="fa-solid fa-bell" style={{ color: activePoppin.accentColor || "#2563eb", fontSize: 18 }}></i>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: "#0f172a" }}>
              {activePoppin.title}
            </h4>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: activePoppin.buttonText ? 12 : 0, lineHeight: 1.5 }}>
              {activePoppin.message}
            </p>
            {activePoppin.buttonText && activePoppin.buttonLink && (
              <Link
                href={activePoppin.buttonLink}
                onClick={handleDismiss}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: activePoppin.accentColor || "#2563eb",
                  textDecoration: "none",
                }}
              >
                {activePoppin.buttonText}
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }}></i>
              </Link>
            )}
          </div>

          {activePoppin.dismissable && (
            <button
              onClick={handleDismiss}
              style={{
                background: "#f1f5f9",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: 0,
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-times" style={{ fontSize: 11 }}></i>
            </button>
          )}
        </div>
        <style jsx global>{`
          @keyframes toastSlideIn { from { opacity: 0; transform: translateX(100%) scale(0.9); } to { opacity: 1; transform: translateX(0) scale(1); } }
        `}</style>
      </div>
    );
  }

  // ========== SLIDE-IN TYPE (Default) ==========
  const hasSlideInImage = activePoppin.imageUrl && activePoppin.imageUrl.trim() !== "";

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      background: "#fff",
      borderRadius: 20,
      maxWidth: 400,
      boxShadow: "0 20px 50px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)",
      zIndex: 9999,
      animation: "slideInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      overflow: "hidden",
    }}>
      {/* Image header if available */}
      {hasSlideInImage && (
        <div style={{
          height: 140,
          backgroundImage: `linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6)), url(${activePoppin.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}>
          {activePoppin.dismissable && (
            <button
              onClick={handleDismiss}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(4px)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="fa-solid fa-times" style={{ fontSize: 11 }}></i>
            </button>
          )}
        </div>
      )}

      <div style={{ padding: hasSlideInImage ? "20px 24px 24px" : "28px 24px" }}>
        {!hasSlideInImage && activePoppin.dismissable && (
          <button
            onClick={handleDismiss}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "#f1f5f9",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className="fa-solid fa-times" style={{ fontSize: 11 }}></i>
          </button>
        )}

        {/* Icon for non-image variant */}
        {!hasSlideInImage && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${activePoppin.accentColor || "#2563eb"} 0%, ${activePoppin.backgroundColor || "#1d4ed8"} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: `0 4px 12px ${activePoppin.accentColor || "#2563eb"}40`,
          }}>
            <i className="fa-solid fa-gift" style={{ color: "#fff", fontSize: 22 }}></i>
          </div>
        )}

        <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0f172a", paddingRight: hasSlideInImage ? 0 : 32 }}>
          {activePoppin.title}
        </h4>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
          {activePoppin.message}
        </p>

        {activePoppin.buttonText && activePoppin.buttonLink && (
          <Link
            href={activePoppin.buttonLink}
            onClick={handleDismiss}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: `linear-gradient(135deg, ${activePoppin.accentColor || "#2563eb"} 0%, ${activePoppin.backgroundColor || "#1d4ed8"} 100%)`,
              color: "#fff",
              padding: "14px 24px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: `0 4px 14px ${activePoppin.accentColor || "#2563eb"}40`,
            }}
          >
            {activePoppin.buttonText}
            <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }}></i>
          </Link>
        )}
      </div>
      <style jsx global>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(100px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

export default MarketingPopup;
