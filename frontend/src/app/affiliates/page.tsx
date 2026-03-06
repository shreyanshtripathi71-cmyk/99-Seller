"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";


import React from "react";


import ReactMarkdown from "react-markdown";
import { useContent } from "@/modules/AppLogic_Module";

const defaultContent = {
    title: "Affiliate Program",
    subtitle: "Earn recurring commissions by referring real estate professionals",
    content: `
# Join the 99Sellers Affiliate Program

Earn up to **30% recurring commission** by referring real estate investors, agents, and wholesalers to 99Sellers.

## Why Join Our Program?

- **High Commissions**: Earn 30% on every subscription you refer
- **Recurring Revenue**: Get paid every month as long as your referrals stay subscribed
- **Marketing Support**: Access to banners, landing pages, and promotional materials
- **Real-Time Tracking**: Monitor your referrals and earnings in your dashboard
- **Fast Payouts**: Receive payments via PayPal or direct deposit

## How It Works

1. **Sign Up** - Apply to become an affiliate partner
2. **Get Your Link** - Receive your unique referral tracking link
3. **Promote** - Share 99Sellers with your audience
4. **Earn** - Get paid for every successful referral

## Who Should Join?

Our affiliate program is perfect for:
- Real estate bloggers and content creators
- Investment coaches and educators
- Real estate software reviewers
- Industry influencers and thought leaders

## Ready to Get Started?

[Apply Now](/contact) or email us at affiliates@99sellers.com
  `
};

export default function AffiliatesPage() {
    const { content: displayContent, loading } = useContent('page_affiliates', defaultContent);

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
