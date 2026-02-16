const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('CREATING SAMPLE USERS\n');

        // Get subscription IDs
        const [subs] = await conn.query('SELECT subscriptionId, planName FROM subscriptions');
        const premiumSubId = subs.find(s => s.planName === 'premium')?.subscriptionId;
        const enterpriseSubId = subs.find(s => s.planName === 'enterprise')?.subscriptionId;

        console.log(`Premium Sub ID: ${premiumSubId}, Enterprise Sub ID: ${enterpriseSubId}\n`);

        // First, check if user_login table exists and has users
        try {
            const [users] = await conn.query('SELECT Username FROM user_login LIMIT 3');
            console.log(`Found ${users.length} users in user_login table`);
            if (users.length > 0) {
                console.log('Sample usernames:', users.map(u => u.Username).join(', '));
            }
        } catch (err) {
            console.log('ERROR checking user_login:', err.message);
        }

        // Try to create one premium user
        console.log('\nAttempting to create premium user...');
        try {
            await conn.query(`
                INSERT INTO premium_users 
                (Username, subscriptionId, subscriptionStart, subscriptionEnd, paymentStatus, autoRenew, createdAt, updatedAt)
                VALUES ('test_premium_1', ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'paid', 1, NOW(), NOW())
            `, [premiumSubId]);
            console.log('SUCCESS: Created test_premium_1');
        } catch (err) {
            console.log('ERROR:', err.message);
            console.log('Code:', err.code);
        }

        // Try to create one enterprise user
        console.log('\nAttempting to create enterprise user...');
        try {
            await conn.query(`
                INSERT INTO enterprise_users 
                (Username, subscriptionId, companyName, subscriptionStart, subscriptionEnd, paymentStatus, autoRenew, maxUsers, currentUsers, apiAccess, dedicatedSupport, createdAt, updatedAt)
                VALUES ('test_enterprise_1', ?, 'Test Company', NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'paid', 1, 10, 1, 1, 1, NOW(), NOW())
            `, [enterpriseSubId]);
            console.log('SUCCESS: Created test_enterprise_1');
        } catch (err) {
            console.log('ERROR:', err.message);
            console.log('Code:', err.code);
        }

        // Check counts
        const [pCount] = await conn.query('SELECT COUNT(*) as count FROM premium_users');
        const [eCount] = await conn.query('SELECT COUNT(*) as count FROM enterprise_users');

        console.log(`\nFinal counts:`);
        console.log(`Premium: ${pCount[0].count}, Enterprise: ${eCount[0].count}`);
        console.log(`Expected Revenue: $${(pCount[0].count * 149) + (eCount[0].count * 499)}`);

        await conn.end();
    } catch (error) {
        console.error('FATAL ERROR:', error.message);
    }
})();
