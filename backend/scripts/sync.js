const { sequelize } = require('./models');

const syncDB = async () => {
    try {
        console.log('--- STARTING DATABASE SYNC ---');
        await sequelize.authenticate();
        console.log('Database connected.');

        // sync({alter: true}) will create missing tables without dropping existing ones
        await sequelize.sync({ alter: true });

        console.log('--- SYNC COMPLETED SUCCESSFULLY ---');
        console.log('All missing tables (Properties, Auctions, etc) have been created.');
        process.exit(0);
    } catch (error) {
        console.error('--- SYNC FAILED ---');
        console.error(error);
        process.exit(1);
    }
};

syncDB();
