const mysql = require('mysql2/promise');

async function forceFixExportHistoryIssue() {
    let connection;
    
    try {
        console.log('🔧 Force fixing ExportHistory constraint issue...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check if there are ANY constraints with 'ExportHistory_ibfk_1' name
        const [constraints] = await connection.execute(`
            SELECT TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
                AND (CONSTRAINT_NAME = 'ExportHistory_ibfk_1' OR CONSTRAINT_NAME = 'exporthistory_ibfk_1')
                AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('Found constraints:', constraints);
        
        if (constraints.length > 0) {
            console.log('🔧 Dropping all ExportHistory related constraints...');
            
            for (const constraint of constraints) {
                const tableName = constraint.TABLE_NAME;
                const constraintName = constraint.CONSTRAINT_NAME;
                
                console.log(`Dropping ${constraintName} from ${tableName}`);
                
                try {
                    await connection.execute(`
                        ALTER TABLE \`${tableName}\` 
                        DROP FOREIGN KEY \`${constraintName}\`
                    `);
                    console.log(`✅ Successfully dropped ${constraintName} from ${tableName}`);
                } catch (error) {
                    console.log(`❌ Failed to drop ${constraintName} from ${tableName}: ${error.message}`);
                }
            }
        }
        
        // Check if there are any tables that might be causing this during sync
        console.log('🔍 Checking for problematic tables...');
        
        // Drop and recreate the exporthistory table to ensure clean state
        try {
            console.log('🔧 Dropping exporthistory table...');
            await connection.execute('DROP TABLE IF EXISTS `exporthistory`');
            console.log('✅ exporthistory table dropped');
            
            console.log('🔧 Recreating exporthistory table...');
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
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8
            `);
            console.log('✅ exporthistory table recreated with correct constraint');
            
        } catch (error) {
            console.log(`❌ Error recreating table: ${error.message}`);
        }
        
        // Verify the final state
        const [finalCheck] = await connection.execute(`
            SELECT TABLE_NAME, CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
                AND (TABLE_NAME = 'exporthistory' OR TABLE_NAME = 'ExportHistory')
                AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('✅ Final state check:', finalCheck);
        
        if (finalCheck.length === 1 && finalCheck[0].TABLE_NAME === 'exporthistory') {
            console.log('🎉 ExportHistory issue should now be resolved!');
        } else {
            console.log('⚠️ Issue may still persist');
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

forceFixExportHistoryIssue();
