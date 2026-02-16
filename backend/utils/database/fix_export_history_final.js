const mysql = require('mysql2/promise');

async function fixExportHistoryConstraintOnceAndForAll() {
    let connection;
    
    try {
        console.log('🔧 Fixing ExportHistory constraint issue permanently...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check if exporthistory table exists and its constraints
        const [tableCheck] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'railway' 
            AND TABLE_NAME = 'exporthistory'
        `);
        
        if (tableCheck.length === 0) {
            console.log('ℹ️ exporthistory table does not exist - no fix needed');
            return;
        }
        
        console.log('📋 exporthistory table found, checking constraints...');
        
        // Get all constraints on exporthistory table
        const [constraints] = await connection.execute(`
            SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
            AND TABLE_NAME = 'exporthistory'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('Current constraints:', constraints);
        
        // Check for duplicate constraint names
        const [duplicateCheck] = await connection.execute(`
            SELECT CONSTRAINT_NAME, COUNT(*) as count
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
            AND CONSTRAINT_NAME = 'ExportHistory_ibfk_1'
            AND REFERENCED_TABLE_NAME IS NOT NULL
            GROUP BY CONSTRAINT_NAME
            HAVING count > 1
        `);
        
        if (duplicateCheck.length > 0) {
            console.log('🚨 Found duplicate ExportHistory_ibfk_1 constraints');
            
            // Get all tables with this constraint
            const [tablesWithDuplicate] = await connection.execute(`
                SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'railway' 
                AND CONSTRAINT_NAME = 'ExportHistory_ibfk_1'
                AND REFERENCED_TABLE_NAME IS NOT NULL
                ORDER BY TABLE_NAME
            `);
            
            console.log('Tables with duplicate constraint:', tablesWithDuplicate);
            
            // Drop duplicates (keep the one on exporthistory table)
            for (const table of tablesWithDuplicate) {
                if (table.TABLE_NAME !== 'exporthistory') {
                    console.log(`🔧 Dropping ExportHistory_ibfk_1 from ${table.TABLE_NAME}`);
                    
                    try {
                        await connection.execute(`
                            ALTER TABLE \`${table.TABLE_NAME}\` 
                            DROP FOREIGN KEY \`ExportHistory_ibfk_1\`
                        `);
                        console.log(`✅ Successfully dropped from ${table.TABLE_NAME}`);
                    } catch (error) {
                        console.log(`❌ Failed to drop from ${table.TABLE_NAME}: ${error.message}`);
                    }
                } else {
                    console.log(`✅ Keeping constraint on exporthistory table`);
                }
            }
        } else {
            console.log('ℹ️ No duplicate ExportHistory_ibfk_1 constraints found');
        }
        
        // Verify the fix
        const [finalCheck] = await connection.execute(`
            SELECT CONSTRAINT_NAME, TABLE_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
            AND CONSTRAINT_NAME = 'ExportHistory_ibfk_1'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('✅ Final constraint check:', finalCheck);
        
        if (finalCheck.length === 1 && finalCheck[0].TABLE_NAME === 'exporthistory') {
            console.log('🎉 ExportHistory constraint issue resolved!');
        } else {
            console.log('⚠️ Constraint issue may still exist');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

fixExportHistoryConstraintOnceAndForAll();
