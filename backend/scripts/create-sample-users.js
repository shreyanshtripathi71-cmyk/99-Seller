const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('=== CREATING SAMPLE USERS FOR TESTING ===\n');

        // Get subscription IDs
        const [subs] = await conn.query('SELECT subscriptionId, planName FROM subscriptions');
        const premiumSubId = subs.find(s => s.planName === 'premium')?.subscriptionId;
        const enterpriseSubId = subs.find(s => s.planName === 'enterprise')?.subscriptionId;

        console.log(`Premium Subscription ID: ${premiumSubId}`);
        console.log(`Enterprise Subscription ID: ${enterpriseSubId}\n`);

        // Create sample premium users
        console.log('Creating Premium Users...');
        const premiumUsers = [
            { username: 'premium_user_1', subscriptionId: premiumSubId },
            { username: 'premium_user_2', subscriptionId: premiumSubId },
            { username: 'premium_user_3', subscriptionId: premiumSubId }
        ];

        for (const user of premiumUsers) {
            try {
                await conn.query(`
                    INSERT INTO premium_users 
                    (Username, subscriptionId, subscriptionStart, subscriptionEnd, paymentStatus, autoRenew, createdAt, updatedAt)
                    VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'paid', 1, NOW(), NOW())
                `, [user.username, user.subscriptionId]);
                console.log(`  ✓ Created ${user.username}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`  ⚠ ${user.username} already exists`);
                } else {
                    console.log(`  ✗ Error creating ${user.username}: ${err.message}`);
                }
            }
        }

        // Create sample enterprise users
        console.log('\nCreating Enterprise Users...');
        const enterpriseUsers = [
            { username: 'enterprise_user_1', company: 'Tech Corp', subscriptionId: enterpriseSubId },
            { username: 'enterprise_user_2', company: 'Real Estate Inc', subscriptionId: enterpriseSubId }
        ];

        for (const user of enterpriseUsers) {
            try {
                await conn.query(`
                    INSERT INTO enterprise_users 
                    (Username, subscriptionId, companyName, subscriptionStart, subscriptionEnd, paymentStatus, autoRenew, maxUsers, currentUsers, apiAccess, dedicatedSupport, createdAt, updatedAt)
                    VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'paid', 1, 10, 1, 1, 1, NOW(), NOW())
                `, [user.username, user.subscriptionId, user.company]);
                console.log(`  ✓ Created ${user.username} (${user.company})`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log(`  ⚠ ${user.username} already exists`);
                } else {
                    console.log(`  ✗ Error creating ${user.username}: ${err.message}`);
                }
            }
        }

        // Calculate expected revenue
        console.log('\n=== EXPECTED REVENUE ===');
        const [premiumCount] = await conn.query('SELECT COUNT(*) as count FROM premium_users');
        const [enterpriseCount] = await conn.query('SELECT COUNT(*) as count FROM enterprise_users');

        const premiumRevenue = premiumCount[0].count * 149;
        const enterpriseRevenue = enterpriseCount[0].count * 499;
        const totalRevenue = premiumRevenue + enterpriseRevenue;

        console.log(`Premium Users: ${premiumCount[0].count} × $149 = $${premiumRevenue}/mo`);
        console.log(`Enterprise Users: ${enterpriseCount[0].count} × $499 = $${enterpriseRevenue}/mo`);
        console.log(`Total Monthly Revenue: $${totalRevenue}`);
        console.log(`Active Subscriptions: ${premiumCount[0].count + enterpriseCount[0].count}`);

        await conn.end();
        console.log('\n✅ Sample users created! Refresh analytics to see revenue.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
