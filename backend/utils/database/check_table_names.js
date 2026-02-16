const mysql = require('mysql2/promise');

async function checkTableNames() {
    let connection;
    
    try {
        console.log('🔍 Checking all table names in Railway database...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Get all table names
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 All tables in Railway database:');
        
        tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`  ${index + 1}. ${tableName}`);
        });
        
        // Look for tables with similar names to ExportHistory
        const similarTables = tables.filter(table => {
            const tableName = Object.values(table)[0];
            return tableName.toLowerCase().includes('export') || 
                   tableName.toLowerCase().includes('history');
        });
        
        if (similarTables.length > 0) {
            console.log('📋 Tables with "export" or "history" in name:');
            similarTables.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log(`  - ${tableName}`);
            });
        } else {
            console.log('ℹ️ No tables found with "export" or "history" in name');
        }
        
        // Check for case sensitivity issues
        const exactMatches = tables.filter(table => {
            const tableName = Object.values(table)[0];
            return tableName === 'ExportHistory' || tableName === 'exporthistory';
        });
        
        if (exactMatches.length > 0) {
            console.log('✅ Found exact matches for ExportHistory:');
            exactMatches.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log(`  - ${tableName}`);
            });
        } else {
            console.log('❌ No exact match found for ExportHistory');
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

checkTableNames();
