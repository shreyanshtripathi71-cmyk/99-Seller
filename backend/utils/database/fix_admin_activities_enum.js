const mysql = require('mysql2/promise');

async function fixAdminActivitiesEnum() {
    let connection;
    
    try {
        console.log('🔧 Fixing admin_activities ENUM issue...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check current structure
        const [structure] = await connection.execute('DESCRIBE admin_activities');
        const typeColumn = structure.find(col => col.Field === 'type');
        
        console.log('Current type column:', typeColumn);
        
        if (typeColumn.Type.includes('enum')) {
            console.log('🔧 Converting ENUM to VARCHAR...');
            
            // Convert ENUM to VARCHAR
            await connection.execute(`
                ALTER TABLE admin_activities 
                MODIFY COLUMN type VARCHAR(50) NOT NULL
            `);
            
            console.log('✅ Successfully converted to VARCHAR');
        } else {
            console.log('ℹ️ Type column is already VARCHAR');
        }
        
        // Verify the fix
        const [newStructure] = await connection.execute('DESCRIBE admin_activities');
        const newTypeColumn = newStructure.find(col => col.Field === 'type');
        console.log('Updated type column:', newTypeColumn);
        
        // Test insertion
        try {
            await connection.execute(`
                INSERT INTO admin_activities (type, message, details, createdAt) 
                VALUES ('OWNER_CREATE', 'Test activity after fix', '{}', NOW())
            `);
            console.log('✅ Test insertion successful');
            
            // Clean up
            await connection.execute('DELETE FROM admin_activities WHERE message = "Test activity after fix"');
            console.log('✅ Cleanup completed');
        } catch (error) {
            console.log('❌ Test insertion failed:', error.message);
        }
        
        console.log('🎉 admin_activities ENUM fix completed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

fixAdminActivitiesEnum();
