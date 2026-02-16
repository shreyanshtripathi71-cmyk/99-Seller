const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function askPassword() {
    return new Promise((resolve) => {
        rl.question('Enter your MySQL root password: ', (password) => {
            rl.close();
            resolve(password);
        });
    });
}

async function fixSiteContents() {
    let localConnection, railwayConnection;
    
    try {
        console.log('🔧 Fixing site_contents table...\n');
        
        // Get password from user
        const password = await askPassword();
        
        console.log('Connecting to databases...');
        
        // Connect to local database
        localConnection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: password,
            database: '99sellers'
        });
        
        // Connect to Railway database
        railwayConnection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to both databases!');
        
        // Check table structure
        const [structure] = await localConnection.execute('DESCRIBE site_contents');
        console.log('Table structure:', structure);
        
        // Get data from local table
        const [rows] = await localConnection.execute('SELECT * FROM site_contents');
        
        if (rows.length > 0) {
            console.log(`Found ${rows.length} records in local site_contents`);
            
            // Get column names
            const columns = Object.keys(rows[0]);
            console.log('Columns:', columns);
            
            // Clear existing data in Railway table
            await railwayConnection.execute('DELETE FROM site_contents');
            
            // Insert data with proper column handling (key is a reserved word)
            for (const row of rows) {
                const values = columns.map(col => row[col]);
                const columnList = columns.map(col => col === 'key' ? '`key`' : `\`${col}\``).join(', ');
                const placeholders = columns.map(() => '?').join(', ');
                
                await railwayConnection.execute(
                    `INSERT INTO site_contents (${columnList}) VALUES (${placeholders})`,
                    values
                );
            }
            
            console.log(`✅ Successfully migrated ${rows.length} records to site_contents`);
        }
        
        // Final verification
        const [localCount] = await localConnection.execute('SELECT COUNT(*) as count FROM site_contents');
        const [railwayCount] = await railwayConnection.execute('SELECT COUNT(*) as count FROM site_contents');
        
        console.log('\n🔍 Final verification:');
        console.log(`📊 Local site_contents: ${localCount[0].count} records`);
        console.log(`📊 Railway site_contents: ${railwayCount[0].count} records`);
        
        if (localCount[0].count === railwayCount[0].count) {
            console.log('🎊 PERFECT! site_contents table fully migrated!');
        } else {
            console.log('⚠️  Still some records missing');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (localConnection) {
            await localConnection.end();
        }
        if (railwayConnection) {
            await railwayConnection.end();
        }
    }
}

fixSiteContents();
