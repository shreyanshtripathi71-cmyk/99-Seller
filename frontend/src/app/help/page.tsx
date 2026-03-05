"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";


import React from "react";


import ReactMarkdown from "react-markdown";
import { useContent } from "@/modules/AppLogic_Module";

const defaultContent = {
    title: "Help Center",
    subtitle: "Find answers and get support",
    content: `
# Getting Started

Welcome to the 99Sellers Help Center. Here you'll find guides, tutorials, and answers to common questions.

## Quick Start Guide

1. **Create Your Account** - Sign up for a free trial to get started
2. **Set Your Search Criteria** - Define your target market and lead types
3. **Browse Results** - Review properties matching your criteria
4. **Export Leads** - Download contact information for motivated sellers
5. **Track Your Progress** - Save searches and monitor new listings

## Common Questions

### How do I search for properties?
Use the Lead Discovery tool to filter by location, property type, motivation factors, and more.

### Can I save my searches?
Yes! Click "Save Search" to store your criteria and receive alerts when new matching properties are added.

### How often is data updated?
Our database is updated daily with new public records from counties across the United States.

## Need More Help?

If you can't find what you're looking for, please [contact our support team](/contact).
  `
};

export default function HelpPage() {
    const { content: displayContent, loading } = useContent('page_help', defaultContent);

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Header />
            <section style={{ background: "#0f172a", padding: "140px 24px 60px" }}>
                <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                    <h1 style={{ fontSize: 42, fontWeight: 700, color: "#ffffff", marginBottom: 16 }}>
                        {displayContent.title}
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: 18 }}>{displayContent.subtitle}</p>
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
