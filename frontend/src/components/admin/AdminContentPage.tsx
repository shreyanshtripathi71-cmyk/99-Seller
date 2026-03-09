"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { adminAPI } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

interface HeroImage {
    id: number;
    url: string;
    title: string;
    subtitle: string;
    order: number;
}

const MAX_HERO_IMAGES = 6;

const CONTENT_PAGES = [
    { id: 'hero_images', label: 'Home Hero Slider', type: 'json' },
    { id: 'page_home', label: 'Home Page', type: 'json' },
    { id: 'page_about', label: 'About Us', type: 'json' },
    { id: 'page_about_us_01', label: 'About Us (Alt)', type: 'json' },
    { id: 'page_faq', label: 'FAQ', type: 'json' },
    { id: 'page_pricing', label: 'Pricing', type: 'json' },
    { id: 'page_features', label: 'Features', type: 'json' },
    { id: 'page_contact', label: 'Contact Us', type: 'json' },
    { id: 'page_privacy', label: 'Privacy Policy', type: 'json' },
    { id: 'page_terms', label: 'Terms of Service', type: 'json' },
    { id: 'page_help', label: 'Help Center', type: 'json' },
    { id: 'page_affiliates', label: 'Affiliates', type: 'json' },
    { id: 'page_blog', label: 'Blog Index', type: 'json' },
    { id: 'blog_post', label: 'Individual Blog Post', type: 'blog_post' },
];

// --- Drag & Drop Components ---

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').trim();

