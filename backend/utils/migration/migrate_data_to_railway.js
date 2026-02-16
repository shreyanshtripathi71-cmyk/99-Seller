const mysql = require('mysql2/promise');

async function migrateDataToRailway() {
    let localConnection, railwayConnection;
    
    try {
        console.log('Connecting to local MySQL database...');
        
        // Connect to local database
        localConnection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '***********', // Using the same password from earlier
            database: '99sellers'
        });
        
        console.log('✓ Connected to local database!');
        
        console.log('Connecting to Railway database...');
        
        // Connect to Railway database
        railwayConnection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database!');
        
        // Get all tables from local database
        const [localTables] = await localConnection.execute('SHOW TABLES');
        const tableNames = localTables.map(row => Object.values(row)[0]);
        
        console.log(`Found ${tableNames.length} tables to migrate:`, tableNames);
        
        // Clear Railway database (drop all existing tables)
        console.log('Clearing Railway database...');
        const [railwayTables] = await railwayConnection.execute('SHOW TABLES');
        const railwayTableNames = railwayTables.map(row => Object.values(row)[0]);
        
        for (const tableName of railwayTableNames) {
            await railwayConnection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
        }
        
        // Migrate each table
        for (const tableName of tableNames) {
            console.log(`\nMigrating table: ${tableName}`);
            
            try {
                // Get table structure
                const [createTableResult] = await localConnection.execute(`SHOW CREATE TABLE \`${tableName}\``);
                const createStatement = createTableResult[0]['Create Table'];
                
                // Create table on Railway
                await railwayConnection.execute(createStatement);
                console.log(`✓ Created table ${tableName}`);
                
                // Get data from local table
                const [rows] = await localConnection.execute(`SELECT * FROM \`${tableName}\``);
                
                if (rows.length > 0) {
                    // Get column names
                    const columns = Object.keys(rows[0]);
                    const columnList = columns.join(', ');
                    const placeholders = columns.map(() => '?').join(', ');
                    
                    // Insert data into Railway table
                    for (const row of rows) {
                        const values = columns.map(col => row[col]);
                        await railwayConnection.execute(
                            `INSERT INTO \`${tableName}\` (${columnList}) VALUES (${placeholders})`,
                            values
                        );
                    }
                    
                    console.log(`✓ Migrated ${rows.length} records from ${tableName}`);
                } else {
                    console.log(`✓ Table ${tableName} is empty`);
                }
                
            } catch (error) {
                console.error(`❌ Error migrating table ${tableName}:`, error.message);
            }
        }
        
        // Verify migration
        console.log('\n🔍 Verifying migration...');
        
        for (const tableName of tableNames) {
            try {
                const [localCount] = await localConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
                const [railwayCount] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
                
                const localRecords = localCount[0].count;
                const railwayRecords = railwayCount[0].count;
                
                if (localRecords === railwayRecords) {
                    console.log(`✓ ${tableName}: ${localRecords} records matched`);
                } else {
                    console.log(`⚠️  ${tableName}: Local=${localRecords}, Railway=${railwayRecords}`);
                }
            } catch (error) {
                console.error(`❌ Error verifying ${tableName}:`, error.message);
            }
        }
        
        console.log('\n🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration error:', error.message);
    } finally {
        if (localConnection) {
            await localConnection.end();
            console.log('✓ Local connection closed');
        }
        if (railwayConnection) {
            await railwayConnection.end();
            console.log('✓ Railway connection closed');
        }
    }
}

migrateDataToRailway();
