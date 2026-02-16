const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });

        const [rows] = await conn.query('SELECT * FROM site_contents WHERE `key`=?', ['hero_images']);
        console.log('Hero Images Data:');
        if (rows.length === 0) {
            console.log('No hero_images found in database');
        } else {
            console.log(JSON.stringify(rows, null, 2));
        }

        await conn.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
