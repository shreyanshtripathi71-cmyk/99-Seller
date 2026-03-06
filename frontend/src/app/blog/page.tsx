"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";


import React from "react";


import { useContent } from "@/modules/AppLogic_Module";
import Link from "next/link";

const defaultContent = {
    title: "Insights & Strategy",
    subtitle: "The latest in off-market real estate investing",
    posts: [
        {
            id: 1,
            title: "How to Find Foreclosures Before They Hit the MLS",
            excerpt: "Learn the secrets to identifying pre-foreclosure opportunities early...",
            date: "Jan 15, 2024",
            image: "/images/blog/blog-1.jpg"
        },
        {
            id: 2,
            title: "The Art of the Follow-up with Motivated Sellers",
            excerpt: "Consistency is key. Here is how to build a follow-up sequence that converts.",
            date: "Jan 10, 2024",
            image: "/images/blog/blog-2.jpg"
        }
    ]
};

export default function BlogPage() {
    const { content: displayContent, loading } = useContent('page_blog', defaultContent);

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <Header />
            <section style={{ background: "#0f172a", padding: "140px 24px 80px", textAlign: "center" }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <h1 style={{ fontSize: 42, fontWeight: 700, color: "#ffffff", marginBottom: 16 }}>
                        {displayContent.title}
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: 18 }}>{displayContent.subtitle}</p>
                </div>
            </section>

            <section style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: '#3b82f6' }}></i>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
                        {(displayContent.posts || []).map((post: any) => (
                            <div key={post.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                <div style={{ height: 200, background: `url(${post.image}) center/cover` }}></div>
                                <div style={{ padding: 24 }}>
                                    <p style={{ color: '#2563eb', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{post.date}</p>
                                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>{post.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{post.excerpt}</p>
                                    <Link href={`/blog/${post.id}`} style={{ color: '#0f172a', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        Read More <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }}></i>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            <Footer />
        </div>
    );
}
