const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('=== CHECKING TABLE STRUCTURES ===\n');

        const [premiumCols] = await conn.query('DESCRIBE premium_users');
        console.log('Premium Users Columns:');
        premiumCols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

        console.log('\n');
        const [enterpriseCols] = await conn.query('DESCRIBE enterprise_users');
        console.log('Enterprise Users Columns:');
        enterpriseCols.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
