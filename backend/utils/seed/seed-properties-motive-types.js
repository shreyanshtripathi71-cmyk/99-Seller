/**
 * Seed Properties with Diverse Motive Type Data
 * This script populates the database with realistic property data for all 9 motive types
 */

const {
    Property,
    Proaddress,
    Owner,
    Loan,
    Auction,
    Eviction,
    Violation,
    Probate,
    Divorce,
    TaxLien,
    Trustee,
    Auctioneer,
    MotiveTypes
} = require('./models');

async function seedProperties() {
    try {
        const sequelize = Property.sequelize;

        console.log('🗑️  Clearing existing properties...');

        // Disable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });

        // Truncate tables
        await Property.truncate({ cascade: true, restartIdentity: true });
        await Proaddress.truncate({ cascade: true, restartIdentity: true });
        await Owner.truncate({ cascade: true, restartIdentity: true });
        await Loan.truncate({ cascade: true, restartIdentity: true });
        await Auction.truncate({ cascade: true, restartIdentity: true });
        await Eviction.truncate({ cascade: true, restartIdentity: true });
        await Violation.truncate({ cascade: true, restartIdentity: true });
        await Probate.truncate({ cascade: true, restartIdentity: true });
        await Divorce.truncate({ cascade: true, restartIdentity: true });
        await TaxLien.truncate({ cascade: true, restartIdentity: true });
        await Trustee.truncate({ cascade: true, restartIdentity: true });
        await Auctioneer.truncate({ cascade: true, restartIdentity: true });

        // Enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

        console.log('✅ Cleared existing data');

        // Get motive type IDs
        const motiveTypes = await MotiveTypes.findAll();
        const motiveTypeMap = {};
        motiveTypes.forEach(mt => {
            motiveTypeMap[mt.code] = mt.id;
        });

        console.log('📊 Creating properties for each motive type...\n');

        // ========================================================================
        // 1. PRE-FORECLOSURE PROPERTY
        // ========================================================================
        console.log('Creating Pre-foreclosure property...');
        const preProperty = await Property.create({
            motive_type_id: motiveTypeMap['PRE'],
            status: 'Active',
            published_on: new Date('2024-01-15')
        });

        await Proaddress.create({
            property_id: preProperty.id,
            street_addr1: '1234 Maple Street',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90001',
            county: 'Los Angeles',
            apn: 'APN-5432-1098',
            legal_desc: 'Lot 12, Block 5, Maple Grove Subdivision',
            beds: 3,
            baths: 2,
            sqft: 1850,
            lot_size: 0.25,
            year_built: 2005,
            property_type: 'Single Family',
            zoning: 'R1',
            appraised_value: 650000,
            tax_assessed_value: 625000,
            last_sale_price: 580000,
            last_sale_date: new Date('2018-06-15'),
            // Trustee embedded fields
            trusteename: 'California Trustee Services',
            trusteeaddress: '2500 Venture Oaks Way',
            trusteecity: 'Sacramento',
            trusteestate: 'CA',
            trusteezip: '95833',
            trusteephone: '(916) 555-0100',
            trusteeemail: 'info@catrustee.com',
            trusteewebsite: 'www.catrustee.com',
            trusteetype: 'Substitute Trustee'
        });

        await Owner.create({
            property_id: preProperty.id,
            OFirstName: 'Michael',
            OMiddleName: 'James',
            OLastName: 'Thompson',
            OStreetAddr1: '1234 Maple Street',
            OCity: 'Los Angeles',
            OState: 'CA',
            OZip: '90001',
            OEmail: 'michael.thompson@email.com',
            is_out_of_state: false
        });

        await Loan.create({
            property_id: preProperty.id,
            borrower_name: 'Michael J. Thompson',
            lender_name: 'Wells Fargo Bank',
            lender_address: '420 Montgomery Street, San Francisco, CA 94104',
            datetime: new Date('2018-06-15'),
            loan_amount: 520000,
            deed_id: 'DOC-2018-065432'
        });

        // ========================================================================
        // 2. FORECLOSURE PROPERTY
        // ========================================================================
        console.log('Creating Foreclosure property...');

        const auctioneer = await Auctioneer.create({
            name: 'Southwest Auction Group',
            contact_name: 'David Martinez', // Note: using name for contact if that's how it's used, or just name for company
            phone: '(602) 555-0300',
            email: 'david@southwestauction.com'
        });

        const forProperty = await Property.create({
            motive_type_id: motiveTypeMap['FOR'],
            status: 'Active',
            published_on: new Date('2024-02-01'),
            auctioneer_id: auctioneer.id
        });

        await Proaddress.create({
            property_id: forProperty.id,
            street_addr1: '5678 Oak Avenue',
            city: 'Phoenix',
            state: 'AZ',
            zip: '85001',
            county: 'Maricopa',
            apn: 'APN-8765-4321',
            legal_desc: 'Lot 8, Block 3, Oak Hills Estate',
            beds: 4,
            baths: 3,
            sqft: 2400,
            lot_size: 0.35,
            year_built: 2010,
            property_type: 'Single Family',
            zoning: 'R1',
            appraised_value: 485000,
            tax_assessed_value: 470000,
            last_sale_price: 425000,
            last_sale_date: new Date('2015-03-20'),
            // Trustee embedded fields
            trusteename: 'Arizona Foreclosure Services',
            trusteeaddress: '1850 N Central Ave',
            trusteecity: 'Phoenix',
            trusteestate: 'AZ',
            trusteezip: '85004',
            trusteephone: '(602) 555-0200',
            trusteeemail: 'contact@azforeclosure.com',
            trusteewebsite: 'www.azforeclosure.com',
            trusteetype: 'Trustee',
            // Auction embedded fields
            auctiondatetime: new Date('2024-03-15 10:00:00'),
            auction_amt: 350000,
            auctionplace: 'Maricopa County Courthouse, 201 W Jefferson St, Phoenix, AZ 85003',
            auctiondescription: 'Public foreclosure auction - property sold as-is'
        });

        await Owner.create({
            property_id: forProperty.id,
            OFirstName: 'Sarah',
            OMiddleName: 'Marie',
            OLastName: 'Rodriguez',
            OStreetAddr1: '5678 Oak Avenue',
            OCity: 'Phoenix',
            OState: 'AZ',
            OZip: '85001',
            OEmail: 'sarah.rodriguez@email.com',
            is_out_of_state: false
        });

        await Loan.create({
            property_id: forProperty.id,
            borrower_name: 'Sarah M. Rodriguez',
            lender_name: 'Bank of America',
            lender_address: '100 N Tryon St, Charlotte, NC 28255',
            datetime: new Date('2015-03-20'),
            loan_amount: 380000,
            deed_id: 'DOC-2015-032145'
        });

        await Auction.create({
            APropertyID: forProperty.id,
            AAuctionDateTime: new Date('2024-03-15 10:00:00'),
            AAuctionPlace: 'Maricopa County Courthouse, 201 W Jefferson St, Phoenix, AZ 85003',
            AAuctionDescription: 'Public foreclosure auction - property sold as-is'
        });

        // ========================================================================
        // 3. AUCTION PROPERTY
        // ========================================================================
        console.log('Creating Auction property...');

        const auctioneer2 = await Auctioneer.create({
            name: 'Texas Premier Auctions',
            contact_name: 'Jennifer Williams',
            phone: '(214) 555-0400',
            email: 'jennifer@txpremierauctions.com'
        });

        const aucProperty = await Property.create({
            motive_type_id: motiveTypeMap['AUC'],
            status: 'Active',
            published_on: new Date('2024-02-10'),
            auctioneer_id: auctioneer2.id
        });

        await Proaddress.create({
            property_id: aucProperty.id,
            street_addr1: '9012 Pine Boulevard',
            city: 'Dallas',
            state: 'TX',
            zip: '75201',
            county: 'Dallas',
            apn: 'APN-3456-7890',
            legal_desc: 'Lot 15, Block 7, Pine Valley Addition',
            beds: 3,
            baths: 2.5,
            sqft: 2100,
            lot_size: 0.28,
            year_built: 2008,
            property_type: 'Single Family',
            zoning: 'R1',
            appraised_value: 425000,
            tax_assessed_value: 410000,
            last_sale_price: 385000,
            last_sale_date: new Date('2016-08-10'),
            auctiondatetime: new Date('2024-03-20 14:00:00'),
            auction_amt: 295000,
            auctionplace: 'Dallas County Courthouse, 411 Elm St, Dallas, TX 75202',
            auctiondescription: 'Tax foreclosure auction'
        });

        await Owner.create({
            property_id: aucProperty.id,
            OFirstName: 'Robert',
            OMiddleName: 'Lee',
            OLastName: 'Johnson',
            OStreetAddr1: '9012 Pine Boulevard',
            OCity: 'Dallas',
            OState: 'TX',
            OZip: '75201',
            OEmail: 'robert.johnson@email.com',
            is_out_of_state: false
        });

        await Auction.create({
            APropertyID: aucProperty.id,
            AAuctionDateTime: new Date('2024-03-20 14:00:00'),
            AAuctionPlace: 'Dallas County Courthouse, 411 Elm St, Dallas, TX 75202',
            AAuctionDescription: 'Tax foreclosure auction'
        });
        // ========================================================================
        // 4. PROBATE PROPERTY
        // ========================================================================
        console.log('Creating Probate property...');
        const proProperty = await Property.create({
            motive_type_id: motiveTypeMap['PRO'],
            status: 'Active',
            published_on: new Date('2024-01-25')
        });

        await Proaddress.create({
            property_id: proProperty.id,
            street_addr1: '3456 Elm Street',
            city: 'Miami',
            state: 'FL',
            zip: '33101',
            county: 'Miami-Dade',
            apn: 'APN-6789-0123',
            legal_desc: 'Lot 22, Block 4, Elm Grove Estates',
            beds: 4,
            baths: 3,
            sqft: 2800,
            lot_size: 0.42,
            year_built: 2000,
            property_type: 'Single Family',
            zoning: 'R1',
            appraised_value: 725000,
            tax_assessed_value: 700000,
            last_sale_price: 625000,
            last_sale_date: new Date('2012-04-15'),
            trusteename: 'Florida Estate Services',
            trusteeaddress: '100 SE 2nd Street',
            trusteecity: 'Miami',
            trusteestate: 'FL',
            trusteezip: '33131',
            trusteephone: '(305) 555-0500',
            trusteeemail: 'info@flestateservices.com',
            trusteewebsite: 'www.flestateservices.com',
            trusteetype: 'Estate Trustee'
        });

        await Owner.create({
            property_id: proProperty.id,
            OFirstName: 'Estate',
            OMiddleName: 'of',
            OLastName: 'Margaret Anderson',
            OStreetAddr1: '3456 Elm Street',
            OCity: 'Miami',
            OState: 'FL',
            OZip: '33101',
            OEmail: 'executor@andersonestate.com',
            is_out_of_state: false
        });

        await Probate.create({
            property_id: proProperty.id,
            case_number: 'PR-2023-8765',
            probate_court: 'Miami-Dade County Probate Court',
            filing_date: new Date('2023-11-10'),
            executor_name: 'James Anderson',
            executor_contact: '(305) 555-0600',
            estate_type: 'Testate',
            estate_value: 1250000,
            status: 'Pending',
            notes: 'Estate includes primary residence and investment properties'
        });

        // ========================================================================
        // 5. CODE VIOLATION PROPERTY
        // ========================================================================
        console.log('Creating Code Violation property...');
        const codProperty = await Property.create({
            motive_type_id: motiveTypeMap['COD'],
            status: 'Active',
            published_on: new Date('2024-02-05')
        });

        await Proaddress.create({
            property_id: codProperty.id,
            street_addr1: '7890 Cedar Lane',
            city: 'Chicago',
            state: 'IL',
            zip: '60601',
            county: 'Cook',
            apn: 'APN-1357-2468',
            legal_desc: 'Lot 9, Block 2, Cedar Heights Subdivision',
            beds: 3,
            baths: 2,
            sqft: 1650,
            lot_size: 0.22,
            year_built: 1995,
            property_type: 'Single Family',
            zoning: 'R1',
            appraised_value: 385000,
            tax_assessed_value: 370000,
            last_sale_price: 340000,
            last_sale_date: new Date('2010-09-20')
        });

        await Owner.create({
            property_id: codProperty.id,
            OFirstName: 'Patricia',
            OMiddleName: 'Ann',
            OLastName: 'Davis',
            OStreetAddr1: '7890 Cedar Lane',
            OCity: 'Chicago',
            OState: 'IL',
            OZip: '60601',
            OEmail: 'patricia.davis@email.com',
            is_out_of_state: false
        });

        await Violation.create({
            property_id: codProperty.id,
            complaint: 'VIOL-2023-4567',
            issue_date: '2023-08-15',
            types: 'Building Code Violation',
            short_desc: 'Deteriorating roof structure and damaged siding',
            details: 'Property has significant exterior damage including roof deterioration, damaged siding, and overgrown vegetation. Owner has been notified multiple times.',
            current_situation: 'Open - Pending Compliance',
            compliance_status: 'Non-Compliant',
            resolution_date: null
        });

        await Violation.create({
            property_id: codProperty.id,
            complaint: 'VIOL-2023-8901',
            issue_date: '2023-10-20',
            types: 'Property Maintenance',
            short_desc: 'Overgrown yard and debris accumulation',
            details: 'Yard maintenance violation with debris and overgrown vegetation exceeding city ordinance limits.',
            current_situation: 'Open - Pending Compliance',
            compliance_status: 'Non-Compliant',
            resolution_date: null
        });

        // ========================================================================
        // 6. EVICTION PROPERTY
        // ========================================================================
        console.log('Creating Eviction property...');
        const eviProperty = await Property.create({
            motive_type_id: motiveTypeMap['EVI'],
            status: 'Active',
            published_on: new Date('2024-01-30')
        });

        await Proaddress.create({
            property_id: eviProperty.id,
            street_addr1: '2468 Birch Court',
            city: 'Atlanta',
            state: 'GA',
            zip: '30301',
            county: 'Fulton',
            apn: 'APN-9876-5432',
            legal_desc: 'Lot 5, Block 1, Birch Creek Village',
            beds: 3,
            baths: 2,
            sqft: 1750,
            lot_size: 0.26,
            year_built: 2012,
            property_type: 'Single Family',
            zoning: 'R1',
            appraised_value: 395000,
            tax_assessed_value: 380000,
            last_sale_price: 355000,
            last_sale_date: new Date('2019-05-10')
        });

        await Owner.create({
            property_id: eviProperty.id,
            OFirstName: 'Christopher',
            OMiddleName: 'David',
            OLastName: 'Miller',
            OStreetAddr1: '2468 Birch Court',
            OCity: 'Atlanta',
            OState: 'GA',
            OZip: '30301',
            OEmail: 'christopher.miller@email.com',
            is_out_of_state: false
        });

        await Eviction.create({
            property_id: eviProperty.id,
            court_date: new Date('2024-02-25'),
            court_docket: 'EV-2024-1234',
            court_room: 'Courtroom 3B',
            court_desc: 'Non-payment of rent - 4 months delinquent',
            details: 'Tenant has failed to pay rent for 4 consecutive months. Owner seeking possession and back rent totaling $8,400.'
        });

        // ========================================================================
        // 7. DIVORCE PROPERTY
        // ========================================================================
        console.log('Creating Divorce property...');
        const divProperty = await Property.create({
            motive_type_id: motiveTypeMap['DIV'],
            status: 'Active',
            published_on: new Date('2024-02-08')
        });

        await Proaddress.create({
            property_id: divProperty.id,
            street_addr1: '1357 Willow Drive',
            city: 'Seattle',
            state: 'WA',
            zip: '98101',
            county: 'King',
            apn: 'APN-2468-1357',
            legal_desc: 'Lot 18, Block 6, Willow Creek Estates',
            beds: 4,
            baths: 3.5,
            sqft: 3200,
            lot_size: 0.48,
            year_built: 2015,
            property_type: 'Single Family',
            zoning: 'R1',
            appraised_value: 895000,
            tax_assessed_value: 870000,
            last_sale_price: 785000,
            last_sale_date: new Date('2015-07-20')
        });

        await Owner.create({
            property_id: divProperty.id,
            OFirstName: 'Jennifer',
            OMiddleName: 'Lynn',
            OLastName: 'Wilson',
            OStreetAddr1: '1357 Willow Drive',
            OCity: 'Seattle',
            OState: 'WA',
            OZip: '98101',
            OEmail: 'jennifer.wilson@email.com',
            is_out_of_state: false
        });

        await Owner.create({
            property_id: divProperty.id,
            OFirstName: 'Thomas',
            OMiddleName: 'Edward',
            OLastName: 'Wilson',
            OStreetAddr1: '425 Pine Street Apt 302',
            OCity: 'Seattle',
            OState: 'WA',
            OZip: '98101',
            OEmail: 'thomas.wilson@email.com',
            is_out_of_state: false
        });

        await Divorce.create({
            property_id: divProperty.id,
            case_number: 'DIV-2023-5678',
            court_name: 'King County Superior Court',
            filing_date: new Date('2023-09-15'),
            petitioner_name: 'Jennifer Lynn Wilson',
            respondent_name: 'Thomas Edward Wilson',
            divorce_type: 'Contested',
            status: 'Pending Settlement',
            settlement_date: null,
            notes: 'Property division in negotiation. Both parties seeking to sell marital home and split proceeds.'
        });

        // ========================================================================
        // 8. UNPAID TAXES PROPERTY
        // ========================================================================
        console.log('Creating Unpaid Taxes property...');
        const taxProperty = await Property.create({
            motive_type_id: motiveTypeMap['TAX'],
            status: 'Active',
            published_on: new Date('2024-01-20')
        });

        await Proaddress.create({
            property_id: taxProperty.id,
            street_addr1: '8642 Spruce Avenue',
            city: 'Detroit',
            state: 'MI',
            zip: '48201',
            county: 'Wayne',
            apn: 'APN-7531-9642',
            legal_desc: 'Lot 11, Block 8, Spruce Hill Addition',
            beds: 3,
            baths: 1.5,
            sqft: 1450,
            lot_size: 0.20,
            year_built: 1985,
            property_type: 'Single Family',
            zoning: 'R1',
            appraised_value: 185000,
            tax_assessed_value: 175000,
            last_sale_price: 165000,
            last_sale_date: new Date('2008-11-05')
        });

        await Owner.create({
            property_id: taxProperty.id,
            OFirstName: 'Daniel',
            OMiddleName: 'Ray',
            OLastName: 'Brown',
            OStreetAddr1: '8642 Spruce Avenue',
            OCity: 'Detroit',
            OState: 'MI',
            OZip: '48201',
            OEmail: 'daniel.brown@email.com',
            is_out_of_state: false
        });

        await TaxLien.create({
            property_id: taxProperty.id,
            tax_year: '2021',
            amount_owed: 8500,
            lien_date: new Date('2022-03-15'),
            tax_authority: 'Wayne County Treasurer',
            lien_number: 'TL-2022-3456',
            status: 'Active',
            sale_date: new Date('2024-04-10'),
            redemption_period_end: new Date('2025-04-10'),
            notes: 'Property subject to tax foreclosure if not redeemed by April 10, 2025'
        });

        await TaxLien.create({
            property_id: taxProperty.id,
            tax_year: '2022',
            amount_owed: 9200,
            lien_date: new Date('2023-03-20'),
            tax_authority: 'Wayne County Treasurer',
            lien_number: 'TL-2023-7890',
            status: 'Active',
            sale_date: null,
            redemption_period_end: null,
            notes: 'Additional year of unpaid taxes'
        });

        // ========================================================================
        // 9. OUT OF STATE PROPERTY
        // ========================================================================
        console.log('Creating Out of State property...');
        const outProperty = await Property.create({
            motive_type_id: motiveTypeMap['OUT'],
            status: 'Active',
            published_on: new Date('2024-02-12')
        });

        await Proaddress.create({
            property_id: outProperty.id,
            street_addr1: '9753 Redwood Circle',
            city: 'Portland',
            state: 'OR',
            zip: '97201',
            county: 'Multnomah',
            apn: 'APN-8520-7413',
            legal_desc: 'Lot 7, Block 3, Redwood Heights',
            beds: 3,
            baths: 2,
            sqft: 1900,
            lot_size: 0.30,
            year_built: 2007,
            property_type: 'Single Family',
            zoning: 'R1',
            appraised_value: 565000,
            tax_assessed_value: 550000,
            last_sale_price: 495000,
            last_sale_date: new Date('2014-02-28')
        });

        await Owner.create({
            property_id: outProperty.id,
            OFirstName: 'Elizabeth',
            OMiddleName: 'Grace',
            OLastName: 'Taylor',
            OStreetAddr1: '1500 Ocean Drive',
            OCity: 'Miami Beach',
            OState: 'FL',
            OZip: '33139',
            OEmail: 'elizabeth.taylor@email.com',
            is_out_of_state: true
        });

        console.log('\n✅ Successfully seeded 9 properties with diverse motive type data!');
        console.log('\nProperty Summary:');
        console.log('1. Pre-foreclosure - 1234 Maple Street, Los Angeles, CA');
        console.log('2. Foreclosure - 5678 Oak Avenue, Phoenix, AZ');
        console.log('3. Auction - 9012 Pine Boulevard, Dallas, TX');
        console.log('4. Probate - 3456 Elm Street, Miami, FL');
        console.log('5. Code Violation - 7890 Cedar Lane, Chicago, IL');
        console.log('6. Eviction - 2468 Birch Court, Atlanta, GA');
        console.log('7. Divorce - 1357 Willow Drive, Seattle, WA');
        console.log('8. Unpaid Taxes - 8642 Spruce Avenue, Detroit, MI');
        console.log('9. Out of State - 9753 Redwood Circle, Portland, OR');

    } catch (error) {
        console.error('❌ Error seeding properties:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedProperties()
        .then(() => {
            console.log('\n🎉 Seeding complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = seedProperties;
