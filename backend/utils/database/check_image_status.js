const { Property, sequelize } = require('./models');
const fs = require('fs');
const path = require('path');

async function checkImages() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const propertiesWithImages = await Property.findAll({
            where: sequelize.literal('local_image_path IS NOT NULL AND local_image_path != ""')
        });

        console.log(`\nFound ${propertiesWithImages.length} properties with images in DB.`);

        propertiesWithImages.forEach(p => {
            console.log(`[Prop ID ${p.id}] Image: ${p.local_image_path}`);
            const filePath = path.join(__dirname, 'uploads', p.local_image_path);
            if (fs.existsSync(filePath)) {
                console.log(`   -> File EXISTS: ${filePath}`);
            } else {
                console.log(`   -> File MISSING: ${filePath}`);
            }
        });

        const uploadDir = path.join(__dirname, 'uploads');
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            console.log(`\n[backend/uploads] Total files: ${files.length}`);
            console.log('Sample files:', files.slice(0, 5));
        } else {
            console.log('\n[backend/uploads] Directory does NOT exist.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkImages();
