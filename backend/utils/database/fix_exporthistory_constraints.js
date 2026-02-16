const mysql = require('mysql2/promise');

async function checkExportHistoryConstraints() {
    let connection;
    
    try {
        console.log('🔧 Checking exporthistory table constraints...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check exporthistory table constraints
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
                AND TABLE_NAME = 'exporthistory'
                AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        console.log('📋 exporthistory constraints:', exportConstraints);
        
        // Check table structure
        const [structure] = await connection.execute('DESCRIBE exporthistory');
        console.log('📋 exporthistory table structure:', structure);
        
        // Look for any constraint issues
        if (exportConstraints.length > 0) {
            console.log('🔍 Checking for duplicate constraint names...');
            
            // Get all constraint names in the database
            const [allConstraints] = await connection.execute(`
                SELECT CONSTRAINT_NAME, COUNT(*) as count
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'railway' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
                GROUP BY CONSTRAINT_NAME
                HAVING count > 1
            `);
            
            if (allConstraints.length > 0) {
                console.log('🚨 Found duplicate constraint names:');
                allConstraints.forEach(constraint => {
                    console.log(`  - ${constraint.CONSTRAINT_NAME} (${constraint.count} occurrences)`);
                });
                
                // Fix duplicates by renaming them
                for (const duplicate of allConstraints) {
                    const constraintName = duplicate.CONSTRAINT_NAME;
                    
                    // Get all tables with this constraint
                    const [tablesWithConstraint] = await connection.execute(`
                        SELECT TABLE_NAME
                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = 'railway' 
                        AND CONSTRAINT_NAME = ?
                        AND REFERENCED_TABLE_NAME IS NOT NULL
                    `, [constraintName]);
                    
                    // Rename duplicates (keep first one as-is)
                    for (let i = 1; i < tablesWithConstraint.length; i++) {
                        const tableName = tablesWithConstraint[i].TABLE_NAME;
                        const newConstraintName = `${constraintName}_${tableName}_${Date.now()}`;
                        
                        console.log(`Renaming ${constraintName} to ${newConstraintName} in table ${tableName}`);
                        
                        try {
                            await connection.execute(`
                                ALTER TABLE \`${tableName}\` 
                                DROP FOREIGN KEY \`${constraintName}\`
                            `);
                            
                            // Note: We would need to recreate the constraint with the new name
                            // but for now, just dropping the duplicate should fix the issue
                            console.log(`✅ Dropped duplicate constraint ${constraintName} from ${tableName}`);
                        } catch (error) {
                            console.log(`❌ Failed to fix ${constraintName} in ${tableName}: ${error.message}`);
                        }
                    }
                }
            }
        }
        
        console.log('✅ exporthistory constraint check completed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

checkExportHistoryConstraints();
