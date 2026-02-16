const mysql = require('mysql2/promise');

async function fixLocalAdminActivitiesTable() {
    let connection;
    
    try {
        console.log('🔧 Fixing local admin_activities table schema...');
        
        // Connect to local database
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'Nyasha@2004',
            database: '99sellers'
        });
        
        console.log('✓ Connected to local database');
        
        // Fix the type column - change from ENUM to VARCHAR
        await connection.execute(`
            ALTER TABLE admin_activities 
            MODIFY COLUMN type VARCHAR(50) NOT NULL
        `);
        
        console.log('✓ Fixed local admin_activities.type column size');
        
        // Verify the fix
        const [structure] = await connection.execute('DESCRIBE admin_activities');
        console.log('Updated structure:', structure);
        
        console.log('✅ Local admin_activities table fixed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

fixLocalAdminActivitiesTable();
