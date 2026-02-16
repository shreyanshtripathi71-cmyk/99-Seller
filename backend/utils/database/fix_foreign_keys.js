const mysql = require('mysql2/promise');

async function fixDuplicateForeignKeyConstraints() {
    let connection;
    
    try {
        console.log('🔧 Fixing duplicate foreign key constraints...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check for duplicate foreign key constraints
        const [constraints] = await connection.execute(`
            SELECT 
                TABLE_NAME,
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM 
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE 
                TABLE_SCHEMA = 'railway' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY 
                TABLE_NAME, CONSTRAINT_NAME
        `);
        
        console.log('📋 Current foreign key constraints:');
        constraints.forEach(constraint => {
            console.log(`  ${constraint.TABLE_NAME}.${constraint.CONSTRAINT_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
        });
        
        // Find and fix duplicate constraints
        const duplicates = {};
        constraints.forEach(constraint => {
            const key = `${constraint.TABLE_NAME}_${constraint.COLUMN_NAME}_${constraint.REFERENCED_TABLE_NAME}`;
            if (!duplicates[key]) {
                duplicates[key] = [];
            }
            duplicates[key].push(constraint);
        });
        
        // Fix duplicates by dropping the older ones
        for (const [key, duplicateList] of Object.entries(duplicates)) {
            if (duplicateList.length > 1) {
                console.log(`🔧 Found duplicate constraints for ${key}:`);
                duplicateList.forEach((dup, index) => {
                    console.log(`  ${index + 1}. ${dup.CONSTRAINT_NAME}`);
                });
                
                // Drop the duplicates (keep the first one)
                for (let i = 1; i < duplicateList.length; i++) {
                    const constraint = duplicateList[i];
                    console.log(`  Dropping: ${constraint.CONSTRAINT_NAME}`);
                    
                    try {
                        await connection.execute(`
                            ALTER TABLE \`${constraint.TABLE_NAME}\` 
                            DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\`
                        `);
                        console.log(`  ✅ Dropped ${constraint.CONSTRAINT_NAME}`);
                    } catch (error) {
                        console.log(`  ❌ Failed to drop ${constraint.CONSTRAINT_NAME}: ${error.message}`);
                    }
                }
            }
        }
        
        // Verify the fix
        const [finalConstraints] = await connection.execute(`
            SELECT 
                TABLE_NAME,
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM 
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE 
                TABLE_SCHEMA = 'railway' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY 
                TABLE_NAME, CONSTRAINT_NAME
        `);
        
        console.log('✅ Final foreign key constraints:');
        finalConstraints.forEach(constraint => {
            console.log(`  ${constraint.TABLE_NAME}.${constraint.CONSTRAINT_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
        });
        
        console.log('🎉 Duplicate foreign key constraints fixed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

fixDuplicateForeignKeyConstraints();
