const { sequelize } = require('./models');
async function checkTable() {
    try {
        const [results, metadata] = await sequelize.query("DESCRIBE property");
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkTable();
