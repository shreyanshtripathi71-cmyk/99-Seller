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
        // Sync models to ensure schema updates are applied (ALTER TABLE if needed?)
        // Warning: strict constraints on existing null data will fail.
        // We will truncate tables first.

        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync models to update schema (add new columns)
        // Sync models to update schema (force: true drops tables first)
        console.log('Syncing schema (force reset)...');
        await sequelize.sync({ force: true });
        console.log('Schema synced.');

        // Order matters for foreign keys
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await Property.truncate();
        await Proaddress.truncate();
        await Owner.truncate();
        await Auction.truncate();
        await Loan.truncate();
        await Probate.truncate();
        await Divorce.truncate();
        await TaxLien.truncate();
        await Violation.truncate();
        await Eviction.truncate();
        // Do not truncate MotiveTypes usually, but sync might need it? 
        // Assuming MotiveTypes exist or will be seeded elsewhere? 
        // Let's ensure MotiveTypes exist.
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Tables truncated.');

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

        // Create Auctioneer if needed (for Auction motive)
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

                // 1. Create Proaddress
                const proaddress = await Proaddress.create({
                    PStreetNum: streetAddr.split(' ')[0],
                    PStreetName: streetAddr.split(' ').slice(1).join(' '), // simple fallback
                    Pcity: city,
                    PState: state,
                    Pzip: zip,
                    owner_name: ownerName,
                    price: price,
                    beds: getRandomInt(2, 6).toString(),
                    baths: getRandomInt(1, 4).toString(),
                    // OutOfState specifics helper
                    owner_mailing_address: motive.code === 'OUT' ? generateAddress() : null,
                    owner_current_state: motive.code === 'OUT' ? getRandomElement(states.filter(s => s !== state)) : null,
                    PStreetAddr1: streetAddr,
                    square_feet: getRandomInt(1000, 5000)
                });

                // 2. Create Property
                const property = await Property.create({
                    PStreetAddr1: streetAddr,
                    Pcity: city,
                    Pstate: state,
                    Pzip: zip,
                    motive_type_id: motive.id,
                    proaddress_id: proaddress.id,
                    auctioneer_id: motive.code === 'AUC' ? auctioneer.id : null,
                    PBeds: proaddress.beds,
                    PBaths: proaddress.baths
                });

                // 3. Create Owner
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

                // 4. Motive Record Creation
                const now = new Date();
                const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

                if (motive.code === 'DIV') {
                    await Divorce.create({
                        property_id: property.id,
                        case_number: `DIV-${getRandomInt(1000, 9999)}`,
                        filing_date: getRandomDateOnly(new Date(2023, 0, 1), now),
                        legal_filing_date: getRandomDateOnly(new Date(2023, 0, 1), now),
                        attorney_name: `Lawyer ${generateName()}`,
                        petitioner_name: ownerName,
                        respondent_name: generateName()
                    });
                }

                if (motive.code === 'AUC' || motive.code === 'FOR') {
                    // FOR and AUC usually have Auction records
                    if (motive.code === 'AUC' || motive.code === 'FOR') {
                        await Auction.create({
                            APropertyID: property.id,
                            AAuctionDateTime: future,
                            AAuctionPlace: `${city} Courthouse`,
                            minimum_bid: price * 0.4, // Opening bid
                            AAuctionCity: city,
                            AAuctionState: state
                            // AOpeningBid might be mapped to minimum_bid in schema updates I made?
                            // I added minimum_bid. Did I remove AOpeningBid? No, kept it nullable if it was there?
                            // Wait, I updated Step 426: I added minimum_bid. 
                            // I will fill minimum_bid as mandated.
                        });
                    }
                }

                if (motive.code === 'PRO') {
                    await Probate.create({
                        property_id: property.id,
                        case_number: `PRO-${getRandomInt(1000, 9999)}`,
                        probate_court_county: `${getRandomElement(counties)} County Court`,
                        date_of_death: getRandomDateOnly(new Date(2023, 0, 1), now),
                        executor_name: generateName(),
                        status: 'Open'
                    });
                }

                if (motive.code === 'PRE' || motive.code === 'FOR') {
                    await Loan.create({
                        property_id: property.id,
                        lender_name: 'Big Bank LLC',
                        loan_amount: price * 0.8,
                        total_default_amount: getRandomFloat(5000, 50000),
                        foreclosure_stage: motive.code === 'PRE' ? 'Pre-Foreclosure' : 'Auction Scheduled',
                        lis_pendens_date: getRandomDateOnly(new Date(2023, 0, 1), now),
                        arrears_amount: getRandomFloat(1000, 10000),
                        default_status: 'Defaulted'
                    });
                }

                if (motive.code === 'COD') {
                    await Violation.create({
                        property_id: property.id,
                        types: 'Structural Damage',
                        fine_amount: getRandomFloat(100, 5000),
                        remediation_deadline: getRandomDateOnly(now, future),
                        current_situation: 'Pending Repair'
                    });
                }

                if (motive.code === 'EVI') {
                    await Eviction.create({
                        property_id: property.id,
                        plaintiff_name: `Landlord ${generateName()}`,
                        court_date: getRandomDateOnly(now, future),
                        court_docket: `EVI-${getRandomInt(100, 999)}`,
                        details: 'Non-payment of rent'
                    });
                }

                if (motive.code === 'TAX') {
                    await TaxLien.create({
                        property_id: property.id,
                        amount_owed: getRandomFloat(1000, 20000),
                        last_tax_year_paid: (new Date().getFullYear() - 2).toString(),
                        status: 'Active',
                        tax_authority: `${getRandomElement(counties)} Tax Collector`
                    });
                }
            }
        }

        console.log('Seeding completed successfully.');
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
