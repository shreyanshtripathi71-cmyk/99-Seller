const { SiteContent, sequelize } = require('../models');

const pricingContent = {
    hero: {
        title: "Stop Losing Deals to Faster Investors",
        subtitle: "The all-in-one proprietary data platform for serious real estate investors. Go from hunting to closing."
    },
    plans: [
        {
            name: "Starter",
            price: "0",
            period: "forever",
            description: "Perfect for testing the waters.",
            features: ["50 leads per month", "1 county access", "Basic filters", "Email support"],
            buttonText: "Start for Free",
            highlight: false
        },
        {
            name: "Monthly Pro",
            price: "50",
            period: "mo",
            description: "Full access for a single month.",
            features: ["Unlimited leads access", "All 50 states", "Skip Tracing", "Bulk Export"],
            buttonText: "Join Monthly",
            highlight: true
        },
        {
            name: "Quarterly Pro",
            price: "150",
            period: "quarter",
            description: "Go big and save time.",
            features: ["Unlimited leads access", "All 50 states", "Skip Tracing", "Bulk Export"],
            buttonText: "Join Quarterly",
            highlight: false
        }
    ],
    guarantee: {
        title: "100% Satisfaction Guarantee",
        text: "Try 99Sellers risk-free. If you're not finding value within the first 15 days, we'll refund your subscription—no questions asked."
    }
};

async function seedPricing() {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL via Sequelize');

        const [content, created] = await SiteContent.findOrCreate({
            where: { key: 'page_pricing' },
            defaults: {
                key: 'page_pricing',
                type: 'json',
                value: pricingContent,
                contentType: 'json'
            }
        });

        if (!created) {
            console.log('Updating existing pricing content...');
            await content.update({
                value: pricingContent,
                contentType: 'json'
            });
        }

        console.log('Pricing content seeded successfully (Key: page_pricing)!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding pricing content:', error);
        process.exit(1);
    }
}

seedPricing();
