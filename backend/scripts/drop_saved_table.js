const { Sequelize } = require('sequelize');
const config = require('./config/config');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: console.log
});

const dropTable = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');
        await sequelize.getQueryInterface().dropTable('saved_properties');
        console.log('Dropped saved_properties table.');
    } catch (error) {
        console.error('Error dropping table:', error);
    } finally {
        await sequelize.close();
    }
};

dropTable();
