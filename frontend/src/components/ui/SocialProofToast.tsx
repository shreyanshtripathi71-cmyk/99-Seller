"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Simple social proof data - deal closings and membership upgrades
const NAMES = [
    "James", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Ashley",
    "William", "Amanda", "Christopher", "Nicole", "Daniel", "Lauren", "Matthew", "Stephanie"
];

const LOCATIONS = [
    "Austin, TX", "Miami, FL", "Denver, CO", "Seattle, WA", "Chicago, IL",
    "Phoenix, AZ", "Nashville, TN", "Atlanta, GA", "Dallas, TX", "Tampa, FL",
    "Charlotte, NC", "Las Vegas, NV", "Houston, TX", "San Diego, CA"
];

const ACTIONS = [
    { text: "just closed a deal", icon: "fa-check-circle", color: "#10B981" },
    { text: "upgraded their membership", icon: "fa-arrow-up", color: "#3B82F6" },
    { text: "started their free trial", icon: "fa-play-circle", color: "#8B5CF6" },
];

const TIMES = ["just now", "1 min ago", "2 mins ago", "5 mins ago"];

const SocialProofToast: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [proofData, setProofData] = useState({
        name: "",
        location: "",
        action: ACTIONS[0],
        time: "just now"
    });
    const pathname = usePathname();
    const { isAuthenticated, user, subscription } = useAuth();

    // Determine if user should see social proof
    // Show to: guests (not authenticated) OR free users
    // Don't show to: paid users (premium/enterprise) OR admin
    const shouldShowSocialProof = () => {
        // Guest users - always show
        if (!isAuthenticated) return true;

        // Check user type and subscription
        const userType = user?.userType?.toLowerCase() || "";
        const plan = subscription?.plan?.toLowerCase() || "";

        // Admin - never show
        if (userType === "admin") return false;

        // Paid users (premium) - never show
        if (userType === "premium") return false;
        if (plan === "premium" || plan === "pro") return false;

        // Free users - show
        return true;
    };

    useEffect(() => {
        // Only run on homepage
        if (pathname !== "/") return;

        // Check if user should see social proof
        if (!shouldShowSocialProof()) return;

        const showRandomProof = () => {
            setProofData({
                name: NAMES[Math.floor(Math.random() * NAMES.length)],
                location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
                action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
                time: TIMES[Math.floor(Math.random() * TIMES.length)],
            });
            setIsVisible(true);

            // Auto-hide after 5 seconds
            setTimeout(() => setIsVisible(false), 5000);
        };

        // First popup after 10 seconds
        const initialTimer = setTimeout(showRandomProof, 10000);

        // Then every 30 seconds
        const interval = setInterval(showRandomProof, 30000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [pathname, isAuthenticated, user, subscription]);

    if (!isVisible) return null;

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    bottom: 20,
                    left: 20,
                    background: "#fff",
                    borderRadius: 8,
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    zIndex: 9999,
                    animation: "slideInUp 0.35s ease",
                    maxWidth: 280,
                    border: "1px solid #e2e8f0",
                }}
            >
                {/* Green dot indicator */}
                <div
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#10b981",
                        flexShrink: 0,
                    }}
                />

                {/* Text */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.4 }}>
                        <strong>{proofData.name}</strong> from {proofData.location} {proofData.action.text}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {proofData.time}
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={() => setIsVisible(false)}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: 2,
                        fontSize: 12,
                        lineHeight: 1,
                    }}
                >
                    ×
                </button>
            </div>

            <style jsx global>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default SocialProofToast;
