"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface FeatureGatePopupProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    imageUrl?: string;
    featureName?: string;
    onStartTrial?: () => void;
    onUpgrade?: () => void;
    showTrialButton?: boolean;
}

const FeatureGatePopup: React.FC<FeatureGatePopupProps> = ({
    isOpen,
    onClose,
    title = "Unlock Premium Features",
    message = "Upgrade to Pro to access this feature and unlock the full potential of 99Sellers.",
    imageUrl,
    featureName,
    onStartTrial,
    onUpgrade,
    showTrialButton = true,
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = () => {
        if (onUpgrade) {
            onUpgrade();
        } else {
            router.push("/dashboard/subscription");
        }
        onClose();
    };

    const handleTrial = async () => {
        setIsLoading(true);
        if (onStartTrial) {
            await onStartTrial();
        } else {
            router.push("/dashboard/subscription?trial=true");
        }
        setIsLoading(false);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(4px)",
                    zIndex: 9998,
                    animation: "fadeIn 0.2s ease-out",
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 9999,
                    width: "100%",
                    maxWidth: imageUrl ? 520 : 420,
                    animation: "slideIn 0.3s ease-out",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        borderRadius: 20,
                        overflow: "hidden",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            border: "none",
                            background: "rgba(0, 0, 0, 0.1)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 10,
                            transition: "background 0.2s",
                        }}
                    >
                        <i className="fa-solid fa-xmark" style={{ color: "#64748B", fontSize: 14 }}></i>
                    </button>

                    {/* Image section (optional) */}
                    {imageUrl && (
                        <div
                            style={{
                                width: "100%",
                                height: 180,
                                background: `linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(29, 78, 216, 0.9) 100%), url(${imageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    background: "rgba(255, 255, 255, 0.2)",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backdropFilter: "blur(10px)",
                                }}
                            >
                                <i className="fa-solid fa-crown" style={{ color: "#fff", fontSize: 36 }}></i>
                            </div>
                        </div>
                    )}

                    {/* Content section */}
                    <div style={{ padding: imageUrl ? "24px 32px 32px" : "40px 32px 32px" }}>
                        {/* Icon (only if no image) */}
                        {!imageUrl && (
                            <div
                                style={{
                                    width: 72,
                                    height: 72,
                                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 20px",
                                    boxShadow: "0 10px 30px rgba(37, 99, 235, 0.35)",
                                }}
                            >
                                <i className="fa-solid fa-download" style={{ color: "#fff", fontSize: 32 }}></i>
                            </div>
                        )}

                        {/* Feature badge */}
                        {featureName && (
                            <div
                                style={{
                                    display: "inline-block",
                                    padding: "4px 12px",
                                    background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#2563EB",
                                    marginBottom: 12,
                                }}
                            >
                                <i className="fa-solid fa-lock me-1" style={{ fontSize: 10 }}></i>
                                {featureName}
                            </div>
                        )}

                        {/* Title */}
                        <h2
                            style={{
                                margin: "0 0 12px",
                                fontSize: 24,
                                fontWeight: 700,
                                color: "#1E1B4B",
                                textAlign: "center",
                            }}
                        >
                            {title}
                        </h2>

                        {/* Message */}
                        <p
                            style={{
                                margin: "0 0 24px",
                                fontSize: 15,
                                color: "#64748B",
                                lineHeight: 1.6,
                                textAlign: "center",
                            }}
                        >
                            {message}
                        </p>

                        {/* Features list */}
                        <div
                            style={{
                                background: "#F8FAFC",
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 24,
                            }}
                        >
                            {[
                                "Full property addresses & contact info",
                                "Unlimited data exports (CSV, Excel, JSON)",
                                "Detailed financial & loan information",
                                "Priority customer support",
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        marginBottom: index < 3 ? 10 : 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                            background: "#ECFDF5",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <i className="fa-solid fa-check" style={{ color: "#10B981", fontSize: 10 }}></i>
                                    </div>
                                    <span style={{ fontSize: 13, color: "#475569" }}>{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
                            <button
                                onClick={handleUpgrade}
                                style={{
                                    width: "100%",
                                    padding: "14px 24px",
                                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 12,
                                    fontSize: 15,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                }}
                            >
                                <i className="fa-solid fa-bolt"></i>
                                Upgrade to Pro
                            </button>

                            {showTrialButton && (
                                <button
                                    onClick={handleTrial}
                                    disabled={isLoading}
                                    style={{
                                        width: "100%",
                                        padding: "14px 24px",
                                        background: "#fff",
                                        color: "#2563EB",
                                        border: "2px solid #BFDBFE",
                                        borderRadius: 12,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        cursor: isLoading ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                        opacity: isLoading ? 0.7 : 1,
                                        transition: "background 0.2s, border-color 0.2s",
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            Starting Trial...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-rocket"></i>
                                            Start 7-Day Free Trial
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Footer note */}
                        <p
                            style={{
                                marginTop: 16,
                                fontSize: 12,
                                color: "#94A3B8",
                                textAlign: "center",
                            }}
                        >
                            <i className="fa-solid fa-shield-check me-1"></i>
                            No credit card required for trial
                        </p>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translate(-50%, -48%);
          }
          to { 
            opacity: 1; 
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
        </>
    );
};

export default FeatureGatePopup;
