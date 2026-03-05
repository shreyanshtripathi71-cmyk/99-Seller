const models = require('./models');
async function test() {
    try {
        await models.sequelize.authenticate();
        console.log('✅ Connection has been established successfully.');
        const motive = await models.MotiveTypes.findOne({ where: { code: 'PRO' } });
        console.log('PRO Motive:', motive ? motive.id : 'NOT FOUND');
        process.exit(0);
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
}
test();
