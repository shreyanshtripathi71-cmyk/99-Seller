const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function askPassword() {
    return new Promise((resolve) => {
        rl.question('Enter your MySQL root password: ', (password) => {
            rl.close();
            resolve(password);
        });
    });
}

async function fixRemainingTables() {
    let localConnection, railwayConnection;
    
    try {
        console.log('🔧 Fixing remaining tables with foreign key constraints...\n');
        
        // Get password from user
        const password = await askPassword();
        
        console.log('Connecting to databases...');
        
        // Connect to local database
        localConnection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: password,
            database: '99sellers'
        });
        
        // Connect to Railway database
        railwayConnection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to both databases!');
        
        // Tables that failed due to foreign key constraints
        const failedTables = [
            'auction', 'divorce', 'eviction', 'free_users', 'loan', 
            'owner', 'premium_users', 'probate', 'site_contents'
        ];
        
        // Disable foreign key checks
        await railwayConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        for (const tableName of failedTables) {
            console.log(`\n🔧 Fixing table: ${tableName}`);
            
            try {
                // Clear existing data in Railway table
                await railwayConnection.execute(`DELETE FROM \`${tableName}\``);
                
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
                    
                    console.log(`✓ Fixed ${tableName}: ${rows.length} records migrated`);
                } else {
                    console.log(`✓ Table ${tableName} is empty`);
                }
                
            } catch (error) {
                console.error(`❌ Error fixing ${tableName}:`, error.message);
            }
        }
        
        // Re-enable foreign key checks
        await railwayConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        // Final verification
        console.log('\n🔍 Final verification of all tables...');
        
        const [allTables] = await localConnection.execute('SHOW TABLES');
        const tableNames = allTables.map(row => Object.values(row)[0]);
        
        let totalLocalRecords = 0;
        let totalRailwayRecords = 0;
        
        for (const tableName of tableNames) {
            try {
                const [localCount] = await localConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
                const [railwayCount] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
                
                const localRecords = localCount[0].count;
                const railwayRecords = railwayCount[0].count;
                
                totalLocalRecords += localRecords;
                totalRailwayRecords += railwayRecords;
                
                if (localRecords === railwayRecords) {
                    console.log(`✅ ${tableName}: ${localRecords} records`);
                } else {
                    console.log(`⚠️  ${tableName}: Local=${localRecords}, Railway=${railwayRecords}`);
                }
            } catch (error) {
                console.error(`❌ Error verifying ${tableName}:`, error.message);
            }
        }
        
        console.log('\n🎉 Final Migration Summary:');
        console.log(`📊 Total local records: ${totalLocalRecords}`);
        console.log(`📊 Total Railway records: ${totalRailwayRecords}`);
        
        if (totalLocalRecords === totalRailwayRecords) {
            console.log('🎊 PERFECT MIGRATION! All data successfully transferred to Railway!');
        } else {
            console.log(`⚠️  Migration completed with ${totalLocalRecords - totalRailwayRecords} missing records.`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (localConnection) {
            await localConnection.end();
        }
        if (railwayConnection) {
            await railwayConnection.end();
        }
    }
}

fixRemainingTables();
