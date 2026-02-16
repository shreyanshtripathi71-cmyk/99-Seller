"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/profile");
    }, [router]);

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