interface DragDropUploaderProps {
    value: string;
    onChange: (url: string) => void;
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({ value, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleUpload(files[0]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const result = await adminAPI.content.uploadImage(formData);
            if (result.success && result.data) {
                const fullUrl = result.data.url.startsWith('http')
                    ? result.data.url
                    : `${API_BASE_URL}${result.data.url}`;
                onChange(fullUrl);
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ marginBottom: 16 }}>
            {value ? (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
                        </div>
                        <button
                            onClick={() => onChange('')}
                            style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${isDragging ? '#3b82f6' : '#cbd5e1'}`,
                        borderRadius: 12,
                        padding: 32,
                        textAlign: 'center',
                        background: isDragging ? '#eff6ff' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                    }}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    {uploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: '#3b82f6' }}></i>
                            <span style={{ fontSize: 14, color: '#64748b' }}>Uploading...</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 18 }}></i>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>
                                <span style={{ color: '#3b82f6' }}>Click to upload</span> or drag and drop
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>SVG, PNG, JPG (max 5MB)</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const AdminContentPage: React.FC = () => {
    const [activeKey, setActiveKey] = useState<string>(CONTENT_PAGES[0].id);
    const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
    const [jsonContent, setJsonContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isValidJson, setIsValidJson] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    const [viewMode, setViewMode] = useState<'form' | 'json'>('form');
    const [parsedContent, setParsedContent] = useState<any>(null);
    const [contentList, setContentList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const activePageInfo = CONTENT_PAGES.find(p => p.id === activeKey) ||
        (activeKey.startsWith('blog_post_') ? { id: activeKey, label: activeKey.replace('blog_post_', '').replace(/_/g, ' '), type: 'blog_post' } :
            { id: activeKey, label: activeKey, type: 'json' });

    useEffect(() => {
        fetchContentList();
    }, []);

    useEffect(() => {
        loadContent(activeKey);
    }, [activeKey]);

    const fetchContentList = async () => {
        try {
            const result = await adminAPI.content.list();
            if (result.success) {
                setContentList(result.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch content list:', error);
        }
    };

    const handleDeleteContent = async (key: string) => {
        const isCore = CONTENT_PAGES.some(p => p.id === key);
        const confirmMsg = isCore
            ? `WARNING: "${key}" is a CORE page. Deleting it may break the site! Type "DELETE" to confirm:`
            : `Are you sure you want to delete "${key}"?`;

        if (isCore) {
            const userInput = window.prompt(confirmMsg);
            if (userInput !== 'DELETE') return;
        } else {
            if (!window.confirm(confirmMsg)) return;
        }

        setSaving(true);
        try {
            const result = await adminAPI.content.delete(key);
            if (result.success) {
                showMessage('success', 'Content deleted successfully');
                fetchContentList();
                if (key === activeKey) {
                    setActiveKey(CONTENT_PAGES[0].id);
                }
            } else {
                showMessage('error', 'Failed to delete content');
            }
        } catch (error) {
            showMessage('error', 'Error deleting content');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateContent = async () => {
        const key = window.prompt("Enter Content Key (e.g., page_about or blog_post_title):");
        if (!key) return;

        setSaving(true);
        try {
            const initialContent = key.startsWith('blog_post_') ? {
                title: key.replace('blog_post_', '').replace(/_/g, ' '),
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                author: "Admin",
                category: "Real Estate",
                content: "Start writing here...",
                image: "/images/blog/blog-1.jpg",
                tags: []
            } : { title: "New Content", content: "" };

            const result = await adminAPI.content.update(key, initialContent, 'json');
            if (result.success) {
                showMessage('success', 'Content created!');
                fetchContentList();
                setActiveKey(key);
            }
        } catch (error) {
            showMessage('error', 'Failed to create content');
        } finally {
            setSaving(false);
        }
    };

    const loadContent = async (key: string) => {
        setLoading(true);
        try {
            const pageInfo = CONTENT_PAGES.find(p => p.id === key);
            const type = pageInfo?.type || (key.startsWith('blog_post_') ? 'blog_post' : 'json');

            // Handle database-backed content
            const result = await adminAPI.content.get(key);

            if (result.success && result.data?.value) {
                // Fix double-serialization: if value is a string, try to parse it as JSON
                let contentValue = result.data.value;
                if (typeof contentValue === 'string') {
                    try {
                        contentValue = JSON.parse(contentValue);
                    } catch (e) {
                        // If it fails, keep it as a string
                    }
                }

                setJsonContent(JSON.stringify(contentValue, null, 4));
                setParsedContent(contentValue);
                if (key === 'hero_images') {
                    const heroArr = Array.isArray(contentValue) ? contentValue : [];
                    setHeroImages(heroArr.slice(0, MAX_HERO_IMAGES));
                }
            } else {
                // Rich defaults for each page type
                const defaults: Record<string, any> = {
                    hero_images: [
                        { id: 1, url: '/images/home/hero-slide-1.jpg', title: 'Find 100s of motivated sellers at few clicks', subtitle: 'Never let the lack of information stops you from closing deals', order: 1 },
                        { id: 2, url: '/images/home/hero-slide-2.jpg', title: 'Want basket full of sales lead today?', subtitle: 'Hundreds and thousands of distressed sellers are just waiting for you to sell their home.', order: 2 },
                        { id: 3, url: '/images/home/hero-slide-3.jpg', title: 'Sellers are waiting to sell their property.', subtitle: "Finding the right seller doesn't have to be hard. We make it easy for you.", order: 3 },
                    ],
                    page_home: {
                        hero: { title: '99Sellers', highlight: 'Deal Terminal', subtitle: 'Find foreclosures, divorce filings, and tax liens before they hit the MLS.', backgroundImage: '/images/hero-bg.jpg' },
                        stats: { leads: '50,000+', states: '50', motives: '9+', backgroundImage: '/images/stats-bg.jpg' },
                        features: [
                            { title: 'Lead Discovery', description: 'Search distressed properties across all 50 states', image: '/images/features/discovery.jpg' },
                            { title: 'Skip Tracing', description: 'Get owner contact info including phone and email', image: '/images/features/skip-tracing.jpg' },
                            { title: 'Market Analytics', description: 'Understand market trends and property values', image: '/images/features/analytics.jpg' }
                        ],
                        testimonials: [
                            { name: 'John D.', role: 'Real Estate Investor', text: 'Found 3 deals in my first month!', avatar: '/images/avatars/avatar1.jpg' }
                        ],
                        cta: { title: 'Start Finding Off-Market Deals Today', buttonText: 'Get Started Free', backgroundImage: '/images/cta-bg.jpg' }
                    },
                    page_about: {
                        hero: { title: 'About', highlight: 'Us', subtitle: 'Empowering Real Estate Professionals to Find Motivated Sellers', backgroundImage: '/images/about-hero-bg.jpg' },
                        teamImage: '/images/about/team.jpg',
                        sections: [
                            { id: 'challenge', title: 'The Challenge Every Agent Faces', content: 'Finding motivated sellers is the hardest part of real estate investing.', image: '/images/about/challenge.jpg' }
                        ],
                        distressedItems: ['Pre-Foreclosure', 'Probate', 'Divorce', 'Tax Delinquencies', 'Code Violations'],
                        cta: { text: 'Ready to Transform Your Lead Generation?', buttonText: 'Get Started Free', backgroundImage: '/images/about/cta-bg.jpg' }
                    },
                    page_about_us_01: {
                        hero: { title: 'About Us', subtitle: 'Our Mission', backgroundImage: '/images/about-alt-hero.jpg' },
                        storyImage: '/images/about/story.jpg',
                        sections: [
                            { title: 'Our Story', content: 'We started with a simple mission...', image: '/images/about/story-section.jpg' }
                        ]
                    },
                    page_faq: {
                        title: 'Frequently Asked Questions', subtitle: 'Everything you need to know', headerImage: '/images/faq-header.jpg',
                        faqs: [
                            { question: 'What is 99Sellers?', answer: 'A real estate lead generation platform for off-market properties.' },
                            { question: 'How does the free trial work?', answer: 'Sign up for a free 15-day trial. No credit card required.' }
                        ]
                    },
                    page_pricing: {
                        pricingHeader: { title: 'Our', titleHighlight: 'Pricing', subtitle: 'Choose the plan that fits your business.', backgroundImage: '/images/pricing-header-bg.jpg' },
                        plans: [
                            { id: 'starter', name: 'Free', price: '0', period: 'forever', description: 'Get started', features: ['Basic lead search', 'Limited results'], buttonText: 'Get Started Free', popular: false, iconImage: '/images/pricing/free-icon.png' },
                            { id: 'monthly', name: 'Pro Monthly', price: '50', period: 'month', description: 'Full access', features: ['Unlimited lead search', 'Skip tracing', 'Export data'], buttonText: 'Start Pro', popular: true, iconImage: '/images/pricing/pro-icon.png' }
                        ],
                        guarantee: { title: '30-day money-back guarantee', description: 'Try any paid plan risk-free.', badgeImage: '/images/pricing/guarantee-badge.png' },
                        comparisonImage: '/images/pricing/comparison.jpg'
                    },
                    page_features: {
                        hero: { title: 'Powerful Features for Modern Investors', subtitle: 'Everything you need to find, track, and close off-market deals.', backgroundImage: '/images/features-hero-bg.jpg' },
                        features: [
                            { image: '/images/features/discovery.jpg', title: 'Advanced Lead Discovery', layout: 'left', description: 'Search properties across all 50 states.' },
                            { image: '/images/features/skip-tracing.jpg', title: 'Skip Tracing', layout: 'right', description: 'Get owner contact information.' },
                            { image: '/images/features/analytics.jpg', title: 'Market Analytics', layout: 'left', description: 'Understand market trends and property values.' },
                            { image: '/images/features/export.jpg', title: 'Data Export', layout: 'right', description: 'Export leads to CSV, Excel, or your CRM.' }
                        ]
                    },
                    page_contact: {
                        hero: { title: 'Contact', highlight: 'Us', subtitle: 'Get in touch with our team', backgroundImage: '/images/contact-hero-bg.jpg' },
                        contactInfo: { email: 'support@99sellers.com', phone: '(555) 123-4567' },
                        mapImage: '/images/contact/map.jpg',
                        sections: [
                            { id: 'support', title: 'Customer Support', content: 'Our team is here to help.', image: '/images/contact/support.jpg' }
                        ]
                    },
                    page_privacy: { title: 'Privacy Policy', lastUpdated: 'January 1, 2025', content: 'Your privacy is important to us.', headerImage: '/images/privacy-header.jpg' },
                    page_terms: { title: 'Terms of Service', lastUpdated: 'January 1, 2025', content: 'By using 99Sellers, you agree to these terms.', headerImage: '/images/terms-header.jpg' },
                    page_help: { title: 'Help Center', subtitle: 'How can we help you?', headerImage: '/images/help-header.jpg', categories: [{ title: 'Getting Started', icon: 'rocket', image: '/images/help/getting-started.jpg', articles: [] }] },
                    page_affiliates: { hero: { title: 'Affiliate Program', subtitle: 'Earn commission by referring users', backgroundImage: '/images/affiliates-hero-bg.jpg' }, bannerImage: '/images/affiliates/banner.jpg', benefits: [{ title: 'High Commission', description: '30% recurring', iconImage: '/images/affiliates/commission-icon.png' }] },
                    page_blog: { title: 'Blog', subtitle: 'Real estate insights and tips', featuredImage: '/images/blog/featured.jpg', headerImage: '/images/blog-header.jpg' }
                };
                const defaultObj = defaults[key] || { title: "New Content", content: "" };
                setJsonContent(JSON.stringify(defaultObj, null, 4));
                setParsedContent(defaultObj);
                if (key === 'hero_images') setHeroImages(Array.isArray(defaultObj) ? defaultObj : []);
            }
            setIsDirty(false);
        } catch (error) {
            console.error('Failed to load content:', error);
            showMessage('error', 'Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const handleJsonChange = (val: string) => {
        setJsonContent(val);
        try {
            JSON.parse(val);
            setIsValidJson(true);
        } catch (e) {
            setIsValidJson(false);
        }
    };

    const handleSaveForm = async () => {
        setSaving(true);
        try {
            const result = await adminAPI.content.update(activeKey, parsedContent, 'json');
            if (result.success) {
                showMessage('success', 'Content saved!');
                setJsonContent(JSON.stringify(parsedContent, null, 4));
                fetchContentList();
                setIsDirty(false);
            } else {
                showMessage('error', 'Failed to save content');
            }
        } catch (error) {
            showMessage('error', 'Error while saving content');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveJson = async () => {
        if (!isValidJson) return showMessage('error', 'Invalid JSON');

        // File-based content cannot be saved through admin panel (Deprecated/Not used)
        if (activePageInfo.type === 'file_json') {
            showMessage('error', 'This content type is deprecated. Please contact support.');
            return;
        }

        setSaving(true);
        try {
            const parsed = JSON.parse(jsonContent);
            const result = await adminAPI.content.update(activeKey, parsed, 'json');
            if (result.success) {
                showMessage('success', 'Content saved!');
                setParsedContent(parsed);
                fetchContentList();
            }
        } catch (error) {
            showMessage('error', 'Error saving JSON');
        } finally {
            setSaving(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const updateParsedContent = (path: string[], value: any) => {
        const newData = JSON.parse(JSON.stringify(parsedContent));
        let current = newData;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        setParsedContent(newData);
        setIsDirty(true);
    };

    const handleAddItem = (path: string[], defaultValue: any) => {
        const newData = JSON.parse(JSON.stringify(parsedContent));

        // Handle root array
        if (path.length === 0) {
            if (Array.isArray(newData)) {
                // If adding to hero_images, ensure we have a template
                if (activeKey === 'hero_images' && Object.keys(defaultValue).length === 0) {
                    defaultValue = {
                        id: Date.now(),
                        url: '',
                        title: 'New Slide',
                        subtitle: 'Subtitle',
                        order: newData.length + 1
                    };
                }
                const updated = [...newData, defaultValue];
                setParsedContent(updated);
                setIsDirty(true);
            }
            return;
        }

        let current = newData;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        const key = path[path.length - 1];
        if (!Array.isArray(current[key])) current[key] = [];
        current[key] = [...current[key], defaultValue];
        setParsedContent(newData);
        setIsDirty(true);
    };

    const handleRemoveItem = (path: string[], index: number) => {
        const newData = JSON.parse(JSON.stringify(parsedContent));

        // Handle root array
        if (path.length === 0) {
            if (Array.isArray(newData)) {
                const updated = newData.filter((_: any, i: number) => i !== index);
                setParsedContent(updated);
                setIsDirty(true);
            }
            return;
        }

        let current = newData;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        const key = path[path.length - 1];
        if (Array.isArray(current[key])) {
            current[key] = current[key].filter((_: any, i: number) => i !== index);
        }
        setParsedContent(newData);
        setIsDirty(true);
    };

    const renderField = (label: string, value: any, path: string[]) => {
        // --- UNIVERSAL IMAGE FIELD DETECTION ---
        // Detect by field name
        const lbl = label.toLowerCase();
        const imageLabels = ['image', 'photo', 'logo', 'icon', 'banner', 'src', 'bg',
            'background', 'thumbnail', 'cover', 'hero', 'avatar', 'picture', 'poster',
            'img', 'screenshot', 'preview', 'wallpaper', 'graphic', 'illustration'];
        const isImageByLabel = imageLabels.some(k => lbl.includes(k)) || lbl === 'url';

        // Detect by value — if it looks like an image path/URL
        const isImageByValue = typeof value === 'string' && (
            /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif)(\?.*)?$/i.test(value) ||
            value.startsWith('/images/') ||
            value.startsWith('/uploads/') ||
            (value.startsWith('http') && /\.(jpg|jpeg|png|gif|webp|svg)/i.test(value)) ||
            value.startsWith('data:image/')
        );

        const isImage = isImageByLabel || isImageByValue;

        if (isImage && typeof value === 'string') {
            return (
                <div key={path.join('.')} style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, textTransform: 'capitalize' }}>
                        <i className="fa-solid fa-image" style={{ marginRight: 6, color: '#6366f1', fontSize: 12 }}></i>
                        {label.replace(/_/g, ' ')}
                    </label>
                    <DragDropUploader
                        value={value}
                        onChange={(url) => updateParsedContent(path, url)}
                    />
                </div>
            );
        }

        if (typeof value === 'string') {
            const isLong = label.toLowerCase().includes('content') || label.toLowerCase().includes('text') || value.length > 100;
            return (
                <div key={path.join('.')} style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, textTransform: 'capitalize' }}>
                        {label.replace(/_/g, ' ')}
                    </label>
                    {isLong ? (
                        <textarea
                            value={value}
                            onChange={(e) => updateParsedContent(path, e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, minHeight: 120, resize: 'vertical' }}
                        />
                    ) : (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => updateParsedContent(path, e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}
                        />
                    )}
                </div>
            );
        }

        if (Array.isArray(value)) {
            return (
                <div key={path.join('.')} style={{ marginBottom: 32, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'capitalize' }}>
                            {label.replace(/_/g, ' ')} List
                        </h3>
                        <button
                            onClick={() => handleAddItem(path, value.length > 0 && typeof value[0] === 'object' ? { ...value[0] } : (label === 'tags' ? '' : { title: '', content: '' }))}
                            style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                            <i className="fa-solid fa-plus me-1"></i> Add Item
                        </button>
                    </div>
                    {value.map((item, index) => (
                        <div key={index} style={{ marginBottom: 16, padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', position: 'relative' }}>
                            <button
                                onClick={() => handleRemoveItem(path, index)}
                                style={{ position: 'absolute', top: 12, right: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#64748b', marginBottom: 12 }}>Item #{index + 1}</div>
                            {typeof item === 'object' && item !== null ? (
                                Object.entries(item).map(([k, v]) => renderField(k, v, [...path, index.toString(), k]))
                            ) : (
                                renderField('', item, [...path, index.toString()])
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof value === 'object' && value !== null) {
            return (
                <div key={path.join('.')} style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 12, borderBottom: '1px solid #f1f5f9', paddingBottom: 8, textTransform: 'capitalize' }}>
                        {label.replace(/_/g, ' ')}
                    </h3>
                    <div style={{ paddingLeft: 12 }}>
                        {Object.entries(value).map(([k, v]) => renderField(k, v, [...path, k]))}
                    </div>
                </div>
            );
        }

        return null;
    };

    const categories = [
        { title: 'Core Pages', filter: (k: string) => CONTENT_PAGES.some(p => p.id === k) },
        { title: 'Blog Posts', filter: (k: string) => k.startsWith('blog_post_') },
        { title: 'Other Content', filter: (k: string) => !CONTENT_PAGES.some(p => p.id === k) && !k.startsWith('blog_post_') }
    ];

    return (
        <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 100px)', minHeight: 600 }}>
            {/* Sidebar */}
            <div style={{ width: 300, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: 16, borderBottom: '1px solid #f1f5f9' }}>
                    <button
                        onClick={handleCreateContent}
                        style={{ width: '100%', padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                        <i className="fa-solid fa-plus"></i> New Content Item
                    </button>
                    <input
                        type="text"
                        placeholder="Filter content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', marginTop: 12, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
                    />
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                    {categories.map(cat => {
                        // Merge core pages into the items list if they belong to this category
                        const coreItemsInRange = cat.title === 'Core Pages'
                            ? CONTENT_PAGES.filter(p => !p.id.startsWith('blog_post') && p.id !== 'blog_post')
                            : [];

                        // Get all keys from DB that match this category
                        const dbItems = contentList.filter(i => cat.filter(i.key));

                        // Combine and deduplicate by key
                        const combinedKeys = Array.from(new Set([
                            ...coreItemsInRange.map(i => i.id),
                            ...dbItems.map(i => i.key)
                        ])).filter(k => k.toLowerCase().includes(searchTerm.toLowerCase()));

                        if (combinedKeys.length === 0 && searchTerm === '') return null;

                        return (
                            <div key={cat.title} style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>{cat.title}</div>
                                {combinedKeys.map(key => {
                                    const label = CONTENT_PAGES.find(p => p.id === key)?.label ||
                                        key.replace('page_', '').replace('blog_post_', '').replace(/_/g, ' ');
                                    return (
                                        <div
                                            key={key}
                                            onClick={() => setActiveKey(key)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: 6,
                                                fontSize: 13,
                                                cursor: 'pointer',
                                                background: activeKey === key ? '#eff6ff' : 'transparent',
                                                color: activeKey === key ? '#2563eb' : '#475569',
                                                fontWeight: activeKey === key ? 600 : 400,
                                                marginBottom: 2
                                            }}
                                        >
                                            {label}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Editor Pane */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>{activePageInfo.label}</h2>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Key: <code>{activeKey}</code></div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: '#e2e8f0', padding: 3, borderRadius: 6 }}>
                            <button onClick={() => setViewMode('form')} style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: viewMode === 'form' ? '#fff' : 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Form</button>
                            <button onClick={() => setViewMode('json')} style={{ padding: '4px 12px', borderRadius: 4, border: 'none', background: viewMode === 'json' ? '#fff' : 'transparent', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>JSON</button>
                        </div>
                        <button
                            onClick={() => handleDeleteContent(activeKey)}
                            style={{ padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                        >
                            <i className="fa-solid fa-trash me-2"></i> Delete
                        </button>
                        <button
                            onClick={viewMode === 'form' ? handleSaveForm : handleSaveJson}
                            disabled={saving}
                            style={{
                                padding: '8px 20px',
                                background: isDirty ? '#f59e0b' : '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: isDirty ? '0 4px 6px -1px rgba(245, 158, 11, 0.4)' : 'none'
                            }}
                        >
                            {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save me-2"></i>}
                            {isDirty ? 'Save Changes *' : 'Saved'}
                        </button>
                    </div>
                </div>

                <div style={{ padding: 32, flex: 1 }}>
                    {message && (
                        <div style={{ padding: '12px 16px', borderRadius: 8, background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b', marginBottom: 24, fontSize: 14 }}>
                            <i className={`fa-solid ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                            {message.text}
                        </div>
                    )}

                    {loading ? (
                        <div style={{ padding: 60, textAlign: 'center' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: '#3b82f6', marginBottom: 16 }}></i>
                            <p style={{ color: '#64748b' }}>Loading content...</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'form' ? (
                                <div style={{ maxWidth: 800 }}>
                                    {parsedContent && (Array.isArray(parsedContent) ? (
                                        parsedContent.map((item, index) => (
                                            <div key={index} style={{ marginBottom: 32, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Item #{index + 1}</h3>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button
                                                            onClick={() => handleRemoveItem([], index)}
                                                            style={{ color: '#ef4444', background: '#fee2e2', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                {typeof item === 'object' && item !== null ? (
                                                    Object.entries(item).map(([k, v]) => renderField(k, v, [index.toString(), k]))
                                                ) : (
                                                    renderField('', item, [index.toString()])
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        Object.entries(parsedContent).map(([k, v]) => renderField(k, v, [k]))
                                    ))}

                                    {Array.isArray(parsedContent) && (
                                        <button
                                            onClick={() => handleAddItem([], {})}
                                            style={{ marginTop: 16, padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                                        >
                                            <i className="fa-solid fa-plus"></i> Add New Item
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    value={jsonContent}
                                    onChange={(e) => handleJsonChange(e.target.value)}
                                    style={{ width: '100%', height: 500, fontFamily: 'monospace', padding: 20, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminContentPage;
