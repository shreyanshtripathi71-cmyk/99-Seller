const mysql = require('mysql2/promise');

async function fixAllDuplicateConstraints() {
    let connection;
    
    try {
        console.log('🔧 Fixing all duplicate foreign key constraints...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Find all duplicate constraint names
        const [duplicates] = await connection.execute(`
            SELECT 
                CONSTRAINT_NAME,
                COUNT(*) as count,
                GROUP_CONCAT(TABLE_NAME) as tables
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            GROUP BY CONSTRAINT_NAME
            HAVING count > 1
        `);
        
        if (duplicates.length === 0) {
            console.log('✅ No duplicate constraints found');
            return;
        }
        
        console.log(`🚨 Found ${duplicates.length} duplicate constraint names:`);
        duplicates.forEach(dup => {
            console.log(`  - ${dup.CONSTRAINT_NAME} (${dup.count} occurrences) in tables: ${dup.tables}`);
        });
        
        // Fix each duplicate
        for (const duplicate of duplicates) {
            const constraintName = duplicate.CONSTRAINT_NAME;
            const tableList = duplicate.tables.split(',');
            
            console.log(`\n🔧 Fixing constraint: ${constraintName}`);
            
            // Get detailed info for this constraint
            const [constraintDetails] = await connection.execute(`
                SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'railway' 
                    AND CONSTRAINT_NAME = ?
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                ORDER BY TABLE_NAME
            `, [constraintName]);
            
            // Drop duplicates (keep first one)
            for (let i = 1; i < constraintDetails.length; i++) {
                const detail = constraintDetails[i];
                const tableName = detail.TABLE_NAME;
                
                console.log(`  Dropping ${constraintName} from ${tableName}`);
                
                try {
                    await connection.execute(`
                        ALTER TABLE \`${tableName}\` 
                        DROP FOREIGN KEY \`${constraintName}\`
                    `);
                    console.log(`  ✅ Successfully dropped from ${tableName}`);
                } catch (error) {
                    console.log(`  ❌ Failed to drop from ${tableName}: ${error.message}`);
                }
            }
        }
        
        // Verify the fix
        const [remainingDuplicates] = await connection.execute(`
            SELECT 
                CONSTRAINT_NAME,
                COUNT(*) as count
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            GROUP BY CONSTRAINT_NAME
            HAVING count > 1
        `);
        
        if (remainingDuplicates.length === 0) {
            console.log('🎉 All duplicate constraints have been fixed!');
        } else {
            console.log(`⚠️ Still have ${remainingDuplicates.length} duplicate constraints`);
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

fixAllDuplicateConstraints();
