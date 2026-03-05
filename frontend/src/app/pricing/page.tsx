"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";


import styles from "../../components/home/home-modern/styles/homepage.module.scss";
import { useContent } from "@/modules/AppLogic_Module";
import { useAuth } from "@/context/AuthContext";

/* --- Default content (CMS fallback) --- */
const defaultContent = {
    pricingHeader: {
        title: "Stop Losing Deals to",
        titleHighlight: "Faster Investors",
        subtitle: "The all-in-one proprietary data platform for serious real estate investors. Go from hunting to closing."
    },
    plans: [
        {
            id: "starter", name: "Free", price: "0", period: "forever",
            description: "Get started and explore the platform",
            features: [
                { text: "50 leads per month", included: true },
                { text: "1 county access", included: true },
                { text: "Basic search filters", included: true },
                { text: "Email support", included: true },
                { text: "Skip tracing", included: false },
                { text: "Unlimited exports", included: false },
                { text: "All 9 seller motives", included: false },
                { text: "Priority support", included: false }
            ],
            buttonText: "Get Started Free", popular: false
        },
        {
            id: "monthly", name: "Pro Monthly", price: "50", period: "month",
            description: "Full access, billed monthly",
            features: [
                { text: "Unlimited leads", included: true },
                { text: "All 50 states", included: true },
                { text: "All 9 seller motives", included: true },
                { text: "Built-in skip tracing", included: true },
                { text: "Unlimited CRM exports", included: true },
                { text: "Daily fresh data", included: true },
                { text: "Priority support", included: true },
                { text: "Full owner contact info", included: true }
            ],
            buttonText: "Start Pro Monthly", popular: true
        },
        {
            id: "quarterly", name: "Pro Quarterly", price: "120", period: "quarter",
            description: "Best value \u2014 save 20%", saveBadge: "Save $30",
            features: [
                { text: "Everything in Pro Monthly", included: true },
                { text: "All 50 states", included: true },
                { text: "All 9 seller motives", included: true },
                { text: "Built-in skip tracing", included: true },
                { text: "Unlimited CRM exports", included: true },
                { text: "Daily fresh data", included: true },
                { text: "Priority support", included: true },
                { text: "Full owner contact info", included: true }
            ],
            buttonText: "Start Pro Quarterly", popular: false
        }
    ],
    guarantee: {
        title: "30-day money-back guarantee",
        description: "Try any paid plan risk-free. If you don\u2019t find value in the first 30 days, we\u2019ll refund every penny \u2014 no questions asked."
    },
    faq: [
        { q: "Can I cancel anytime?", a: "Yes. There are no contracts or cancellation fees. You can cancel your subscription at any time from your dashboard." },
        { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards including Visa, Mastercard, and American Express." },
        { q: "What are the 9 seller motives?", a: "Pre-foreclosure, Foreclosure, Auction, Probate, Code Violation, Eviction, Divorce, Tax Liens, and Out-of-State Owners." },
        { q: "Do I get phone numbers and addresses?", a: "Yes \u2014 paid plan members get full access to owner phone numbers, email addresses, and mailing addresses." }
    ]
};

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
};

/* ===========================
   COMPARISON DATA
   Manual Way vs 99Sellers Way
   =========================== */
const comparisonRows = [
    { category: "Lead Discovery", manual: "Drive for hours scouting neighborhoods", sellers: "Instant nationwide distressed property search" },
    { category: "Data Sources", manual: "Manually search county records one by one", sellers: "Automated aggregation from every county, daily" },
    { category: "Cost", manual: "$500+/mo for outdated, generic lead lists", sellers: "Starting at $50/mo for unlimited, targeted leads" },
    { category: "Contact Info", manual: "Pay extra for skip-tracing services", sellers: "Built-in skip tracing with phone & email" },
    { category: "Data Freshness", manual: "Lists are weeks or months old", sellers: "Updated daily — never miss a new filing" },
    { category: "Coverage", manual: "Limited to 1 county or market area", sellers: "All 50 states, every county, instantly" },
    { category: "Filtering", manual: "No way to filter by seller motivation", sellers: "9 distress motive types with advanced filters" },
    { category: "Export", manual: "Manual copy-paste into spreadsheets", sellers: "One-click CSV/CRM export" },
    { category: "Lead Quality", manual: "Mixed bag — many unqualified leads", sellers: "Every lead is a verified motivated seller" },
    { category: "Speed to Contact", manual: "Days to research each prospect", sellers: "Seconds — owner info ready instantly" },
];

