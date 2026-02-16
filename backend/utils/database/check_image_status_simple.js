const { Property, sequelize } = require('./models');

async function checkImages() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const propertiesWithImages = await Property.findAll({
            where: sequelize.literal('local_image_path IS NOT NULL AND local_image_path != ""')
        });

        console.log(`Found ${propertiesWithImages.length} properties with images.`);
        if (propertiesWithImages.length > 0) {
            console.log('Sample IDs:', propertiesWithImages.map(p => p.id).slice(0, 5));
            console.log('Sample Paths:', propertiesWithImages.map(p => p.local_image_path).slice(0, 5));
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkImages();
