"use client";
import { Header, Footer, FeatureSection } from "@/modules/HomeUI_Module";


import React, { useState, useEffect } from "react";



import { useContent } from "@/modules/AppLogic_Module";

const defaultContent = {
    hero: {
        title: "Powerful Features for Modern Investors",
        subtitle: "Everything you need to find, track, and close off-market deals."
    },
    features: [
        {
            layout: "image-left",
            title: "Advanced Lead Discovery",
            description: "Our proprietary search engine lets you filter through millions of public records to find the most motivated sellers in any market.",
            features: ["Real-time data updates", "Advanced GIS mapping", "Motivation scoring"],
            image: "/images/features/discovery.jpg",
            ctaText: "Start Searching",
            ctaLink: "/search"
        },
        {
            layout: "image-right",
            title: "Automated Skip Tracing",
            description: "Stop wasting time searching for phone numbers. We provide direct contact info for property owners instantly.",
            features: ["Triple-verified phone numbers", "Email addresses", "Social media profiles"],
            image: "/images/features/skip-tracing.jpg",
            ctaText: "Try Skip Tracing",
            ctaLink: "/signup"
        }
    ]
};

export default function FeaturesPage() {
    const { content: displayContent, loading } = useContent('page_features', defaultContent);

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Header />
            <section style={{ background: "#0f172a", padding: "140px 24px 80px", textAlign: "center" }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <h1 style={{ fontSize: 42, fontWeight: 700, color: "#ffffff", marginBottom: 16 }}>
                        {displayContent.hero?.title}
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: 18 }}>{displayContent.hero?.subtitle}</p>
                </div>
            </section>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 100 }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: '#3b82f6' }}></i>
                </div>
            ) : (
                (displayContent.features || []).map((feature: any, index: number) => (
                    <FeatureSection
                        key={index}
                        {...feature}
                        className={index % 2 !== 0 ? 'bg_alternate' : ''}
                    />
                ))
            )}
            <Footer />
        </div>
    );
}
