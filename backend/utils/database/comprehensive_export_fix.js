const mysql = require('mysql2/promise');

async function comprehensiveExportHistoryFix() {
    let connection;
    
    try {
        console.log('🔧 Comprehensive ExportHistory fix - addressing all possible sources...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Step 1: Check current state
        const [currentTables] = await connection.execute('SHOW TABLES LIKE "%export%"');
        console.log('Current export-related tables:', currentTables);
        
        // Step 2: Drop ALL export-related tables and constraints
        console.log('🔧 Step 1: Dropping all export-related tables...');
        
        const tablesToDrop = ['exporthistory', 'ExportHistory'];
        for (const tableName of tablesToDrop) {
            try {
                await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
                console.log(`✅ Dropped table: ${tableName}`);
            } catch (error) {
                console.log(`⚠️ Could not drop ${tableName}: ${error.message}`);
            }
        }
        
        // Step 3: Check for any remaining constraints with problematic names
        console.log('🔧 Step 2: Checking for remaining problematic constraints...');
        
        const [problematicConstraints] = await connection.execute(`
            SELECT CONSTRAINT_NAME, TABLE_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
                AND (CONSTRAINT_NAME LIKE '%ExportHistory%' OR CONSTRAINT_NAME LIKE '%export%')
                AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('Problematic constraints found:', problematicConstraints);
        
        // Step 4: Drop any remaining problematic constraints
        for (const constraint of problematicConstraints) {
            try {
                await connection.execute(`
                    ALTER TABLE \`${constraint.TABLE_NAME}\` 
                    DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\`
                `);
                console.log(`✅ Dropped constraint: ${constraint.CONSTRAINT_NAME} from ${constraint.TABLE_NAME}`);
            } catch (error) {
                console.log(`⚠️ Could not drop constraint ${constraint.CONSTRAINT_NAME}: ${error.message}`);
            }
        }
        
        // Step 5: Create the correct exporthistory table with proper naming
        console.log('🔧 Step 3: Creating clean exporthistory table...');
        
        await connection.execute(`
            CREATE TABLE \`exporthistory\` (
                \`exportId\` int(11) NOT NULL AUTO_INCREMENT,
                \`username\` varchar(50) NOT NULL,
                \`filename\` varchar(255) NOT NULL,
                \`recordCount\` int(11) DEFAULT '0',
                \`format\` varchar(255) NOT NULL,
                \`status\` varchar(255) DEFAULT 'completed',
                \`url\` varchar(255) DEFAULT NULL,
                \`createdAt\` datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`exportId\`),
                KEY \`username\` (\`username\`),
                CONSTRAINT \`exporthistory_ibfk_1\` FOREIGN KEY (\`username\`) REFERENCES \`user_login\` (\`Username\`) ON DELETE CASCADE ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        console.log('✅ Created clean exporthistory table');
        
        // Step 6: Verify the final state
        const [finalCheck] = await connection.execute(`
            SELECT TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
                AND TABLE_NAME = 'exporthistory'
                AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('✅ Final verification:', finalCheck);
        
        // Step 7: Test the table
        try {
            await connection.execute(`
                INSERT INTO exporthistory (username, filename, format) 
                VALUES ('test', 'test.csv', 'csv')
            `);
            
            await connection.execute('DELETE FROM exporthistory WHERE username = "test"');
            console.log('✅ Table test successful');
        } catch (error) {
            console.log(`❌ Table test failed: ${error.message}`);
        }
        
        console.log('🎉 Comprehensive ExportHistory fix completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

comprehensiveExportHistoryFix();
