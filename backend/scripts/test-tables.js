const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        // Show all tables
        const [tables] = await conn.query('SHOW TABLES');
        console.log('All tables in database:');
        console.log(tables);

        await conn.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
