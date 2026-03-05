const { Property, Proaddress, Owner, Loan, Auction, PropertyTrustDeed, Trustee, Auctioneer, MotiveTypes, sequelize } = require('./models');

async function seedForeclosures() {
    const transaction = await sequelize.transaction();
    try {
        console.log('Starting custom seeding for Foreclosure properties...');

        // 1. Foreclosure WITH Auction
        const prop1 = await Property.create({
            PStreetAddr1: '123 Auction Lane',
            Pcity: 'Alpharetta',
            Pstate: 'GA',
            Pzip: '30004',
            Pcounty: 'Fulton',
            PBeds: '4',
            PBaths: '3.5',
            PTotSQFootage: '3200',
            PYearBuilt: '2015',
            PTotAppraisedAmt: '550000',
            PAppraisedBuildingAmt: '400000',
            PAppraisedLandAmt: '150000',
            PTotLandArea: '0.25 Acres',
            PTotBuildingArea: '3200',
            PLastSalePrice: '425000',
            PLastSaleDate: '2018-05-12',
            motive_type_id: 1, // FOR
            PDateFiled: new Date()
        }, { transaction });

        const proaddr1 = await Proaddress.create({
            property_id: prop1.id,
            PStreetNum: '123',
            PStreetName: 'Auction Lane',
            Pcity: 'Alpharetta',
            PState: 'GA',
            Pzip: '30004',
            owner_name: 'Alice Owner',
            price: 525000,
            sale_date: '2024-03-20',
            sale_time: '10:00:00',
            case_number: '2024-CV-123456',
            deed_book_page: 'B552/P123',
            beds: '4',
            baths: '3.5',
            square_feet: 3200,
            floors: 2,
            proptype: 'Single Family',
            lot_size: '0.25',
            garage_size: 2,
            school_district: 'Fulton County Schools',
            amenities: 'Pool, Granite Countertops, Hardwood Floors',
            comments: 'Great investment opportunity with scheduled auction.',
            trusteename: 'Legal Eagles LLP',
            trusteeaddress: '500 Law Way',
            trusteecity: 'Atlanta',
            trusteestate: 'GA',
            trusteezip: 30301,
            trusteephone: '4045550101',
            trusteeemail: 'trustee@legaleagles.com',
            trusteewebsite: 'www.legaleagles.com',
            trusteetype: 'Law Firm',
            auction_amt: '350000',
            auctiondatetime: '2024-04-15 11:00:00',
            auctionplace: 'Fulton County Courthouse Steps',
            auctiondescription: 'Public auction on the front steps.',
            auctioneername: 'John Gavel',
            auctioneercompanyname: 'Gavel Auctions Inc',
            auctioneerphone: '4045550102',
            owner_phone: '4045550103'
        }, { transaction });

        // Update Property with proaddress_id
        await prop1.update({ proaddress_id: proaddr1.id }, { transaction });

        await Owner.create({
            OProperty_id: prop1.id,
            OFirstName: 'Alice',
            OLastName: 'Owner',
            OCellPhone: '4045550103',
            email: 'alice@example.com',
            OStreetAddr1: '123 Auction Lane', // Living at property
            OCity: 'Alpharetta',
            OState: 'GA',
            OZip: '30004',
            is_out_of_state: false
        }, { transaction });

        await Loan.create({
            property_id: prop1.id,
            borrower_name: 'Alice Owner',
            lender_name: 'Big Bank USA',
            lender_address: '100 Finance St, New York, NY 10001',
            loan_amount: '400000',
            total_default_amount: '45000',
            arrears_amount: '12000',
            foreclosure_stage: 'Auction',
            default_status: 'Defaulted',
            lis_pendens_date: '2023-11-10',
            datetime: '2018-05-12'
        }, { transaction });

        await Auction.create({
            APropertyID: prop1.id,
            AAuctionDateTime: new Date('2024-04-15 11:00:00'),
            AAuctionPlace: 'Fulton County Courthouse Steps',
            minimum_bid: 350000.00,
            AAuctionDescription: 'Public auction for default on first deed of trust.'
        }, { transaction });

        // 2. Foreclosure WITHOUT Auction (Early Stage, Out of State Owner)
        const prop2 = await Property.create({
            PStreetAddr1: '789 Quiet Blvd',
            Pcity: 'Roswell',
            Pstate: 'GA',
            Pzip: '30075',
            Pcounty: 'Fulton',
            PBeds: '3',
            PBaths: '2.5',
            PTotSQFootage: '2400',
            PYearBuilt: '2010',
            PTotAppraisedAmt: '480000',
            motive_type_id: 1, // FOR
            PDateFiled: new Date()
        }, { transaction });

        const proaddr2 = await Proaddress.create({
            property_id: prop2.id,
            PStreetNum: '789',
            PStreetName: 'Quiet Blvd',
            Pcity: 'Roswell',
            PState: 'GA',
            Pzip: '30075',
            owner_name: 'Bob Absentee',
            price: 500000,
            beds: '3',
            baths: '2.5',
            square_feet: 2400,
            sale_date: '2024-03-25',
            case_number: '2024-CV-999888',
            proptype: 'Townhouse',
            owner_phone: '2125550999',
            owner_mailing_address: '100 Manhattan Plaza, New York, NY 10001',
            owner_current_state: 'NY'
        }, { transaction });

        await prop2.update({ proaddress_id: proaddr2.id }, { transaction });

        await Owner.create({
            OProperty_id: prop2.id,
            OFirstName: 'Bob',
            OLastName: 'Absentee',
            email: 'bob@example.com',
            OStreetAddr1: '100 Manhattan Plaza',
            OCity: 'New York',
            OState: 'NY',
            OZip: '10001',
            is_out_of_state: true
        }, { transaction });

        await Loan.create({
            property_id: prop2.id,
            borrower_name: 'Bob Absentee',
            lender_name: 'Global Lending',
            loan_amount: '350000',
            total_default_amount: '15000',
            foreclosure_stage: 'Lis Pendens',
            default_status: 'Pre-Auction',
            lis_pendens_date: '2024-01-15'
        }, { transaction });

        // Specific Trust Deed info for Section 4
        // Note: property_id in this table is a string
        await PropertyTrustDeed.create({
            deed_id: 'TD-999',
            county: 'Fulton',
            property_address: '789 Quiet Blvd, Roswell, GA 30075',
            owner_name: 'Bob Absentee',
            borrower_name: 'Bob Absentee',
            lender_name: 'Global Lending',
            lender_address: 'Finance Tower, London',
            trustee_name: 'London Trustee Group',
            trustee_address: '10 Baker St, London',
            property_id: prop2.id.toString(),
            datetime: '2024-01-15',
            loan_amount: '350000'
        }, { transaction });

        await transaction.commit();
        console.log('Seeding completed successfully!');
    } catch (error) {
        await transaction.rollback();
        console.error('Seeding failed:', error);
    } finally {
        process.exit();
    }
}

seedForeclosures();
