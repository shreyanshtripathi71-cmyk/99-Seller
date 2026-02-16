const mysql = require('mysql2/promise');

async function optimizeDatabaseForRailway() {
    let connection;
    
    try {
        console.log('🚀 Optimizing database for Railway deployment...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Set optimal InnoDB settings for Railway
        const optimizations = [
            'SET GLOBAL innodb_lock_wait_timeout = 10',
            'SET GLOBAL innodb_deadlock_detect = ON',
            'SET GLOBAL transaction_isolation = "READ-COMMITTED"',
            'SET GLOBAL innodb_buffer_pool_size = 134217728', // 128MB
            'SET GLOBAL innodb_log_file_size = 268435456', // 256MB
            'SET GLOBAL innodb_flush_log_at_trx_commit = 2',
            'SET GLOBAL innodb_flush_method = "O_DIRECT"'
        ];
        
        for (const query of optimizations) {
            try {
                await connection.execute(query);
                console.log(`✅ Applied: ${query}`);
            } catch (error) {
                console.log(`⚠️ Skipped: ${query} - ${error.message}`);
            }
        }
        
        // Check for and optimize slow queries
        const [slowQueries] = await connection.execute(`
            SELECT * FROM mysql.slow_log 
            WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ORDER BY query_time DESC 
            LIMIT 5
        `);
        
        if (slowQueries.length > 0) {
            console.log('📊 Recent slow queries:');
            slowQueries.forEach(query => {
                console.log(`  ${query.sql_text} (${query.query_time}s)`);
            });
        }
        
        // Analyze tables to ensure optimal statistics
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(table => Object.values(table)[0]);
        
        console.log(`🔍 Analyzing ${tableNames.length} tables...`);
        
        for (const tableName of tableNames.slice(0, 10)) { // Limit to first 10 for speed
            try {
                await connection.execute(`ANALYZE TABLE \`${tableName}\``);
                console.log(`✅ Analyzed: ${tableName}`);
            } catch (error) {
                console.log(`⚠️ Failed to analyze ${tableName}: ${error.message}`);
            }
        }
        
        // Check for fragmented tables
        const [fragmented] = await connection.execute(`
            SELECT 
                TABLE_NAME,
                ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size_MB',
                ROUND((DATA_FREE / 1024 / 1024), 2) AS 'Free_MB'
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'railway' 
                AND DATA_FREE > 0
            ORDER BY DATA_FREE DESC
            LIMIT 5
        `);
        
        if (fragmented.length > 0) {
            console.log('📊 Fragmented tables (consider optimizing):');
            fragmented.forEach(table => {
                console.log(`  ${table.TABLE_NAME}: ${table.Size_MB}MB, ${table.Free_MB}MB free`);
            });
        }
        
        console.log('🎉 Database optimization completed');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

optimizeDatabaseForRailway();
