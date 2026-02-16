"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../../components/home/home-modern/components/Header";
import Footer from "../../components/home/home-modern/components/Footer";
import styles from "../../components/home/home-modern/styles/homepage.module.scss";
import { useContent } from "@/hooks/useContent";
import { useAuth } from "@/context/AuthContext";

/* --- Default content (CMS fallback) --- */
const defaultContent = {
    pricingHeader: {
        title: "Our",
        titleHighlight: "Pricing",
        subtitle: "Choose the plan that fits your business. No hidden fees, cancel anytime."
    },
    plans: [
        {
            id: "starter",
            name: "Free",
            price: "0",
            period: "forever",
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
            buttonText: "Get Started Free",
            popular: false
        },
        {
            id: "monthly",
            name: "Pro Monthly",
            price: "50",
            period: "month",
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
            buttonText: "Start Pro Monthly",
            popular: true
        },
        {
            id: "quarterly",
            name: "Pro Quarterly",
            price: "120",
            period: "quarter",
            description: "Best value \u2014 save 20%",
            saveBadge: "Save $30",
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
            buttonText: "Start Pro Quarterly",
            popular: false
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

            {/* HERO HEADER — matches About Us style */}
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
                        <h1 style={{
                            fontSize: 48,
                            fontWeight: 700,
                            marginBottom: 20,
                        }}>
                            <span style={{ color: '#ffffff' }}>{pricingHeader.title} </span>
                            <span style={{ color: '#2563eb' }}>{pricingHeader.titleHighlight}</span>
                        </h1>
                        <p style={{
                            fontSize: 22,
                            color: '#94a3b8',
                            lineHeight: 1.7,
                            maxWidth: 600,
                            margin: '0 auto'
                        }}>
                            {pricingHeader.subtitle}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* PRICING CARDS */}
            <section style={{ padding: '60px 24px 80px', background: '#fff' }}>
                <div style={{
                    maxWidth: 1100,
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: 24,
                    alignItems: 'stretch'
                }}>
                    {plans.map((plan: any, index: number) => {
                        const isPopular = plan.popular;
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                style={{
                                    background: isPopular ? '#0f172a' : '#fff',
                                    border: isPopular ? '2px solid #0f172a' : '1px solid #e2e8f0',
                                    borderRadius: 20,
                                    padding: '40px 32px 36px',
                                    display: 'flex',
                                    flexDirection: 'column' as const,
                                    position: 'relative' as const,
                                }}
                                whileHover={{
                                    y: -4,
                                    boxShadow: isPopular
                                        ? '0 24px 48px rgba(15, 23, 42, 0.25)'
                                        : '0 12px 32px rgba(0, 0, 0, 0.08)'
                                }}
                            >
                                {isPopular && (
                                    <div style={{
                                        position: 'absolute' as const, top: -13, left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: '#2563eb', color: '#fff',
                                        fontSize: 12, fontWeight: 700,
                                        padding: '6px 18px', borderRadius: 50,
                                        letterSpacing: '0.04em', textTransform: 'uppercase' as const
                                    }}>
                                        Most Popular
                                    </div>
                                )}

                                {plan.saveBadge && !isPopular && (
                                    <div style={{
                                        position: 'absolute' as const, top: -13, left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: '#2563eb', color: '#fff',
                                        fontSize: 12, fontWeight: 700,
                                        padding: '6px 18px', borderRadius: 50,
                                        letterSpacing: '0.04em'
                                    }}>
                                        {plan.saveBadge}
                                    </div>
                                )}

                                <div style={{ marginBottom: 24 }}>
                                    <h3 style={{
                                        fontSize: 22, fontWeight: 700,
                                        color: isPopular ? '#fff' : '#0f172a',
                                        marginBottom: 4
                                    }}>
                                        {plan.name}
                                    </h3>
                                    <p style={{
                                        fontSize: 14, margin: 0,
                                        color: isPopular ? 'rgba(255,255,255,0.6)' : '#94a3b8'
                                    }}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28 }}>
                                    <span style={{
                                        fontSize: 16, fontWeight: 600,
                                        color: isPopular ? 'rgba(255,255,255,0.7)' : '#64748b'
                                    }}>$</span>
                                    <span style={{
                                        fontSize: 48, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em',
                                        color: isPopular ? '#fff' : '#0f172a'
                                    }}>
                                        {plan.price}
                                    </span>
                                    {plan.period !== "forever" && (
                                        <span style={{
                                            fontSize: 15, marginLeft: 2,
                                            color: isPopular ? 'rgba(255,255,255,0.5)' : '#94a3b8'
                                        }}>
                                            /{plan.period}
                                        </span>
                                    )}
                                </div>

                                <Link
                                    href={getPlanLink(plan)}
                                    style={{
                                        display: 'block', width: '100%', textAlign: 'center' as const,
                                        padding: '14px 24px', borderRadius: 12,
                                        fontSize: 15, fontWeight: 700, textDecoration: 'none',
                                        marginBottom: 28, transition: 'all 0.2s ease',
                                        ...(isPopular
                                            ? { background: '#2563eb', color: '#fff', border: 'none' }
                                            : { background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }
                                        )
                                    }}
                                >
                                    {plan.buttonText}
                                </Link>

                                <div style={{
                                    height: 1, marginBottom: 24,
                                    background: isPopular ? 'rgba(255,255,255,0.1)' : '#f1f5f9'
                                }} />

                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                                    {plan.features.map((feature: any, i: number) => (
                                        <li key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            marginBottom: 14, fontSize: 14,
                                            color: feature.included
                                                ? (isPopular ? 'rgba(255,255,255,0.85)' : '#334155')
                                                : (isPopular ? 'rgba(255,255,255,0.3)' : '#cbd5e1'),
                                            textDecoration: feature.included ? 'none' : 'line-through'
                                        }}>
                                            <i
                                                className={"fa-solid " + (feature.included ? 'fa-check' : 'fa-xmark')}
                                                style={{
                                                    fontSize: 12, width: 20, textAlign: 'center' as const,
                                                    color: feature.included
                                                        ? (isPopular ? '#60a5fa' : '#2563eb')
                                                        : (isPopular ? 'rgba(255,255,255,0.2)' : '#d1d5db')
                                                }}
                                            />
                                            {feature.text}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* GUARANTEE */}
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

            {/* OLD WAY vs 99SELLERS WAY — side by side */}
            <section style={{ padding: '80px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                        fontWeight: 800, color: '#0f172a',
                        textAlign: 'center', marginBottom: 12
                    }}>
                        The Old Way vs The <span style={{ color: '#2563eb' }}>99Sellers</span> Way
                    </h2>
                    <p style={{
                        fontSize: 16, color: '#64748b', textAlign: 'center',
                        marginBottom: 48, maxWidth: 550, margin: '0 auto 48px'
                    }}>
                        Stop wasting time with outdated methods. See how 99Sellers transforms your lead generation.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 24,
                        alignItems: 'stretch'
                    }}>
                        {/* OLD WAY */}
                        <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 20,
                            padding: '40px 32px',
                            display: 'flex',
                            flexDirection: 'column' as const
                        }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '6px 16px', background: '#fff',
                                border: '1px solid #e2e8f0', borderRadius: 50,
                                marginBottom: 24, width: 'fit-content',
                                fontSize: 13, fontWeight: 700, color: '#64748b',
                                textTransform: 'uppercase' as const, letterSpacing: '0.04em'
                            }}>
                                <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: 12 }} />
                                The Old Way
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                                {[
                                    'Drive for hours searching neighborhoods',
                                    'Manually search county records one by one',
                                    'Pay $500+/mo for outdated lead lists',
                                    'Cold call from purchased phone lists',
                                    'Spend days skipping tracing leads',
                                    'Miss deals because data is weeks old',
                                    'Limited to one county or market',
                                    'No way to filter by seller motivation',
                                    'Waste money on unqualified leads',
                                ].map((text, i) => (
                                    <li key={i} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 12,
                                        marginBottom: 18, fontSize: 14,
                                        color: '#64748b', lineHeight: 1.5
                                    }}>
                                        <i
                                            className="fa-solid fa-xmark"
                                            style={{
                                                fontSize: 14, width: 22, textAlign: 'center' as const,
                                                color: '#94a3b8', marginTop: 3, flexShrink: 0
                                            }}
                                        />
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 99SELLERS WAY */}
                        <div style={{
                            background: '#0f172a',
                            border: '2px solid #0f172a',
                            borderRadius: 20,
                            padding: '40px 32px',
                            display: 'flex',
                            flexDirection: 'column' as const,
                            position: 'relative' as const
                        }}>
                            <div style={{
                                position: 'absolute' as const, top: -13, left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#2563eb', color: '#fff',
                                fontSize: 12, fontWeight: 700,
                                padding: '6px 18px', borderRadius: 50,
                                letterSpacing: '0.04em', textTransform: 'uppercase' as const
                            }}>
                                Smarter Approach
                            </div>

                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '6px 16px', background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 50,
                                marginBottom: 24, width: 'fit-content',
                                fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
                                textTransform: 'uppercase' as const, letterSpacing: '0.04em'
                            }}>
                                <i className="fa-solid fa-bolt" style={{ fontSize: 12, color: '#60a5fa' }} />
                                The 99Sellers Way
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                                {[
                                    'Instant access to motivated seller leads',
                                    'All 50 states — every county, automated',
                                    'Starting at just $50/mo for unlimited leads',
                                    'Built-in skip tracing with phone & email',
                                    'Owner contact info ready in seconds',
                                    'Daily fresh data — never miss a deal',
                                    'Search any market nationwide instantly',
                                    'Filter by all 9 distress motive types',
                                    'Every lead is a motivated seller',
                                ].map((text, i) => (
                                    <li key={i} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 12,
                                        marginBottom: 18, fontSize: 14,
                                        color: 'rgba(255,255,255,0.85)', lineHeight: 1.5
                                    }}>
                                        <i
                                            className="fa-solid fa-check"
                                            style={{
                                                fontSize: 14, width: 22, textAlign: 'center' as const,
                                                color: '#60a5fa', marginTop: 3, flexShrink: 0
                                            }}
                                        />
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* COMPARE PLANS TABLE */}
            <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                        fontWeight: 800, color: '#0f172a',
                        textAlign: 'center', marginBottom: 40
                    }}>
                        Compare <span style={{ color: '#2563eb' }}>Plans</span>
                    </h2>

                    <div style={{ borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 100px 100px',
                            padding: '16px 24px', background: '#fff',
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Feature</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.04em', textAlign: 'center' as const }}>Free</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' as const, letterSpacing: '0.04em', textAlign: 'center' as const }}>Pro</span>
                        </div>

                        {[
                            { feature: 'Monthly leads', free: '50', pro: 'Unlimited' },
                            { feature: 'County coverage', free: '1', pro: 'All 50 states' },
                            { feature: 'Seller motive types', free: 'Limited', pro: 'All 9 types' },
                            { feature: 'Skip tracing', free: false, pro: true },
                            { feature: 'CRM export', free: false, pro: true },
                            { feature: 'Owner phone numbers', free: false, pro: true },
                            { feature: 'Owner mailing address', free: false, pro: true },
                            { feature: 'Daily data refresh', free: false, pro: true },
                            { feature: 'Priority support', free: false, pro: true },
                        ].map((row, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'grid', gridTemplateColumns: '1fr 100px 100px',
                                    padding: '14px 24px',
                                    borderBottom: i < 8 ? '1px solid #f1f5f9' : 'none',
                                    background: i % 2 === 0 ? '#fff' : '#fafbfc'
                                }}
                            >
                                <span style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{row.feature}</span>
                                <span style={{ textAlign: 'center' as const, fontSize: 14 }}>
                                    {typeof row.free === 'boolean'
                                        ? <i className={"fa-solid " + (row.free ? 'fa-check' : 'fa-xmark')} style={{ color: row.free ? '#2563eb' : '#d1d5db' }} />
                                        : <span style={{ color: '#64748b', fontWeight: 500 }}>{row.free}</span>
                                    }
                                </span>
                                <span style={{ textAlign: 'center' as const, fontSize: 14 }}>
                                    {typeof row.pro === 'boolean'
                                        ? <i className={"fa-solid " + (row.pro ? 'fa-check' : 'fa-xmark')} style={{ color: row.pro ? '#2563eb' : '#d1d5db' }} />
                                        : <span style={{ color: '#0f172a', fontWeight: 600 }}>{row.pro}</span>
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
                <div style={{ maxWidth: 650, margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                        fontWeight: 800, color: '#0f172a',
                        textAlign: 'center', marginBottom: 40
                    }}>
                        Frequently asked questions
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

            {/* BOTTOM CTA */}
            <section style={{ padding: '80px 24px', background: '#0f172a', textAlign: 'center' }}>
                <div style={{ maxWidth: 550, margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                        fontWeight: 800, color: '#fff',
                        marginBottom: 16, letterSpacing: '-0.01em'
                    }}>
                        Ready to find your next deal?
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
