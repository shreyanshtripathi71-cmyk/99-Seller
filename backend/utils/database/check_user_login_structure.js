const mysql = require('mysql2/promise');

async function checkUserLoginStructure() {
    let connection;
    
    try {
        console.log('🔍 Checking user_login table structure...');
        
        // Connect to Railway database
        connection = await mysql.createConnection({
            host: 'gondola.proxy.rlwy.net',
            port: 32219,
            user: 'root',
            password: 'oUVLAdYtSZEUJcYrvMqljVVyJXgidNxW',
            database: 'railway'
        });
        
        console.log('✓ Connected to Railway database');
        
        // Check user_login table structure
        const [structure] = await connection.execute('DESCRIBE user_login');
        console.log('user_login table structure:');
        structure.forEach(column => {
            console.log(`  ${column.Field}: ${column.Type} (${column.Null ? 'NULL' : 'NOT NULL'})`);
        });
        
        // Check if Username column exists and its type
        const usernameColumn = structure.find(col => col.Field === 'Username');
        if (usernameColumn) {
            console.log(`✅ Username column found: ${usernameColumn.Type}`);
            
            // Create exporthistory table with compatible column type
            console.log('🔧 Creating exporthistory with compatible column type...');
            
            await connection.execute(`
                CREATE TABLE \`exporthistory\` (
                    \`exportId\` int(11) NOT NULL AUTO_INCREMENT,
                    \`username\` ${usernameColumn.Type} NOT NULL,
                    \`filename\` varchar(255) NOT NULL,
                    \`recordCount\` int(11) DEFAULT '0',
                    \`format\` varchar(255) NOT NULL,
                    \`status\` varchar(255) DEFAULT 'completed',
                    \`url\` varchar(255) DEFAULT NULL,
                    \`createdAt\` datetime DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (\`exportId\`),
                    KEY \`username\` (\`username\`),
                    CONSTRAINT \`exporthistory_ibfk_1\` FOREIGN KEY (\`username\`) REFERENCES \`user_login\` (\`Username\`) ON DELETE CASCADE ON UPDATE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            
            console.log('✅ Created exporthistory with compatible column type');
            
        } else {
            console.log('❌ Username column not found in user_login table');
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

checkUserLoginStructure();
