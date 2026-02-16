const {
    Property, Proaddress, Owner, MotiveTypes, Loan, Auction,
    Trustee, Probate, Violation, Eviction, Divorce, TaxLien,
    PropertyTrustDeed, Auctioneer, ZipCitySt, CityCounty, County,
    sequelize
} = require('./models');

async function seedDatabase() {
    try {
        console.log('Starting database seeding...');

        // Create motive types
        const motiveTypes = await MotiveTypes.bulkCreate([
            { code: 'PRE', name: 'Preforeclosure' },
            { code: 'FOR', name: 'Foreclosure' },
            { code: 'AUC', name: 'Auction' },
            { code: 'PRO', name: 'Probate' },
            { code: 'COD', name: 'Codes' },
            { code: 'EVI', name: 'Eviction' },
            { code: 'DIV', name: 'Divorce' },
            { code: 'TAX', name: 'UnpaidTaxes' },
            { code: 'OOS', name: 'OutOfState' },
            { code: 'LON', name: 'Loan' }
        ], { ignoreDuplicates: true });

        console.log('Motive types created');

        // Sample locations
        const locations = [
            { city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles County' },
            { city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade County' },
            { city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa County' },
            { city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas County' },
            { city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton County' }
        ];

        let propertyCount = 0;

        // Helper function to create property with all relations
        async function createProperty(data) {
            const proaddress = await Proaddress.create(data.proaddress);
            const property = await Property.create({
                ...data.property,
                proaddress_id: proaddress.id
            });

            await Owner.create({
                ...data.owner,
                OProperty_id: property.id
            });

            if (data.loan) {
                await Loan.create({ ...data.loan, property_id: property.id });
            }
            if (data.auction) {
                await Auction.create({ ...data.auction, APropertyID: property.id });
            }
            if (data.probate) {
                await Probate.create({ ...data.probate, property_id: property.id });
            }
            if (data.violation) {
                await Violation.create({ ...data.violation, property_id: property.id });
            }
            if (data.eviction) {
                await Eviction.create({ ...data.eviction, property_id: property.id });
            }
            if (data.divorce) {
                await Divorce.create({ ...data.divorce, property_id: property.id });
            }
            if (data.taxLien) {
                await TaxLien.create({ ...data.taxLien, property_id: property.id });
            }
            if (data.propertyTrustDeed) {
                await PropertyTrustDeed.create(data.propertyTrustDeed);
            }
            if (data.auctioneer) {
                const auctioneer = await Auctioneer.create(data.auctioneer);
                await property.update({ auctioneer_id: auctioneer.id });
            }

            propertyCount++;
            console.log(`Created property ${propertyCount}/50`);
        }

        // PREFORECLOSURE (5 properties)
        const preMotiveId = (await MotiveTypes.findOne({ where: { code: 'PRE' } })).id;
        for (let i = 0; i < 5; i++) {
            const loc = locations[i % locations.length];
            await createProperty({
                proaddress: {
                    PStreetNum: `${1000 + i * 100}`,
                    PStreetName: 'Maple Street',
                    Pcity: loc.city,
                    PState: loc.state,
                    Pzip: loc.zip,
                    owner_name: `John Doe ${i + 1}`,
                    price: 250000 + i * 50000,
                    beds: '3',
                    baths: '2',
                    square_feet: 1800,
                    proptype: 'Single Family'
                },
                property: {
                    motive_type_id: preMotiveId,
                    PBeds: '3',
                    PBaths: '2',
                    Pcity: loc.city,
                    Pstate: loc.state,
                    Pzip: loc.zip,
                    Pcounty: loc.county
                },
                owner: {
                    OFirstName: 'John',
                    OLastName: `Doe${i + 1}`,
                    email: `john.doe${i + 1}@example.com`,
                    OCity: loc.city,
                    OState: loc.state,
                    OZip: loc.zip
                },
                loan: {
                    borrower_name: `John Doe ${i + 1}`,
                    lender_name: 'Bank of America',
                    loan_amount: 200000 + i * 30000,
                    arrears_amount: 15000 + i * 2000,
                    foreclosure_stage: 'Pre-Foreclosure',
                    default_status: 'In Default'
                }
            });
        }

        // FORECLOSURE (5 properties)
        const forMotiveId = (await MotiveTypes.findOne({ where: { code: 'FOR' } })).id;
        for (let i = 0; i < 5; i++) {
            const loc = locations[i % locations.length];
            await createProperty({
                proaddress: {
                    PStreetNum: `${2000 + i * 100}`,
                    PStreetName: 'Oak Avenue',
                    Pcity: loc.city,
                    PState: loc.state,
                    Pzip: loc.zip,
                    owner_name: `Jane Smith ${i + 1}`,
                    price: 300000 + i * 60000,
                    beds: '4',
                    baths: '3',
                    square_feet: 2200,
                    proptype: 'Single Family',
                    trusteename: 'First American Title',
                    trusteephone: '555-0100'
                },
                property: {
                    motive_type_id: forMotiveId,
                    PBeds: '4',
                    PBaths: '3',
                    Pcity: loc.city,
                    Pstate: loc.state,
                    Pzip: loc.zip,
                    Pcounty: loc.county
                },
                owner: {
                    OFirstName: 'Jane',
                    OLastName: `Smith${i + 1}`,
                    email: `jane.smith${i + 1}@example.com`,
                    OCity: loc.city,
                    OState: loc.state,
                    OZip: loc.zip
                },
                loan: {
                    borrower_name: `Jane Smith ${i + 1}`,
                    lender_name: 'Wells Fargo',
                    loan_amount: 250000 + i * 40000,
                    arrears_amount: 25000 + i * 3000,
                    foreclosure_stage: 'Foreclosure',
                    default_status: 'Foreclosed'
                },
                auction: {
                    AAuctionDateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    AAuctionPlace: 'County Courthouse',
                    minimum_bid: 200000 + i * 30000
                }
            });
        }

        // AUCTION (5 properties)
        const aucMotiveId = (await MotiveTypes.findOne({ where: { code: 'AUC' } })).id;
        for (let i = 0; i < 5; i++) {
            const loc = locations[i % locations.length];
            await createProperty({
                proaddress: {
                    PStreetNum: `${3000 + i * 100}`,
                    PStreetName: 'Pine Road',
                    Pcity: loc.city,
                    PState: loc.state,
                    Pzip: loc.zip,
                    owner_name: `Bob Johnson ${i + 1}`,
                    price: 350000 + i * 70000,
                    beds: '3',
                    baths: '2',
                    square_feet: 2000,
                    proptype: 'Condo'
                },
                property: {
                    motive_type_id: aucMotiveId,
                    PBeds: '3',
                    PBaths: '2',
                    Pcity: loc.city,
                    Pstate: loc.state,
                    Pzip: loc.zip,
                    Pcounty: loc.county
                },
                owner: {
                    OFirstName: 'Bob',
                    OLastName: `Johnson${i + 1}`,
                    email: `bob.johnson${i + 1}@example.com`,
                    OCity: loc.city,
                    OState: loc.state,
                    OZip: loc.zip
                },
                auction: {
                    AAuctionDateTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                    AAuctionPlace: 'City Hall',
                    minimum_bid: 280000 + i * 50000
                },
                auctioneer: {
                    name: `Premier Auctions ${i + 1}`,
                    phone: `555-02${10 + i}`,
                    email: `contact@premier${i + 1}.com`,
                    type: 1
                }
            });
        }

        // PROBATE (5 properties)
        const proMotiveId = (await MotiveTypes.findOne({ where: { code: 'PRO' } })).id;
        for (let i = 0; i < 5; i++) {
            const loc = locations[i % locations.length];
            await createProperty({
                proaddress: {
                    PStreetNum: `${4000 + i * 100}`,
                    PStreetName: 'Elm Street',
                    Pcity: loc.city,
                    PState: loc.state,
                    Pzip: loc.zip,
                    owner_name: `Estate of Mary Wilson ${i + 1}`,
                    price: 280000 + i * 55000,
                    beds: '2',
                    baths: '2',
                    square_feet: 1500,
                    proptype: 'Townhouse',
                    trusteename: 'Estate Trustees LLC',
                    trusteephone: '555-0300'
                },
                property: {
                    motive_type_id: proMotiveId,
                    PBeds: '2',
                    PBaths: '2',
                    Pcity: loc.city,
                    Pstate: loc.state,
                    Pzip: loc.zip,
                    Pcounty: loc.county
                },
                owner: {
                    OFirstName: 'Mary',
                    OLastName: `Wilson${i + 1}`,
                    email: `estate.wilson${i + 1}@example.com`,
                    OCity: loc.city,
                    OState: loc.state,
                    OZip: loc.zip
                },
                probate: {
                    case_number: `PRO-2024-${1000 + i}`,
                    probate_court_county: loc.county,
                    date_of_death: new Date('2024-01-15'),
                    executor_name: `Executor ${i + 1}`,
                    estate_value: 300000 + i * 60000
                }
            });
        }

        // CODES/VIOLATIONS (5 properties)
        const codMotiveId = (await MotiveTypes.findOne({ where: { code: 'COD' } })).id;
        for (let i = 0; i < 5; i++) {
            const loc = locations[i % locations.length];
            await createProperty({
                proaddress: {
                    PStreetNum: `${5000 + i * 100}`,
                    PStreetName: 'Cedar Lane',
                    Pcity: loc.city,
                    PState: loc.state,
                    Pzip: loc.zip,
                    owner_name: `Tom Brown ${i + 1}`,
                    price: 220000 + i * 45000,
                    beds: '3',
                    baths: '1',
                    square_feet: 1600,
                    proptype: 'Single Family'
                },
                property: {
                    motive_type_id: codMotiveId,
                    PBeds: '3',
                    PBaths: '1',
                    Pcity: loc.city,
                    Pstate: loc.state,
                    Pzip: loc.zip,
                    Pcounty: loc.county
                },
                owner: {
                    OFirstName: 'Tom',
                    OLastName: `Brown${i + 1}`,
                    email: `tom.brown${i + 1}@example.com`,
                    OCity: loc.city,
                    OState: loc.state,
                    OZip: loc.zip
                },
                violation: {
                    types: 'Building Code Violation',
                    fine_amount: 5000 + i * 1000,
                    remediation_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                    compliance_status: 'Non-Compliant'
                }
            });
        }

        // EVICTION (5 properties)
        const eviMotiveId = (await MotiveTypes.findOne({ where: { code: 'EVI' } })).id;
        for (let i = 0; i < 5; i++) {
            const loc = locations[i % locations.length];
            await createProperty({
                proaddress: {
                    PStreetNum: `${6000 + i * 100}`,
                    PStreetName: 'Birch Court',
                    Pcity: loc.city,
                    PState: loc.state,
                    Pzip: loc.zip,
                    owner_name: `Sarah Davis ${i + 1}`,
                    price: 190000 + i * 40000,
                    beds: '2',
                    baths: '1',
                    square_feet: 1200,
                    proptype: 'Apartment'
                },
                property: {
                    motive_type_id: eviMotiveId,
                    PBeds: '2',
                    PBaths: '1',
                    Pcity: loc.city,
                    Pstate: loc.state,
                    Pzip: loc.zip,
                    Pcounty: loc.county
                },
                owner: {
                    OFirstName: 'Sarah',
                    OLastName: `Davis${i + 1}`,
                    email: `sarah.davis${i + 1}@example.com`,
                    OCity: loc.city,
                    OState: loc.state,
                    OZip: loc.zip
                },
                eviction: {
                    court_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                    court_docket: `EV-2024-${2000 + i}`,
                    plaintiff_name: 'Property Management Co'
                }
            });
        }

        // DIVORCE (5 properties)
        const divMotiveId = (await MotiveTypes.findOne({ where: { code: 'DIV' } })).id;
        for (let i = 0; i < 5; i++) {
            const loc = locations[i % locations.length];
            await createProperty({
                proaddress: {
                    PStreetNum: `${7000 + i * 100}`,
                    PStreetName: 'Willow Drive',
                    Pcity: loc.city,
                    PState: loc.state,
                    Pzip: loc.zip,
                    owner_name: `Mike Anderson ${i + 1}`,
                    price: 320000 + i * 65000,
                    beds: '4',
                    baths: '2',
                    square_feet: 2400,
                    proptype: 'Single Family'
                },
                property: {
                    motive_type_id: divMotiveId,
                    PBeds: '4',
                    PBaths: '2',
                    Pcity: loc.city,
                    Pstate: loc.state,
                    Pzip: loc.zip,
                    Pcounty: loc.county
                },
                owner: {
                    OFirstName: 'Mike',
                    OLastName: `Anderson${i + 1}`,
                    email: `mike.anderson${i + 1}@example.com`,
                    OCity: loc.city,
                    OState: loc.state,
                    OZip: loc.zip
                },
                divorce: {
                    case_number: `DIV-2024-${3000 + i}`,
                    attorney_name: `Law Firm ${i + 1}`,
                    legal_filing_date: new Date('2024-03-01'),
                    status: 'Pending'
                }
            });
        }

        // UNPAID TAXES (5 properties)
        const taxMotiveId = (await MotiveTypes.findOne({ where: { code: 'TAX' } })).id;
        for (let i = 0; i < 5; i++) {
            const loc = locations[i % locations.length];
            await createProperty({
                proaddress: {
                    PStreetNum: `${8000 + i * 100}`,
                    PStreetName: 'Spruce Avenue',
                    Pcity: loc.city,
                    PState: loc.state,
                    Pzip: loc.zip,
                    owner_name: `Lisa Martinez ${i + 1}`,
                    price: 260000 + i * 52000,
                    beds: '3',
                    baths: '2',
                    square_feet: 1900,
                    proptype: 'Single Family'
                },
                property: {
                    motive_type_id: taxMotiveId,
                    PBeds: '3',
                    PBaths: '2',
                    Pcity: loc.city,
                    Pstate: loc.state,
                    Pzip: loc.zip,
                    Pcounty: loc.county
                },
                owner: {
                    OFirstName: 'Lisa',
                    OLastName: `Martinez${i + 1}`,
                    email: `lisa.martinez${i + 1}@example.com`,
                    OCity: loc.city,
                    OState: loc.state,
                    OZip: loc.zip
                },
                taxLien: {
                    amount_owed: 12000 + i * 2500,
                    last_tax_year_paid: '2021',
                    status: 'Active',
                    tax_authority: loc.county
                }
            });
        }

        // OUT OF STATE (5 properties)
        const oosMotiveId = (await MotiveTypes.findOne({ where: { code: 'OOS' } })).id;
        const outOfStateLocations = [
            { ownerState: 'NY', ownerCity: 'New York' },
            { ownerState: 'IL', ownerCity: 'Chicago' },
            { ownerState: 'WA', ownerCity: 'Seattle' },
            { ownerState: 'MA', ownerCity: 'Boston' },
            { ownerState: 'CO', ownerCity: 'Denver' }
        ];
        for (let i = 0; i < 5; i++) {
            const loc = locations[i % locations.length];
            const ownerLoc = outOfStateLocations[i];
            await createProperty({
                proaddress: {
                    PStreetNum: `${9000 + i * 100}`,
                    PStreetName: 'Aspen Boulevard',
                    Pcity: loc.city,
                    PState: loc.state,
                    Pzip: loc.zip,
                    owner_name: `David Lee ${i + 1}`,
                    owner_current_state: ownerLoc.ownerState,
                    owner_mailing_address: `${500 + i} Main St, ${ownerLoc.ownerCity}, ${ownerLoc.ownerState}`,
                    price: 310000 + i * 62000,
                    beds: '3',
                    baths: '2',
                    square_feet: 2100,
                    proptype: 'Single Family'
                },
                property: {
                    motive_type_id: oosMotiveId,
                    PBeds: '3',
                    PBaths: '2',
                    Pcity: loc.city,
                    Pstate: loc.state,
                    Pzip: loc.zip,
                    Pcounty: loc.county
                },
                owner: {
                    OFirstName: 'David',
                    OLastName: `Lee${i + 1}`,
                    email: `david.lee${i + 1}@example.com`,
                    OCity: ownerLoc.ownerCity,
                    OState: ownerLoc.ownerState,
                    OZip: '10001',
                    is_out_of_state: true
                }
            });
        }

        // LOAN (5 properties)
        const lonMotiveId = (await MotiveTypes.findOne({ where: { code: 'LON' } })).id;
        for (let i = 0; i < 5; i++) {
            const loc = locations[i % locations.length];
            await createProperty({
                proaddress: {
                    PStreetNum: `${10000 + i * 100}`,
                    PStreetName: 'Redwood Street',
                    Pcity: loc.city,
                    PState: loc.state,
                    Pzip: loc.zip,
                    owner_name: `Chris Taylor ${i + 1}`,
                    price: 340000 + i * 68000,
                    beds: '4',
                    baths: '3',
                    square_feet: 2600,
                    proptype: 'Single Family'
                },
                property: {
                    motive_type_id: lonMotiveId,
                    PBeds: '4',
                    PBaths: '3',
                    Pcity: loc.city,
                    Pstate: loc.state,
                    Pzip: loc.zip,
                    Pcounty: loc.county
                },
                owner: {
                    OFirstName: 'Chris',
                    OLastName: `Taylor${i + 1}`,
                    email: `chris.taylor${i + 1}@example.com`,
                    OCity: loc.city,
                    OState: loc.state,
                    OZip: loc.zip
                },
                loan: {
                    borrower_name: `Chris Taylor ${i + 1}`,
                    lender_name: 'Chase Bank',
                    loan_amount: 280000 + i * 55000,
                    default_status: 'Current'
                },
                propertyTrustDeed: {
                    deed_id: `TD-${5000 + i}`,
                    county: loc.county,
                    property_address: `${10000 + i * 100} Redwood Street, ${loc.city}, ${loc.state}`,
                    owner_name: `Chris Taylor ${i + 1}`,
                    borrower_name: `Chris Taylor ${i + 1}`,
                    lender_name: 'Chase Bank',
                    loan_amount: `${280000 + i * 55000}`
                }
            });
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log(`Total properties created: ${propertyCount}`);

    } catch (error) {
        console.error('❌ Seeding error:', error);
        throw error;
    }
}

// Run seeding
seedDatabase()
    .then(() => {
        console.log('Seeding finished');
        process.exit(0);
    })
    .catch(err => {
        console.error('Seeding failed:', err);
        process.exit(1);
    });
