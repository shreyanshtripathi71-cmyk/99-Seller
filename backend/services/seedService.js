const {
    UserLogin,
    FreeUser,
    PremiumUser,
    Subscription,
    MotiveTypes,
    Property,
    Proaddress,
    Owner,
    Loan,
    Auction,
    Probate,
    Divorce,
    TaxLien,
    Eviction,
    Violation,
    AdminActivity,
    SiteContent
} = require('../models');
const bcrypt = require('bcryptjs');

// Helper to create future dates
const futureDate = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };

// Helper to parse address into street number and street name
const parseAddress = (addr) => {
    const parts = addr.trim().split(/\s+/);
    const streetNum = parts[0] || '0';
    const streetName = parts.slice(1).join(' ') || addr;
    return { streetNum, streetName };
};

// Helper to create a Proaddress record and link it to a Property
const createProaddressForProperty = async (prop, p, motiveCode) => {
    const { streetNum, streetName } = parseAddress(p.addr);
    const proaddress = await Proaddress.create({
        PStreetNum: streetNum,
        PStreetName: streetName,
        Pcity: p.city,
        PState: p.state,
        Pzip: p.zip,
        owner_name: `${p.ownerFirst} ${p.ownerLast}`,
        PMotiveType: motiveCode,
        counties: p.county,
        price: parseFloat(p.value) || 0,
        beds: p.beds,
        baths: p.baths,
        square_feet: parseInt(p.sqft) || 0,
        proptype: p.type,
        PYearBuilt: p.year,
        comments: p.comment
    });
    await prop.update({ proaddress_id: proaddress.id });
    return proaddress;
};

