const mysql = require('mysql2/promise');

async function debugRailwayStartup() {
    let connection;
    
    try {
        console.log('🔍 Debugging Railway startup issues...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check if models can be loaded properly
        console.log('🔍 Testing basic database operations...');
        
        // Test 1: Simple query
        const [testResult] = await connection.execute('SELECT 1 as test');
        console.log('✅ Basic query test passed:', testResult[0]);
        
        // Test 2: Check if admin_activities table exists and works
        try {
            const [count] = await connection.execute('SELECT COUNT(*) as count FROM admin_activities');
            console.log(`✅ admin_activities table accessible: ${count[0].count} records`);
        } catch (error) {
            console.log('❌ admin_activities table issue:', error.message);
        }
        
        // Test 3: Try to insert a simple activity
        try {
            await connection.execute(`
                INSERT INTO admin_activities (type, message, details, createdAt) 
                VALUES ('TEST', 'Debug activity', '{}', NOW())
            `);
            console.log('✅ Activity insertion test passed');
            
            // Clean up
            await connection.execute('DELETE FROM admin_activities WHERE type = "TEST"');
            console.log('✅ Cleanup completed');
        } catch (error) {
            console.log('❌ Activity insertion failed:', error.message);
        }
        
        // Test 4: Check for any problematic constraints
        const [constraints] = await connection.execute(`
            SELECT TABLE_NAME, CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = 'railway' 
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            ORDER BY TABLE_NAME, CONSTRAINT_NAME
        `);
        
        console.log(`📋 Found ${constraints.length} foreign key constraints`);
        
        // Test 5: Check table engines
        const [tableEngines] = await connection.execute(`
            SELECT TABLE_NAME, ENGINE
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'railway'
            ORDER BY TABLE_NAME
        `);
        
        console.log('📋 Table engines:');
        tableEngines.forEach(table => {
            console.log(`  ${table.TABLE_NAME}: ${table.ENGINE}`);
        });
        
        console.log('🎉 Railway database debugging completed');
        
    } catch (error) {
        console.error('❌ Debug error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

debugRailwayStartup();
