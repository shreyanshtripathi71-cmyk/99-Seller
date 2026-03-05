"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";

import React, { useState, useEffect } from "react";


import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useContent } from "@/modules/AppLogic_Module";

const defaultContent = {
  hero: {
    title: "About",
    highlight: "Us",
    subtitle: "Empowering Real Estate Professionals to Find Motivated Sellers"
  },
  sections: [
    {
      id: "challenge",
      title: "The Challenge Every Agent Faces",
      content: `Finding motivated sellers is the hardest part of real estate investing. You already have the skills to close deals—but without quality leads, even the best agents struggle to grow their business.
      
Distressed properties represent some of the most profitable opportunities in real estate. Yet accessing these sellers has traditionally required countless hours of manual research, outdated methods, and wasted resources.`
    }
  ],
  distressedItems: [
    "Pre-Foreclosure & Mortgage Issues",
    "Inherited Properties (Probate)",
    "Divorce Situations",
    "Vacant & Abandoned Homes",
    "Tax Delinquencies",
    "Absentee Owners",
    "Code Violations"
  ],
  cta: {
    text: "Ready to Transform Your Lead Generation?",
    buttonText: "Get Started Free"
  }
};

export default function AboutPage() {
  const { content: displayContent, loading } = useContent('page_about', defaultContent);

  if (loading && !displayContent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: "#2563eb" }}></i>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <Header />

      {/* Hero Section */}
      <section style={{
        background: "#0f172a",
        padding: "140px 24px 80px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 20,
          }}>
            <span style={{ color: "#ffffff" }}>{displayContent.hero?.title} </span>
            <span style={{ color: "#2563eb" }}>{displayContent.hero?.highlight}</span>
          </h1>
          <p style={{ fontSize: 22, color: "#94a3b8", lineHeight: 1.7 }}>
            {displayContent.hero?.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>

        {(displayContent.sections || []).map((section: any) => (
          <div key={section.id} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>
              {section.title}
            </h2>
            <div style={{ fontSize: 18, color: "#334155", lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {/* What We Consider Distressed */}
        <div style={{
          background: "#f8fafc",
          padding: 40,
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          marginBottom: 48
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>
            What Makes a Property &quot;Distressed&quot;?
          </h2>
          <p style={{ fontSize: 17, color: "#334155", lineHeight: 1.8, marginBottom: 24 }}>
            Distressed properties come from owners who need to sell quickly due to challenging circumstances:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {(displayContent.distressedItems || []).map((item: string, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <i className="fa-solid fa-circle-check" style={{ color: "#2563eb" }}></i>
                <span style={{ fontSize: 15, color: "#334155" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: "#f8fafc",
          padding: 40,
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          textAlign: "center"
        }}>
          <p style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", marginBottom: 16 }}>
            {displayContent.cta?.text}
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/search"
              style={{
                display: "inline-block",
                padding: "16px 32px",
                background: "#2563eb",
                color: "#fff",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600
              }}
            >
              {displayContent.cta?.buttonText}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}