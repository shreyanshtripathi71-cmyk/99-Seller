const mysql = require('mysql2/promise');

async function fixAdminActivitiesTable() {
    let connection;
    
    try {
        console.log('🔧 Fixing admin_activities table schema...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check current table structure
        const [structure] = await connection.execute('DESCRIBE admin_activities');
        console.log('Current structure:', structure);
        
        // Fix the type column - increase its size
        await connection.execute(`
            ALTER TABLE admin_activities 
            MODIFY COLUMN type VARCHAR(50) NOT NULL
        `);
        
        console.log('✓ Fixed admin_activities.type column size');
        
        // Verify the fix
        const [newStructure] = await connection.execute('DESCRIBE admin_activities');
        console.log('Updated structure:', newStructure);
        
        // Test insert to verify it works
        await connection.execute(`
            INSERT INTO admin_activities (type, message, details, createdAt) 
            VALUES ('OWNER_CREATE', 'Test activity', '{}', NOW())
        `);
        
        console.log('✅ Test insert successful - table is fixed!');
        
        // Clean up test data
        await connection.execute('DELETE FROM admin_activities WHERE message = "Test activity"');
        console.log('✓ Cleaned up test data');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

fixAdminActivitiesTable();
