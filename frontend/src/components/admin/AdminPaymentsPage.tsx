"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { adminAPI } from "@/services/api";

const AdminPaymentsPage = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await adminAPI.billing.getAllInvoices();
            if (res.success && res.data) {
                setInvoices(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch invoices", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--notion-text-primary)", margin: "0 0 8px" }}>
                    Payment History
                </h2>
                <p style={{ color: "var(--notion-text-secondary)", fontSize: 14 }}>
                    View all transaction history and billing records.
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
                        Loading payments...
                    </div>
                ) : invoices.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--notion-text-secondary)" }}>
                        No payments found.
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "var(--notion-bg)", borderBottom: "1px solid var(--notion-border)" }}>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>Invoice ID</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>User</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>Date</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>Amount</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>Status</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--notion-text-secondary)" }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id} style={{ borderBottom: "1px solid var(--notion-border)" }}>
                                        <td style={{ padding: "16px", fontSize: 13, fontFamily: "monospace", color: "var(--notion-text-secondary)" }}>
                                            {inv.id}
                                        </td>
                                        <td style={{ padding: "16px" }}>
                                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--notion-text-primary)" }}>
                                                {inv.UserLogin ? `${inv.UserLogin.FirstName} ${inv.UserLogin.LastName}` : (inv.Username || "Unknown")}
                                            </div>
                                            <div style={{ fontSize: 11, color: "var(--notion-text-secondary)" }}>
                                                {inv.UserLogin ? inv.UserLogin.Email : ""}
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px", fontSize: 13, color: "var(--notion-text-primary)" }}>
                                            {(() => {
                                                try {
                                                    return inv.date ? format(new Date(inv.date), "MMM d, yyyy") : "-";
                                                } catch (e) {
                                                    return "-";
                                                }
                                            })()}
                                        </td>
                                        <td style={{ padding: "16px", fontSize: 13, fontWeight: 600, color: "var(--notion-text-primary)" }}>
                                            ${inv.amount ? parseFloat(inv.amount).toFixed(2) : "0.00"}
                                        </td>
                                        <td style={{ padding: "16px" }}>
                                            <span style={{
                                                padding: "4px 8px",
                                                borderRadius: 4,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                textTransform: "uppercase",
                                                background: inv.status === "paid" ? "#DCFCE7" : "#FEF3C7",
                                                color: inv.status === "paid" ? "#166534" : "#92400E"
                                            }}>
                                                {inv.status || "Unknown"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px", fontSize: 13, color: "var(--notion-text-secondary)" }}>
                                            {inv.description}
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

export default AdminPaymentsPage;
