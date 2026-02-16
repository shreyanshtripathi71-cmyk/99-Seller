const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('=== SUBSCRIPTIONS TABLE ===');
        const [subs] = await conn.query('SELECT * FROM subscriptions');
        console.log(JSON.stringify(subs, null, 2));

        console.log('\n=== PREMIUM USERS ===');
        const [premium] = await conn.query('SELECT userId, subscriptionId, subscriptionStart, subscriptionEnd FROM premium_users LIMIT 5');
        console.log(JSON.stringify(premium, null, 2));

        await conn.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
