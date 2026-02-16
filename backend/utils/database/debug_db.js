
const { sequelize } = require('./models');

async function testSync() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connected. Syncing...');
        await sequelize.sync({ alter: true });
        console.log('Sync successful.');
    } catch (error) {
        console.error('Sync failed:', error);
        const fs = require('fs');
        fs.writeFileSync('db_error.log', error.stack || error.toString());
    } finally {
        await sequelize.close();
    }
}

testSync();
