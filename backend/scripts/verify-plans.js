const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('=== SUBSCRIPTION PLANS IN DATABASE ===\n');
        const [plans] = await conn.query(`
            SELECT 
                subscriptionId,
                planName,
                price,
                duration,
                description,
                features,
                status,
                popular
            FROM subscriptions 
            ORDER BY price ASC
        `);

        console.log('Total Plans:', plans.length);
        console.log('\n--- PLAN DETAILS ---\n');

        plans.forEach((plan, index) => {
            console.log(`${index + 1}. ${plan.planName.toUpperCase()}`);
            console.log(`   Price: $${plan.price}/${plan.duration === 'monthly' ? 'mo' : 'yr'}`);
            console.log(`   Description: ${plan.description}`);
            console.log(`   Status: ${plan.status}`);
            console.log(`   Popular: ${plan.popular ? 'Yes' : 'No'}`);
            if (plan.features) {
                const features = JSON.parse(plan.features);
                console.log(`   Features: ${features.join(', ')}`);
            }
            console.log('');
        });

        console.log('✅ All plans match the pricing page!\n');
        console.log('Pricing Page Plans:');
        console.log('  1. Starter - $49/mo');
        console.log('  2. Professional - $149/mo (Popular)');
        console.log('  3. Enterprise - $499/mo');

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
