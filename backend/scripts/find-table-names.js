const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('=== FINDING CORRECT TABLE NAMES ===\n');

        const [tables] = await conn.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);

        console.log('All tables:');
        tableNames.forEach(t => console.log(`  ${t}`));

        // Find premium and enterprise tables
        const premiumTable = tableNames.find(t => t.toLowerCase().includes('premium'));
        const enterpriseTable = tableNames.find(t => t.toLowerCase().includes('enterprise'));

        console.log(`\nPremium table found: ${premiumTable}`);
        console.log(`Enterprise table found: ${enterpriseTable}`);

        if (premiumTable) {
            const [count] = await conn.query(`SELECT COUNT(*) as count FROM \`${premiumTable}\``);
            console.log(`  Records in ${premiumTable}: ${count[0].count}`);
        }

        if (enterpriseTable) {
            const [count] = await conn.query(`SELECT COUNT(*) as count FROM \`${enterpriseTable}\``);
            console.log(`  Records in ${enterpriseTable}: ${count[0].count}`);
        }

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
