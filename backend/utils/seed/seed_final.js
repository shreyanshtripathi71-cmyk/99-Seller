const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const {
    Property, Proaddress, Owner, MotiveTypes,
    Auction, Auctioneer, Loan, Probate, Divorce,
    TaxLien, Violation, Eviction
} = require('./models');
const { sequelize } = require('./models');

// --- Helper Functions ---

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
const getRandomDateOnly = (start, end) => getRandomDate(start, end).toISOString().split('T')[0];

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica', 'William', 'Jennifer', 'James', 'Elizabeth'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'];
const streetNames = ['Main', 'Oak', 'Maple', 'Cedar', 'Elm', 'Washington', 'Lake', 'Hill', 'Park', 'Pine'];
const cities = ['Springfield', 'Riverside', 'Franklin', 'Greenville', 'Bristol', 'Clinton', 'Fairview', 'Madison', 'Georgetown', 'Ashland'];
const states = ['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
const counties = ['Shelby', 'Jefferson', 'Madison', 'Franklin', 'Hamilton', 'Marion', 'Monroe', 'Washington', 'Jackson', 'Montgomery'];

const generateName = () => `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
const generateAddress = () => `${getRandomInt(100, 9999)} ${getRandomElement(streetNames)} St`;
const generatePhone = () => `(${getRandomInt(200, 999)}) ${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`;
const generateEmail = (name) => {
    const cleanName = name.toLowerCase().replace(' ', '.');
    return `${cleanName}${getRandomInt(1, 99)}@example.com`;
};

// --- Seed Logic ---

const seed = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        // Force sync to drop tables and recreate them with strict constraints
        console.log('Syncing schema (force reset)...');
        await sequelize.sync({ force: true });
        console.log('Schema newly created.');

        // Ensure Motive Types exist
        const motiveCodes = ['PRE', 'FOR', 'AUC', 'PRO', 'DIV', 'TAX', 'COD', 'EVI', 'OUT'];
        const motives = [];

        for (const code of motiveCodes) {
            let [motive] = await MotiveTypes.findOrCreate({
                where: { code },
                defaults: {
                    name: code === 'PRE' ? 'Pre-foreclosure' :
                        code === 'FOR' ? 'Foreclosure' :
                            code === 'AUC' ? 'Auction' :
                                code === 'PRO' ? 'Probate' :
                                    code === 'DIV' ? 'Divorce' :
                                        code === 'TAX' ? 'Unpaid Taxes' :
                                            code === 'COD' ? 'Code Violation' :
                                                code === 'EVI' ? 'Eviction' : 'Out of State',
                    description: `Properties listed under ${code}`
                }
            });
            motives.push(motive);
        }

        // Create Auctioneer (Required for Auction/Foreclosure)
        const auctioneer = await Auctioneer.create({
            name: 'Global Auctioneers Ltd',
            phone: '555-0199',
            email: 'info@globalauctions.com'
        });

        for (const motive of motives) {
            console.log(`Seeding 5 properties for ${motive.code}...`);

            for (let i = 0; i < 5; i++) {
                const ownerName = generateName();
                const streetAddr = generateAddress();
                const city = getRandomElement(cities);
                const state = getRandomElement(states);
                const zip = getRandomInt(10000, 99999).toString();
                const price = getRandomInt(100000, 1000000);
                const sqft = getRandomInt(1200, 4500);

                // 1. Create Proaddress (Mandatory: owner_name, price, beds, baths, sqft)
                const proaddress = await Proaddress.create({
                    PStreetNum: streetAddr.split(' ')[0],
                    PStreetName: streetAddr.split(' ').slice(1).join(' '),
                    Pcity: city,
                    PState: state,
                    Pzip: zip,
                    owner_name: ownerName,
                    price: price,
                    beds: getRandomInt(2, 6).toString(),
                    baths: getRandomInt(1, 4).toString(),
                    square_feet: sqft,
                    // OutOfState specifics: Displayed for OUT motive
                    owner_mailing_address: motive.code === 'OUT' ? generateAddress() : null,
                    owner_current_state: motive.code === 'OUT' ? getRandomElement(states.filter(s => s !== state)) : null,
                    PStreetAddr1: streetAddr
                });

                // 2. Create Property
                const property = await Property.create({
                    PStreetAddr1: streetAddr,
                    Pcity: city,
                    Pstate: state,
                    Pzip: zip,
                    motive_type_id: motive.id,
                    proaddress_id: proaddress.id,
                    auctioneer_id: (motive.code === 'AUC' || motive.code === 'FOR') ? auctioneer.id : null,
                    PBeds: proaddress.beds,
                    PBaths: proaddress.baths
                });

                // 3. Create Owner (Mandatory: email)
                await Owner.create({
                    OProperty_id: property.id,
                    OFirstName: ownerName.split(' ')[0],
                    OLastName: ownerName.split(' ')[1],
                    OStreetAddr1: streetAddr,
                    OCity: city,
                    OState: state,
                    OZip: zip,
                    email: generateEmail(ownerName),
                    is_out_of_state: motive.code === 'OUT'
                });

                // 4. Motive-Specific Data Generation (Strict Compliance)
                const now = new Date();
                const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                const past = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

                // Divorce: case_number, attorney_name, legal_filing_date
                if (motive.code === 'DIV') {
                    await Divorce.create({
                        property_id: property.id,
                        case_number: `DIV-${getRandomInt(10000, 99999)}`,
                        attorney_name: `Lawyer ${generateName()}`,
                        legal_filing_date: getRandomDateOnly(past, now),
                        // Extras
                        filing_date: getRandomDateOnly(past, now),
                        petitioner_name: ownerName,
                        respondent_name: generateName(),
                        status: 'Filed'
                    });
                }

                // Auction: auction_date (AAuctionDateTime), auctioneer_id (on prop), minimum_bid, auction_location (AAuctionPlace)
                if (motive.code === 'AUC') {
                    await Auction.create({
                        APropertyID: property.id,
                        AAuctionDateTime: future,
                        AAuctionPlace: `${city} Courthouse`,
                        minimum_bid: price * 0.4,
                        AAuctionCity: city,
                        AAuctionState: state,
                        // Schema might require these if present
                        AOpeningBid: price * 0.4
                    });
                }

                // Probate: executor_name, date_of_death, probate_court_county
                if (motive.code === 'PRO') {
                    await Probate.create({
                        property_id: property.id,
                        executor_name: generateName(),
                        date_of_death: getRandomDateOnly(past, now),
                        probate_court_county: `${getRandomElement(counties)} County`,
                        case_number: `PRO-${getRandomInt(1000, 9999)}`,
                        status: 'Open'
                    });
                }

                // Foreclosure: Loan & Auction. Loan -> lender_name, total_default_amount, foreclosure_stage
                if (motive.code === 'FOR') {
                    await Loan.create({
                        property_id: property.id,
                        lender_name: 'Big Bank LLC',
                        total_default_amount: getRandomFloat(5000, 50000),
                        foreclosure_stage: 'Auction Scheduled',
                        loan_amount: price * 0.8,
                        default_status: 'Defaulted'
                    });

                    // Also create Auction record for Foreclosure
                    await Auction.create({
                        APropertyID: property.id,
                        AAuctionDateTime: future,
                        AAuctionPlace: `${city} Courthouse`,
                        minimum_bid: price * 0.5,
                        AAuctionCity: city,
                        AAuctionState: state,
                        AOpeningBid: price * 0.5
                    });
                }

                // Preforeclosure: Loan -> lis_pendens_date, arrears_amount, default_status
                if (motive.code === 'PRE') {
                    await Loan.create({
                        property_id: property.id,
                        lender_name: 'Regional Bank',
                        lis_pendens_date: getRandomDateOnly(past, now),
                        arrears_amount: getRandomFloat(2000, 15000),
                        default_status: 'Notice of Default',
                        foreclosure_stage: 'Pre-Foreclosure',
                        loan_amount: price * 0.75
                    });
                }

                // Codes (Violation): violation_type (types), fine_amount, remediation_deadline
                if (motive.code === 'COD') {
                    await Violation.create({
                        property_id: property.id,
                        types: 'Code Violation - Structural',
                        fine_amount: getRandomFloat(500, 5000),
                        remediation_deadline: getRandomDateOnly(now, future),
                        current_situation: 'Non-Compliant',
                        complaint: `VIO-${getRandomInt(1000, 9999)}`
                    });
                }

                // Eviction: filing_date (court_date), court_case_id (court_docket), plaintiff_name
                if (motive.code === 'EVI') {
                    await Eviction.create({
                        property_id: property.id,
                        court_date: getRandomDateOnly(past, now),
                        court_docket: `EVI-${getRandomInt(10000, 99999)}`,
                        plaintiff_name: `Landlord ${generateName()}`,
                        details: 'Non-payment of rent'
                    });
                }

                // OutOfState: owner_mailing_address, owner_current_state (Done in Proaddress)
                // Nothing extra model-specific needed, but valid Proaddress/Owner data is crucial.

                // UnpaidTaxes: total_tax_owed (amount_owed), last_tax_year_paid, lien_status (status)
                if (motive.code === 'TAX') {
                    await TaxLien.create({
                        property_id: property.id,
                        amount_owed: getRandomFloat(2000, 25000),
                        last_tax_year_paid: (new Date().getFullYear() - 2).toString(),
                        status: 'Active',
                        tax_authority: `${getRandomElement(counties)} Tax Collector`,
                        tax_year: (new Date().getFullYear() - 1).toString()
                    });
                }
            }
        }

        console.log('Seeding completed successfully with strict data compliance.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        if (error.errors) {
            error.errors.forEach(e => console.error(`Validation Error: ${e.message} (${e.path})`));
        }
        process.exit(1);
    }
};

seed();
