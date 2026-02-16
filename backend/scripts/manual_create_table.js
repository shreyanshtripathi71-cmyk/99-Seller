require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config/config');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: console.log
});

const createTable = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        await sequelize.getQueryInterface().createTable('saved_properties', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            propertyId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        console.log('Table created.');
    } catch (err) {
        console.error('Create error:', err);
    } finally {
        await sequelize.close();
    }
};

createTable();
