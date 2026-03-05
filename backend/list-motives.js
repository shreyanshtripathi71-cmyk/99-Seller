const { MotiveTypes } = require('./models');

async function listMotiveTypes() {
    try {
        const motives = await MotiveTypes.findAll({
            order: [['id', 'ASC']]
        });

        console.log('--- MOTIVE TYPES ---');
        motives.forEach(m => {
            console.log(`${m.id}: [${m.code}] ${m.name}`);
        });
        console.log('--------------------');

    } catch (error) {
        console.error('Failed to list motive types:', error);
    } finally {
        process.exit();
    }
}

listMotiveTypes();
