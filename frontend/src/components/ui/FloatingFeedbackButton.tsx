"use client";
import React, { useState } from "react";
import { feedbackAPI } from "@/services/api";

const FloatingFeedbackButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        type: "suggestion",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await feedbackAPI.submit(formData);

            if (res.success) {
                console.log("Feedback submitted:", res.data);
                setIsSubmitting(false);
                setSubmitted(true);

                setTimeout(() => {
                    setSubmitted(false);
                    setIsOpen(false);
                    setFormData({ name: "", email: "", type: "suggestion", message: "" });
                }, 2000);
            } else {
                console.error("Feedback submission failed:", res.error);
                setIsSubmitting(false);
                // Handle error (maybe show a toast)
            }
        } catch (error) {
            console.error("Feedback submission error:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: "fixed",
                    bottom: 24,
                    right: 24,
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(37, 99, 235, 0.4)",
                    zIndex: 9990,
                    transition: "transform 0.2s, box-shadow 0.2s",
                }}
                title="Give Feedback"
            >
                <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-comment-dots"}`} style={{ fontSize: 22 }}></i>
            </button>

            {/* Feedback Form Modal */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.3)",
                            zIndex: 9991,
                        }}
                    />

                    {/* Form */}
                    <div
                        style={{
                            position: "fixed",
                            bottom: 90,
                            right: 24,
                            width: 340,
                            background: "#0f172a",
                            borderRadius: 16,
                            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
                            zIndex: 9992,
                            overflow: "hidden",
                            animation: "slideUp 0.2s ease-out",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                                padding: "20px 24px",
                                color: "#fff",
                            }}
                        >
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#ffffff" }}>
                                <i className="fa-solid fa-comment-dots me-2" style={{ color: "#ffffff" }}></i>
                                Send Feedback
                            </h3>
                            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.9, color: "#ffffff" }}>
                                Help us improve your experience
                            </p>
                        </div>

                        {submitted ? (
                            <div style={{ padding: 40, textAlign: "center" }}>
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        background: "#ECFDF5",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 16px",
                                    }}
                                >
                                    <i className="fa-solid fa-check" style={{ color: "#10B981", fontSize: 24 }}></i>
                                </div>
                                <h4 style={{ margin: "0 0 8px", color: "#111827" }}>Thank You!</h4>
                                <p style={{ margin: 0, color: "#6B7280", fontSize: 14 }}>
                                    Your feedback has been submitted.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#ffffff", marginBottom: 6 }}>
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Your name"
                                        style={{
                                            width: "100%",
                                            padding: "10px 12px",
                                            border: "1px solid #334155",
                                            borderRadius: 8,
                                            fontSize: 14,
                                            outline: "none",
                                            background: "#1e293b",
                                            color: "#ffffff",
                                        }}
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#ffffff", marginBottom: 6 }}>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="you@example.com"
                                        style={{
                                            width: "100%",
                                            padding: "10px 12px",
                                            border: "1px solid #334155",
                                            borderRadius: 8,
                                            fontSize: 14,
                                            outline: "none",
                                            background: "#1e293b",
                                            color: "#ffffff",
                                        }}
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#ffffff", marginBottom: 6 }}>
                                        Feedback Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px 12px",
                                            border: "1px solid #334155",
                                            borderRadius: 8,
                                            fontSize: 14,
                                            outline: "none",
                                            background: "#1e293b",
                                            color: "#ffffff",
                                        }}
                                    >
                                        <option value="suggestion">Suggestion</option>
                                        <option value="bug">Bug Report</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#ffffff", marginBottom: 6 }}>
                                        Message
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Tell us what you think..."
                                        rows={4}
                                        style={{
                                            width: "100%",
                                            padding: "10px 12px",
                                            border: "1px solid #334155",
                                            borderRadius: 8,
                                            fontSize: 14,
                                            outline: "none",
                                            resize: "vertical",
                                            background: "#1e293b",
                                            color: "#ffffff",
                                        }}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        background: isSubmitting
                                            ? "#9CA3AF"
                                            : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 8,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: isSubmitting ? "not-allowed" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-paper-plane"></i>
                                            Submit Feedback
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    <style jsx global>{`
            @keyframes slideUp {
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
            )}
        </>
    );
};

export default FloatingFeedbackButton;
