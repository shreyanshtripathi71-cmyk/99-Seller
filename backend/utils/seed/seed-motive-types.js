const { sequelize, MotiveTypes } = require('./models');

async function seedMotiveTypes() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database');

        // Define the 9 motive types
        const motiveTypes = [
            { id: 1, code: 'PRE', name: 'Preforeclosure' },
            { id: 2, code: 'FOR', name: 'Foreclosure' },
            { id: 3, code: 'AUC', name: 'Auction' },
            { id: 4, code: 'PRO', name: 'Probate' },
            { id: 5, code: 'COD', name: 'Codes' },
            { id: 6, code: 'EVI', name: 'Eviction' },
            { id: 7, code: 'DIV', name: 'Divorce' },
            { id: 8, code: 'TAX', name: 'Unpaid Taxes' },
            { id: 9, code: 'OOS', name: 'Out of State' }
        ];

        console.log('Seeding motive types...');

        for (const mt of motiveTypes) {
            const [motiveType, created] = await MotiveTypes.findOrCreate({
                where: { id: mt.id },
                defaults: mt
            });

            if (created) {
                console.log(`✓ Created: ${mt.name} (${mt.code})`);
            } else {
                // Update existing
                await motiveType.update({ code: mt.code, name: mt.name });
                console.log(`✓ Updated: ${mt.name} (${mt.code})`);
            }
        }

        console.log('\n✓ Motive types seeded successfully!');
        console.log('\nMotive Types:');
        motiveTypes.forEach(mt => {
            console.log(`  ${mt.id}. ${mt.name} (${mt.code})`);
        });

    } catch (error) {
        console.error('Error seeding motive types:', error);
    } finally {
        await sequelize.close();
    }
}

seedMotiveTypes();
