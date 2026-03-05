require('dotenv').config();
const { Property, MotiveTypes } = require('./models');

async function verify() {
    try {
        const codMotive = await MotiveTypes.findOne({ where: { code: 'COD' } });
        if (!codMotive) {
            console.log('COD Motive not found.');
            return;
        }

        const count = await Property.count({
            where: { motive_type_id: codMotive.id }
        });

        const properties = await Property.findAll({
            where: { motive_type_id: codMotive.id },
            attributes: ['id', 'PStreetAddr1']
        });

        console.log(`TOTAL_COD_COUNT: ${count}`);
        properties.forEach(p => {
            console.log(`REMAINING_ID: ${p.id}`);
        });

    } catch (err) {
        console.error('Verification error:', err.message);
    } finally {
        process.exit();
    }
}

verify();