const PricingPage = () => {
    const { isAuthenticated } = useAuth();
    const { content } = useContent('page_pricing', defaultContent);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const plans = content.plans || defaultContent.plans;
    const pricingHeader = content.pricingHeader || defaultContent.pricingHeader;
    const guarantee = content.guarantee || defaultContent.guarantee;
    const faq = content.faq || defaultContent.faq;

    const getPlanLink = (plan: any) => {
        if (plan.id === "starter") {
            return isAuthenticated ? "/search" : "/signup";
        }
        const billingCycle = plan.id === "quarterly" ? "quarterly" : "monthly";
        const billingPath = "/dashboard/billing?action=upgrade&plan=premium&billing=" + billingCycle;
        if (isAuthenticated) return billingPath;
        return "/signup?redirect=" + encodeURIComponent(billingPath);
    };

    return (
        <div className={styles.homepage} style={{ background: '#fff' }}>
            <Header />

            {/* ========== HERO HEADER ========== */}
            <section style={{
                background: '#0f172a',
                padding: '140px 24px 80px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 20 }}>
                            <span style={{ color: '#ffffff' }}>{pricingHeader.title} </span>
                            <span style={{ color: '#2563eb' }}>{pricingHeader.titleHighlight}</span>
                        </h1>
                        <p style={{
                            fontSize: 22, color: '#94a3b8', lineHeight: 1.7,
                            maxWidth: 600, margin: '0 auto'
                        }}>
                            {pricingHeader.subtitle}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ========== SECTION 1: IMAGE | CONTENT ========== */}
            <section style={{ padding: '100px 24px', background: '#fff' }}>
                <div style={{
                    maxWidth: 1100, margin: '0 auto',
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 60, alignItems: 'center'
                }}>
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={scaleIn}
                    >
                        <div style={{
                            borderRadius: 24, overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.12)'
                        }}>
                            <img
                                src="/images/pricing/hero-investor.png"
                                alt="Smart real estate investing"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 16px', background: '#eff6ff',
                            borderRadius: 50, marginBottom: 20,
                            fontSize: 13, fontWeight: 700, color: '#2563eb',
                            textTransform: 'uppercase' as const, letterSpacing: '0.04em'
                        }}>
                            <i className="fa-solid fa-bolt" style={{ fontSize: 11 }} />
                            Smarter Investing
                        </div>
                        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 16, lineHeight: 1.2 }}>
                            Why Top Investors Choose{' '}
                            <span style={{ color: '#2563eb' }}>99Sellers</span>
                        </h2>
                        <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.8, marginBottom: 24 }}>
                            While others are driving for dollars and combing through outdated lists,
                            99Sellers users are closing deals from their laptop. Our platform delivers
                            verified, motivated seller leads straight to your dashboard — with full contact
                            info, equity data, and seller motive analysis.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                            {[
                                'Instant access to pre-foreclosures, probate, divorce & more',
                                'Owner phone, email & mailing address included',
                                'Updated daily from county records nationwide'
                            ].map((text, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: '50%',
                                        background: '#eff6ff', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <i className="fa-solid fa-check" style={{ fontSize: 11, color: '#2563eb' }} />
                                    </div>
                                    <span style={{ fontSize: 15, color: '#334155' }}>{text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ========== SECTION 2: CONTENT | IMAGE ========== */}
            <section style={{ padding: '100px 24px', background: '#f8fafc' }}>
                <div style={{
                    maxWidth: 1100, margin: '0 auto',
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 60, alignItems: 'center'
                }}>
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '6px 16px', background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 50, marginBottom: 20,
                            fontSize: 13, fontWeight: 700, color: '#0f172a',
                            textTransform: 'uppercase' as const, letterSpacing: '0.04em'
                        }}>
                            <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 11 }} />
                            Time is Money
                        </div>
                        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', marginBottom: 16, lineHeight: 1.2 }}>
                            <span style={{ color: '#0f172a' }}>Stop </span>
                            <span style={{ color: '#0f172a' }}>Wasting Time on </span>
                            <span style={{ color: '#2563eb' }}>Bad Data</span>
                        </h2>
                        <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.8, marginBottom: 24 }}>
                            The average investor spends 20+ hours per week researching leads manually.
                            With 99Sellers, you get the same results in minutes. Our AI-driven filters
                            identify properties with real equity and genuine seller motivation — so you
                            only call leads worth your time.
                        </p>
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' as const }}>
                            {[
                                { num: '20x', label: 'Faster lead discovery' },
                                { num: '98%', label: 'Data accuracy rate' },
                                { num: '50', label: 'States covered' }
                            ].map((stat, i) => (
                                <div key={i} style={{ textAlign: 'center' as const }}>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: '#2563eb' }}>{stat.num}</div>
                                    <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={scaleIn}
                    >
                        <div style={{
                            borderRadius: 24, overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.12)'
                        }}>
                            <img
                                src="/images/pricing/old-vs-new.png"
                                alt="Old way vs 99Sellers way"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                    </motion.div>
                </div>
            </section>


            {/* ========== MANUAL WAY vs 99SELLERS — SIDE-BY-SIDE TABLE ========== */}
            <section style={{ padding: '100px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={fadeInUp}
                        style={{ textAlign: 'center', marginBottom: 48 }}
                    >
                        <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
                            <span style={{ color: '#0f172a' }}>The Manual Way vs </span>
                            <span style={{ color: '#2563eb' }}>99Sellers</span>
                        </h2>
                        <p style={{ fontSize: 17, color: '#64748b', maxWidth: 550, margin: '0 auto' }}>
                            See exactly how 99Sellers saves you time, money, and missed deals compared to traditional methods.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }}
                        variants={scaleIn}
                        style={{
                            borderRadius: 20, overflow: 'hidden',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
                        }}
                    >
                        {/* Table Header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '180px 1fr 1fr',
                            background: '#0f172a', color: '#fff'
                        }}>
                            <div style={{ padding: '18px 24px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#94a3b8' }}>
                                Category
                            </div>
                            <div style={{
                                padding: '18px 24px', fontSize: 13, fontWeight: 700,
                                textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                                color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8,
                                borderLeft: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <i className="fa-solid fa-xmark" style={{ fontSize: 12 }} />
                                Manual / Old Way
                            </div>
                            <div style={{
                                padding: '18px 24px', fontSize: 13, fontWeight: 700,
                                textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                                color: '#4ade80', display: 'flex', alignItems: 'center', gap: 8,
                                borderLeft: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <i className="fa-solid fa-check" style={{ fontSize: 12 }} />
                                99Sellers Way
                            </div>
                        </div>

                        {/* Table Rows */}
                        {comparisonRows.map((row, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'grid', gridTemplateColumns: '180px 1fr 1fr',
                                    borderTop: '1px solid #f1f5f9',
                                    background: i % 2 === 0 ? '#fff' : '#fafbfc',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{
                                    padding: '16px 24px', fontSize: 14, fontWeight: 700,
                                    color: '#0f172a', display: 'flex', alignItems: 'center'
                                }}>
                                    {row.category}
                                </div>
                                <div style={{
                                    padding: '16px 24px', fontSize: 14, color: '#94a3b8',
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    borderLeft: '1px solid #f1f5f9'
                                }}>
                                    <i className="fa-solid fa-xmark" style={{ color: '#ef4444', fontSize: 12, flexShrink: 0 }} />
                                    {row.manual}
                                </div>
                                <div style={{
                                    padding: '16px 24px', fontSize: 14, color: '#334155', fontWeight: 500,
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    borderLeft: '1px solid #f1f5f9'
                                }}>
                                    <i className="fa-solid fa-check" style={{ color: '#22c55e', fontSize: 12, flexShrink: 0 }} />
                                    {row.sellers}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ========== PRICING CARDS ========== */}
            <section style={{ padding: '100px 24px 80px', background: '#fff' }}>
                <div style={{ maxWidth: 800, margin: '0 auto 48px', textAlign: 'center' }}>
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                        <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
                            <span style={{ color: '#0f172a' }}>Simple, Transparent </span>
                            <span style={{ color: '#2563eb' }}>Pricing</span>
                        </h2>
                        <p style={{ fontSize: 17, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
                            No hidden fees. No contracts. Cancel anytime. Start free and upgrade when you&apos;re ready.
                        </p>
                    </motion.div>
                </div>

                <div style={{
                    maxWidth: 1100, margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 24, alignItems: 'stretch'
                }}>
                    {/* FREE PLAN */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: 0, duration: 0.4 }}
                        style={{
                            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20,
                            padding: '40px 32px 36px', display: 'flex', flexDirection: 'column' as const,
                            position: 'relative' as const,
                        }}
                        whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)' }}
                    >
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Free</h3>
                            <p style={{ fontSize: 14, margin: 0, color: '#94a3b8' }}>Get started and explore the platform</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                            <span style={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}>$</span>
                            <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: '#0f172a' }}>0</span>
                            <span style={{ fontSize: 15, marginLeft: 2, color: '#94a3b8' }}>/forever</span>
                        </div>
                        <Link href={isAuthenticated ? "/search" : "/signup"} style={{
                            display: 'block', width: '100%', textAlign: 'center' as const,
                            padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                            textDecoration: 'none', marginBottom: 28, transition: 'all 0.2s ease',
                            background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0'
                        }}>
                            Get Started Free
                        </Link>
                        <div style={{ height: 1, marginBottom: 24, background: '#f1f5f9' }} />
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                            {[
                                { text: '50 leads per month', included: true },
                                { text: '1 county access', included: true },
                                { text: 'Basic search filters', included: true },
                                { text: 'Email support', included: true },
                                { text: 'Skip tracing', included: false },
                                { text: 'Unlimited exports', included: false },
                                { text: 'All 9 seller motives', included: false },
                                { text: 'Priority support', included: false },
                            ].map((f, i) => (
                                <li key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    marginBottom: 14, fontSize: 14,
                                    color: f.included ? '#334155' : '#cbd5e1',
                                    textDecoration: f.included ? 'none' : 'line-through'
                                }}>
                                    <i className={"fa-solid " + (f.included ? 'fa-check' : 'fa-xmark')}
                                        style={{
                                            fontSize: 12, width: 20, textAlign: 'center' as const,
                                            color: f.included ? '#2563eb' : '#d1d5db'
                                        }} />
                                    {f.text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* PRO MONTHLY — POPULAR */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.4 }}
                        style={{
                            background: '#0f172a', border: '2px solid #0f172a', borderRadius: 20,
                            padding: '40px 32px 36px', display: 'flex', flexDirection: 'column' as const,
                            position: 'relative' as const,
                        }}
                        whileHover={{ y: -4, boxShadow: '0 24px 48px rgba(15, 23, 42, 0.25)' }}
                    >
                        <div style={{
                            position: 'absolute' as const, top: -13, left: '50%',
                            transform: 'translateX(-50%)', background: '#2563eb', color: '#fff',
                            fontSize: 12, fontWeight: 700, padding: '6px 18px', borderRadius: 50,
                            letterSpacing: '0.04em', textTransform: 'uppercase' as const
                        }}>
                            Most Popular
                        </div>
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Pro Monthly</h3>
                            <p style={{ fontSize: 14, margin: 0, color: 'rgba(255,255,255,0.6)' }}>Full access, billed monthly</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                            <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>$</span>
                            <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: '#fff' }}>50</span>
                            <span style={{ fontSize: 15, marginLeft: 2, color: 'rgba(255,255,255,0.5)' }}>/month</span>
                        </div>
                        <Link href={getPlanLink({ id: 'monthly' })} style={{
                            display: 'block', width: '100%', textAlign: 'center' as const,
                            padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                            textDecoration: 'none', marginBottom: 28, transition: 'all 0.2s ease',
                            background: '#2563eb', color: '#fff', border: 'none'
                        }}>
                            Start Pro Monthly
                        </Link>
                        <div style={{ height: 1, marginBottom: 24, background: 'rgba(255,255,255,0.1)' }} />
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                            {[
                                'Unlimited leads',
                                'All 50 states',
                                'All 9 seller motives',
                                'Built-in skip tracing',
                                'Unlimited CRM exports',
                                'Daily fresh data',
                                'Priority support',
                                'Full owner contact info',
                            ].map((text, i) => (
                                <li key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    marginBottom: 14, fontSize: 14, color: 'rgba(255,255,255,0.85)'
                                }}>
                                    <i className="fa-solid fa-check"
                                        style={{ fontSize: 12, width: 20, textAlign: 'center' as const, color: '#60a5fa' }} />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* PRO QUARTERLY */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.4 }}
                        style={{
                            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20,
                            padding: '40px 32px 36px', display: 'flex', flexDirection: 'column' as const,
                            position: 'relative' as const,
                        }}
                        whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)' }}
                    >
                        <div style={{
                            position: 'absolute' as const, top: -13, left: '50%',
                            transform: 'translateX(-50%)', background: '#2563eb', color: '#fff',
                            fontSize: 12, fontWeight: 700, padding: '6px 18px', borderRadius: 50,
                            letterSpacing: '0.04em'
                        }}>
                            Save $30
                        </div>
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Pro Quarterly</h3>
                            <p style={{ fontSize: 14, margin: 0, color: '#94a3b8' }}>Best value — save 20%</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                            <span style={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}>$</span>
                            <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: '#0f172a' }}>120</span>
                            <span style={{ fontSize: 15, marginLeft: 2, color: '#94a3b8' }}>/quarter</span>
                        </div>
                        <Link href={getPlanLink({ id: 'quarterly' })} style={{
                            display: 'block', width: '100%', textAlign: 'center' as const,
                            padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                            textDecoration: 'none', marginBottom: 28, transition: 'all 0.2s ease',
                            background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0'
                        }}>
                            Start Pro Quarterly
                        </Link>
                        <div style={{ height: 1, marginBottom: 24, background: '#f1f5f9' }} />
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                            {[
                                'Everything in Pro Monthly',
                                'All 50 states',
                                'All 9 seller motives',
                                'Built-in skip tracing',
                                'Unlimited CRM exports',
                                'Daily fresh data',
                                'Priority support',
                                'Full owner contact info',
                            ].map((text, i) => (
                                <li key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    marginBottom: 14, fontSize: 14, color: '#334155'
                                }}>
                                    <i className="fa-solid fa-check"
                                        style={{ fontSize: 12, width: 20, textAlign: 'center' as const, color: '#2563eb' }} />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* ========== GUARANTEE ========== */}
            <section style={{
                padding: '48px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '8px 20px', background: '#fff',
                        border: '1px solid #e2e8f0', borderRadius: 50, marginBottom: 20
                    }}>
                        <i className="fa-solid fa-shield-halved" style={{ color: '#2563eb', fontSize: 14 }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                            {guarantee.title}
                        </span>
                    </div>
                    <p style={{
                        fontSize: 15, color: '#64748b', lineHeight: 1.7,
                        margin: '0 auto', maxWidth: 550
                    }}>
                        {guarantee.description}
                    </p>
                    <div style={{
                        display: 'flex', justifyContent: 'center',
                        gap: 24, marginTop: 24, opacity: 0.4
                    }}>
                        <i className="fa-brands fa-cc-visa" style={{ fontSize: 28, color: '#0f172a' }} />
                        <i className="fa-brands fa-cc-mastercard" style={{ fontSize: 28, color: '#0f172a' }} />
                        <i className="fa-brands fa-cc-amex" style={{ fontSize: 28, color: '#0f172a' }} />
                        <i className="fa-brands fa-stripe" style={{ fontSize: 28, color: '#0f172a' }} />
                    </div>
                </div>
            </section>


            {/* ========== FAQ ========== */}
            <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
                <div style={{ maxWidth: 650, margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40
                    }}>
                        <span style={{ color: '#0f172a' }}>Frequently Asked </span>
                        <span style={{ color: '#2563eb' }}>Questions</span>
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                        {faq.map((item: any, i: number) => {
                            const isOpen = openFaq === i;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        transition: 'box-shadow 0.2s ease',
                                        boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.04)' : 'none'
                                    }}
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : i)}
                                        style={{
                                            width: '100%',
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', padding: '18px 24px',
                                            background: 'none', border: 'none',
                                            cursor: 'pointer', textAlign: 'left' as const
                                        }}
                                    >
                                        <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{item.q}</span>
                                        <i
                                            className="fa-solid fa-chevron-down"
                                            style={{
                                                fontSize: 12, color: '#94a3b8',
                                                transition: 'transform 0.2s ease',
                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                flexShrink: 0, marginLeft: 16
                                            }}
                                        />
                                    </button>
                                    {isOpen && (
                                        <div style={{ padding: '0 24px 18px' }}>
                                            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                                                {item.a}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ========== BOTTOM CTA ========== */}
            <section style={{ padding: '80px 24px', background: '#0f172a', textAlign: 'center' }}>
                <div style={{ maxWidth: 550, margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.01em'
                    }}>
                        <span style={{ color: '#fff' }}>Ready to find your </span>
                        <span style={{ color: '#3b82f6' }}>next deal?</span>
                    </h2>
                    <p style={{
                        fontSize: 16, color: 'rgba(255,255,255,0.6)',
                        marginBottom: 32, lineHeight: 1.6
                    }}>
                        Join thousands of investors using 99Sellers to close more deals, faster.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' as const }}>
                        <Link
                            href={isAuthenticated ? "/search" : "/signup"}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '14px 32px', background: '#2563eb',
                                color: '#fff', borderRadius: 12,
                                fontSize: 15, fontWeight: 700, textDecoration: 'none'
                            }}
                        >
                            Get Started Free
                            <i className="fa-solid fa-arrow-right" style={{ fontSize: 13 }} />
                        </Link>
                        <Link
                            href={isAuthenticated
                                ? "/dashboard/billing?action=upgrade&plan=premium&billing=monthly"
                                : "/signup?redirect=" + encodeURIComponent("/dashboard/billing?action=upgrade&plan=premium&billing=monthly")
                            }
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '14px 32px', background: 'transparent',
                                color: '#fff', borderRadius: 12,
                                fontSize: 15, fontWeight: 600, textDecoration: 'none',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            View Pro Plans
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default PricingPage;
