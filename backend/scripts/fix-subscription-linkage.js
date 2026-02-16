const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('=== FIXING SUBSCRIPTION LINKAGE ===\n');

        // Get current subscription IDs
        const [subs] = await conn.query('SELECT subscriptionId, planName, price FROM subscriptions ORDER BY price');
        console.log('Current Subscriptions:');
        subs.forEach(s => console.log(`  ${s.planName}: ID=${s.subscriptionId}, Price=$${s.price}`));

        const premiumSubId = subs.find(s => s.planName === 'premium')?.subscriptionId;
        const enterpriseSubId = subs.find(s => s.planName === 'enterprise')?.subscriptionId;

        console.log('\n=== PREMIUM USERS (premium_users table) ===');
        const [premiumTotal] = await conn.query('SELECT COUNT(*) as count FROM premium_users');
        console.log(`Total Premium Users: ${premiumTotal[0].count}`);

        if (premiumSubId && premiumTotal[0].count > 0) {
            const result = await conn.query('UPDATE premium_users SET subscriptionId = ?', [premiumSubId]);
            console.log(`✓ Updated ${result[0].affectedRows} premium users to subscription ID ${premiumSubId}`);
        } else if (premiumTotal[0].count === 0) {
            console.log('⚠ No premium users found in premium_users table');
        }

        console.log('\n=== ENTERPRISE USERS (enterprise_users table) ===');
        const [enterpriseTotal] = await conn.query('SELECT COUNT(*) as count FROM enterprise_users');
        console.log(`Total Enterprise Users: ${enterpriseTotal[0].count}`);

        if (enterpriseSubId && enterpriseTotal[0].count > 0) {
            const result = await conn.query('UPDATE enterprise_users SET subscriptionId = ?', [enterpriseSubId]);
            console.log(`✓ Updated ${result[0].affectedRows} enterprise users to subscription ID ${enterpriseSubId}`);
        } else if (enterpriseTotal[0].count === 0) {
            console.log('⚠ No enterprise users found in enterprise_users table');
        }

        console.log('\n=== EXPECTED REVENUE ===');
        const premiumRevenue = premiumTotal[0].count * 149;
        const enterpriseRevenue = enterpriseTotal[0].count * 499;
        const totalRevenue = premiumRevenue + enterpriseRevenue;

        console.log(`Premium: ${premiumTotal[0].count} users × $149 = $${premiumRevenue}/mo`);
        console.log(`Enterprise: ${enterpriseTotal[0].count} users × $499 = $${enterpriseRevenue}/mo`);
        console.log(`Total Monthly Revenue: $${totalRevenue}`);
        console.log(`Active Subscriptions: ${premiumTotal[0].count + enterpriseTotal[0].count}`);

        await conn.end();
        console.log('\n✅ Done! Refresh http://localhost:3000/admin/analytics to see updated revenue.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
