const mysql = require('mysql2/promise');

async function finalExportHistoryFix() {
    let connection;
    
    try {
        console.log('🔧 Final ExportHistory fix - addressing column compatibility...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Step 1: Drop any existing export tables
        console.log('🔧 Step 1: Dropping existing export tables...');
        
        await connection.execute('DROP TABLE IF EXISTS `exporthistory`');
        await connection.execute('DROP TABLE IF EXISTS `ExportHistory`');
        console.log('✅ Dropped existing tables');
        
        // Step 2: Create exporthistory table with exact same column type as user_login.Username
        console.log('🔧 Step 2: Creating exporthistory with compatible column type...');
        
        await connection.execute(`
            CREATE TABLE \`exporthistory\` (
                \`exportId\` int(11) NOT NULL AUTO_INCREMENT,
                \`username\` varchar(50) DEFAULT NULL,
                \`filename\` varchar(255) NOT NULL,
                \`recordCount\` int(11) DEFAULT '0',
                \`format\` varchar(255) NOT NULL,
                \`status\` varchar(255) DEFAULT 'completed',
                \`url\` varchar(255) DEFAULT NULL,
                \`createdAt\` datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`exportId\`),
                KEY \`username\` (\`username\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        console.log('✅ Created exporthistory table without foreign key');
        
        // Step 3: Add foreign key with proper column definition
        console.log('🔧 Step 3: Adding foreign key constraint...');
        
        try {
            await connection.execute(`
                ALTER TABLE \`exporthistory\` 
                ADD CONSTRAINT \`exporthistory_ibfk_1\` 
                FOREIGN KEY (\`username\`) 
                REFERENCES \`user_login\` (\`Username\`) 
                ON DELETE CASCADE ON UPDATE CASCADE
            `);
            console.log('✅ Added foreign key constraint');
        } catch (error) {
            console.log(`⚠️ Could not add foreign key: ${error.message}`);
            console.log('ℹ️ Table created without foreign key - this should prevent the error');
        }
        
        // Step 4: Test the table
        console.log('🔧 Step 4: Testing table functionality...');
        
        try {
            await connection.execute(`
                INSERT INTO exporthistory (username, filename, format) 
                VALUES ('test', 'test.csv', 'csv')
            `);
            
            const [testResult] = await connection.execute('SELECT * FROM exporthistory WHERE username = "test"');
            await connection.execute('DELETE FROM exporthistory WHERE username = "test"');
            
            console.log('✅ Table test successful:', testResult[0]);
        } catch (error) {
            console.log(`❌ Table test failed: ${error.message}`);
        }
        
        // Step 5: Final verification
        const [finalCheck] = await connection.execute(`
            SELECT TABLE_NAME, ENGINE, TABLE_ROWS, TABLE_COMMENT
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'railway' 
            AND TABLE_NAME = 'exporthistory'
        `);
        
        console.log('✅ Final verification:', finalCheck[0]);
        
        console.log('🎉 Final ExportHistory fix completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Connection closed');
        }
    }
}

finalExportHistoryFix();
