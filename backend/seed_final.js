const { Property, Proaddress, PropertyTrustDeed, Loan } = require('./models');

async function seed() {
    try {
        console.log('Seeding Property ID 4 with ABSOLUTELY EVERYTHING (Resilient Version)...');

        const p = await Property.findByPk(4);
        if (!p) {
            console.error('Property 4 not found');
            process.exit(1);
        }

        const proaddr = await Proaddress.findByPk(p.proaddress_id);
        if (!proaddr) {
            console.error('Proaddress not found');
            process.exit(1);
        }

        // 1. Trust Deed
        let deed;
        if (proaddr.property_trust_deed_id) {
            deed = await PropertyTrustDeed.findByPk(proaddr.property_trust_deed_id);
        }

        const deedData = {
            deed_id: 'TD-GOLD-888',
            lender_name: 'SUPREME FEDERAL BANK',
            trustee_name: 'RICHARD ROE',
            trustee_address: '123 LEGAL PLAZA, SUITE 500',
            loan_amount: '525000',
            datetime: new Date('2023-11-15'),
            local_document_path: 'deed_4.pdf'
        };

        if (deed) {
            await deed.update(deedData);
        } else {
            deed = await PropertyTrustDeed.create(deedData);
            await proaddr.update({ property_trust_deed_id: deed.id });
        }

        // 2. Proaddress with Every Possible Field
        await proaddr.update({
            // Owner
            PcompayName: 'GOLDEN INVESTMENTS LLC',
            owner_email: 'ceo@goldeninvest.com',
            owner_phone: '2125550001',
            owner_current_state: 'Florida',
            owner_mailing_address: '500 OCEAN DRIVE, MIAMI, FL 33139',
            // Trustee
            trusteename: 'RICHARD ROE',
            trusteecompanyname: 'ROE & ASSOCIATES',
            trusteeaddress: '123 LEGAL PLAZA, SUITE 500',
            trusteecity: 'NEW YORK',
            trusteestate: 'NY',
            trusteezip: 10001,
            trusteephone: '2125551234',
            trusteeemail: 'contact@roelaw.com',
            trusteewebsite: 'www.roelaw.com',
            trusteetype: 'Substitute Trustee',
            // Auction
            auction_amt: '415000',
            auctiondatetime: new Date('2026-04-12T10:30:00'),
            auctionplace: 'COUNTY COURTHOUSE STEPS',
            auctionplaceaddr1: '100 MAIN STREET',
            auctionplaceaddr2: 'SOUTH ENTRANCE',
            auctioncity: 'NEW YORK',
            auctionstate: 'NY',
            auctionzip: 10001,
            sale_time: '10:30 AM',
            auctiondescription: 'Mandatory $10,000 cash deposit required at time of sale. Balance due within 30 days.',
            // Auctioneer
            auctioneername: 'MIKE SMITH',
            auctioneercompanyname: 'ELITE AUCTION SERVICES',
            auctioneeraddress: '99 GAVEL STREET, NEW YORK, NY 10002',
            auctioneerphone: '2125559999',
            auctioneeremail: 'mike@eliteauctions.com',
            auctioneerweb_site: 'www.eliteauctions.com',
            // Extra
            case_number: '2024-CV-123456',
            deed_book_page: 'B120 / P450'
        });

        // 3. Loan
        let loan = await Loan.findOne({ where: { property_id: 4 } });
        const loanData = {
            property_id: 4,
            lender_name: 'SUPREME FEDERAL BANK',
            loan_amount: 525000,
            total_default_amount: 58400.25,
            foreclosure_stage: 'Auction Scheduled',
            lis_pendens_date: new Date('2024-01-20'),
            arrears_amount: 18450.00,
            default_status: 'Default'
        };
        if (loan) {
            await loan.update(loanData);
        } else {
            await Loan.create(loanData);
        }

        console.log('Successfully seeded ABSOLUTELY EVERYTHING for property 4.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
