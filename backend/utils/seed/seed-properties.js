const {
    Property,
    Owner,
    Loan,
    Auction,
    Probate,
    Divorce,
    TaxLien,
    Eviction,
    Violation,
    MotiveTypes,
    sequelize
} = require('./models');

async function seedMotiveTypeProperties() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Clear existing properties and related data
        console.log('\n🗑️  Clearing existing properties...');
        // Delete in order to respect foreign keys
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await Auction.destroy({ where: {}, force: true });
        await Probate.destroy({ where: {}, force: true });
        await Divorce.destroy({ where: {}, force: true });
        await TaxLien.destroy({ where: {}, force: true });
        await Eviction.destroy({ where: {}, force: true });
        await Violation.destroy({ where: {}, force: true });
        await Loan.destroy({ where: {}, force: true });
        await Owner.destroy({ where: {}, force: true });
        await Property.destroy({ where: {}, force: true });
        await sequelize.query('DELETE FROM saved_properties');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✓ Existing properties cleared');

        // Get all motive types
        const motiveTypes = await MotiveTypes.findAll();
        console.log(`\n✓ Found ${motiveTypes.length} motive types`);

        const motiveMap = {};
        motiveTypes.forEach(mt => {
            motiveMap[mt.code] = mt.id;
        });

        console.log('\n📝 Seeding properties for each motive type...\n');

        let successCount = 0;

        // 1. PREFORECLOSURE
        try {
            if (motiveMap['PRE']) {
                const prop1 = await Property.create({
                    PStreetAddr1: '142 Maple Street',
                    Pcity: 'Portland',
                    Pstate: 'OR',
                    Pzip: '97201',
                    Pcounty: 'Multnomah',
                    PType: 'Single Family',
                    PBeds: '3',
                    PBaths: '2',
                    PTotSQFootage: '1850',
                    PYearBuilt: '2005',
                    PTotAppraisedAmt: '475000',
                    PComments: 'Preforeclosure - Owner behind on payments',
                    motive_type_id: motiveMap['PRE']
                });

                await Owner.create({
                    OFirstName: 'Sarah',
                    OLastName: 'Johnson',
                    OStreetAddr1: '142 Maple Street',
                    OCity: 'Portland',
                    OState: 'OR',
                    OZip: '97201',
                    OProperty_id: prop1.id
                });

                await Loan.create({
                    property_id: prop1.id,
                    borrower_name: 'Sarah Johnson',
                    lender_name: 'Wells Fargo Bank',
                    loan_amount: 380000,
                    loan_date: '2020-03-15'
                });

                console.log('✓ Created Preforeclosure property (ID: ' + prop1.id + ')');
                successCount++;
            }
        } catch (err) {
            console.error('❌ Error creating Preforeclosure:', err.message);
        }

        // 2. FORECLOSURE
        try {
            if (motiveMap['FOR']) {
                const prop2 = await Property.create({
                    PStreetAddr1: '789 Ocean View Drive',
                    Pcity: 'Santa Monica',
                    Pstate: 'CA',
                    Pzip: '90401',
                    Pcounty: 'Los Angeles',
                    PType: 'Condo',
                    PBeds: '2',
                    PBaths: '2',
                    PTotSQFootage: '1200',
                    PYearBuilt: '2015',
                    PTotAppraisedAmt: '850000',
                    PComments: 'Active foreclosure proceeding',
                    motive_type_id: motiveMap['FOR']
                });

                await Owner.create({
                    OFirstName: 'Michael',
                    OLastName: 'Chen',
                    OStreetAddr1: '789 Ocean View Drive',
                    OCity: 'Santa Monica',
                    OState: 'CA',
                    OZip: '90401',
                    OProperty_id: prop2.id
                });

                await Loan.create({
                    property_id: prop2.id,
                    borrower_name: 'Michael Chen',
                    lender_name: 'Bank of America',
                    loan_amount: 680000,
                    loan_date: '2018-06-20'
                });

                const auctionDate = new Date();
                auctionDate.setDate(auctionDate.getDate() + 30);
                await Auction.create({
                    AAuctionDateTime: auctionDate,
                    AAuctionPlace: 'Los Angeles County Courthouse',
                    AAuctionCity: 'Los Angeles',
                    AAuctionState: 'CA',
                    AAuctionDescription: 'Foreclosure auction - Min bid $700,000',
                    ABid: 700000,
                    APropertyID: prop2.id
                });

                console.log('✓ Created Foreclosure property (ID: ' + prop2.id + ')');
                successCount++;
            }
        } catch (err) {
            console.error('❌ Error creating Foreclosure:', err.message);
        }

        // 3. AUCTION
        try {
            if (motiveMap['AUC']) {
                const prop3 = await Property.create({
                    PStreetAddr1: '456 Mountain Road',
                    Pcity: 'Denver',
                    Pstate: 'CO',
                    Pzip: '80202',
                    Pcounty: 'Denver',
                    PType: 'Single Family',
                    PBeds: '4',
                    PBaths: '3',
                    PTotSQFootage: '2400',
                    PYearBuilt: '2010',
                    PTotAppraisedAmt: '625000',
                    PComments: 'Scheduled for auction this month',
                    motive_type_id: motiveMap['AUC']
                });

                await Owner.create({
                    OFirstName: 'Jennifer',
                    OLastName: 'Martinez',
                    OStreetAddr1: '456 Mountain Road',
                    OCity: 'Denver',
                    OState: 'CO',
                    OZip: '80202',
                    OProperty_id: prop3.id
                });

                const auctionDate2 = new Date();
                auctionDate2.setDate(auctionDate2.getDate() + 10);
                await Auction.create({
                    AAuctionDateTime: auctionDate2,
                    AAuctionPlace: 'Denver County Courthouse Steps',
                    AAuctionCity: 'Denver',
                    AAuctionState: 'CO',
                    AAuctionDescription: 'Public auction - Cash only',
                    ABid: 500000,
                    APropertyID: prop3.id
                });

                console.log('✓ Created Auction property (ID: ' + prop3.id + ')');
                successCount++;
            }
        } catch (err) {
            console.error('❌ Error creating Auction:', err.message);
        }

        // 4. PROBATE
        try {
            if (motiveMap['PRO']) {
                const prop4 = await Property.create({
                    PStreetAddr1: '234 Heritage Lane',
                    Pcity: 'Charleston',
                    Pstate: 'SC',
                    Pzip: '29401',
                    Pcounty: 'Charleston',
                    PType: 'Historical Home',
                    PBeds: '3',
                    PBaths: '2',
                    PTotSQFootage: '2100',
                    PYearBuilt: '1920',
                    PTotAppraisedAmt: '725000',
                    PComments: 'Estate sale - Probate proceeding',
                    motive_type_id: motiveMap['PRO']
                });

                await Owner.create({
                    OFirstName: 'James',
                    OLastName: 'Williams',
                    OStreetAddr1: '234 Heritage Lane',
                    OCity: 'Charleston',
                    OState: 'SC',
                    OZip: '29401',
                    OProperty_id: prop4.id
                });

                await Probate.create({
                    property_id: prop4.id,
                    case_number: 'PR-2025-00421',
                    probate_court: 'Charleston County Probate Court',
                    filing_date: '2025-11-15',
                    estate_type: 'Testate',
                    executor_name: 'Robert Williams',
                    executor_contact: '(843) 555-0198',
                    estate_value: 725000,
                    status: 'Open'
                });

                console.log('✓ Created Probate property (ID: ' + prop4.id + ')');
                successCount++;
            }
        } catch (err) {
            console.error('❌ Error creating Probate:', err.message);
        }

        // 5. CODES (Violations)
        try {
            if (motiveMap['COD']) {
                const prop5 = await Property.create({
                    PStreetAddr1: '567 Park Avenue',
                    Pcity: 'Detroit',
                    Pstate: 'MI',
                    Pzip: '48201',
                    Pcounty: 'Wayne',
                    PType: 'Single Family',
                    PBeds: '3',
                    PBaths: '1',
                    PTotSQFootage: '1400',
                    PYearBuilt: '1975',
                    PTotAppraisedAmt: '125000',
                    PComments: 'Multiple code violations - Motivated seller',
                    motive_type_id: motiveMap['COD']
                });

                await Owner.create({
                    OFirstName: 'David',
                    OLastName: 'Thompson',
                    OStreetAddr1: '890 Different St',
                    OCity: 'Lansing',
                    OState: 'MI',
                    OZip: '48933',
                    is_out_of_state: false,
                    OProperty_id: prop5.id
                });

                await Violation.create({
                    property_id: prop5.id,
                    complaint: 'INSP-2024-8821',
                    issue_date: '2024-08-10',
                    types: 'Building Code Violations',
                    short_desc: 'Structural repairs needed, roof damage',
                    details: 'Multiple violations including damaged roof, broken windows, unsafe electrical',
                    current_situation: 'Owner given 90 days to comply',
                    compliance_status: 'Non-Compliant'
                });

                console.log('✓ Created Code Violations property (ID: ' + prop5.id + ')');
                successCount++;
            }
        } catch (err) {
            console.error('❌ Error creating Code Violations:', err.message);
        }

        // 6. EVICTION
        try {
            if (motiveMap['EVI']) {
                const prop6 = await Property.create({
                    PStreetAddr1: '890 Elm Street',
                    Pcity: 'Phoenix',
                    Pstate: 'AZ',
                    Pzip: '85001',
                    Pcounty: 'Maricopa',
                    PType: 'Townhouse',
                    PBeds: '2',
                    PBaths: '2.5',
                    PTotSQFootage: '1600',
                    PYearBuilt: '2018',
                    PTotAppraisedAmt: '320000',
                    PComments: 'Tenant eviction in progress',
                    motive_type_id: motiveMap['EVI']
                });

                await Owner.create({
                    OFirstName: 'Lisa',
                    OLastName: 'Anderson',
                    OStreetAddr1: '2300 Investment Blvd',
                    OCity: 'Scottsdale',
                    OState: 'AZ',
                    OZip: '85251',
                    OProperty_id: prop6.id
                });

                await Eviction.create({
                    property_id: prop6.id,
                    court_date: '2026-03-15',
                    court_docket: 'CV-2026-001245',
                    court_desc: 'Eviction for non-payment of rent',
                    court_room: 'Courtroom 4B',
                    details: 'Tenant behind 4 months rent - Scheduled eviction hearing'
                });

                console.log('✓ Created Eviction property (ID: ' + prop6.id + ')');
                successCount++;
            }
        } catch (err) {
            console.error('❌ Error creating Eviction:', err.message);
        }

        // 7. DIVORCE
        try {
            if (motiveMap['DIV']) {
                const prop7 = await Property.create({
                    PStreetAddr1: '321 Sunset Boulevard',
                    Pcity: 'Austin',
                    Pstate: 'TX',
                    Pzip: '78701',
                    Pcounty: 'Travis',
                    PType: 'Single Family',
                    PBeds: '4',
                    PBaths: '3',
                    PTotSQFootage: '2800',
                    PYearBuilt: '2012',
                    PTotAppraisedAmt: '650000',
                    PComments: 'Marital asset - Divorce settlement required',
                    motive_type_id: motiveMap['DIV']
                });

                await Owner.create({
                    OFirstName: 'Mark',
                    OLastName: 'Robinson',
                    OStreetAddr1: '321 Sunset Boulevard',
                    OCity: 'Austin',
                    OState: 'TX',
                    OZip: '78701',
                    OProperty_id: prop7.id
                });

                await Loan.create({
                    property_id: prop7.id,
                    borrower_name: 'Mark & Karen Robinson',
                    lender_name: 'Chase Bank',
                    loan_amount: 520000,
                    loan_date: '2017-09-10'
                });

                await Divorce.create({
                    property_id: prop7.id,
                    case_number: 'DIV-2025-7788',
                    court_name: 'Travis County Family Court',
                    filing_date: '2025-10-01',
                    divorce_type: 'Contested',
                    petitioner_name: 'Mark Robinson',
                    respondent_name: 'Karen Robinson',
                    status: 'Pending'
                });

                console.log('✓ Created Divorce property (ID: ' + prop7.id + ')');
                successCount++;
            }
        } catch (err) {
            console.error('❌ Error creating Divorce:', err.message);
        }

        // 8. UNPAID TAXES
        try {
            if (motiveMap['TAX']) {
                const prop8 = await Property.create({
                    PStreetAddr1: '678 Lakeside Drive',
                    Pcity: 'Atlanta',
                    Pstate: 'GA',
                    Pzip: '30301',
                    Pcounty: 'Fulton',
                    PType: 'Single Family',
                    PBeds: '3',
                    PBaths: '2',
                    PTotSQFootage: '1900',
                    PYearBuilt: '2000',
                    PTotAppraisedAmt: '385000',
                    PComments: 'Tax lien - Delinquent property taxes',
                    motive_type_id: motiveMap['TAX']
                });

                await Owner.create({
                    OFirstName: 'Robert',
                    OLastName: 'Davis',
                    OStreetAddr1: '678 Lakeside Drive',
                    OCity: 'Atlanta',
                    OState: 'GA',
                    OZip: '30301',
                    OProperty_id: prop8.id
                });

                await TaxLien.create({
                    property_id: prop8.id,
                    tax_year: '2021-2024',
                    amount_owed: 28500,
                    lien_date: '2024-06-01',
                    tax_authority: 'Fulton County Tax Commissioner',
                    lien_number: 'TL-2024-5521',
                    status: 'Active',
                    sale_date: '2026-04-15',
                    redemption_period_end: '2026-06-15'
                });

                console.log('✓ Created Unpaid Taxes property (ID: ' + prop8.id + ')');
                successCount++;
            }
        } catch (err) {
            console.error('❌ Error creating Unpaid Taxes:', err.message);
        }

        // 9. OUT OF STATE
        try {
            if (motiveMap['OOS']) {
                const prop9 = await Property.create({
                    PStreetAddr1: '999 Beach Road',
                    Pcity: 'Miami',
                    Pstate: 'FL',
                    Pzip: '33101',
                    Pcounty: 'Miami-Dade',
                    PType: 'Condo',
                    PBeds: '2',
                    PBaths: '2',
                    PTotSQFootage: '1350',
                    PYearBuilt: '2019',
                    PTotAppraisedAmt: '495000',
                    PComments: 'Absentee owner - Out of state landlord',
                    motive_type_id: motiveMap['OOS']
                });

                await Owner.create({
                    OFirstName: 'Patricia',
                    OLastName: 'Miller',
                    OMailAddr1: '5500 Park Avenue',
                    OMailCity: 'New York',
                    OMailState: 'NY',
                    OMailZip: '10001',
                    is_out_of_state: true,
                    OProperty_id: prop9.id
                });

                await Loan.create({
                    property_id: prop9.id,
                    borrower_name: 'Patricia Miller',
                    lender_name: 'TD Bank',
                    loan_amount: 395000,
                    loan_date: '2021-02-20'
                });

                console.log('✓ Created Out of State property (ID: ' + prop9.id + ')');
                successCount++;
            }
        } catch (err) {
            console.error('❌ Error creating Out of State:', err.message);
        }

        console.log(`\n✅ Successfully seeded ${successCount}/9 properties with motive type-specific data!`);
        console.log('\n📍 Test property detail pages at:');
        console.log('   http://localhost:3004/dashboard/property/1 - Preforeclosure');
        console.log('   http://localhost:3004/dashboard/property/2 - Foreclosure');
        console.log('   http://localhost:3004/dashboard/property/3 - Auction');
        console.log('   http://localhost:3004/dashboard/property/4 - Probate');
        console.log('   http://localhost:3004/dashboard/property/5 - Code Violations');
        console.log('   http://localhost:3004/dashboard/property/6 - Eviction');
        console.log('   http://localhost:3004/dashboard/property/7 - Divorce');
        console.log('   http://localhost:3004/dashboard/property/8 - Unpaid Taxes');
        console.log('   http://localhost:3004/dashboard/property/9 - Out of State');

    } catch (error) {
        console.error('❌ Error seeding properties:', error);
    } finally {
        await sequelize.close();
    }
}

seedMotiveTypeProperties();
