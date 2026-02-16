
const { sequelize } = require('./models');

async function checkIndexes() {
    try {
        await sequelize.authenticate();
        const [results, metadata] = await sequelize.query("SHOW INDEX FROM site_contents");
        console.log('Indexes on site_contents:', JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error fetching indexes:', error);
    } finally {
        await sequelize.close();
    }
}

checkIndexes();
