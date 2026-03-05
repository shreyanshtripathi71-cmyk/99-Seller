const { sequelize } = require('./models');

async function seed() {
    try {
        console.log('Simple SQL Seed...');
        await sequelize.query("UPDATE proaddress SET trusteename='RICHARD ROE', trusteecompanyname='ROE LAW FIRM', auctioneername='MIKE SMITH', PcompayName='GOLDEN INVESTMENTS LLC', owner_current_state='FLORIDA' WHERE id=41");
        await sequelize.query("UPDATE loan SET total_default_amount=58400.25, arrears_amount=12000.50 WHERE property_id=4");
        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seed();
