const mysql = require('mysql2/promise');
const fs = require('fs');

async function importDatabase() {
    let connection;
    try {
        console.log('Connecting to Railway database...');
        
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway',
            multipleStatements: true
        });
        
        console.log('✓ Connected successfully!');
        
        // Read the SQL dump file
        const sqlDump = fs.readFileSync('database_dump_20260215_194625.sql', 'utf8');
        
        console.log('Executing SQL dump...');
        
        // Split the dump into individual statements and execute them
        const statements = sqlDump.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement && !statement.startsWith('--') && !statement.startsWith('/*')) {
                try {
                    await connection.execute(statement);
                    if (i % 10 === 0) {
                        console.log(`Progress: ${i}/${statements.length} statements executed`);
                    }
                } catch (err) {
                    console.log(`Warning: Statement ${i} failed: ${err.message}`);
                }
            }
        }
        
        console.log('✓ Database import completed!');
        
        // Verify the import
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM user_login');
        const [propertyCount] = await connection.execute('SELECT COUNT(*) as count FROM property');
        const [auctionCount] = await connection.execute('SELECT COUNT(*) as count FROM auction');
        
        console.log('Verification:');
        console.log(`- Users: ${userCount[0].count}`);
        console.log(`- Properties: ${propertyCount[0].count}`);
        console.log(`- Auctions: ${auctionCount[0].count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

importDatabase();
