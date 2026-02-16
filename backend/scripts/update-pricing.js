const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('Updating subscription pricing to match user types...\n');

        // Delete existing subscriptions
        await conn.query('DELETE FROM subscriptions');
        console.log('✓ Cleared old subscription data');

        // Insert correct subscription plans matching user types
        const subscriptions = [
            {
                planName: 'free',
                price: 0.00,
                duration: 'monthly',
                description: 'Perfect for getting started with basic property search.',
                features: JSON.stringify(['10 Property Views/mo', 'Basic Search', 'Community Support', 'Weekly Updates']),
                status: 'active',
                popular: false
            },
            {
                planName: 'premium',
                price: 149.00,
                duration: 'monthly',
                description: 'For active investors who need more data and reach.',
                features: JSON.stringify(['500 Lead Exports/mo', 'Advanced AI Filters', 'Priority Support', 'Skip Tracing Access']),
                status: 'active',
                popular: true
            },
            {
                planName: 'enterprise',
                price: 499.00,
                duration: 'monthly',
                description: 'Full-scale data solutions for large teams and offices.',
                features: JSON.stringify(['Unlimited Exports', 'Custom API Access', 'Dedicated Manager', 'White-label Reports']),
                status: 'active',
                popular: false
            }
        ];

        for (const sub of subscriptions) {
            await conn.query(
                'INSERT INTO subscriptions (planName, price, duration, description, features, status, popular, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [sub.planName, sub.price, sub.duration, sub.description, sub.features, sub.status, sub.popular]
            );
            console.log(`✓ Created ${sub.planName} plan: $${sub.price}/mo`);
        }

        console.log('\n=== UPDATED SUBSCRIPTIONS ===');
        const [updated] = await conn.query('SELECT subscriptionId, planName, price, duration, popular FROM subscriptions ORDER BY price');
        console.log(JSON.stringify(updated, null, 2));

        await conn.end();
        console.log('\n✅ Database updated successfully!');
        console.log('\nRevenue Calculation:');
        console.log('  - Free users: $0/mo each');
        console.log('  - Premium users: $149/mo each');
        console.log('  - Enterprise users: $499/mo each');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
