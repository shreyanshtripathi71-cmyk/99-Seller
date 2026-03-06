"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";


import React, { useState } from "react";


import { useContent } from "@/modules/AppLogic_Module";

const defaultContent = {
  title: "Frequently Asked Questions",
  subtitle: "Everything you need to know about 99Sellers",
  faqs: [
    {
      question: "What is 99Sellers?",
      answer: "99Sellers is a real estate lead generation platform that provides access to off-market properties including foreclosures, tax defaults, divorce filings, and probate cases."
    },
    {
      question: "How does the free trial work?",
      answer: "Sign up for a free 15-day trial to access all features. No credit card required. You can upgrade to a paid plan anytime."
    },
    {
      question: "What data sources do you use?",
      answer: "We aggregate data from county records, court filings, and public databases across all 50 states. Our data is updated daily."
    },
    {
      question: "Can I export leads?",
      answer: "Yes, premium users can export leads to CSV or Excel format. Export limits depend on your subscription plan."
    },
    {
      question: "How accurate is the data?",
      answer: "Our data accuracy rate is 98%. We verify information across multiple sources and update records regularly."
    },
    {
      question: "Is there a mobile app?",
      answer: "Our platform is fully responsive and works great on mobile browsers. A dedicated mobile app is coming soon."
    }
  ]
};

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { content: displayContent, loading } = useContent('page_faq', defaultContent);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Header />

      {/* Hero Section */}
      <section style={{ background: "#0f172a", padding: "140px 24px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, color: "#ffffff", marginBottom: 16 }}>
            {displayContent.title}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 18 }}>{displayContent.subtitle}</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px" }}>
        {loading && !displayContent ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: '#3b82f6' }}></i>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(displayContent.faqs || []).map((faq: any, index: number) => (
              <div
                key={index}
                style={{
                  background: "#ffffff",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #e2e8f0"
                }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <span style={{ fontSize: 17, fontWeight: 600, color: "#0f172a" }}>{faq.question}</span>
                  <i
                    className={`fa-solid ${openIndex === index ? 'fa-minus' : 'fa-plus'}`}
                    style={{ color: "#64748b", transition: "transform 0.2s" }}
                  ></i>
                </button>

                {openIndex === index && (
                  <div style={{ padding: "0 24px 24px", color: "#475569", fontSize: 16, lineHeight: 1.6 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 60, textAlign: "center", padding: 40, background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Still have questions?</h3>
          <p style={{ color: "#64748b", marginBottom: 24 }}>We're here to help you find the answers you need.</p>
          <a
            href="/contact"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "#2563eb",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: "none"
            }}
          >
            Contact Support
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}