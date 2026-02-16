const mysql = require('mysql2/promise');

async function checkAndFixExportHistoryConstraint() {
    let connection;
    
    try {
        console.log('🔧 Checking ExportHistory constraint specifically...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check ExportHistory table constraints specifically
        const [exportConstraints] = await connection.execute(`
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM 
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE 
                TABLE_SCHEMA = 'railway' 
                AND TABLE_NAME = 'ExportHistory'
                AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('📋 ExportHistory constraints:', exportConstraints);
        
        // Check if there are any duplicates specifically for ExportHistory
        if (exportConstraints.length > 1) {
            console.log('🔧 Found multiple constraints on ExportHistory table');
            
            // Drop all but the first one
            for (let i = 1; i < exportConstraints.length; i++) {
                const constraint = exportConstraints[i];
                console.log(`Dropping constraint: ${constraint.CONSTRAINT_NAME}`);
                
                try {
                    await connection.execute(`
                        ALTER TABLE \`ExportHistory\` 
                        DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\`
                    `);
                    console.log(`✅ Dropped ${constraint.CONSTRAINT_NAME}`);
                } catch (error) {
                    console.log(`❌ Failed to drop ${constraint.CONSTRAINT_NAME}: ${error.message}`);
                }
            }
        }
        
        // Check table structure
        const [structure] = await connection.execute('DESCRIBE ExportHistory');
        console.log('📋 ExportHistory table structure:', structure);
        
        console.log('✅ ExportHistory constraint check completed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

checkAndFixExportHistoryConstraint();
