"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";


import React, { useState, useEffect } from "react";


import { adminAPI } from "@/services/api";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BlogPostPage() {
    const params = useParams();
    const id = params.id;
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            if (!id) return;
            try {
                const result = await adminAPI.content.get(`blog_post_${id}`);
                if (result.success && result.data?.value) {
                    setContent(result.data.value);
                }
            } catch (error) {
                console.error("Failed to fetch blog post:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [id]);

    const defaultContent = {
        title: "Blog Post Not Found",
        date: "",
        author: "",
        category: "",
        content: "We couldn't find the blog post you're looking for. It might have been moved or deleted.",
        image: "/images/blog/blog-1.jpg",
        tags: []
    };

    const displayContent = content || defaultContent;

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#ffffff" }}>
                <Header />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 40, color: "#2563eb" }}></i>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#ffffff" }}>
            <Header />

            {/* Post Hero */}
            <section style={{ background: "#0f172a", padding: "140px 24px 80px", textAlign: "center" }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <p style={{ color: "#3b82f6", fontWeight: 600, fontSize: 14, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                        {displayContent.category}
                    </p>
                    <h1 style={{ fontSize: 42, fontWeight: 700, color: "#ffffff", marginBottom: 24, lineHeight: 1.2 }}>
                        {displayContent.title}
                    </h1>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, color: "#94a3b8", fontSize: 15 }}>
                        <span><i className="fa-regular fa-calendar" style={{ marginRight: 8 }}></i>{displayContent.date}</span>
                        <span><i className="fa-regular fa-user" style={{ marginRight: 8 }}></i>{displayContent.author}</span>
                    </div>
                </div>
            </section>

            {/* Post Content */}
            <section style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
                {displayContent.image && (
                    <img
                        src={displayContent.image}
                        alt={displayContent.title}
                        style={{ width: "100%", height: "auto", borderRadius: 16, marginBottom: 40, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                    />
                )}

                <div className="markdown-content" style={{ fontSize: 18, lineHeight: 1.8, color: "#334155" }}>
                    <ReactMarkdown>{displayContent.content}</ReactMarkdown>
                </div>

                <div style={{ marginTop: 60, paddingTop: 40, borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {(displayContent.tags || []).map((tag: string) => (
                            <span key={tag} style={{ background: "#f1f5f9", padding: "6px 14px", borderRadius: 20, fontSize: 14, color: "#475569" }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 60 }}>
                    <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                        <i className="fa-solid fa-arrow-left"></i> Back to Insights
                    </Link>
                </div>
            </section>

            <Footer />
            <style jsx global>{`
                .markdown-content h2 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 40px 0 20px; }
                .markdown-content h3 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 30px 0 16px; }
                .markdown-content p { margin-bottom: 24px; }
                .markdown-content ul, .markdown-content ol { margin-bottom: 24px; padding-left: 24px; }
                .markdown-content li { margin-bottom: 12px; }
                .markdown-content blockquote { border-left: 4px solid #3b82f6; padding-left: 20px; font-style: italic; color: #475569; margin: 30px 0; }
            `}</style>
        </div>
    );
}
