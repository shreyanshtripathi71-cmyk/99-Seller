/**
 * Seed Max Detail Script (Final Mandatory)
 * This script populates properties with every possible field to showcase the enhanced UI.
 */
const {
    Property,
    Proaddress,
    MotiveTypes,
    Loan,
    PropertyTrustDeed,
    Owner
} = require('./models');

async function seedMaxDetail() {
    try {
        console.log('🚀 Starting Final Mandatory Max Detail Seeding...');

        // 1. Get Motive Types
        const foreclosureMotive = await MotiveTypes.findOne({ where: { code: 'FOR' } });
        const preforeclosureMotive = await MotiveTypes.findOne({ where: { code: 'PRE' } });

        if (!foreclosureMotive || !preforeclosureMotive) {
            console.error('❌ Motive types not found.');
            process.exit(1);
        }

        // --- FORECLOSURE CASE (MAX DETAIL) ---
        console.log('📦 Creating Max Detail Foreclosure Proaddress...');
        const forProaddr = await Proaddress.create({
            listing_id: 'MLS-FOR-90210-ENHANCED',
            PStreetNum: '100',
            PStreetName: 'ELITE FORECLOSURE WAY',
            Pcity: 'Beverly Hills',
            PState: 'CA',
            Pzip: '90210',
            owner_name: 'RICHARD RICHARDS',
            PMotiveType: 'FOR',
            price: 5500000.0,
            beds: '6',
            baths: '7',
            square_feet: 8500,
            PYearBuilt: '2018',
            floors: 3.0,
            garage_size: 4.0,
            lot_size: '1.5 Acres',
            school_district: 'Beverly Hills Unified',
            amenities: 'Infinity Pool, Home Theater, Wine Cellar, Smart Home System',
            comments: 'Stunning modern estate in pre-auction phase.',
            case_number: 'FOR-2026-9999',
            deed_book_page: 'B2500 / P125',
            trusteename: 'LAWRENCE LEGAL',
            trusteecompanyname: 'PREMIUM TRUSTEE SERVICES INC',
            trusteeaddress: '500 CORPORATE PLAZA, SUITE 100',
            trusteecity: 'Los Angeles',
            trusteestate: 'CA',
            trusteezip: 90001,
            trusteephone: '5550109999',
            trusteeemail: 'contact@premiumtrustee.com',
            trusteewebsite: 'www.premiumtrustee.com',
            trusteetype: 'Corporate Trustee',
            auction_amt: '3200000',
            auctiondatetime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            auctionplace: 'Los Angeles County Courthouse',
            auctionplaceaddr1: '111 N HILL ST',
            auctioncity: 'Los Angeles',
            auctionstate: 'CA',
            auctionzip: 90012,
            auctiondescription: 'Front steps entrance.',
            auctioneername: 'VICTOR VICTORY',
            auctioneercompanyname: 'ELITE AUCTIONEERS GROUP',
            auctioneerphone: '5550208888',
            sale_time: '10:30:00'
        });

        console.log('📦 Creating Max Detail Foreclosure Property...');
        const forProp = await Property.create({
            PStreetAddr1: '100 ELITE FORECLOSURE WAY',
            Pcity: 'Beverly Hills',
            Pstate: 'CA',
            Pzip: '90210',
            Pcounty: 'Los Angeles',
            PBase: '3S',
            PBeds: '6',
            PBaths: '7',
            PType: 'Single Family Residential',
            PLastSoldAmt: '4200000',
            PLastSoldDate: '2015-05-20',
            PTotLandArea: '65,340 sqft',
            PTotBuildingArea: '8,500 sqft',
            PTotSQFootage: '8500',
            PYearBuilt: '2018',
            PAppraisedBuildingAmt: '4500000',
            PAppraisedLandAmt: '1000000',
            PTotAppraisedAmt: '5500000',
            motive_type_id: foreclosureMotive.id,
            proaddress_id: forProaddr.id,
            PComments: 'High-end distressed asset.',
            PDateFiled: new Date()
        });

        await Loan.bulkCreate([
            {
                property_id: forProp.id,
                deed_id: 'DOC-2018-001',
                borrower_name: 'RICHARD RICHARDS',
                lender_name: 'CHASE PRIVATE CLIENT',
                lender_address: '1 CHASE MANHATTAN PLAZA, NY',
                datetime: '2018-01-10',
                loan_amount: '3500000',
                total_default_amount: '150000',
                foreclosure_stage: 'Auction Scheduled',
                lis_pendens_date: '2025-11-05',
                default_status: 'Default'
            }
        ]);

        // --- PRE-FORECLOSURE CASE (MAX DETAIL) ---
        console.log('📦 Creating Max Detail Pre-foreclosure Proaddress...');
        const preProaddr = await Proaddress.create({
            listing_id: 'MLS-PRE-33139-ENHANCED',
            PStreetNum: '250',
            PStreetName: 'BARGAIN LIS PENDENS AVE',
            Pcity: 'Miami',
            PState: 'FL',
            Pzip: '33139',
            owner_name: 'MARIA MARTINEZ',
            PMotiveType: 'PRE',
            price: 1200000.0,
            beds: '4',
            baths: '3',
            square_feet: 3200,
            PYearBuilt: '2005',
            floors: 2.0,
            garage_size: 2.0,
            lot_size: '0.25 Acres',
            school_district: 'Miami-Dade Public Schools',
            amenities: 'Remodeled Kitchen, Screened Patio',
            comments: 'Early stage pre-foreclosure.',
            case_number: 'LP-2026-F678',
            deed_book_page: 'OR-12345 / PG-678',
            trusteename: 'FLORIDA FORECLOSURE FIRM',
            trusteecompanyname: 'GARCIA & ASSOCIATES LEGAL',
            trusteeaddress: '100 SE 2ND ST, MIAMI, FL',
            trusteecity: 'Miami',
            trusteestate: 'FL',
            trusteezip: 33131,
            trusteephone: '3055551212',
            trusteeemail: 'service@garcialaw.com',
            trusteetype: 'Legal Representative'
        });

        console.log('📦 Creating Max Detail Pre-foreclosure Property...');
        const preProp = await Property.create({
            PStreetAddr1: '250 BARGAIN LIS PENDENS AVE',
            Pcity: 'Miami',
            Pstate: 'FL',
            Pzip: '33139',
            Pcounty: 'Miami-Dade',
            PBase: '2S',
            PBeds: '4',
            PBaths: '3',
            PType: 'Single Family Residential',
            PLastSoldAmt: '750000',
            PLastSoldDate: '2012-11-12',
            PTotLandArea: '10,890 sqft',
            PTotBuildingArea: '3,200 sqft',
            PTotSQFootage: '3200',
            PYearBuilt: '2005',
            PAppraisedBuildingAmt: '900000',
            PAppraisedLandAmt: '300000',
            PTotAppraisedAmt: '1200000',
            motive_type_id: preforeclosureMotive.id,
            proaddress_id: preProaddr.id,
            PComments: 'Solid investment in Miami Beach.',
            PDateFiled: new Date()
        });

        await Loan.create({
            property_id: preProp.id,
            deed_id: 'MTG-FL-PRE01',
            borrower_name: 'MARIA MARTINEZ',
            lender_name: 'WELLS FARGO HOME MORTGAGE',
            lender_address: 'P.O. BOX 10335, DES MOINES, IA',
            datetime: '2005-08-01',
            loan_amount: '850000',
            total_default_amount: '45000',
            foreclosure_stage: 'Notice of Default Filed',
            lis_pendens_date: '2026-01-15',
            arrears_amount: '12000',
            default_status: 'Delinquent'
        });

        console.log('✅ Max Detail Seeding Completed Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        if (error.errors) {
            error.errors.forEach(e => console.error(` - ${e.message}`));
        }
        process.exit(1);
    }
}

seedMaxDetail();
