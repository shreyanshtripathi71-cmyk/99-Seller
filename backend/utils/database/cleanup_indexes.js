
const { sequelize } = require('./models');

async function cleanupIndexes() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        const [indexes] = await sequelize.query("SHOW INDEX FROM site_contents");
        console.log(`Found ${indexes.length} index entries.`);

        const keyIndexes = indexes.filter(idx => idx.Column_name === 'key' && idx.Key_name !== 'PRIMARY');
        // Group by Key_name because one index can have multiple rows (for composite indexes, but here key is single column)
        const uniqueIndexNames = [...new Set(keyIndexes.map(idx => idx.Key_name))];

        console.log(`Found ${uniqueIndexNames.length} indexes on 'key' column:`, uniqueIndexNames);

        if (uniqueIndexNames.length > 1 || (uniqueIndexNames.length === 1 && uniqueIndexNames[0] !== 'key')) {
            console.log('Dropping excessive indexes...');
            for (const indexName of uniqueIndexNames) {
                console.log(`Dropping index: ${indexName}`);
                try {
                    await sequelize.query(`DROP INDEX \`${indexName}\` ON site_contents`);
                } catch (err) {
                    console.error(`Failed to drop ${indexName}:`, err.message);
                }
            }
            console.log('Indexes dropped. Sync will recreate necessary one.');
        } else {
            console.log('No excessive indexes found or already clean.');
        }

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await sequelize.close();
    }
}

cleanupIndexes();
