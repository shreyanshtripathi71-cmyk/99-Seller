"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const router = useRouter();
    const { isAdmin, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAdmin) {
                router.replace("/admin");
            } else {
                router.replace("/dashboard/profile");
            }
        }
    }, [router, isAdmin, isLoading]);

    return (
        <div style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#2563eb" }} />
        </div>
    );
}
