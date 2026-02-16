"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { feedbackAPI } from "@/services/api";

const AdminFeedbackPage = () => {
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const res = await feedbackAPI.getAll();
            if (res.success && res.data) {
                setFeedback(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch feedback", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        // Optimistic update
        setFeedback(prev => prev.map(item =>
            item.id === id ? { ...item, status: newStatus } : item
        ));

        try {
            await feedbackAPI.updateStatus(id, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            fetchFeedback(); // Revert on error
        }
    };

    return (
        <>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--notion-text-primary)", margin: "0 0 8px" }}>
                    User Feedback
                </h2>
                <p style={{ color: "var(--notion-text-secondary)", fontSize: 14 }}>
                    Review and manage user feedback, bug reports, and suggestions.
                </p>
            </div>

            <div style={{
                background: "#fff",
                borderRadius: "var(--notion-radius)",
                border: "1px solid var(--notion-border)",
                overflow: "hidden"
            }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--notion-text-secondary)" }}>
                        Loading feedback...
                    </div>
                ) : feedback.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--notion-text-secondary)" }}>
                        No feedback found.
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "var(--notion-bg)", borderBottom: "1px solid var(--notion-border)" }}>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>Status</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>Type</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>User</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>Rating</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)", width: "40%" }}>Message</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedback.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: "1px solid var(--notion-border)" }}>
                                        <td style={{ padding: "16px" }}>
                                            <select
                                                value={item.status}
                                                onChange={(e) => updateStatus(item.id, e.target.value)}
                                                style={{
                                                    padding: "4px 8px",
                                                    borderRadius: 4,
                                                    border: "1px solid var(--notion-border)",
                                                    fontSize: 12,
                                                    background:
                                                        item.status === "new" ? "#DBEAFE" :
                                                            item.status === "resolved" ? "#DCFCE7" :
                                                                "#F3F4F6",
                                                    color:
                                                        item.status === "new" ? "#1E40AF" :
                                                            item.status === "resolved" ? "#166534" :
                                                                "#374151",
                                                    fontWeight: 500,
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <option value="new">New</option>
                                                <option value="read">Read</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: "16px" }}>
                                            <span style={{
                                                padding: "2px 8px",
                                                borderRadius: 12,
                                                fontSize: 11,
                                                fontWeight: 500,
                                                background: item.type === "bug" ? "#FEE2E2" : "#F3F4F6",
                                                color: item.type === "bug" ? "#991B1B" : "#374151"
                                            }}>
                                                {item.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px" }}>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--notion-text-primary)" }}>
                                                {item.UserLogin ? `${item.UserLogin.FirstName} ${item.UserLogin.LastName}` : (item.email || "Anonymous")}
                                            </div>
                                            <div style={{ fontSize: 11, color: "var(--notion-text-secondary)" }}>
                                                {item.UserLogin ? item.UserLogin.Email : ""}
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px" }}>
                                            {item.rating ? (
                                                <div style={{ color: "#F59E0B", fontSize: 12 }}>
                                                    {Array.from({ length: item.rating }).map((_, i) => (
                                                        <i key={i} className="fa-solid fa-star"></i>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: "#9CA3AF", fontSize: 12 }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "16px", fontSize: 13, color: "var(--notion-text-primary)", lineHeight: 1.5 }}>
                                            {item.message}
                                        </td>
                                        <td style={{ padding: "16px", fontSize: 12, color: "var(--notion-text-secondary)" }}>
                                            {(() => {
                                                try {
                                                    return item.createdAt ? format(new Date(item.createdAt), "MMM d, yyyy") : "-";
                                                } catch (e) {
                                                    return "-";
                                                }
                                            })()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminFeedbackPage;
