const { sequelize } = require('./models');

async function seed() {
    try {
        console.log('Seeding Property 4 via FIXED RAW SQL...');

        // 1. Update Proaddress
        await sequelize.query(`
            UPDATE proaddress SET 
                listing_id = 'LIST-4141',
                PcompayName = 'GOLDEN INVESTMENTS LLC',
                owner_email = 'ceo@goldeninvest.com',
                owner_phone = '2125550001',
                owner_current_state = 'Florida',
                owner_mailing_address = '500 OCEAN DRIVE, MIAMI, FL 33139',
                trusteename = 'RICHARD ROE',
                trusteecompanyname = 'ROE & ASSOCIATES',
                trusteeaddress = '123 LEGAL PLAZA, SUITE 500',
                trusteecity = 'NEW YORK',
                trusteestate = 'NY',
                trusteezip = 10001,
                trusteephone = '2125551234',
                trusteeemail = 'contact@roelaw.com',
                trusteewebsite = 'www.roelaw.com',
                trusteetype = 'Substitute Trustee',
                auction_amt = '415000',
                auctiondatetime = '2026-04-12 10:30:00',
                auctionplace = 'COUNTY COURTHOUSE STEPS',
                auctionplaceaddr1 = '100 MAIN STREET',
                auctioncity = 'NEW YORK',
                auctionstate = 'NY',
                auctionzip = 10001,
                sale_time = '10:30 AM',
                auctiondescription = 'Mandatory $10,000 cash deposit required at time of sale. Balance due within 30 days.',
                auctioneername = 'MIKE SMITH',
                auctioneercompanyname = 'ELITE AUCTION SERVICES',
                auctioneeraddress = '99 GAVEL STREET, NEW YORK, NY 10002',
                auctioneerphone = '2125559999',
                auctioneeremail = 'mike@eliteauctions.com',
                auctioneerweb_site = 'www.eliteauctions.com',
                case_number = '2024-CV-123456'
            WHERE id = 41
        `);

        // 2. Update Loan
        await sequelize.query(`
            UPDATE loan SET 
                loan_amount = 525000,
                total_default_amount = 58400.25,
                foreclosure_stage = 'Auction Scheduled',
                lis_pendens_date = '2024-01-20',
                arrears_amount = 18450.00,
                default_status = 'Default'
            WHERE property_id = 4
        `);

        console.log('SQL Seed Complete.');
        process.exit(0);
    } catch (err) {
        console.error('SQL Seed error:', err.message);
        process.exit(1);
    }
}
seed();
