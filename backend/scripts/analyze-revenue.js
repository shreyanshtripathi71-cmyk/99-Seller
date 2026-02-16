const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('=== DETAILED USER & SUBSCRIPTION ANALYSIS ===\n');

        // Check subscriptions
        const [subs] = await conn.query('SELECT * FROM subscriptions ORDER BY price');
        console.log('SUBSCRIPTIONS TABLE:');
        subs.forEach(s => {
            console.log(`  ID ${s.subscriptionId}: ${s.planName} - $${s.price}/${s.duration}`);
        });

        // Check premium users with JOIN
        console.log('\n=== PREMIUM USERS ===');
        const [premiumUsers] = await conn.query(`
            SELECT p.Username, p.subscriptionId, s.planName, s.price, s.status
            FROM premium_users p
            LEFT JOIN subscriptions s ON p.subscriptionId = s.subscriptionId
        `);
        console.log(`Total: ${premiumUsers.length} users`);
        if (premiumUsers.length > 0) {
            premiumUsers.forEach(u => {
                console.log(`  ${u.Username}: SubID=${u.subscriptionId}, Plan=${u.planName}, Price=$${u.price}, Status=${u.status}`);
            });
        }

        // Check enterprise users with JOIN
        console.log('\n=== ENTERPRISE USERS ===');
        const [enterpriseUsers] = await conn.query(`
            SELECT e.Username, e.subscriptionId, s.planName, s.price, s.status
            FROM enterprise_users e
            LEFT JOIN subscriptions s ON e.subscriptionId = s.subscriptionId
        `);
        console.log(`Total: ${enterpriseUsers.length} users`);
        if (enterpriseUsers.length > 0) {
            enterpriseUsers.forEach(u => {
                console.log(`  ${u.Username}: SubID=${u.subscriptionId}, Plan=${u.planName}, Price=$${u.price}, Status=${u.status}`);
            });
        }

        // Calculate expected revenue
        console.log('\n=== REVENUE CALCULATION ===');
        const activePremium = premiumUsers.filter(u => u.status === 'active');
        const activeEnterprise = enterpriseUsers.filter(u => u.status === 'active');

        const premiumRevenue = activePremium.reduce((sum, u) => sum + parseFloat(u.price || 0), 0);
        const enterpriseRevenue = activeEnterprise.reduce((sum, u) => sum + parseFloat(u.price || 0), 0);

        console.log(`Active Premium Users: ${activePremium.length}`);
        console.log(`Active Enterprise Users: ${activeEnterprise.length}`);
        console.log(`Premium Revenue: $${premiumRevenue}/mo`);
        console.log(`Enterprise Revenue: $${enterpriseRevenue}/mo`);
        console.log(`Total Monthly Revenue: $${premiumRevenue + enterpriseRevenue}`);

        await conn.end();

        if (premiumUsers.length === 0 && enterpriseUsers.length === 0) {
            console.log('\n⚠️  NO USERS FOUND!');
            console.log('The premium_users and enterprise_users tables are empty.');
            console.log('This is why revenue shows $0.');
            console.log('\nTo fix: You need to create premium or enterprise user records in the database.');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
