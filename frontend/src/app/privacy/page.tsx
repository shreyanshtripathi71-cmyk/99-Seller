"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";


import React from "react";


import ReactMarkdown from "react-markdown";
import { useContent } from "@/modules/AppLogic_Module";

const defaultContent = {
    title: "Privacy Policy",
    updatedAt: "January 24, 2024",
    content: `
# Privacy Policy

At 99Sellers, we take your privacy seriously. This policy describes how we collect, use, and handle your information when you use our websites, software, and services.

## 1. Information Collection
We collect information that you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.

## 2. Use of Information
We use the information we collect to:
* Provide, maintain, and improve our Services;
* Process and complete transactions;
* Send you technical notices, updates, security alerts, and support and administrative messages;
* Communicate with you about products, services, offers, promotions, and events.

## 3. Data Sharing
We do not share your personal information with third parties except as described in this policy. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
  `
};

export default function PrivacyPage() {
    const { content: displayContent, loading } = useContent('page_privacy', defaultContent);

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Header />
            <section style={{ background: "#0f172a", padding: "140px 24px 60px" }}>
                <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                    <h1 style={{ fontSize: 42, fontWeight: 700, color: "#ffffff", marginBottom: 16 }}>
                        {displayContent.title}
                    </h1>
                    <p style={{ color: "#94a3b8" }}>Last Updated: {displayContent.updatedAt}</p>
                </div>
            </section>

            <section style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
                {loading && !displayContent ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: '#3b82f6' }}></i>
                    </div>
                ) : (
                    <article className="prose prose-slate max-w-none" style={{ color: "#475569", lineHeight: 1.8 }}>
                        <ReactMarkdown>{displayContent.content}</ReactMarkdown>
                    </article>
                )}
            </section>
            <Footer />
        </div>
    );
}
