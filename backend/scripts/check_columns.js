require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./config/config');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false
});

const checkColumns = async () => {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SHOW FULL COLUMNS FROM user_login WHERE Field = 'Username'");
        if (results.length > 0) {
            console.log('SCHEMA_START');
            console.log(JSON.stringify(results[0], null, 2));
            console.log('SCHEMA_END');
        } else {
            console.log('Column Username not found in user_login');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sequelize.close();
    }
};

checkColumns();
