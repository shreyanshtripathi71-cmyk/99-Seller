const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('=== LINKING USER_LOGIN TO SUBSCRIPTION TABLES ===\n');

        // Get subscription IDs
        const [subs] = await conn.query('SELECT subscriptionId, planName, price FROM subscriptions ORDER BY price');
        const premiumSubId = subs.find(s => s.planName === 'premium')?.subscriptionId;
        const enterpriseSubId = subs.find(s => s.planName === 'enterprise')?.subscriptionId;

        console.log('Subscription IDs:');
        console.log(`  Premium: ${premiumSubId} ($149/mo)`);
        console.log(`  Enterprise: ${enterpriseSubId} ($499/mo)\n`);

        // Find premium users in user_login
        console.log('=== PREMIUM USERS ===');
        const [premiumLogins] = await conn.query(`
            SELECT Username FROM user_login 
            WHERE userType = 'premium'
        `);
        console.log(`Found ${premiumLogins.length} premium users in user_login`);

        let premiumCreated = 0;
        for (const user of premiumLogins) {
            try {
                await conn.query(`
                    INSERT INTO premium_users 
                    (Username, subscriptionId, subscriptionStart, subscriptionEnd, paymentStatus, autoRenew, createdAt, updatedAt)
                    VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'paid', 1, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE subscriptionId = ?
                `, [user.Username, premiumSubId, premiumSubId]);
                premiumCreated++;
                console.log(`  ✓ Linked ${user.Username}`);
            } catch (err) {
                console.log(`  ✗ Error linking ${user.Username}: ${err.message}`);
            }
        }

        // Find enterprise users in user_login
        console.log('\n=== ENTERPRISE USERS ===');
        const [enterpriseLogins] = await conn.query(`
            SELECT Username FROM user_login 
            WHERE userType = 'enterprise'
        `);
        console.log(`Found ${enterpriseLogins.length} enterprise users in user_login`);

        let enterpriseCreated = 0;
        for (const user of enterpriseLogins) {
            try {
                await conn.query(`
                    INSERT INTO enterprise_users 
                    (Username, subscriptionId, companyName, subscriptionStart, subscriptionEnd, paymentStatus, autoRenew, maxUsers, currentUsers, apiAccess, dedicatedSupport, createdAt, updatedAt)
                    VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'paid', 1, 10, 1, 1, 1, NOW(), NOW())
                    ON DUPLICATE KEY UPDATE subscriptionId = ?
                `, [user.Username, enterpriseSubId, `${user.Username} Company`, enterpriseSubId]);
                enterpriseCreated++;
                console.log(`  ✓ Linked ${user.Username}`);
            } catch (err) {
                console.log(`  ✗ Error linking ${user.Username}: ${err.message}`);
            }
        }

        // Calculate revenue
        console.log('\n=== REVENUE CALCULATION ===');
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
        console.log('\n✅ Done! Refresh http://localhost:3000/admin/analytics to see revenue.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
