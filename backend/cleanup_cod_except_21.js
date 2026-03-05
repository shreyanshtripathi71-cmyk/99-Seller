require('dotenv').config();
const { Property, MotiveTypes } = require('./models');
const { Op } = require('sequelize');

async function cleanup() {
    try {
        console.log('Starting COD Properties Cleanup...');

        // 1. Get COD Motive Type
        const codMotive = await MotiveTypes.findOne({
            where: { code: 'COD' }
        });

        if (!codMotive) {
            console.log('COD Motive Type not found. Nothing to delete.');
            return;
        }

        console.log(`Found COD Motive ID: ${codMotive.id}`);

        // 2. Delete Properties (except ID 21)
        const deletedCount = await Property.destroy({
            where: {
                motive_type_id: codMotive.id,
                id: {
                    [Op.ne]: 21
                }
            }
        });

        console.log(`Successfully deleted ${deletedCount} properties with motive type COD (excluding ID 21).`);

    } catch (err) {
        console.error('Cleanup error:', err.message);
    } finally {
        process.exit();
    }
}

cleanup();
