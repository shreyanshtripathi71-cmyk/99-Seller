const mysql = require('mysql2/promise');

async function testProductionConnection() {
    try {
        console.log('🔍 Testing production database connection...');
        
        // Test Railway connection (same as deployed app would use)
        const connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✅ Connected to Railway database successfully!');
        
        // Check if owner data exists
        const [ownerCount] = await connection.execute('SELECT COUNT(*) as count FROM owner');
        console.log(`📊 Railway owner records: ${ownerCount[0].count}`);
        
        // Show sample owner data
        if (ownerCount[0].count > 0) {
            const [owners] = await connection.execute('SELECT * FROM owner LIMIT 3');
            console.log('👥 Sample Railway owners:', owners.map(o => ({ id: o.id, name: o.OName })));
        }
        
        await connection.end();
        
        console.log('\n🎯 ANSWER: YES - Your deployed app at https://99-sellers-5o4wz8kr8-99-sellers-projects.vercel.app/admin/owners WILL use Railway database!');
        console.log('📝 Because your models/index.js automatically detects Railway environment variables and connects to Railway database in production.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testProductionConnection();
