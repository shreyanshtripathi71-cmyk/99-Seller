"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";


import React from "react";


import { useContent } from "@/modules/AppLogic_Module";
import Link from "next/link";

const defaultContent = {
    hero: {
        title: "About Us",
        subtitle: "Revolutionizing Real Estate Lead Generation"
    },
    sections: [
        {
            id: "mission",
            title: "Our Mission",
            content: "We're on a mission to democratize access to off-market real estate opportunities. Every investor deserves the tools to find motivated sellers and close profitable deals."
        },
        {
            id: "story",
            title: "Our Story",
            content: "Founded by real estate investors who were frustrated with outdated lead generation methods, 99Sellers was built to solve a real problem: finding quality leads shouldn't be this hard."
        }
    ],
    cta: {
        title: "Ready to Transform Your Business?",
        buttonText: "Start Free Trial",
        buttonLink: "/signup"
    }
};

export default function AboutUs01Page() {
    const { content: displayContent, loading } = useContent('page_about_us_01', defaultContent);

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Header />

            {/* Hero */}
            <section style={{ background: "#0f172a", padding: "140px 24px 80px", textAlign: "center" }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <h1 style={{ fontSize: 48, fontWeight: 800, color: "#ffffff", marginBottom: 16 }}>
                        {displayContent.hero?.title || "About Us"}
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: 20 }}>
                        {displayContent.hero?.subtitle || ""}
                    </p>
                </div>
            </section>

            {/* Content Sections */}
            <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px" }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: '#3b82f6' }}></i>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
                        {(displayContent.sections || []).map((section: any, index: number) => (
                            <div key={section.id || index} id={section.id}>
                                <h2 style={{ fontSize: 32, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>
                                    {section.title}
                                </h2>
                                <p style={{ color: "#475569", fontSize: 18, lineHeight: 1.8 }}>
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA */}
            <section style={{ background: "#f8fafc", padding: "80px 24px" }}>
                <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
                    <h2 style={{ fontSize: 36, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
                        {displayContent.cta?.title || "Get Started Today"}
                    </h2>
                    <Link
                        href={displayContent.cta?.buttonLink || "/signup"}
                        style={{
                            display: "inline-block",
                            marginTop: 24,
                            padding: "16px 40px",
                            background: "#2563eb",
                            color: "#fff",
                            borderRadius: 12,
                            fontWeight: 600,
                            fontSize: 18,
                            textDecoration: "none"
                        }}
                    >
                        {displayContent.cta?.buttonText || "Start Free Trial"}
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
