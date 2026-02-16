const mysql = require('mysql2/promise');

async function findAndFixActualDuplicateConstraint() {
    let connection;
    
    try {
        console.log('🔍 Finding the actual duplicate constraint causing the error...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check for ALL duplicate constraint names (case-insensitive)
        const [duplicates] = await connection.execute(`
            SELECT 
                LOWER(CONSTRAINT_NAME) as constraint_name_lower,
                CONSTRAINT_NAME as original_name,
                COUNT(*) as count,
                GROUP_CONCAT(TABLE_NAME) as tables
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            GROUP BY LOWER(CONSTRAINT_NAME), CONSTRAINT_NAME
            HAVING count > 1
        `);
        
        if (duplicates.length === 0) {
            console.log('ℹ️ No duplicate constraints found');
            
            // Check for any constraint that might be causing issues during model sync
            const [allConstraints] = await connection.execute(`
                SELECT 
                    CONSTRAINT_NAME,
                    TABLE_NAME,
                    COLUMN_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'railway' 
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                ORDER BY CONSTRAINT_NAME, TABLE_NAME
            `);
            
            console.log('📋 All foreign key constraints:');
            allConstraints.forEach(constraint => {
                console.log(`  ${constraint.CONSTRAINT_NAME} on ${constraint.TABLE_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
            });
            
            return;
        }
        
        console.log('🚨 Found duplicate constraints:');
        duplicates.forEach(dup => {
            console.log(`  ${dup.original_name} (${dup.count} occurrences) in tables: ${dup.tables}`);
        });
        
        // Fix each duplicate
        for (const duplicate of duplicates) {
            const constraintName = duplicate.original_name;
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
            
            console.log('Constraint details:', constraintDetails);
            
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
                    
                    // Try to drop with backticks
                    try {
                        await connection.execute(`
                            ALTER TABLE \`${tableName}\` 
                            DROP FOREIGN KEY \`${constraintName}\`
                        `);
                        console.log(`  ✅ Successfully dropped (with backticks) from ${tableName}`);
                    } catch (error2) {
                        console.log(`  ❌ Still failed: ${error2.message}`);
                    }
                }
            }
        }
        
        // Final verification
        const [finalDuplicates] = await connection.execute(`
            SELECT 
                CONSTRAINT_NAME,
                COUNT(*) as count
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'railway' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            GROUP BY CONSTRAINT_NAME
            HAVING count > 1
        `);
        
        if (finalDuplicates.length === 0) {
            console.log('🎉 All duplicate constraints have been fixed!');
        } else {
            console.log(`⚠️ Still have ${finalDuplicates.length} duplicate constraints`);
            finalDuplicates.forEach(dup => {
                console.log(`  ${dup.CONSTRAINT_NAME}: ${dup.count} occurrences`);
            });
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

findAndFixActualDuplicateConstraint();
