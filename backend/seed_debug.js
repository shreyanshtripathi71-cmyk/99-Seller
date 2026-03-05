const { Proaddress } = require('./models');

async function seed() {
    try {
        const id = 41; // Property 4's proaddress_id is usually 41 if I remember or let's find it
        const pro = await Proaddress.findOne({ where: { id: 41 } }); // Let's try 41 based on previous runs or just query by property 4

        const fields = [
            'PcompayName', 'owner_email', 'owner_phone', 'owner_current_state',
            'trusteename', 'trusteecompanyname', 'trusteeaddress', 'trusteecity',
            'trusteestate', 'trusteezip', 'trusteephone', 'trusteeemail',
            'trusteewebsite', 'trusteetype', 'auction_amt', 'auctionplace',
            'auctionplaceaddr1', 'auctioncity', 'auctionstate', 'auctionzip',
            'auctioneername', 'auctioneercompanyname', 'auctioneeraddress',
            'auctioneerphone', 'auctioneeremail', 'auctioneerweb_site', 'case_number'
        ];

        for (const field of fields) {
            try {
                await Proaddress.update({ [field]: 'TEST' }, { where: { id: 41 } });
                console.log(`OK: ${field}`);
            } catch (err) {
                console.error(`FAIL: ${field} - ${err.message}`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Fatal:', err);
        process.exit(1);
    }
}
seed();
