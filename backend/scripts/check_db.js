const { Sequelize } = require('sequelize');
const config = require('./config/config');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false
});

const checkDB = async () => {
    try {
        await sequelize.authenticate();
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('Tables in DB:', tables);

        const desc = await sequelize.getQueryInterface().describeTable('saved_properties').catch(e => e.message);
        console.log('saved_properties description:', desc);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await sequelize.close();
    }
};

checkDB();
