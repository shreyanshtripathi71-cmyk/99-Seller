const mysql = require('mysql2/promise');

async function debugSequelizeSyncIssue() {
    let connection;
    
    try {
        console.log('🔍 Debugging Sequelize sync issue...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check if there are any tables that might be causing conflicts during sync
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(table => Object.values(table)[0]);
        
        console.log(`📋 Found ${tableNames.length} tables in database`);
        
        // Look for any tables that might have case sensitivity issues
        const caseIssues = {};
        tableNames.forEach(tableName => {
            const lowerName = tableName.toLowerCase();
            if (caseIssues[lowerName]) {
                caseIssues[lowerName].push(tableName);
            } else {
                caseIssues[lowerName] = [tableName];
            }
        });
        
        const potentialCaseConflicts = Object.values(caseIssues).filter(names => names.length > 1);
        if (potentialCaseConflicts.length > 0) {
            console.log('⚠️ Potential case sensitivity conflicts:');
            potentialCaseConflicts.forEach(names => {
                console.log(`  ${names.join(', ')}`);
            });
        }
        
        // Check for any tables that might be trying to create the same constraint
        console.log('🔍 Checking for potential constraint conflicts...');
        
        // Check specifically for ExportHistory related tables (case-insensitive)
        const exportRelatedTables = tableNames.filter(name => 
            name.toLowerCase().includes('export') || 
            name.toLowerCase().includes('history')
        );
        
        if (exportRelatedTables.length > 0) {
            console.log('📋 Export/History related tables:');
            exportRelatedTables.forEach(table => {
                console.log(`  - ${table}`);
            });
            
            // Check constraints on these tables
            for (const tableName of exportRelatedTables) {
                const [constraints] = await connection.execute(`
                    SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE TABLE_SCHEMA = 'railway' 
                        AND TABLE_NAME = ?
                        AND REFERENCED_TABLE_NAME IS NOT NULL
                `, [tableName]);
                
                if (constraints.length > 0) {
                    console.log(`  Constraints on ${tableName}:`);
                    constraints.forEach(constraint => {
                        console.log(`    ${constraint.CONSTRAINT_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
                    });
                }
            }
        }
        
        // Try to simulate what Sequelize might be doing
        console.log('🔍 Simulating potential Sequelize sync issue...');
        
        // Check if there are any model files that might be causing this
        console.log('💡 The error might be occurring because:');
        console.log('   1. Sequelize is trying to create a table that already exists');
        console.log('   2. There\'s a case sensitivity issue between model name and table name');
        console.log('   3. The model definition doesn\'t match the existing table structure');
        
        // Suggest a fix
        console.log('\n🔧 Suggested fixes:');
        console.log('   1. Add force: true to sequelize.sync() to drop and recreate tables');
        console.log('   2. Check model definitions for case sensitivity issues');
        console.log('   3. Ensure model names match table names exactly');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

debugSequelizeSyncIssue();
