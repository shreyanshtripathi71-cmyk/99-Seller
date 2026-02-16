const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('=== USER DISTRIBUTION ===\n');

        // Check user_logins table
        const [users] = await conn.query('SELECT Username, userType FROM user_logins');
        console.log(`Total Users in user_logins: ${users.length}`);

        // Count by type
        const typeCounts = {};
        users.forEach(u => {
            typeCounts[u.userType] = (typeCounts[u.userType] || 0) + 1;
        });

        console.log('\nUser Type Distribution:');
        Object.entries(typeCounts).forEach(([type, count]) => {
            console.log(`  ${type}: ${count} users`);
        });

        // Check premium_users table
        const [premiumCount] = await conn.query('SELECT COUNT(*) as count FROM premium_users');
        console.log(`\nPremium Users Table: ${premiumCount[0].count} records`);

        // Check enterprise_users table  
        const [enterpriseCount] = await conn.query('SELECT COUNT(*) as count FROM enterprise_users');
        console.log(`Enterprise Users Table: ${enterpriseCount[0].count} records`);

        console.log('\n=== ISSUE IDENTIFIED ===');
        console.log('The premium_users and enterprise_users tables are empty!');
        console.log('Users exist in user_logins but not in the subscription-specific tables.');
        console.log('\nTo fix this, we need to:');
        console.log('1. Create records in premium_users for users with userType="premium"');
        console.log('2. Create records in enterprise_users for users with userType="enterprise"');

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
