const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        console.log('=== ALL TABLES IN DATABASE ===\n');
        const [tables] = await conn.query('SHOW TABLES');
        tables.forEach(t => console.log(`  ${Object.values(t)[0]}`));

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
