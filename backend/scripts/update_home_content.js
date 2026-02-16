const { SiteContent, sequelize } = require('../models');

const homeContent = {
    quote1: {
        text: "The best deals aren't found. They're created with better data."
    },
    benefit1: {
        title: "Close Deals From Your Couch",
        subtitle: "REMOTE WHOLESALING",
        description: "Forget driving for dollars. Access thousands of motivated seller leads—pre-foreclosures, divorce, tax liens—instantly. Pick up the phone, make the offer, and assign the contract without leaving your home office.",
        features: [
            "Direct-to-Seller Contact Info (Mobile & Email)",
            "Daily Updates from County Records",
            "Skip-Trace with 98% Accuracy"
        ],
        ctaText: "Start Finding Deals",
        imageAlt: "Reach clients remotely"
    },
    benefit2: {
        title: "Automate Your Empire",
        subtitle: "SYSTEMS & SPEED",
        description: "Stop wasting time on bad data. Our AI-driven filters help you identify the 1% of properties with actual equity and seller motivation. Be the first to call, not the last.",
        features: [
            "Save Custom Search Criteria",
            "Get Instant Notifications on New Leads",
            "Export to CSV/CRM in One Click"
        ],
        ctaText: "Automate Now",
        imageAlt: "Save time with 99Sellers"
    },
    dealShowcase: {
        title: "Real Deals. Real Profit.",
        deals: [
            { title: "Austin Fix & Flip", profit: "$45,000", badge: "Flip", time: "30 Days", img: "/images/home/property-austin.png" },
            { title: "Phoenix Wholesale", profit: "$12,500", badge: "Wholesale", time: "4 Hours", img: "/images/home/property-phoenix.png" },
            { title: "Denver BRRRR", profit: "$350/mo", badge: "Rental", time: "Infinite", img: "/images/home/property-denver.png" }
        ]
    },
    benefit3: {
        title: "Data That Dominates",
        subtitle: "MARKET INTELLIGENCE",
        description: "Spot trends before the competition. Our dashboard visualizes market heat, inventory levels, and price corrections so you can move with confidence.",
        features: [
            "Live Market Heatmaps",
            "Comparable Sales Reports (Comps)",
            "Investment Calculator"
        ],
        ctaText: "Explore Data",
        imageAlt: "Maximize your profit"
    },
    quote2: {
        text: "99Sellers is the unfair advantage I was looking for.",
        author: "— Join 10,000+ Investors, Wholesalers, and Agents"
    },
    howItWorks: {
        title: "From Lead to Closing",
        subtitle: "3 SIMPLE STEPS",
        description: "We built this for speed. No complex onboarding. Just sign up, search, and start calling sellers today.",
        features: [
            "1. Define Your Buy Box (Location, Equity, Distress)",
            "2. Unlock Seller Contact Info Instantly",
            "3. Close The Deal"
        ],
        ctaText: "Start Your Free Trial",
        imageAlt: "How 99Sellers works"
    }
};

async function seedHome() {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL via Sequelize');

        const [content, created] = await SiteContent.findOrCreate({
            where: { key: 'page_home' },
            defaults: {
                key: 'page_home',
                type: 'json',
                value: homeContent,
                contentType: 'json'
            }
        });

        if (!created) {
            console.log('Updating existing home content...');
            await content.update({
                value: homeContent,
                contentType: 'json'
            });
        }

        console.log('Home content seeded successfully (Key: page_home)!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding home content:', error);
        process.exit(1);
    }
}

seedHome();
