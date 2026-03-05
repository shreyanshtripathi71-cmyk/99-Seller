/**
 * Seed script to populate SiteContent with rich, structured templates for all pages.
 * Each template matches the defaultContent in the corresponding frontend page component.
 * Run: node scripts/seed-content.js
 */
require('dotenv').config();
const { sequelize, SiteContent } = require('../models');

const contentTemplates = {
    hero_images: [
        { id: 1, url: '/images/hero1.jpg', title: '99Sellers', subtitle: 'The Off-Market Deal Terminal', order: 1 },
        { id: 2, url: '/images/hero2.jpg', title: 'Find Deals First', subtitle: 'Foreclosures, Divorce Filings & Tax Liens', order: 2 },
        { id: 3, url: '/images/hero3.jpg', title: 'Skip the MLS', subtitle: 'Access Off-Market Properties Nationwide', order: 3 }
    ],
    page_home: {
        hero: {
            title: '99Sellers',
            highlight: 'Deal Terminal',
            subtitle: 'Find foreclosures, divorce filings, and tax liens before they hit the MLS.',
            backgroundImage: '/images/hero-bg.jpg'
        },
        stats: { leads: '50,000+', states: '50', motives: '9+' },
        features: [
            { title: 'Lead Discovery', description: 'Search distressed properties across all 50 states with advanced filters.', image: '/images/features/discovery.jpg' },
            { title: 'Skip Tracing', description: 'Get owner contact info including phone numbers and email addresses.', image: '/images/features/skip-tracing.jpg' },
            { title: 'Market Analytics', description: 'Understand market trends and property values with real-time data.', image: '/images/features/analytics.jpg' }
        ],
        testimonials: [
            { name: 'John D.', role: 'Real Estate Investor', text: 'Found 3 deals in my first month using 99Sellers. The platform is incredible.', avatar: '/images/avatars/avatar1.jpg' },
            { name: 'Sarah M.', role: 'RE Agent', text: 'Best lead generation tool I\'ve ever used. Saves me hours of research every week.', avatar: '/images/avatars/avatar2.jpg' }
        ],
        cta: { title: 'Start Finding Off-Market Deals Today', buttonText: 'Get Started Free', backgroundImage: '/images/cta-bg.jpg' }
    },
    page_about: {
        hero: { title: 'About', highlight: 'Us', subtitle: 'Empowering Real Estate Professionals to Find Motivated Sellers' },
        sections: [
            {
                id: 'challenge',
                title: 'The Challenge Every Agent Faces',
                content: 'Finding motivated sellers is the hardest part of real estate investing. You already have the skills to close deals—but without quality leads, even the best agents struggle to grow their business.\n\nDistressed properties represent some of the most profitable opportunities in real estate. Yet accessing these sellers has traditionally required countless hours of manual research, outdated methods, and wasted resources.'
            },
            {
                id: 'solution',
                title: 'Our Solution',
                content: '99Sellers aggregates data from county records, court filings, and public databases across all 50 states. We identify motivated sellers from 9 different distress categories before they hit the MLS.'
            }
        ],
        distressedItems: [
            'Pre-Foreclosure & Mortgage Issues',
            'Inherited Properties (Probate)',
            'Divorce Situations',
            'Vacant & Abandoned Homes',
            'Tax Delinquencies',
            'Absentee Owners',
            'Code Violations'
        ],
        cta: { text: 'Ready to Transform Your Lead Generation?', buttonText: 'Get Started Free' }
    },
    page_about_us_01: {
        hero: { title: 'Who We Are', subtitle: 'A team passionate about real estate technology', backgroundImage: '/images/about-hero.jpg' },
        mission: { title: 'Our Mission', content: 'To democratize access to off-market real estate opportunities for investors and agents nationwide.' },
        team: [
            { name: 'CEO', role: 'Founder & CEO', bio: 'Real estate veteran with 15+ years of experience.', photo: '/images/team/ceo.jpg' }
        ],
        stats: { usersServed: '10,000+', statesCovered: '50', leadsGenerated: '500,000+' }
    },
    page_faq: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about 99Sellers',
        faqs: [
            { question: 'What is 99Sellers?', answer: '99Sellers is a real estate lead generation platform that provides access to off-market properties including foreclosures, tax defaults, divorce filings, and probate cases.' },
            { question: 'How does the free trial work?', answer: 'Sign up for a free 15-day trial to access all features. No credit card required. You can upgrade to a paid plan anytime.' },
            { question: 'What data sources do you use?', answer: 'We aggregate data from county records, court filings, and public databases across all 50 states. Our data is updated daily.' },
            { question: 'Can I export leads?', answer: 'Yes, premium users can export leads to CSV or Excel format. Export limits depend on your subscription plan.' },
            { question: 'How accurate is the data?', answer: 'Our data accuracy rate is 98%. We verify information across multiple sources and update records regularly.' },
            { question: 'Is there a mobile app?', answer: 'Our platform is fully responsive and works great on mobile browsers. A dedicated mobile app is coming soon.' }
        ]
    },
    page_pricing: {
        pricingHeader: { title: 'Our', titleHighlight: 'Pricing', subtitle: 'Choose the plan that fits your business. No hidden fees, cancel anytime.' },
        plans: [
            {
                id: 'starter', name: 'Free', price: '0', period: 'forever',
                description: 'Get started and explore the platform',
                features: [
                    { text: '10 leads per day', included: true },
                    { text: 'Basic property info', included: true },
                    { text: 'Owner contact info', included: false },
                    { text: 'Priority support', included: false }
                ],
                buttonText: 'Get Started Free', popular: false
            },
            {
                id: 'monthly', name: 'Pro Monthly', price: '50', period: 'month',
                description: 'Full access, billed monthly',
                features: [
                    { text: 'Unlimited leads', included: true },
                    { text: 'Full property details', included: true },
                    { text: 'Owner contact info', included: true },
                    { text: 'Priority support', included: true }
                ],
                buttonText: 'Start Pro Monthly', popular: true
            },
            {
                id: 'quarterly', name: 'Pro Quarterly', price: '120', period: 'quarter',
                description: 'Best value — save 20%', saveBadge: 'Save $30',
                features: [
                    { text: 'Unlimited leads', included: true },
                    { text: 'Full property details', included: true },
                    { text: 'Owner contact info', included: true },
                    { text: 'Priority support', included: true }
                ],
                buttonText: 'Start Pro Quarterly', popular: false
            }
        ],
        guarantee: { title: '30-day money-back guarantee', description: 'Try any paid plan risk-free. If you don\'t find value in the first 30 days, we\'ll refund every penny — no questions asked.' },
        faq: [
            { q: 'Can I cancel anytime?', a: 'Yes — cancel your subscription at any time. No long-term contracts.' },
            { q: 'Do I get phone numbers and addresses?', a: 'Yes — paid plan members get full access to owner phone numbers, email addresses, and mailing addresses.' }
        ]
    },
    page_features: {
        hero: { title: 'Powerful Features for Modern Investors', subtitle: 'Everything you need to find, track, and close off-market deals.' },
        features: [
            { image: '/images/features/discovery.jpg', title: 'Advanced Lead Discovery', layout: 'left', description: 'Search distressed properties across all 50 states with powerful filters. Filter by location, motive type, equity, and more.' },
            { image: '/images/features/skip-tracing.jpg', title: 'Skip Tracing', layout: 'right', description: 'Get owner contact information including phone numbers, email addresses, and mailing addresses.' },
            { image: '/images/features/analytics.jpg', title: 'Market Analytics', layout: 'left', description: 'Understand market trends, property values, and investment opportunities with real-time analytics.' },
            { image: '/images/features/export.jpg', title: 'Data Export', layout: 'right', description: 'Export your leads to CSV or Excel for use in your CRM or marketing campaigns.' }
        ]
    },
    page_contact: {
        hero: { title: 'Contact', highlight: 'Us', subtitle: 'Get in touch with our team' },
        contactInfo: { email: 'support@99sellers.com', phone: '(555) 123-4567', address: '123 Main St, Austin, TX 78701' },
        sections: [
            { id: 'support', title: 'Customer Support', content: 'Our dedicated support team is available Monday through Friday, 9 AM - 5 PM EST.' },
            { id: 'how-it-works', title: 'How It Works', content: 'Our system aggregates data from thousands of public records and uses proprietary algorithms to identify the most motivated sellers.' }
        ]
    },
    page_privacy: {
        title: 'Privacy Policy',
        lastUpdated: 'January 1, 2025',
        sections: [
            { title: 'Information We Collect', content: 'We collect information you provide directly to us, such as your name, email address, and payment information.' },
            { title: 'How We Use Your Information', content: 'We use the information we collect to provide, maintain, and improve our services.' },
            { title: 'Data Security', content: 'We implement appropriate technical and organizational measures to protect your personal data.' }
        ]
    },
    page_terms: {
        title: 'Terms of Service',
        lastUpdated: 'January 1, 2025',
        sections: [
            { title: 'Acceptance of Terms', content: 'By accessing or using 99Sellers, you agree to be bound by these Terms of Service.' },
            { title: 'Use of Service', content: 'You may use our service only for lawful purposes and in accordance with these Terms.' },
            { title: 'Accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials.' }
        ]
    },
    page_help: {
        title: 'Help Center',
        subtitle: 'How can we help you?',
        heroImage: '/images/help-hero.jpg',
        categories: [
            {
                title: 'Getting Started', icon: 'rocket', articles: [
                    { title: 'How to sign up', content: 'Visit our homepage and click Get Started Free.' },
                    { title: 'Setting up your profile', content: 'Navigate to Dashboard > Profile to complete your setup.' }
                ]
            },
            {
                title: 'Search & Leads', icon: 'search', articles: [
                    { title: 'How to search properties', content: 'Use the search bar or advanced filters to find distressed properties.' },
                    { title: 'Saving leads', content: 'Click the heart icon on any property to save it to your favorites.' }
                ]
            },
            {
                title: 'Billing', icon: 'credit-card', articles: [
                    { title: 'Managing your subscription', content: 'Go to Dashboard > Subscription to manage your plan.' }
                ]
            }
        ]
    },
    page_affiliates: {
        hero: { title: 'Affiliate', highlight: 'Program', subtitle: 'Earn commission by referring real estate professionals to 99Sellers', backgroundImage: '/images/affiliate-hero.jpg' },
        benefits: [
            { title: 'High Commission', description: '30% recurring commission on all referrals', icon: 'dollar-sign' },
            { title: '90-Day Cookie', description: 'Generous tracking window for conversions', icon: 'clock' },
            { title: 'Monthly Payouts', description: 'Reliable monthly payments via PayPal or bank transfer', icon: 'wallet' },
            { title: 'Marketing Materials', description: 'Access banners, landing pages, and email templates', icon: 'palette' }
        ],
        howItWorks: [
            { step: 1, title: 'Sign Up', description: 'Join our affiliate program for free' },
            { step: 2, title: 'Share', description: 'Share your unique referral link' },
            { step: 3, title: 'Earn', description: 'Earn 30% on every subscription' }
        ],
        cta: { title: 'Ready to Start Earning?', buttonText: 'Join Affiliate Program' }
    },
    page_blog: {
        title: 'Blog',
        subtitle: 'Real estate insights, tips, and market analysis',
        featuredImage: '/images/blog/featured.jpg',
        categories: ['Real Estate', 'Investing', 'Market Analysis', 'Tips & Tricks']
    }
};

async function seedContent() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        for (const [key, value] of Object.entries(contentTemplates)) {
            const [record, created] = await SiteContent.findOrCreate({
                where: { key },
                defaults: { value, contentType: 'json' }
            });

            if (!created) {
                // If existing content is double-serialized (string), fix it
                if (typeof record.value === 'string') {
                    console.log(`🔧 Fixing double-serialized content for: ${key}`);
                    try {
                        const parsed = JSON.parse(record.value);
                        await record.update({ value: parsed });
                    } catch (e) {
                        console.log(`  Could not parse, replacing with template`);
                        await record.update({ value });
                    }
                } else {
                    console.log(`✓ Content already exists for: ${key} (keeping existing)`);
                }
            } else {
                console.log(`✨ Created content for: ${key}`);
            }
        }

        console.log('\n✅ Content seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding content:', err);
        process.exit(1);
    }
}

seedContent();
