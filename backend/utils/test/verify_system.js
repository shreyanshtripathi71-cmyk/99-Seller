const { Sequelize } = require('sequelize');
const axios = require('axios');
require('dotenv').config();

// Setup Sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
);

async function verifySystem() {
    try {
        console.log('1. Checking Database Connection...');
        await sequelize.authenticate();
        console.log('✅ Database connected');

        console.log('\n2. Checking Database Tables...');
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('Tables in DB:', tables.map(t => Object.values(t)[0]));

        console.log('\n3. Checking Property Count...');
        // Try Property or Properties based on what we find
        let tableName = 'Properties';
        const tableNames = tables.map(t => Object.values(t)[0]);
        if (tableNames.includes('properties')) tableName = 'properties';
        if (tableNames.includes('Property')) tableName = 'Property';
        if (tableNames.includes('property')) tableName = 'property';

        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = results[0].count;
        console.log(`Property Count in DB (${tableName}): ${count}`);

        if (count === 0) {
            console.error('❌ No properties found in database! Seeding might have failed or data was lost.');
            return;
        } else {
            console.log('✅ Properties exist in DB');
        }

        console.log('\n3. Testing Admin Login...');
        try {
            const loginRes = await axios.post('http://localhost:5000/api/login', {
                email: 'admin@test.com',
                password: 'Admin@99Sell#2026'
            });

            console.log('✅ Login successful');
            const token = loginRes.data.token;
            // console.log('Token:', token);

            console.log('\n4. Testing GET /api/admin/properties...');
            try {
                const propRes = await axios.get('http://localhost:5000/api/admin/properties', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log(`API Status: ${propRes.status}`);
                console.log(`API Data Success: ${propRes.data.success}`);
                if (propRes.data.data) {
                    console.log(`API Returned ${propRes.data.data.length} properties`);
                } else {
                    console.log('API returned no data array');
                }

            } catch (err) {
                console.error('❌ API Fetch Failed:', err.message);
                if (err.response) {
                    console.error('Status:', err.response.status);
                    console.error('Data:', err.response.data);
                }
            }

        } catch (err) {
            console.error('❌ Login Failed:', err.message);
            if (err.response) {
                console.error('Status:', err.response.status);
                console.error('Data:', err.response.data);
            }
        }

    } catch (error) {
        console.error('System Check Failed:', error);
    } finally {
        await sequelize.close();
    }
}

verifySystem();
