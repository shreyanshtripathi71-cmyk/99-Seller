const mysql = require('mysql2/promise');

async function testRailwayConnection() {
    try {
        console.log('Connecting to Railway database...');
        
        const connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected successfully!');
        
        // Show databases
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('Databases:', databases);
        
        // Show tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables:', tables);
        
        await connection.end();
        console.log('✓ Connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testRailwayConnection();
