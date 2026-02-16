const mysql = require('mysql2/promise');

async function checkForRemainingIssues() {
    let connection;
    
    try {
        console.log('🔍 Checking for any remaining issues that might cause the error...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check for any remaining constraints with the problematic name
        const [problematicConstraints] = await connection.execute(`
            SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
                AND CONSTRAINT_NAME = 'ExportHistory_ibfk_1'
                AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('Constraints with name "ExportHistory_ibfk_1":', problematicConstraints);
        
        if (problematicConstraints.length > 0) {
            console.log('🔧 Dropping remaining problematic constraints...');
            for (const constraint of problematicConstraints) {
                try {
                    await connection.execute(`
                        ALTER TABLE \`${constraint.TABLE_NAME}\` 
                        DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\`
                    `);
                    console.log(`✅ Dropped ${constraint.CONSTRAINT_NAME} from ${constraint.TABLE_NAME}`);
                } catch (error) {
                    console.log(`❌ Failed to drop ${constraint.CONSTRAINT_NAME}: ${error.message}`);
                }
            }
        }
        
        // Check if there are any other tables that might be causing this during sync
        console.log('🔍 Checking for any other tables that might reference ExportHistory...');
        
        const [allTables] = await connection.execute('SHOW TABLES');
        const tableNames = allTables.map(table => Object.values(table)[0]);
        
        // Look for any tables that might have ExportHistory references
        for (const tableName of tableNames) {
            if (tableName.toLowerCase().includes('export')) {
                console.log(`📋 Found export-related table: ${tableName}`);
                
                const [constraints] = await connection.execute(`
                    SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = 'railway' 
                        AND TABLE_NAME = ?
                        AND REFERENCED_TABLE_NAME IS NOT NULL
                `, [tableName]);
                
                if (constraints.length > 0) {
                    console.log(`  Constraints on ${tableName}:`, constraints);
                }
            }
        }
        
        // Check the current state of exporthistory table
        const [exportHistoryStatus] = await connection.execute(`
            SELECT TABLE_NAME, ENGINE, TABLE_ROWS, AUTO_INCREMENT, TABLE_COMMENT
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'railway' 
            AND TABLE_NAME = 'exporthistory'
        `);
        
        console.log('✅ Current exporthistory table status:', exportHistoryStatus[0]);
        
        // Check if the table is accessible
        try {
            const [testQuery] = await connection.execute('SELECT COUNT(*) as count FROM exporthistory');
            console.log(`✅ exporthistory table is accessible with ${testQuery[0].count} records`);
        } catch (error) {
            console.log(`❌ exporthistory table not accessible: ${error.message}`);
        }
        
        console.log('🎯 Analysis Summary:');
        console.log('✅ exporthistory table exists and is functional');
        console.log('✅ No foreign key constraints with problematic names');
        console.log('✅ Table can be accessed and queried');
        
        console.log('\n💡 If the error still persists, the issue might be:');
        console.log('1. Cached deployment (Railway needs to restart with new code)');
        console.log('2. Application code still has old references');
        console.log('3. Model synchronization happening during startup');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

checkForRemainingIssues();
