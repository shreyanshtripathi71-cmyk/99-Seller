const {
    sequelize,
    Property,
    Proaddress,
    Owner,
    Loan,
    Auction,
    Probate,
    Divorce,
    TaxLien,
    Eviction,
    Violation,
    AdminActivity,
    SavedProperty,
    SavedSearch,
    Invoice,
    Feedback,
    Poppin,
    ExportHistory,
    CrawlerRun,
    CrawlerLogAll,
    Errors,
    ErroneousLinks,
    FilesUrls,
    PagesUrls,
    SiteContent
} = require('../models');

async function clearDatabase() {
    console.log('[CLEANUP] Starting database cleanup...');

    try {
        // Disable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('[CLEANUP] Foreign key checks disabled.');

        const modelsToClear = [
            { name: 'Property', model: Property },
            { name: 'Proaddress', model: Proaddress },
            { name: 'Owner', model: Owner },
            { name: 'Loan', model: Loan },
            { name: 'Auction', model: Auction },
            { name: 'Probate', model: Probate },
            { name: 'Divorce', model: Divorce },
            { name: 'TaxLien', model: TaxLien },
            { name: 'Eviction', model: Eviction },
            { name: 'Violation', model: Violation },
            { name: 'AdminActivity', model: AdminActivity },
            { name: 'SavedProperty', model: SavedProperty },
            { name: 'SavedSearch', model: SavedSearch },
            { name: 'Invoice', model: Invoice },
            { name: 'Feedback', model: Feedback },
            { name: 'Poppin', model: Poppin },
            { name: 'ExportHistory', model: ExportHistory },
            { name: 'CrawlerRun', model: CrawlerRun },
            { name: 'CrawlerLogAll', model: CrawlerLogAll },
            { name: 'Errors', model: Errors },
            { name: 'ErroneousLinks', model: ErroneousLinks },
            { name: 'FilesUrls', model: FilesUrls },
            { name: 'PagesUrls', model: PagesUrls }
        ];

        for (const { name, model } of modelsToClear) {
            if (model) {
                console.log(`[CLEANUP] Clearing table: ${name}...`);
                await model.destroy({ where: {}, truncate: true, cascade: false });
            } else {
                console.warn(`[CLEANUP] Warning: Model ${name} not found.`);
            }
        }

        // Specifically handle SiteContent if needed, though user said "all properties loans etc etc"
        // Usually SiteContent is structural, but truncate if it's dynamic
        // console.log('[CLEANUP] Clearing SiteContent...');
        // await SiteContent.destroy({ where: {}, truncate: true });

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('[CLEANUP] Foreign key checks re-enabled.');

        console.log('========================================');
        console.log('CLEANUP COMPLETED SUCCESSFULLY');
        console.log('Users and core configurations preserved.');
        console.log('========================================');

    } catch (error) {
        console.error('[CLEANUP] Error during cleanup:', error);
        // Ensure keys are back on even on error
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

clearDatabase();
