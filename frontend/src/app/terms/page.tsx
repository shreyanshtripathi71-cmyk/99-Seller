"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";


import React from "react";


import ReactMarkdown from "react-markdown";
import { useContent } from "@/modules/AppLogic_Module";

const defaultContent = {
    title: "Terms of Service",
    updatedAt: "January 24, 2024",
    content: `
# Terms of Service

Welcome to 99Sellers. By using our website and services, you agree to be bound by the following terms and conditions.

## 1. Acceptance of Terms
By accessing or using the Service, you signify that you have read, understood, and agree to be bound by these Terms of Service.

## 2. Description of Service
99Sellers provides real estate lead generation tools, data analytics, and search capabilities. We reserve the right to modify or discontinue the Service at any time.

## 3. User Responsibilities
You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.

## 4. Prohibited Conduct
You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the Service.

## 5. Limitation of Liability
In no event shall 99Sellers be liable for any indirect, incidental, special, consequential or punitive damages arising out of or in connection with your use of the Service.
  `
};

export default function TermsPage() {
    const { content: displayContent, loading } = useContent('page_terms', defaultContent);

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
