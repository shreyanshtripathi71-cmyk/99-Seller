const mysql = require('mysql2/promise');

async function fixDatabaseDeadlock() {
    let connection;
    
    try {
        console.log('🔧 Fixing database deadlock issues...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check for any ongoing transactions
        const [processes] = await connection.execute('SHOW PROCESSLIST');
        console.log(`📋 Found ${processes.length} active processes`);
        
        // Look for long-running queries
        const longRunning = processes.filter(proc => proc.Time > 5);
        if (longRunning.length > 0) {
            console.log('⚠️ Long-running queries found:');
            longRunning.forEach(proc => {
                console.log(`  ID: ${proc.Id}, Time: ${proc.Time}s, Query: ${proc.Info || 'None'}`);
            });
        }
        
        // Check for locked tables
        const [lockedTables] = await connection.execute('SHOW OPEN TABLES WHERE In_use > 0');
        if (lockedTables.length > 0) {
            console.log('🔒 Locked tables found:');
            lockedTables.forEach(table => {
                console.log(`  ${table.Database}.${table.Table_name}: ${table.In_use} locks`);
            });
        }
        
        // Kill any problematic processes (optional - use with caution)
        if (longRunning.length > 0) {
            console.log('🔧 Terminating long-running queries...');
            for (const proc of longRunning) {
                if (proc.Info && (proc.Info.includes('ALTER TABLE') || proc.Info.includes('LOCK'))) {
                    try {
                        await connection.execute(`KILL ${proc.Id}`);
                        console.log(`  ✅ Killed process ${proc.Id}`);
                    } catch (error) {
                        console.log(`  ❌ Failed to kill process ${proc.Id}: ${error.message}`);
                    }
                }
            }
        }
        
        // Check and optimize InnoDB settings
        const [innodbStatus] = await connection.execute('SHOW ENGINE INNODB STATUS');
        console.log('📊 InnoDB status checked');
        
        // Set transaction isolation level to reduce deadlocks
        await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
        console.log('✅ Transaction isolation level set to READ COMMITTED');
        
        // Set lock timeout to reduce wait time
        await connection.execute('SET innodb_lock_wait_timeout = 10');
        console.log('✅ Lock timeout set to 10 seconds');
        
        // Test a simple transaction
        try {
            await connection.beginTransaction();
            const [test] = await connection.execute('SELECT COUNT(*) as count FROM admin_activities');
            await connection.commit();
            console.log('✅ Test transaction successful:', test[0]);
        } catch (error) {
            await connection.rollback();
            console.log('❌ Test transaction failed:', error.message);
        }
        
        console.log('🎉 Database deadlock fixes applied');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

fixDatabaseDeadlock();