const seedData = async () => {
    try {
        // Generate unique complex passwords for each user type
        const passwords = {
            admin: 'Admin@99Sell#2026',
            free: 'Free$User!2026',
            premium: 'Premium*Pass#2026'
        };

        // Hash all passwords
        const hashedPasswords = {
            admin: await bcrypt.hash(passwords.admin, 10),
            free: await bcrypt.hash(passwords.free, 10),
            premium: await bcrypt.hash(passwords.premium, 10)
        };

        // Log credentials for user reference
        console.log('\n========================================');
        console.log('USER CREDENTIALS - SAVE THESE!');
        console.log('========================================');
        console.log('Admin User:');
        console.log('  Email: admin@test.com');
        console.log('  Password:', passwords.admin);
        console.log('');
        console.log('Free User:');
        console.log('  Email: free@test.com');
        console.log('  Password:', passwords.free);
        console.log('');
        console.log('Premium User:');
        console.log('  Email: paid@test.com');
        console.log('  Password:', passwords.premium);
        console.log('========================================\n');

        // 1. Seed Subscriptions
        console.log('[SEED] Seeding subscriptions...');
        const plans = [
            { planName: 'free', price: 0, duration: 'monthly', status: 'active', description: 'Basic free plan' },
            { planName: 'premium', price: 49.99, duration: 'monthly', status: 'active', description: 'Premium features', popular: true }
        ];

        const seededPlans = {};
        for (const plan of plans) {
            const [p] = await Subscription.findOrCreate({
                where: { planName: plan.planName },
                defaults: plan
            });
            seededPlans[plan.planName] = p.subscriptionId;
        }

        // 2. Seed Motive Types (all 9 types from seed data)
        console.log('[SEED] Seeding motive types...');
        const motiveTypesList = [
            { code: 'PRE', name: 'Preforeclosure' },
            { code: 'FOR', name: 'Foreclosure' },
            { code: 'AUC', name: 'Auction' },
            { code: 'PRO', name: 'Probate' },
            { code: 'COD', name: 'Code Violations' },
            { code: 'EVI', name: 'Eviction' },
            { code: 'DIV', name: 'Divorce' },
            { code: 'TAX', name: 'Unpaid Taxes' },
            { code: 'OOS', name: 'Out of State' }
        ];

        const seededMotiveTypes = {};
        for (const type of motiveTypesList) {
            const [mt] = await MotiveTypes.findOrCreate({
                where: { code: type.code },
                defaults: type
            });
            seededMotiveTypes[type.code] = mt.id;
        }

        // 3. Seed Users & Associated Roles
        console.log('[SEED] Seeding users and roles...');
        const testUsers = [
            {
                Username: 'admin@test.com',
                Email: 'admin@test.com',
                Password: hashedPasswords.admin,
                FirstName: 'Admin',
                LastName: 'User',
                UserType: 'admin'
            },
            {
                Username: 'free@test.com',
                Email: 'free@test.com',
                Password: hashedPasswords.free,
                FirstName: 'Free',
                LastName: 'User',
                UserType: 'free'
            },
            {
                Username: 'paid@test.com',
                Email: 'paid@test.com',
                Password: hashedPasswords.premium,
                FirstName: 'Paid',
                LastName: 'User',
                UserType: 'premium'
            },

        ];

        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        for (const userData of testUsers) {
            const [user, created] = await UserLogin.findOrCreate({
                where: { Username: userData.Username },
                defaults: userData
            });

            if (!created) {
                await user.update({ Password: userData.Password, UserType: userData.UserType });
            }

            // Sync Role specific tables
            if (userData.UserType === 'free') {
                await FreeUser.findOrCreate({ where: { Username: userData.Username } });
            } else if (userData.UserType === 'premium') {
                await PremiumUser.findOrCreate({
                    where: { Username: userData.Username },
                    defaults: {
                        subscriptionId: seededPlans['premium'],
                        subscriptionEnd: nextYear,
                        paymentStatus: 'paid'
                    }
                });
            }
            console.log(`[SEED] Synced user: ${userData.Username} (${userData.UserType})`);
        }

        // =====================================================================
        // 4. Seed 95 Properties across all 9 motive types
        // =====================================================================
        console.log('[SEED] Seeding 95 properties across all motive types...');
        const propertyCount = await Property.count();
        if (propertyCount === 0) {
            let totalSeeded = 0;

            // ===================================================================
            // PREFORECLOSURE (11 properties)
            // ===================================================================
            const preProperties = [
                { addr: '142 Maple Street', city: 'Portland', state: 'OR', zip: '97201', county: 'Multnomah', type: 'Single Family', beds: '3', baths: '2', sqft: '1850', year: '2005', value: '475000', comment: 'Preforeclosure - Owner behind on payments', ownerFirst: 'Sarah', ownerLast: 'Johnson', email: 'sjohnson@example.com', borrower: 'Sarah Johnson', lender: 'Wells Fargo Bank', loanAmt: 380000, defaultAmt: 42000, arrears: 18000 },
                { addr: '2810 Willow Creek Rd', city: 'Sacramento', state: 'CA', zip: '95814', county: 'Sacramento', type: 'Single Family', beds: '4', baths: '2', sqft: '2100', year: '2001', value: '540000', comment: 'Notice of default filed. Owner seeking quick sale.', ownerFirst: 'Thomas', ownerLast: 'Baker', email: 'tbaker@example.com', borrower: 'Thomas Baker', lender: 'Citibank', loanAmt: 430000, defaultAmt: 55000, arrears: 24000 },
                { addr: '1234 Maple Street', city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles', type: 'Single Family', beds: '3', baths: '2', sqft: '1850', year: '2005', value: '650000', comment: 'Pre-foreclosure - Wells Fargo loan in default', ownerFirst: 'Michael', ownerLast: 'Thompson', email: 'mthompson@example.com', borrower: 'Michael J. Thompson', lender: 'Wells Fargo Bank', loanAmt: 520000, defaultAmt: 65000, arrears: 28000 },
                { addr: '1100 Maple Street', city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles County', type: 'Single Family', beds: '3', baths: '2', sqft: '1800', year: '2003', value: '350000', comment: 'Preforeclosure - Bank of America', ownerFirst: 'John', ownerLast: 'Doe', email: 'john.doe1@example.com', borrower: 'John Doe 1', lender: 'Bank of America', loanAmt: 200000, defaultAmt: 15000, arrears: 15000 },
                { addr: '1200 Maple Street', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade County', type: 'Single Family', beds: '3', baths: '2', sqft: '1800', year: '2004', value: '400000', comment: 'Preforeclosure - Behind on payments', ownerFirst: 'John', ownerLast: 'Doe2', email: 'john.doe2@example.com', borrower: 'John Doe 2', lender: 'Bank of America', loanAmt: 230000, defaultAmt: 17000, arrears: 17000 },
                { addr: '1300 Maple Street', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa County', type: 'Single Family', beds: '3', baths: '2', sqft: '1800', year: '2005', value: '450000', comment: 'Pre-foreclosure notice issued', ownerFirst: 'John', ownerLast: 'Doe3', email: 'john.doe3@example.com', borrower: 'John Doe 3', lender: 'Bank of America', loanAmt: 260000, defaultAmt: 19000, arrears: 19000 },
                { addr: '1400 Maple Street', city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas County', type: 'Single Family', beds: '3', baths: '2', sqft: '1800', year: '2006', value: '500000', comment: 'Owner in default - motivated', ownerFirst: 'John', ownerLast: 'Doe4', email: 'john.doe4@example.com', borrower: 'John Doe 4', lender: 'Bank of America', loanAmt: 290000, defaultAmt: 21000, arrears: 21000 },
                { addr: '1500 Maple Street', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton County', type: 'Single Family', beds: '3', baths: '2', sqft: '1800', year: '2007', value: '550000', comment: 'Lis pendens filed. Quick sale needed.', ownerFirst: 'John', ownerLast: 'Doe5', email: 'john.doe5@example.com', borrower: 'John Doe 5', lender: 'Bank of America', loanAmt: 320000, defaultAmt: 23000, arrears: 23000 },
                { addr: '415 Birch Lane', city: 'Tampa', state: 'FL', zip: '33601', county: 'Hillsborough', type: 'Single Family', beds: '3', baths: '2', sqft: '1650', year: '2009', value: '380000', comment: 'Pre-foreclosure. Owner willing to negotiate.', ownerFirst: 'Angela', ownerLast: 'Morris', email: 'amorris@example.com', borrower: 'Angela Morris', lender: 'US Bank', loanAmt: 295000, defaultAmt: 35000, arrears: 16000 },
                { addr: '7722 Pinecrest Ave', city: 'San Antonio', state: 'TX', zip: '78201', county: 'Bexar', type: 'Single Family', beds: '3', baths: '2', sqft: '1780', year: '2011', value: '310000', comment: 'Default notice received. Seller motivated.', ownerFirst: 'Gregory', ownerLast: 'Hall', email: 'ghall@example.com', borrower: 'Gregory Hall', lender: 'Regions Bank', loanAmt: 245000, defaultAmt: 29000, arrears: 14000 },
                { addr: '930 Elmwood Ct', city: 'Minneapolis', state: 'MN', zip: '55401', county: 'Hennepin', type: 'Townhouse', beds: '2', baths: '2', sqft: '1400', year: '2013', value: '290000', comment: 'Pre-foreclosure filing. Needs repairs.', ownerFirst: 'Diane', ownerLast: 'Foster', email: 'dfoster@example.com', borrower: 'Diane Foster', lender: 'TCF Bank', loanAmt: 220000, defaultAmt: 22000, arrears: 11000 }
            ];

            for (let i = 0; i < preProperties.length; i++) {
                const p = preProperties[i];
                const prop = await Property.create({ PStreetAddr1: p.addr, Pcity: p.city, Pstate: p.state, Pzip: p.zip, Pcounty: p.county, PType: p.type, PBeds: p.beds, PBaths: p.baths, PTotSQFootage: p.sqft, PYearBuilt: p.year, PTotAppraisedAmt: p.value, PComments: p.comment, motive_type_id: seededMotiveTypes['PRE'] });
                await createProaddressForProperty(prop, p, 'PRE');
                await Owner.create({ OFirstName: p.ownerFirst, OLastName: p.ownerLast, email: p.email, OStreetAddr1: p.addr, OCity: p.city, OState: p.state, OZip: p.zip, OProperty_id: prop.id });
                await Loan.create({ property_id: prop.id, borrower_name: p.borrower, lender_name: p.lender, loan_amount: p.loanAmt, total_default_amount: p.defaultAmt, arrears_amount: p.arrears, foreclosure_stage: 'Pre-Foreclosure', default_status: 'Active' });
                totalSeeded++;
            }
            console.log(`[SEED] ✓ Preforeclosure: ${preProperties.length} properties`);

            // ===================================================================
            // FORECLOSURE (11 properties)
            // ===================================================================
            const forProperties = [
                { addr: '789 Ocean View Drive', city: 'Santa Monica', state: 'CA', zip: '90401', county: 'Los Angeles', type: 'Condo', beds: '2', baths: '2', sqft: '1200', year: '2015', value: '850000', comment: 'Active foreclosure proceeding', ownerFirst: 'Michael', ownerLast: 'Chen', email: 'mchen@example.com', borrower: 'Michael Chen', lender: 'Bank of America', loanAmt: 680000, defaultAmt: 125000, arrears: 48000, auctionPlace: 'Los Angeles County Courthouse', auctionCity: 'Los Angeles', auctionState: 'CA', minBid: 700000, auctionDays: 30 },
                { addr: '550 Peachtree Lane', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton', type: 'Single Family', beds: '4', baths: '3', sqft: '2800', year: '2005', value: '680000', comment: 'Lis pendens filed. Spacious family home.', ownerFirst: 'David', ownerLast: 'Johnson', email: 'djohnson@example.com', borrower: 'David Johnson', lender: 'SunTrust Bank', loanAmt: 520000, defaultAmt: 78000, arrears: 34000, auctionPlace: 'Fulton County Courthouse Steps', auctionCity: 'Atlanta', auctionState: 'GA', minBid: 450000, auctionDays: 45 },
                { addr: '5678 Oak Avenue', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa', type: 'Single Family', beds: '4', baths: '3', sqft: '2400', year: '2010', value: '485000', comment: 'Foreclosure - Arizona Foreclosure Services', ownerFirst: 'Sarah', ownerLast: 'Rodriguez', email: 'srodriguez@example.com', borrower: 'Sarah M. Rodriguez', lender: 'Bank of America', loanAmt: 380000, defaultAmt: 65000, arrears: 28000, auctionPlace: 'Maricopa County Courthouse', auctionCity: 'Phoenix', auctionState: 'AZ', minBid: 350000, auctionDays: 20 },
                { addr: '2100 Oak Avenue', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade County', type: 'Single Family', beds: '4', baths: '3', sqft: '2200', year: '2008', value: '460000', comment: 'Foreclosed - Wells Fargo', ownerFirst: 'Jane', ownerLast: 'Smith1', email: 'jane.smith1@example.com', borrower: 'Jane Smith 1', lender: 'Wells Fargo', loanAmt: 290000, defaultAmt: 28000, arrears: 28000, auctionPlace: 'Miami-Dade County Courthouse', auctionCity: 'Miami', auctionState: 'FL', minBid: 230000, auctionDays: 30 },
                { addr: '2200 Oak Avenue', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa County', type: 'Single Family', beds: '4', baths: '3', sqft: '2200', year: '2009', value: '520000', comment: 'Foreclosure auction pending', ownerFirst: 'Jane', ownerLast: 'Smith2', email: 'jane.smith2@example.com', borrower: 'Jane Smith 2', lender: 'Wells Fargo', loanAmt: 330000, defaultAmt: 31000, arrears: 31000, auctionPlace: 'Maricopa County Courthouse', auctionCity: 'Phoenix', auctionState: 'AZ', minBid: 260000, auctionDays: 35 },
                { addr: '2300 Oak Avenue', city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas County', type: 'Single Family', beds: '4', baths: '3', sqft: '2200', year: '2010', value: '580000', comment: 'Active foreclosure. Bank-owned soon.', ownerFirst: 'Jane', ownerLast: 'Smith3', email: 'jane.smith3@example.com', borrower: 'Jane Smith 3', lender: 'Wells Fargo', loanAmt: 370000, defaultAmt: 34000, arrears: 34000, auctionPlace: 'Dallas County Courthouse', auctionCity: 'Dallas', auctionState: 'TX', minBid: 290000, auctionDays: 25 },
                { addr: '2400 Oak Avenue', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton County', type: 'Single Family', beds: '4', baths: '3', sqft: '2200', year: '2011', value: '640000', comment: 'Foreclosure - judge ordered sale', ownerFirst: 'Jane', ownerLast: 'Smith4', email: 'jane.smith4@example.com', borrower: 'Jane Smith 4', lender: 'Wells Fargo', loanAmt: 410000, defaultAmt: 37000, arrears: 37000, auctionPlace: 'Fulton County Courthouse', auctionCity: 'Atlanta', auctionState: 'GA', minBid: 320000, auctionDays: 40 },
                { addr: '2500 Oak Avenue', city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles County', type: 'Single Family', beds: '4', baths: '3', sqft: '2200', year: '2012', value: '700000', comment: 'Foreclosure process initiated', ownerFirst: 'Jane', ownerLast: 'Smith5', email: 'jane.smith5@example.com', borrower: 'Jane Smith 5', lender: 'Wells Fargo', loanAmt: 450000, defaultAmt: 40000, arrears: 40000, auctionPlace: 'Los Angeles County Courthouse', auctionCity: 'Los Angeles', auctionState: 'CA', minBid: 350000, auctionDays: 28 },
                { addr: '610 Magnolia Blvd', city: 'Nashville', state: 'TN', zip: '37201', county: 'Davidson', type: 'Single Family', beds: '3', baths: '2', sqft: '1950', year: '2007', value: '425000', comment: 'Foreclosure. Auction date set.', ownerFirst: 'Walter', ownerLast: 'Brooks', email: 'wbrooks@example.com', borrower: 'Walter Brooks', lender: 'Pinnacle Bank', loanAmt: 340000, defaultAmt: 52000, arrears: 22000, auctionPlace: 'Davidson County Courthouse', auctionCity: 'Nashville', auctionState: 'TN', minBid: 280000, auctionDays: 15 },
                { addr: '2850 Harbor View', city: 'San Diego', state: 'CA', zip: '92101', county: 'San Diego', type: 'Condo', beds: '2', baths: '2', sqft: '1150', year: '2014', value: '580000', comment: 'Coastal condo in foreclosure', ownerFirst: 'Rachel', ownerLast: 'Kim', email: 'rkim@example.com', borrower: 'Rachel Kim', lender: 'US Bank', loanAmt: 460000, defaultAmt: 72000, arrears: 31000, auctionPlace: 'San Diego County Courthouse', auctionCity: 'San Diego', auctionState: 'CA', minBid: 420000, auctionDays: 22 },
                { addr: '1188 Riverside Dr', city: 'Jacksonville', state: 'FL', zip: '32202', county: 'Duval', type: 'Single Family', beds: '4', baths: '2', sqft: '2300', year: '2003', value: '365000', comment: 'Foreclosure sale scheduled next month', ownerFirst: 'Frank', ownerLast: 'Howard', email: 'fhoward@example.com', borrower: 'Frank Howard', lender: 'Regions Bank', loanAmt: 280000, defaultAmt: 45000, arrears: 19000, auctionPlace: 'Duval County Courthouse', auctionCity: 'Jacksonville', auctionState: 'FL', minBid: 240000, auctionDays: 32 }
            ];

            for (let i = 0; i < forProperties.length; i++) {
                const p = forProperties[i];
                const prop = await Property.create({ PStreetAddr1: p.addr, Pcity: p.city, Pstate: p.state, Pzip: p.zip, Pcounty: p.county, PType: p.type, PBeds: p.beds, PBaths: p.baths, PTotSQFootage: p.sqft, PYearBuilt: p.year, PTotAppraisedAmt: p.value, PComments: p.comment, motive_type_id: seededMotiveTypes['FOR'] });
                await createProaddressForProperty(prop, p, 'FOR');
                await Owner.create({ OFirstName: p.ownerFirst, OLastName: p.ownerLast, email: p.email, OStreetAddr1: p.addr, OCity: p.city, OState: p.state, OZip: p.zip, OProperty_id: prop.id });
                await Loan.create({ property_id: prop.id, borrower_name: p.borrower, lender_name: p.lender, loan_amount: p.loanAmt, total_default_amount: p.defaultAmt, arrears_amount: p.arrears, foreclosure_stage: 'Foreclosure', default_status: 'Active' });
                await Auction.create({ AAuctionDateTime: futureDate(p.auctionDays), AAuctionPlace: p.auctionPlace, AAuctionCity: p.auctionCity, AAuctionState: p.auctionState, AAuctionDescription: `Foreclosure auction - ${p.addr}`, minimum_bid: p.minBid, APropertyID: prop.id });
                totalSeeded++;
            }
            console.log(`[SEED] ✓ Foreclosure: ${forProperties.length} properties`);

            // ===================================================================
            // AUCTION (11 properties)
            // ===================================================================
            const aucProperties = [
                { addr: '456 Mountain Road', city: 'Denver', state: 'CO', zip: '80202', county: 'Denver', type: 'Single Family', beds: '4', baths: '3', sqft: '2400', year: '2010', value: '625000', comment: 'Scheduled for auction this month', ownerFirst: 'Jennifer', ownerLast: 'Martinez', email: 'jmartinez@example.com', auctionPlace: 'Denver County Courthouse Steps', auctionCity: 'Denver', auctionState: 'CO', minBid: 500000, days: 10 },
                { addr: '9012 Pine Boulevard', city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas', type: 'Single Family', beds: '3', baths: '2', sqft: '2100', year: '2008', value: '425000', comment: 'Tax foreclosure auction', ownerFirst: 'Robert', ownerLast: 'Lee', email: 'rlee@example.com', auctionPlace: 'Dallas County Courthouse', auctionCity: 'Dallas', auctionState: 'TX', minBid: 295000, days: 20 },
                { addr: '3100 Pine Road', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa County', type: 'Condo', beds: '3', baths: '2', sqft: '2000', year: '2009', value: '420000', comment: 'Auction at City Hall next week', ownerFirst: 'Bob', ownerLast: 'Johnson1', email: 'bob.johnson1@example.com', auctionPlace: 'Phoenix City Hall', auctionCity: 'Phoenix', auctionState: 'AZ', minBid: 330000, days: 7 },
                { addr: '3200 Pine Road', city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas County', type: 'Condo', beds: '3', baths: '2', sqft: '2000', year: '2010', value: '490000', comment: 'Public auction - cash or certified check', ownerFirst: 'Bob', ownerLast: 'Johnson2', email: 'bob.johnson2@example.com', auctionPlace: 'Dallas City Hall', auctionCity: 'Dallas', auctionState: 'TX', minBid: 380000, days: 12 },
                { addr: '3300 Pine Road', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton County', type: 'Condo', beds: '3', baths: '2', sqft: '2000', year: '2011', value: '560000', comment: 'Auction scheduled - motivated seller', ownerFirst: 'Bob', ownerLast: 'Johnson3', email: 'bob.johnson3@example.com', auctionPlace: 'Fulton County Courthouse', auctionCity: 'Atlanta', auctionState: 'GA', minBid: 430000, days: 14 },
                { addr: '3400 Pine Road', city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles County', type: 'Condo', beds: '3', baths: '2', sqft: '2000', year: '2012', value: '630000', comment: 'Bank-ordered auction. As-is condition.', ownerFirst: 'Bob', ownerLast: 'Johnson4', email: 'bob.johnson4@example.com', auctionPlace: 'LA County Courthouse', auctionCity: 'Los Angeles', auctionState: 'CA', minBid: 480000, days: 18 },
                { addr: '3500 Pine Road', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade County', type: 'Condo', beds: '3', baths: '2', sqft: '2000', year: '2013', value: '700000', comment: 'Beachside condo at auction', ownerFirst: 'Bob', ownerLast: 'Johnson5', email: 'bob.johnson5@example.com', auctionPlace: 'Miami-Dade County Courthouse', auctionCity: 'Miami', auctionState: 'FL', minBid: 530000, days: 21 },
                { addr: '775 Oakmont Circle', city: 'Charlotte', state: 'NC', zip: '28201', county: 'Mecklenburg', type: 'Single Family', beds: '4', baths: '3', sqft: '2600', year: '2006', value: '520000', comment: 'Estate auction - all cash bidding', ownerFirst: 'Nathan', ownerLast: 'Price', email: 'nprice@example.com', auctionPlace: 'Mecklenburg County Courthouse', auctionCity: 'Charlotte', auctionState: 'NC', minBid: 380000, days: 8 },
                { addr: '210 Bayshore Dr', city: 'Tampa', state: 'FL', zip: '33601', county: 'Hillsborough', type: 'Condo', beds: '2', baths: '2', sqft: '1300', year: '2016', value: '390000', comment: 'Waterfront auction. Online bidding.', ownerFirst: 'Sandra', ownerLast: 'White', email: 'swhite@example.com', auctionPlace: 'Hillsborough County Courthouse', auctionCity: 'Tampa', auctionState: 'FL', minBid: 280000, days: 16 },
                { addr: '4400 Grand Ave', city: 'Kansas City', state: 'MO', zip: '64101', county: 'Jackson', type: 'Single Family', beds: '3', baths: '2', sqft: '1900', year: '2002', value: '285000', comment: 'Public auction next month', ownerFirst: 'Dennis', ownerLast: 'Russell', email: 'drussell@example.com', auctionPlace: 'Jackson County Courthouse', auctionCity: 'Kansas City', auctionState: 'MO', minBid: 195000, days: 25 },
                { addr: '1650 Summit Ridge', city: 'Colorado Springs', state: 'CO', zip: '80901', county: 'El Paso', type: 'Single Family', beds: '4', baths: '3', sqft: '2750', year: '2009', value: '475000', comment: 'Mountain view home at auction', ownerFirst: 'Barbara', ownerLast: 'King', email: 'bking@example.com', auctionPlace: 'El Paso County Courthouse', auctionCity: 'Colorado Springs', auctionState: 'CO', minBid: 340000, days: 11 }
            ];

            for (let i = 0; i < aucProperties.length; i++) {
                const p = aucProperties[i];
                const prop = await Property.create({ PStreetAddr1: p.addr, Pcity: p.city, Pstate: p.state, Pzip: p.zip, Pcounty: p.county, PType: p.type, PBeds: p.beds, PBaths: p.baths, PTotSQFootage: p.sqft, PYearBuilt: p.year, PTotAppraisedAmt: p.value, PComments: p.comment, motive_type_id: seededMotiveTypes['AUC'] });
                await createProaddressForProperty(prop, p, 'AUC');
                await Owner.create({ OFirstName: p.ownerFirst, OLastName: p.ownerLast, email: p.email, OStreetAddr1: p.addr, OCity: p.city, OState: p.state, OZip: p.zip, OProperty_id: prop.id });
                await Auction.create({ AAuctionDateTime: futureDate(p.days), AAuctionPlace: p.auctionPlace, AAuctionCity: p.auctionCity, AAuctionState: p.auctionState, AAuctionDescription: `Public auction - ${p.addr}`, minimum_bid: p.minBid, APropertyID: prop.id });
                totalSeeded++;
            }
            console.log(`[SEED] ✓ Auction: ${aucProperties.length} properties`);

            // ===================================================================
            // PROBATE (11 properties)
            // ===================================================================
            const proProperties = [
                { addr: '234 Heritage Lane', city: 'Charleston', state: 'SC', zip: '29401', county: 'Charleston', type: 'Historical Home', beds: '3', baths: '2', sqft: '2100', year: '1920', value: '725000', comment: 'Estate sale - Probate proceeding', ownerFirst: 'James', ownerLast: 'Williams', email: 'jwilliams@example.com', caseNum: 'PR-2025-00421', courtCounty: 'Charleston', deathDate: '2025-10-01', executor: 'Robert Williams', estateVal: 725000 },
                { addr: '875 Coral Way', city: 'Miami', state: 'FL', zip: '33145', county: 'Miami-Dade', type: 'Single Family', beds: '3', baths: '2', sqft: '1800', year: '1972', value: '750000', comment: 'Probate property. Estate looking for quick sale.', ownerFirst: 'Carlos', ownerLast: 'Rivera', email: 'crivera@example.com', caseNum: 'PR-2025-08832', courtCounty: 'Miami-Dade', deathDate: '2025-08-15', executor: 'Maria Rivera', estateVal: 750000 },
                { addr: '3456 Elm Street', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade', type: 'Single Family', beds: '4', baths: '3', sqft: '2800', year: '2000', value: '725000', comment: 'Estate includes primary residence', ownerFirst: 'Margaret', ownerLast: 'Anderson', email: 'manderson@example.com', caseNum: 'PR-2023-8765', courtCounty: 'Miami-Dade', deathDate: '2023-10-10', executor: 'James Anderson', estateVal: 1250000 },
                { addr: '4100 Elm Street', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa County', type: 'Townhouse', beds: '2', baths: '2', sqft: '1500', year: '2001', value: '335000', comment: 'Estate sale - executor ready to sell', ownerFirst: 'Mary', ownerLast: 'Wilson1', email: 'estate.wilson1@example.com', caseNum: 'PRO-2024-1001', courtCounty: 'Maricopa County', deathDate: '2024-01-15', executor: 'Executor Wilson 1', estateVal: 360000 },
                { addr: '4200 Elm Street', city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas County', type: 'Townhouse', beds: '2', baths: '2', sqft: '1500', year: '2002', value: '390000', comment: 'Probate approved. Ready for sale.', ownerFirst: 'Mary', ownerLast: 'Wilson2', email: 'estate.wilson2@example.com', caseNum: 'PRO-2024-1002', courtCounty: 'Dallas County', deathDate: '2024-02-15', executor: 'Executor Wilson 2', estateVal: 420000 },
                { addr: '4300 Elm Street', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton County', type: 'Townhouse', beds: '2', baths: '2', sqft: '1500', year: '2003', value: '445000', comment: 'Estate probate in progress', ownerFirst: 'Mary', ownerLast: 'Wilson3', email: 'estate.wilson3@example.com', caseNum: 'PRO-2024-1003', courtCounty: 'Fulton County', deathDate: '2024-03-15', executor: 'Executor Wilson 3', estateVal: 480000 },
                { addr: '4400 Elm Street', city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles County', type: 'Townhouse', beds: '2', baths: '2', sqft: '1500', year: '2004', value: '500000', comment: 'Heirs seeking quick estate liquidation', ownerFirst: 'Mary', ownerLast: 'Wilson4', email: 'estate.wilson4@example.com', caseNum: 'PRO-2024-1004', courtCounty: 'Los Angeles County', deathDate: '2024-04-15', executor: 'Executor Wilson 4', estateVal: 540000 },
                { addr: '4500 Elm Street', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade County', type: 'Townhouse', beds: '2', baths: '2', sqft: '1500', year: '2005', value: '555000', comment: 'Probate court approved sale', ownerFirst: 'Mary', ownerLast: 'Wilson5', email: 'estate.wilson5@example.com', caseNum: 'PRO-2024-1005', courtCounty: 'Miami-Dade County', deathDate: '2024-05-15', executor: 'Executor Wilson 5', estateVal: 600000 },
                { addr: '880 Hickory Rd', city: 'Raleigh', state: 'NC', zip: '27601', county: 'Wake', type: 'Single Family', beds: '3', baths: '2', sqft: '1900', year: '1985', value: '340000', comment: 'Estate sale. Property needs updating.', ownerFirst: 'Harold', ownerLast: 'Evans', email: 'hevans@example.com', caseNum: 'PRO-2025-2201', courtCounty: 'Wake', deathDate: '2025-03-01', executor: 'Susan Evans', estateVal: 340000 },
                { addr: '1225 Chestnut Ave', city: 'Philadelphia', state: 'PA', zip: '19101', county: 'Philadelphia', type: 'Row House', beds: '3', baths: '1', sqft: '1350', year: '1930', value: '280000', comment: 'Historic row house in probate', ownerFirst: 'Dorothy', ownerLast: 'Campbell', email: 'dcampbell@example.com', caseNum: 'PRO-2025-3310', courtCounty: 'Philadelphia', deathDate: '2025-01-20', executor: 'William Campbell', estateVal: 280000 },
                { addr: '560 Pecan Lane', city: 'New Orleans', state: 'LA', zip: '70112', county: 'Orleans', type: 'Single Family', beds: '4', baths: '2', sqft: '2200', year: '1955', value: '410000', comment: 'Probate estate. Large lot.', ownerFirst: 'Eugene', ownerLast: 'Mitchell', email: 'emitchell@example.com', caseNum: 'PRO-2025-4455', courtCounty: 'Orleans', deathDate: '2025-05-10', executor: 'Karen Mitchell', estateVal: 410000 }
            ];

            for (let i = 0; i < proProperties.length; i++) {
                const p = proProperties[i];
                const prop = await Property.create({ PStreetAddr1: p.addr, Pcity: p.city, Pstate: p.state, Pzip: p.zip, Pcounty: p.county, PType: p.type, PBeds: p.beds, PBaths: p.baths, PTotSQFootage: p.sqft, PYearBuilt: p.year, PTotAppraisedAmt: p.value, PComments: p.comment, motive_type_id: seededMotiveTypes['PRO'] });
                await createProaddressForProperty(prop, p, 'PRO');
                await Owner.create({ OFirstName: p.ownerFirst, OLastName: p.ownerLast, email: p.email, OStreetAddr1: p.addr, OCity: p.city, OState: p.state, OZip: p.zip, OProperty_id: prop.id });
                await Probate.create({ property_id: prop.id, case_number: p.caseNum, probate_court_county: p.courtCounty, date_of_death: p.deathDate, executor_name: p.executor, estate_value: p.estateVal, status: 'Open' });
                totalSeeded++;
            }
            console.log(`[SEED] ✓ Probate: ${proProperties.length} properties`);

            // ===================================================================
            // CODE VIOLATIONS (10 properties)
            // ===================================================================
            const codProperties = [
                { addr: '567 Park Avenue', city: 'Detroit', state: 'MI', zip: '48201', county: 'Wayne', type: 'Single Family', beds: '3', baths: '1', sqft: '1400', year: '1975', value: '125000', comment: 'Multiple code violations - Motivated seller', ownerFirst: 'David', ownerLast: 'Thompson', email: 'dthompson@example.com', violType: 'Building Code Violations', fineAmt: 15000, deadline: '2026-05-10' },
                { addr: '7890 Cedar Lane', city: 'Chicago', state: 'IL', zip: '60601', county: 'Cook', type: 'Single Family', beds: '3', baths: '2', sqft: '1650', year: '1995', value: '385000', comment: 'Deteriorating roof and damaged siding', ownerFirst: 'Patricia', ownerLast: 'Davis', email: 'pdavis2@example.com', violType: 'Building Code Violation', fineAmt: 12000, deadline: '2026-04-15' },
                { addr: '5100 Cedar Lane', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa County', type: 'Single Family', beds: '3', baths: '1', sqft: '1600', year: '1990', value: '265000', comment: 'Structural damage code violation', ownerFirst: 'Tom', ownerLast: 'Brown1', email: 'tom.brown1@example.com', violType: 'Structural Damage', fineAmt: 6000, deadline: '2026-06-01' },
                { addr: '5200 Cedar Lane', city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas County', type: 'Single Family', beds: '3', baths: '1', sqft: '1600', year: '1991', value: '310000', comment: 'Electrical code violations', ownerFirst: 'Tom', ownerLast: 'Brown2', email: 'tom.brown2@example.com', violType: 'Electrical Violations', fineAmt: 7000, deadline: '2026-07-01' },
                { addr: '5300 Cedar Lane', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton County', type: 'Single Family', beds: '3', baths: '1', sqft: '1600', year: '1992', value: '355000', comment: 'Plumbing and fire code issues', ownerFirst: 'Tom', ownerLast: 'Brown3', email: 'tom.brown3@example.com', violType: 'Fire Code Violation', fineAmt: 8000, deadline: '2026-08-01' },
                { addr: '5400 Cedar Lane', city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles County', type: 'Single Family', beds: '3', baths: '1', sqft: '1600', year: '1993', value: '400000', comment: 'Zoning violation - unpermitted addition', ownerFirst: 'Tom', ownerLast: 'Brown4', email: 'tom.brown4@example.com', violType: 'Zoning Violation', fineAmt: 9000, deadline: '2026-09-01' },
                { addr: '5500 Cedar Lane', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade County', type: 'Single Family', beds: '3', baths: '1', sqft: '1600', year: '1994', value: '445000', comment: 'Health and safety violations', ownerFirst: 'Tom', ownerLast: 'Brown5', email: 'tom.brown5@example.com', violType: 'Health & Safety Violation', fineAmt: 10000, deadline: '2026-10-01' },
                { addr: '312 Walnut St', city: 'Baltimore', state: 'MD', zip: '21201', county: 'Baltimore City', type: 'Townhouse', beds: '3', baths: '1', sqft: '1300', year: '1960', value: '165000', comment: 'Condemned property. Code violations.', ownerFirst: 'Raymond', ownerLast: 'Collins', email: 'rcollins@example.com', violType: 'Condemnation Notice', fineAmt: 20000, deadline: '2026-03-01' },
                { addr: '888 Ivy Rd', city: 'Cleveland', state: 'OH', zip: '44101', county: 'Cuyahoga', type: 'Single Family', beds: '2', baths: '1', sqft: '1100', year: '1950', value: '95000', comment: 'Roof collapse, structural violations', ownerFirst: 'Betty', ownerLast: 'Reed', email: 'breed@example.com', violType: 'Structural Collapse', fineAmt: 25000, deadline: '2026-04-01' },
                { addr: '1430 Poplar Ave', city: 'Memphis', state: 'TN', zip: '38103', county: 'Shelby', type: 'Single Family', beds: '3', baths: '2', sqft: '1550', year: '1978', value: '140000', comment: 'Environmental and building code violations', ownerFirst: 'Carl', ownerLast: 'Murphy', email: 'cmurphy@example.com', violType: 'Environmental Violation', fineAmt: 18000, deadline: '2026-05-15' }
            ];

            for (let i = 0; i < codProperties.length; i++) {
                const p = codProperties[i];
                const prop = await Property.create({ PStreetAddr1: p.addr, Pcity: p.city, Pstate: p.state, Pzip: p.zip, Pcounty: p.county, PType: p.type, PBeds: p.beds, PBaths: p.baths, PTotSQFootage: p.sqft, PYearBuilt: p.year, PTotAppraisedAmt: p.value, PComments: p.comment, motive_type_id: seededMotiveTypes['COD'] });
                await createProaddressForProperty(prop, p, 'COD');
                await Owner.create({ OFirstName: p.ownerFirst, OLastName: p.ownerLast, email: p.email, OStreetAddr1: p.addr, OCity: p.city, OState: p.state, OZip: p.zip, OProperty_id: prop.id });
                await Violation.create({ property_id: prop.id, types: p.violType, fine_amount: p.fineAmt, remediation_deadline: p.deadline, compliance_status: 'Non-Compliant' });
                totalSeeded++;
            }
            console.log(`[SEED] ✓ Code Violations: ${codProperties.length} properties`);

            // ===================================================================
            // EVICTION (10 properties)
            // ===================================================================
            const eviProperties = [
                { addr: '890 Elm Street', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa', type: 'Townhouse', beds: '2', baths: '2', sqft: '1600', year: '2018', value: '320000', comment: 'Tenant eviction in progress', ownerFirst: 'Lisa', ownerLast: 'Anderson', email: 'landerson@example.com', courtDate: '2026-03-15', docket: 'CV-2026-001245', plaintiff: 'Lisa Anderson' },
                { addr: '320 Magnolia Street', city: 'Savannah', state: 'GA', zip: '31401', county: 'Chatham', type: 'Victorian', beds: '4', baths: '3', sqft: '2900', year: '1920', value: '580000', comment: 'Historic Victorian. Eviction filed.', ownerFirst: 'Patricia', ownerLast: 'DavisEvi', email: 'pdavis3@example.com', courtDate: '2026-04-10', docket: 'CV-2026-003387', plaintiff: 'Patricia Davis' },
                { addr: '2468 Birch Court', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton', type: 'Single Family', beds: '3', baths: '2', sqft: '1750', year: '2012', value: '395000', comment: 'Non-payment eviction filed', ownerFirst: 'Christopher', ownerLast: 'Miller', email: 'cmiller@example.com', courtDate: '2026-02-25', docket: 'EV-2024-1234', plaintiff: 'Christopher Miller' },
                { addr: '6100 Birch Court', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa County', type: 'Apartment', beds: '2', baths: '1', sqft: '1200', year: '2015', value: '230000', comment: 'Eviction for non-payment', ownerFirst: 'Sarah', ownerLast: 'Davis1', email: 'sarah.davis1@example.com', courtDate: '2026-05-01', docket: 'EV-2024-2001', plaintiff: 'Property Management Co' },
                { addr: '6200 Birch Court', city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas County', type: 'Apartment', beds: '2', baths: '1', sqft: '1200', year: '2016', value: '270000', comment: 'Lease violation eviction', ownerFirst: 'Sarah', ownerLast: 'Davis2', email: 'sarah.davis2@example.com', courtDate: '2026-06-01', docket: 'EV-2024-2002', plaintiff: 'Property Management Co' },
                { addr: '6300 Birch Court', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton County', type: 'Apartment', beds: '2', baths: '1', sqft: '1200', year: '2017', value: '310000', comment: 'Tenant damage eviction', ownerFirst: 'Sarah', ownerLast: 'Davis3', email: 'sarah.davis3@example.com', courtDate: '2026-07-01', docket: 'EV-2024-2003', plaintiff: 'Property Management Co' },
                { addr: '6400 Birch Court', city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles County', type: 'Apartment', beds: '2', baths: '1', sqft: '1200', year: '2018', value: '350000', comment: 'Unauthorized occupant eviction', ownerFirst: 'Sarah', ownerLast: 'Davis4', email: 'sarah.davis4@example.com', courtDate: '2026-08-01', docket: 'EV-2024-2004', plaintiff: 'Property Management Co' },
                { addr: '6500 Birch Court', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade County', type: 'Apartment', beds: '2', baths: '1', sqft: '1200', year: '2019', value: '390000', comment: 'Holdover tenant eviction', ownerFirst: 'Sarah', ownerLast: 'Davis5', email: 'sarah.davis5@example.com', courtDate: '2026-09-01', docket: 'EV-2024-2005', plaintiff: 'Property Management Co' },
                { addr: '950 Sycamore Blvd', city: 'Oklahoma City', state: 'OK', zip: '73101', county: 'Oklahoma', type: 'Duplex', beds: '3', baths: '2', sqft: '1800', year: '2000', value: '210000', comment: 'Eviction filed. Both units affected.', ownerFirst: 'Roy', ownerLast: 'Stewart', email: 'rstewart@example.com', courtDate: '2026-04-20', docket: 'EV-2026-5521', plaintiff: 'Roy Stewart' },
                { addr: '2205 Lakeshore Dr', city: 'Milwaukee', state: 'WI', zip: '53201', county: 'Milwaukee', type: 'Single Family', beds: '3', baths: '2', sqft: '1700', year: '2005', value: '265000', comment: 'Drug activity eviction filing', ownerFirst: 'Doris', ownerLast: 'Bennett', email: 'dbennett@example.com', courtDate: '2026-05-15', docket: 'EV-2026-6632', plaintiff: 'Doris Bennett' }
            ];

            for (let i = 0; i < eviProperties.length; i++) {
                const p = eviProperties[i];
                const prop = await Property.create({ PStreetAddr1: p.addr, Pcity: p.city, Pstate: p.state, Pzip: p.zip, Pcounty: p.county, PType: p.type, PBeds: p.beds, PBaths: p.baths, PTotSQFootage: p.sqft, PYearBuilt: p.year, PTotAppraisedAmt: p.value, PComments: p.comment, motive_type_id: seededMotiveTypes['EVI'] });
                await createProaddressForProperty(prop, p, 'EVI');
                await Owner.create({ OFirstName: p.ownerFirst, OLastName: p.ownerLast, email: p.email, OStreetAddr1: p.addr, OCity: p.city, OState: p.state, OZip: p.zip, OProperty_id: prop.id });
                await Eviction.create({ property_id: prop.id, court_date: p.courtDate, court_docket: p.docket, plaintiff_name: p.plaintiff });
                totalSeeded++;
            }
            console.log(`[SEED] ✓ Eviction: ${eviProperties.length} properties`);

            // ===================================================================
            // DIVORCE (10 properties)
            // ===================================================================
            const divProperties = [
                { addr: '321 Sunset Boulevard', city: 'Austin', state: 'TX', zip: '78701', county: 'Travis', type: 'Single Family', beds: '4', baths: '3', sqft: '2800', year: '2012', value: '650000', comment: 'Marital asset - Divorce settlement required', ownerFirst: 'Mark', ownerLast: 'Robinson', email: 'mrobinson@example.com', caseNum: 'DIV-2025-7788', attorney: 'Rebecca Torres, Esq.', filingDate: '2025-10-01', petitioner: 'Mark Robinson', respondent: 'Karen Robinson' },
                { addr: '1357 Willow Drive', city: 'Seattle', state: 'WA', zip: '98101', county: 'King', type: 'Single Family', beds: '4', baths: '3', sqft: '3200', year: '2015', value: '895000', comment: 'Contested divorce - property division', ownerFirst: 'Jennifer', ownerLast: 'Wilson', email: 'jwilson@example.com', caseNum: 'DIV-2023-5678', attorney: 'Smith & Associates', filingDate: '2023-09-15', petitioner: 'Jennifer Wilson', respondent: 'Thomas Wilson' },
                { addr: '7100 Willow Drive', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa County', type: 'Single Family', beds: '4', baths: '2', sqft: '2400', year: '2008', value: '385000', comment: 'Divorce settlement - must sell', ownerFirst: 'Mike', ownerLast: 'Anderson1', email: 'mike.anderson1@example.com', caseNum: 'DIV-2024-3001', attorney: 'Law Firm Anderson 1', filingDate: '2024-03-01', petitioner: 'Mike Anderson1', respondent: 'Lisa Anderson1' },
                { addr: '7200 Willow Drive', city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas County', type: 'Single Family', beds: '4', baths: '2', sqft: '2400', year: '2009', value: '450000', comment: 'Court ordered property sale', ownerFirst: 'Mike', ownerLast: 'Anderson2', email: 'mike.anderson2@example.com', caseNum: 'DIV-2024-3002', attorney: 'Law Firm Anderson 2', filingDate: '2024-04-01', petitioner: 'Mike Anderson2', respondent: 'Lisa Anderson2' },
                { addr: '7300 Willow Drive', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton County', type: 'Single Family', beds: '4', baths: '2', sqft: '2400', year: '2010', value: '515000', comment: 'Divorce pending. Both parties want to sell.', ownerFirst: 'Mike', ownerLast: 'Anderson3', email: 'mike.anderson3@example.com', caseNum: 'DIV-2024-3003', attorney: 'Law Firm Anderson 3', filingDate: '2024-05-01', petitioner: 'Mike Anderson3', respondent: 'Lisa Anderson3' },
                { addr: '7400 Willow Drive', city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles County', type: 'Single Family', beds: '4', baths: '2', sqft: '2400', year: '2011', value: '580000', comment: 'Marital home - forced sale', ownerFirst: 'Mike', ownerLast: 'Anderson4', email: 'mike.anderson4@example.com', caseNum: 'DIV-2024-3004', attorney: 'Law Firm Anderson 4', filingDate: '2024-06-01', petitioner: 'Mike Anderson4', respondent: 'Lisa Anderson4' },
                { addr: '7500 Willow Drive', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade County', type: 'Single Family', beds: '4', baths: '2', sqft: '2400', year: '2012', value: '645000', comment: 'Divorce decree requires property sale', ownerFirst: 'Mike', ownerLast: 'Anderson5', email: 'mike.anderson5@example.com', caseNum: 'DIV-2024-3005', attorney: 'Law Firm Anderson 5', filingDate: '2024-07-01', petitioner: 'Mike Anderson5', respondent: 'Lisa Anderson5' },
                { addr: '425 Rosewood Ave', city: 'Houston', state: 'TX', zip: '77001', county: 'Harris', type: 'Single Family', beds: '5', baths: '3', sqft: '3500', year: '2014', value: '720000', comment: 'High-value divorce. Property must sell.', ownerFirst: 'Steven', ownerLast: 'Wright', email: 'swright@example.com', caseNum: 'DIV-2025-8810', attorney: 'Baker & McKenzie', filingDate: '2025-06-01', petitioner: 'Steven Wright', respondent: 'Mary Wright' },
                { addr: '1750 Cherry Blossom Dr', city: 'Richmond', state: 'VA', zip: '23219', county: 'Richmond City', type: 'Colonial', beds: '4', baths: '3', sqft: '2900', year: '2001', value: '510000', comment: 'Contested divorce. Sale ordered by court.', ownerFirst: 'Margaret', ownerLast: 'Powell', email: 'mpowell@example.com', caseNum: 'DIV-2025-9920', attorney: 'Clarke Legal Group', filingDate: '2025-04-15', petitioner: 'Margaret Powell', respondent: 'Richard Powell' },
                { addr: '3890 Meadow Lane', city: 'Salt Lake City', state: 'UT', zip: '84101', county: 'Salt Lake', type: 'Single Family', beds: '3', baths: '2', sqft: '2100', year: '2007', value: '435000', comment: 'Amicable divorce. Quick sale preferred.', ownerFirst: 'Larry', ownerLast: 'Cooper', email: 'lcooper@example.com', caseNum: 'DIV-2025-1145', attorney: 'Westside Family Law', filingDate: '2025-08-20', petitioner: 'Larry Cooper', respondent: 'Nancy Cooper' }
            ];

            for (let i = 0; i < divProperties.length; i++) {
                const p = divProperties[i];
                const prop = await Property.create({ PStreetAddr1: p.addr, Pcity: p.city, Pstate: p.state, Pzip: p.zip, Pcounty: p.county, PType: p.type, PBeds: p.beds, PBaths: p.baths, PTotSQFootage: p.sqft, PYearBuilt: p.year, PTotAppraisedAmt: p.value, PComments: p.comment, motive_type_id: seededMotiveTypes['DIV'] });
                await createProaddressForProperty(prop, p, 'DIV');
                await Owner.create({ OFirstName: p.ownerFirst, OLastName: p.ownerLast, email: p.email, OStreetAddr1: p.addr, OCity: p.city, OState: p.state, OZip: p.zip, OProperty_id: prop.id });
                await Divorce.create({ property_id: prop.id, case_number: p.caseNum, legal_filing_date: p.filingDate, attorney_name: p.attorney, petitioner_name: p.petitioner, respondent_name: p.respondent, status: 'Pending' });
                totalSeeded++;
            }
            console.log(`[SEED] ✓ Divorce: ${divProperties.length} properties`);

            // ===================================================================
            // UNPAID TAXES (11 properties)
            // ===================================================================
            const taxProperties = [
                { addr: '678 Lakeside Drive', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton', type: 'Single Family', beds: '3', baths: '2', sqft: '1900', year: '2000', value: '385000', comment: 'Tax lien - Delinquent property taxes', ownerFirst: 'Robert', ownerLast: 'Davis', email: 'rdavis@example.com', amountOwed: 28500, lastPaid: '2020', taxAuth: 'Fulton County Tax Commissioner' },
                { addr: '9100 Sunset Blvd', city: 'Las Vegas', state: 'NV', zip: '89101', county: 'Clark', type: 'Single Family', beds: '5', baths: '3', sqft: '3400', year: '2008', value: '620000', comment: 'Pool home. Tax delinquent 2 years.', ownerFirst: 'Kevin', ownerLast: 'Lee', email: 'klee@example.com', amountOwed: 18700, lastPaid: '2023', taxAuth: 'Clark County Treasurer' },
                { addr: '8642 Spruce Avenue', city: 'Detroit', state: 'MI', zip: '48201', county: 'Wayne', type: 'Single Family', beds: '3', baths: '1', sqft: '1450', year: '1985', value: '185000', comment: 'Tax foreclosure pending', ownerFirst: 'Daniel', ownerLast: 'Brown', email: 'dbrown@example.com', amountOwed: 8500, lastPaid: '2021', taxAuth: 'Wayne County Treasurer' },
                { addr: '8100 Spruce Avenue', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa County', type: 'Single Family', beds: '3', baths: '2', sqft: '1900', year: '1998', value: '320000', comment: 'Unpaid taxes 3 years', ownerFirst: 'Lisa', ownerLast: 'Martinez1', email: 'lisa.martinez1@example.com', amountOwed: 14500, lastPaid: '2021', taxAuth: 'Maricopa County Treasurer' },
                { addr: '8200 Spruce Avenue', city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas County', type: 'Single Family', beds: '3', baths: '2', sqft: '1900', year: '1999', value: '372000', comment: 'Tax delinquent - lien active', ownerFirst: 'Lisa', ownerLast: 'Martinez2', email: 'lisa.martinez2@example.com', amountOwed: 17000, lastPaid: '2021', taxAuth: 'Dallas County Tax Office' },
                { addr: '8300 Spruce Avenue', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton County', type: 'Single Family', beds: '3', baths: '2', sqft: '1900', year: '2000', value: '424000', comment: 'County tax sale scheduled', ownerFirst: 'Lisa', ownerLast: 'Martinez3', email: 'lisa.martinez3@example.com', amountOwed: 19500, lastPaid: '2021', taxAuth: 'Fulton County Tax Commissioner' },
                { addr: '8400 Spruce Avenue', city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles County', type: 'Single Family', beds: '3', baths: '2', sqft: '1900', year: '2001', value: '476000', comment: 'Multiple years delinquent taxes', ownerFirst: 'Lisa', ownerLast: 'Martinez4', email: 'lisa.martinez4@example.com', amountOwed: 22000, lastPaid: '2021', taxAuth: 'LA County Tax Collector' },
                { addr: '8500 Spruce Avenue', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade County', type: 'Single Family', beds: '3', baths: '2', sqft: '1900', year: '2002', value: '528000', comment: 'Tax lien certificate issued', ownerFirst: 'Lisa', ownerLast: 'Martinez5', email: 'lisa.martinez5@example.com', amountOwed: 24500, lastPaid: '2021', taxAuth: 'Miami-Dade County Tax Collector' },
                { addr: '770 Dogwood Lane', city: 'Tucson', state: 'AZ', zip: '85701', county: 'Pima', type: 'Single Family', beds: '3', baths: '2', sqft: '1650', year: '1992', value: '230000', comment: 'Tax delinquent. Redemption period ending.', ownerFirst: 'Ruth', ownerLast: 'Jenkins', email: 'rjenkins@example.com', amountOwed: 11200, lastPaid: '2022', taxAuth: 'Pima County Treasurer' },
                { addr: '1330 Oak Hill Rd', city: 'Louisville', state: 'KY', zip: '40201', county: 'Jefferson', type: 'Single Family', beds: '4', baths: '2', sqft: '2100', year: '1988', value: '195000', comment: 'Tax sale imminent', ownerFirst: 'Arthur', ownerLast: 'Henderson', email: 'ahenderson@example.com', amountOwed: 15800, lastPaid: '2020', taxAuth: 'Jefferson County PVA' },
                { addr: '490 Cypress Way', city: 'Birmingham', state: 'AL', zip: '35201', county: 'Jefferson', type: 'Single Family', beds: '3', baths: '1', sqft: '1350', year: '1970', value: '110000', comment: 'Severe tax delinquency. Owner absent.', ownerFirst: 'Martha', ownerLast: 'Perry', email: 'mperry@example.com', amountOwed: 9400, lastPaid: '2019', taxAuth: 'Jefferson County Revenue' }
            ];

            for (let i = 0; i < taxProperties.length; i++) {
                const p = taxProperties[i];
                const prop = await Property.create({ PStreetAddr1: p.addr, Pcity: p.city, Pstate: p.state, Pzip: p.zip, Pcounty: p.county, PType: p.type, PBeds: p.beds, PBaths: p.baths, PTotSQFootage: p.sqft, PYearBuilt: p.year, PTotAppraisedAmt: p.value, PComments: p.comment, motive_type_id: seededMotiveTypes['TAX'] });
                await createProaddressForProperty(prop, p, 'TAX');
                await Owner.create({ OFirstName: p.ownerFirst, OLastName: p.ownerLast, email: p.email, OStreetAddr1: p.addr, OCity: p.city, OState: p.state, OZip: p.zip, OProperty_id: prop.id });
                await TaxLien.create({ property_id: prop.id, amount_owed: p.amountOwed, last_tax_year_paid: p.lastPaid, status: 'Active', tax_authority: p.taxAuth });
                totalSeeded++;
            }
            console.log(`[SEED] ✓ Unpaid Taxes: ${taxProperties.length} properties`);

            // ===================================================================
            // OUT OF STATE (10 properties)
            // ===================================================================
            const oosProperties = [
                { addr: '999 Beach Road', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade', type: 'Condo', beds: '2', baths: '2', sqft: '1350', year: '2019', value: '495000', comment: 'Absentee owner - Out of state landlord', ownerFirst: 'Patricia', ownerLast: 'MillerOOS', email: 'pmiller@example.com', ownerCity: 'New York', ownerState: 'NY', ownerZip: '10001' },
                { addr: '4500 Riverside Drive', city: 'Portland', state: 'OR', zip: '97201', county: 'Multnomah', type: 'Bungalow', beds: '2', baths: '1', sqft: '1200', year: '1945', value: '420000', comment: 'Owner lives out of state. Management issues.', ownerFirst: 'Linda', ownerLast: 'Garcia', email: 'lgarcia@example.com', ownerCity: 'Phoenix', ownerState: 'AZ', ownerZip: '85004' },
                { addr: '9753 Redwood Circle', city: 'Portland', state: 'OR', zip: '97201', county: 'Multnomah', type: 'Single Family', beds: '3', baths: '2', sqft: '1900', year: '2007', value: '565000', comment: 'Out of state owner in Florida', ownerFirst: 'Elizabeth', ownerLast: 'Taylor', email: 'etaylor@example.com', ownerCity: 'Miami Beach', ownerState: 'FL', ownerZip: '33139' },
                { addr: '9100 Aspen Boulevard', city: 'Phoenix', state: 'AZ', zip: '85001', county: 'Maricopa County', type: 'Single Family', beds: '3', baths: '2', sqft: '2100', year: '2006', value: '372000', comment: 'Owner in New York. Wants to sell.', ownerFirst: 'David', ownerLast: 'Lee1', email: 'david.lee1@example.com', ownerCity: 'New York', ownerState: 'NY', ownerZip: '10001' },
                { addr: '9200 Aspen Boulevard', city: 'Dallas', state: 'TX', zip: '75201', county: 'Dallas County', type: 'Single Family', beds: '3', baths: '2', sqft: '2100', year: '2007', value: '434000', comment: 'Absentee owner in Chicago', ownerFirst: 'David', ownerLast: 'Lee2', email: 'david.lee2@example.com', ownerCity: 'Chicago', ownerState: 'IL', ownerZip: '60601' },
                { addr: '9300 Aspen Boulevard', city: 'Atlanta', state: 'GA', zip: '30301', county: 'Fulton County', type: 'Single Family', beds: '3', baths: '2', sqft: '2100', year: '2008', value: '496000', comment: 'Owner relocated to Seattle', ownerFirst: 'David', ownerLast: 'Lee3', email: 'david.lee3@example.com', ownerCity: 'Seattle', ownerState: 'WA', ownerZip: '98101' },
                { addr: '9400 Aspen Boulevard', city: 'Los Angeles', state: 'CA', zip: '90001', county: 'Los Angeles County', type: 'Single Family', beds: '3', baths: '2', sqft: '2100', year: '2009', value: '558000', comment: 'Out of state investor in Boston', ownerFirst: 'David', ownerLast: 'Lee4', email: 'david.lee4@example.com', ownerCity: 'Boston', ownerState: 'MA', ownerZip: '02101' },
                { addr: '9500 Aspen Boulevard', city: 'Miami', state: 'FL', zip: '33101', county: 'Miami-Dade County', type: 'Single Family', beds: '3', baths: '2', sqft: '2100', year: '2010', value: '620000', comment: 'Owner in Denver. Remote landlord.', ownerFirst: 'David', ownerLast: 'Lee5', email: 'david.lee5@example.com', ownerCity: 'Denver', ownerState: 'CO', ownerZip: '80202' },
                { addr: '2600 Palm Dr', city: 'Orlando', state: 'FL', zip: '32801', county: 'Orange', type: 'Single Family', beds: '3', baths: '2', sqft: '1800', year: '2011', value: '365000', comment: 'Owner in Michigan. Rental property.', ownerFirst: 'Henry', ownerLast: 'Barnes', email: 'hbarnes@example.com', ownerCity: 'Detroit', ownerState: 'MI', ownerZip: '48201' },
                { addr: '1100 Desert Vista', city: 'Albuquerque', state: 'NM', zip: '87101', county: 'Bernalillo', type: 'Adobe', beds: '3', baths: '2', sqft: '1600', year: '1998', value: '275000', comment: 'Owner relocated to California', ownerFirst: 'Gloria', ownerLast: 'Rivera', email: 'grivera@example.com', ownerCity: 'San Francisco', ownerState: 'CA', ownerZip: '94102' }
            ];

            for (let i = 0; i < oosProperties.length; i++) {
                const p = oosProperties[i];
                const prop = await Property.create({ PStreetAddr1: p.addr, Pcity: p.city, Pstate: p.state, Pzip: p.zip, Pcounty: p.county, PType: p.type, PBeds: p.beds, PBaths: p.baths, PTotSQFootage: p.sqft, PYearBuilt: p.year, PTotAppraisedAmt: p.value, PComments: p.comment, motive_type_id: seededMotiveTypes['OOS'] });
                await createProaddressForProperty(prop, p, 'OOS');
                await Owner.create({ OFirstName: p.ownerFirst, OLastName: p.ownerLast, email: p.email, OStreetAddr1: `${p.ownerCity} Address`, OCity: p.ownerCity, OState: p.ownerState, OZip: p.ownerZip, is_out_of_state: true, OProperty_id: prop.id });
                totalSeeded++;
            }
            console.log(`[SEED] ✓ Out of State: ${oosProperties.length} properties`);

            console.log(`[SEED] ✅ Total seeded: ${totalSeeded} properties across all 9 motive types.`);
        } else {
            console.log(`[SEED] Properties already exist (${propertyCount} found). Skipping property seed.`);
        }

        // 5. Seed Site Content (Hero Slider)
        console.log('[SEED] Seeding site content (hero slider)...');
        const defaultHeroSlides = [
            {
                id: 1,
                url: "/images/home/hero-slide-1.jpg",
                title: "Find 100s of motivated sellers at few clicks",
                subtitle: "Never let the lack of information stops you from closing deals",
                order: 1
            },
            {
                id: 2,
                url: "/images/home/hero-slide-2.jpg",
                title: "Want basket full of sales lead today?",
                subtitle: "Hundreds and thousands of distressed sellers are just waiting for you to sell their home.",
                order: 2
            },
            {
                id: 3,
                url: "/images/home/hero-slide-3.jpg",
                title: "Sellers are waiting to sell their property.",
                subtitle: "Finding the right seller doesn't have to be hard. We make it easy for you.",
                order: 3
            }
        ];

        await SiteContent.findOrCreate({
            where: { key: 'hero_images' },
            defaults: {
                key: 'hero_images',
                value: defaultHeroSlides,
                contentType: 'json'
            }
        });

        // Seed Features Page Content
        await SiteContent.findOrCreate({
            where: { key: 'page_features' },
            defaults: {
                key: 'page_features',
                value: {
                    hero: {
                        title: "Powerful Features for Modern Investors",
                        subtitle: "Everything you need to find, track, and close off-market deals."
                    },
                    features: [
                        {
                            layout: "image-left",
                            title: "Advanced Lead Discovery",
                            description: "Our proprietary search engine lets you filter through millions of public records to find the most motivated sellers in any market.",
                            features: ["Real-time data updates", "Advanced GIS mapping", "Motivation scoring"],
                            image: "/images/features/discovery.jpg",
                            ctaText: "Start Searching",
                            ctaLink: "/search"
                        },
                        {
                            layout: "image-right",
                            title: "Automated Skip Tracing",
                            description: "Stop wasting time searching for phone numbers. We provide direct contact info for property owners instantly.",
                            features: ["Triple-verified phone numbers", "Email addresses", "Social media profiles"],
                            image: "/images/features/skip-tracing.jpg",
                            ctaText: "Try Skip Tracing",
                            ctaLink: "/signup"
                        }
                    ]
                },
                contentType: 'json'
            }
        });

        // Seed Pricing Page Content
        await SiteContent.findOrCreate({
            where: { key: 'page_pricing' },
            defaults: {
                key: 'page_pricing',
                value: {
                    liveActivities: [
                        { name: "John D.", city: "Houston, TX", action: "just exported 450 probate leads", time: "2 mins ago" },
                        { name: "Sarah M.", city: "Miami, FL", action: "found a $120k equity deal", time: "5 mins ago" },
                        { name: "Robert K.", city: "Phoenix, AZ", action: "started a trial for Lake County", time: "1 min ago" },
                        { name: "Mike T.", city: "Atlanta, GA", action: "closed a deal using 99Sellers data", time: "Just now" },
                        { name: "Emily W.", city: "Denver, CO", action: "captured 12 high-intent foreclosure leads", time: "10 mins ago" }
                    ],
                    hero: {
                        badge: "HIGH DEMAND: 1,420 INVESTORS JOINED THIS WEEK",
                        title: "Find Motivated Sellers",
                        titleHighlight: " Before Your Competition.",
                        subtitle: "Stop wasting time with generic lists. 99Sellers gives you proprietary data on motivated sellers, pre-vetted and ready to close. **Turn data into your unfair advantage.**",
                        ctaText: "View Pricing Plans",
                        heroImage: "/images/home/platform-showcase.jpg"
                    },
                    painVsGain: {
                        title: "The \"Real Estate\" Grind",
                        titleHighlight: "vs",
                        titleEnd: "The Future",
                        subtitle: "It's time to choose which business you want to run.",
                        pain: {
                            icon: "fa-cloud-rain",
                            image: "/images/home/benefit-time.jpg",
                            title: "The Old Way",
                            items: [
                                "Driving for 4 hours a day with zero results",
                                "Buying overpriced, recycled lead lists",
                                "Manually skip tracing 1-by-1",
                                "Calling 'dead' numbers for weeks",
                                "Being the last one to the party"
                            ]
                        },
                        gain: {
                            icon: "fa-sun",
                            image: "/images/home/benefit-profit-new.png",
                            title: "The 99Sellers Way",
                            items: [
                                "Fresh leads delivered to your dashboard daily",
                                "Proprietary 'Hot-Lead' motivation scoring",
                                "Bulk skip tracing in 1-click",
                                "Spend more time with family, less in the car",
                                "Get the deal before the sign goes up"
                            ]
                        }
                    },
                    whyChooseUs: {
                        title: "Why",
                        titleHighlight: "Top-Performing",
                        titleEnd: "Investors Choose Us",
                        subtitle: "The tools you need to move faster and close more.",
                        cards: [
                            { title: "Proprietary Data", image: "/images/home/property-austin.png", description: "Access leads that never hit the MLS. Our data scientists find motivation before the seller even knows they're selling." },
                            { title: "Bulk Skip Tracing", image: "/images/home/property-denver.png", description: "No more 1-by-1 entry. Get phone numbers, emails, and social handles for entire zip codes in seconds." },
                            { title: "AI-Powered Scoring", image: "/images/home/property-phoenix.png", description: "Stop chasing tire-kickers. Our AI scores every lead based on over 50 distress signals." }
                        ]
                    },
                    plans: [
                        {
                            id: "starter",
                            name: "Starter",
                            price: "0",
                            period: "forever",
                            description: "Perfect for testing the waters",
                            features: [
                                { text: "50 leads per month", included: true },
                                { text: "1 county access", included: true },
                                { text: "Basic filters", included: true },
                                { text: "Email support", included: true },
                                { text: "Skip tracing", included: false },
                                { text: "Unlimited exports", included: false },
                                { text: "9 Seller motives", included: false }
                            ],
                            buttonText: "Start for Free",
                            popular: false
                        },
                        {
                            id: "monthly",
                            name: "Monthly Pro",
                            price: "50",
                            period: "month",
                            description: "Full access for a single month",
                            features: [
                                { text: "Unlimited leads access", included: true },
                                { text: "All 50 states included", included: true },
                                { text: "9 High-Motivation seller types", included: true },
                                { text: "Built-in Skip Tracing", included: true },
                                { text: "Bulk CRM export (Unlimited)", included: true },
                                { text: "Priority support", included: true },
                                { text: "Daily fresh data streams", included: true }
                            ],
                            buttonText: "Join Monthly",
                            popular: true,
                            valueStack: [
                                { feature: "Professional Skip Tracing", value: "$199/mo" },
                                { feature: "National Property Database", value: "$149/mo" },
                                { feature: "AI Motivation Scoring", value: "$99/mo" }
                            ],
                            totalValue: "$447"
                        },
                        {
                            id: "quarterly",
                            name: "Quarterly Pro",
                            price: "150",
                            period: "quarter",
                            description: "Go big and save time",
                            features: [
                                { text: "Unlimited leads access", included: true },
                                { text: "All 50 states included", included: true },
                                { text: "9 High-Motivation seller types", included: true },
                                { text: "Built-in Skip Tracing", included: true },
                                { text: "Bulk CRM export (Unlimited)", included: true },
                                { text: "Priority support", included: true },
                                { text: "Daily fresh data streams", included: true }
                            ],
                            buttonText: "Join Quarterly",
                            popular: false,
                            valueStack: [
                                { feature: "Professional Skip Tracing", value: "$199/mo" },
                                { feature: "National Property Database", value: "$149/mo" },
                                { feature: "AI Motivation Scoring", value: "$99/mo" }
                            ],
                            totalValue: "$447"
                        }
                    ],
                    pricingHeader: {
                        title: "Invest in your",
                        titleHighlight: "Financial Freedom.",
                        subtitle: "One deal changes everything. Select the plan that fuels your growth."
                    },
                    roi: {
                        title: "Buy Back",
                        titleHighlight: "Your Time.",
                        subtitle: "Real estate isn't about houses. It's about freedom. At $50/mo, 99Sellers gives you the automation of a 10-person research team, so you can focus on what matters.",
                        cards: [
                            {
                                icon: "fa-clock-rotate-left",
                                iconColor: "#3b82f6",
                                iconBg: "rgba(37, 99, 235, 0.1)",
                                title: "Scale Without Burnout",
                                description: "Stop grinding 80 hours a week for scraps. Automate your lead pipeline and manage your entire business from anywhere in the world."
                            },
                            {
                                icon: "fa-trophy",
                                iconColor: "#10b981",
                                iconBg: "rgba(16, 185, 129, 0.1)",
                                title: "The \"Unfair\" Advantage",
                                description: "Access data that isn't on the MLS or Zillow. Find tired landlords, probate heirs, and high-equity owners before your competition does."
                            }
                        ]
                    },
                    guarantee: {
                        badge: "ROCK-SOLID 30-DAY GUARANTEE",
                        title: "Zero Risk. All Reward.",
                        description: "We are so confident that 99Sellers will revolutionize your deal-finding process that we offer a 100% No-Questions-Asked Money-Back Guarantee. If you don't find at least one high-equity deal in your first 30 days, we'll refund every penny."
                    },
                    finalCta: {
                        title: "Will You Be Next?",
                        subtitle: "Over 5,000 investors have already switched to 99Sellers. Don't get left behind.",
                        buttonText: "Start Your Freedom Journey"
                    },
                    testimonials: [
                        { name: "Sarah Jenkins", role: "Wholesaler, FL", photo: "/images/home/testimonial-sarah.png", text: "99Sellers paid for itself in 48 hours. I found a probate lead that everyone else missed and locked it up for a $45k assignment fee." },
                        { name: "Marcus Thorne", role: "Fix & Flip, TX", photo: "/images/home/testimonial-marcus.png", text: "The skip tracing is the best I've ever used. 90% hit rate on mobile numbers. It's completely changed my outbound game." },
                        { name: "David Chen", role: "Buy & Hold, AZ", photo: "/images/home/testimonial-david.png", text: "I used to spend $2k a month on VA researchers. Now I just use 99Sellers to find my off-market rentals. Best ROI in the business." }
                    ]
                },
                contentType: 'json'
            }
        });

        // 6. Seed Admin Activity
        const activityCount = await AdminActivity.count();
        if (activityCount === 0) {
            console.log('[SEED] Creating initial AdminActivity entry...');
            try {
                await AdminActivity.create({
                    type: 'system',
                    message: 'System Initialized',
                    details: {
                        user: 'admin@test.com',
                        action: 'initial_seed',
                        timestamp: new Date().toISOString()
                    }
                });
                console.log('[SEED] AdminActivity created successfully.');
            } catch (err) {
                console.error('[SEED] AdminActivity Detailed Error:', err.message);
                if (err.errors) {
                    err.errors.forEach(e => console.error(` - ${e.path}: ${e.message}`));
                }
                throw err; // Re-throw to be caught by the outer catch
            }
        }

        console.log('[SEED] Deep database seeding completed successfully.');
    } catch (error) {
        console.error('[SEED] Error seeding data:', error);
    }
};

module.exports = { seedData };
