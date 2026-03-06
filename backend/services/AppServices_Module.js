const {
    AdminActivity, UserLogin, FreeUser, PremiumUser,
    Subscription, MotiveTypes, Property, Proaddress,
    Owner, Loan, Auction, Probate, Divorce, TaxLien,
    Eviction, Violation, SiteContent
} = require('../models');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const bcrypt = require('bcryptjs');

/**
 * ==========================================
 * ACTIVITY LOGGING SERVICE
 * ==========================================
 */
exports.logActivity = async (type, message, details = {}) => {
    try {
        if (AdminActivity) await AdminActivity.create({ type, message, details });
    } catch (err) { console.error('Error logging activity:', err); }
};

/**
 * ==========================================
 * EMAIL SERVICE
 * ==========================================
 */
exports.sendPasswordResetEmail = async (email, resetLink) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    const mailOptions = {
        from: `"99Sellers" <${process.env.EMAIL_USER}>`,
        to: email, subject: 'Password Reset Request - 99Sellers',
        html: `<div style="font-family: Arial; padding: 20px;"><h2>99Sellers</h2><p>Click below to reset:</p><a href="${resetLink}">Reset Password</a></div>`
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, response: info.response };
    } catch (error) { return { success: false, error: error.message }; }
};

/**
 * ==========================================
 * STRIPE / PAYMENT SERVICE
 * ==========================================
 */
let stripeInstance;
const isEnabled = process.env.ENABLE_PAYMENTS === 'true';
if (isEnabled && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
    stripeInstance = {
        paymentIntents: {
            create: async ({ amount, currency }) => ({
                id: 'pi_mock_' + Date.now(), client_secret: 'mock_secret_' + Date.now(), status: 'requires_payment_method', amount, currency
            })
        }
    };
}
exports.stripe = stripeInstance;

/**
 * ==========================================
 * DATABASE SEED SERVICE
 * ==========================================
 */
const futureDate = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
const pastDate = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return d; };
const parseAddress = (addr) => {
    const parts = addr.trim().split(/\s+/);
    return { streetNum: parts[0] || '0', streetName: parts.slice(1).join(' ') || addr };
};
const countyMap = { 'OR': 'Multnomah', 'TX': 'Travis', 'CO': 'Denver', 'WA': 'King', 'FL': 'Miami-Dade', 'GA': 'Fulton', 'AZ': 'Maricopa', 'TN': 'Davidson', 'NC': 'Mecklenburg', 'CA': 'Los Angeles', 'NV': 'Clark', 'UT': 'Salt Lake', 'IL': 'Cook', 'OH': 'Cuyahoga', 'MI': 'Wayne', 'AL': 'Jefferson', 'OK': 'Oklahoma', 'KY': 'Fayette', 'WI': 'Dane', 'NM': 'Bernalillo', 'SC': 'Charleston', 'ID': 'Ada', 'AR': 'Pulaski', 'MD': 'Baltimore', 'NJ': 'Essex', 'MO': 'Jackson', 'IN': 'Marion', 'CT': 'Hartford', 'NY': 'Erie', 'RI': 'Providence', 'PA': 'Allegheny', 'MA': 'Suffolk', 'MN': 'Hennepin', 'LA': 'East Baton Rouge', 'VA': 'Virginia Beach' };
const schoolDistricts = ['Unified School District', 'Independent School District', 'Public Schools', 'Community Schools', 'Metropolitan Schools'];
const amenitiesList = [
    'Central A/C, Forced Air Heating, Hardwood Floors, Granite Countertops, Stainless Steel Appliances',
    'Pool, Patio, Fireplace, Walk-in Closets, Updated Kitchen',
    'Garage (2-car), Fenced Yard, Sprinkler System, New Roof (2020), Energy Efficient Windows',
    'Basement (Finished), Deck, Crown Molding, Recessed Lighting, Laundry Room',
    'Solar Panels, Smart Home System, EV Charger, Built-in Storage, Covered Porch'
];

const createProaddressForProperty = async (prop, p, motiveCode, idx) => {
    const { streetNum, streetName } = parseAddress(p.addr);
    const county = countyMap[p.state] || `${p.city} County`;
    const appraised = parseFloat(p.value) || 0;
    const landValue = Math.round(appraised * 0.3);
    const buildingValue = Math.round(appraised * 0.7);
    const lotAcres = (0.1 + (idx % 10) * 0.08).toFixed(2);
    const ownerState = p.motive === 'OOS' ? (['NY', 'CA', 'IL', 'TX', 'FL'][idx % 5]) : p.state;

    const proData = {
        // Core address
        PStreetNum: streetNum, PStreetName: streetName, Pcity: p.city, PState: p.state, Pzip: p.zip,
        listing_id: `LS-${p.state}-${String(idx + 10000).slice(-5)}`,
        backup_street_name: streetName,
        PSuiteNum: idx % 5 === 0 ? `#${100 + idx}` : null,
        // Owner info
        owner_name: `${p.ownerFirst} ${p.ownerLast}`,
        owner_phone: `(${200 + (idx % 800)}) ${100 + (idx % 900)}-${1000 + (idx % 9000)}`,
        owner_mailing_address: `${500 + idx} ${['Oak', 'Main', 'Park', 'Elm', 'Cedar'][idx % 5]} Ave`,
        owner_current_state: ownerState,
        PFirstName: p.ownerFirst, PLastName: p.ownerLast, PMiddleName: ['A', 'J', 'M', 'R', 'L'][idx % 5],
        // Property details
        PMotiveType: motiveCode,
        counties: county,
        price: appraised,
        beds: p.beds, baths: p.baths,
        square_feet: parseInt(p.sqft) || 0,
        proptype: p.type,
        PYearBuilt: p.year,
        floors: 1 + (idx % 3),
        school_district: `${p.city} ${schoolDistricts[idx % schoolDistricts.length]}`,
        garage_size: idx % 4 === 0 ? 0 : (1 + idx % 3),
        lot_size: `${lotAcres} acres`,
        amenities: amenitiesList[idx % amenitiesList.length],
        comments: `${p.type} property in ${p.city}, ${p.state}. Built in ${p.year}. ${p.beds} bedrooms, ${p.baths} bathrooms, ${parseInt(p.sqft).toLocaleString()} sqft on ${lotAcres} acres.`,
        // Dates & IDs
        DATE_TIMEOFEXTRACTION: pastDate(idx % 30),
        parsed: 'success',
        sale_date: p.motive === 'AUC' || p.motive === 'FOR' ? futureDate(30 + idx * 5) : null,
        sale_time: p.motive === 'AUC' ? `${9 + (idx % 4)}:${idx % 2 === 0 ? '00' : '30'}:00` : null,
        case_number: ['FOR', 'PRE', 'AUC', 'DIV', 'PRO', 'TAX'].includes(p.motive) ? `${motiveCode}-${p.state}-${2025}-${String(idx + 1000).slice(-4)}` : null,
        deed_book_page: `Book ${100 + idx}, Page ${200 + idx * 3}`,
    };

    // Trustee info for FOR and PRE
    if (p.motive === 'FOR' || p.motive === 'PRE') {
        proData.trusteename = `${['Anderson', 'Baker', 'Carter', 'Davis', 'Edwards'][idx % 5]} Trustee`;
        proData.trusteecompanyname = `${p.city} Title & Trust Co.`;
        proData.trusteeaddress = `${300 + idx} Legal Blvd`;
        proData.trusteecity = p.city;
        proData.trusteestate = p.state;
        proData.trusteezip = parseInt(p.zip);
        proData.trusteephone = `(${300 + (idx % 700)}) ${200 + (idx % 800)}-${2000 + (idx % 8000)}`;
        proData.trusteeemail = `trustee${idx}@${p.city.toLowerCase().replace(/\s/g, '')}title.com`;
        proData.trusteewebsite = `www.${p.city.toLowerCase().replace(/\s/g, '')}title.com`;
        proData.trusteetype = ['Substituted Trustee', 'Original Trustee', 'Successor Trustee'][idx % 3];
    }

    // Inline auction info for AUC
    if (p.motive === 'AUC') {
        proData.auction_amt = String(Math.round(appraised * 0.6));
        proData.auctiondatetime = futureDate(7 + idx * 3);
        proData.auctionplace = ['County Courthouse', 'Municipal Building', 'City Hall'][idx % 3];
        proData.auctionplaceaddr1 = `${200 + idx} ${p.city} Main St`;
        proData.auctioncity = p.city;
        proData.auctionstate = p.state;
        proData.auctionzip = parseInt(p.zip);
        proData.auctiondescription = `Foreclosure auction for ${p.addr}, ${p.city}. ${p.beds}BR/${p.baths}BA. Appraised at $${appraised.toLocaleString()}.`;
        proData.auctioneername = `${['Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][idx % 5]} Auctioneers`;
        proData.auctioneercompanyname = `${p.city} Auction Group LLC`;
        proData.auctioneeraddress = `${400 + idx} Commerce Dr, ${p.city}, ${p.state}`;
        proData.auctioneerphone = `(${400 + (idx % 600)}) ${300 + (idx % 700)}-${3000 + (idx % 7000)}`;
        proData.auctioneeremail = `auctions@${p.city.toLowerCase().replace(/\s/g, '')}auctiongroup.com`;
        proData.auctioneerweb_site = `www.${p.city.toLowerCase().replace(/\s/g, '')}auctiongroup.com`;
    }

    // Violation inline info for COD
    if (p.motive === 'COD') {
        const vTypes = ['Building Code', 'Fire Safety', 'Zoning', 'Health & Sanitation', 'Structural'];
        proData.violation_complaint = `${vTypes[idx % 5]} violation at ${p.addr}`;
        proData.violation_issue_date = pastDate(30 + idx * 5).toISOString().split('T')[0];
        proData.violation_types = vTypes[idx % 5];
        proData.violation_total = 1 + (idx % 3);
        proData.violation_desc = `${vTypes[idx % 5]} violation - requires remediation within 30 days`;
        proData.violation_details = `Inspection of ${p.addr} revealed ${vTypes[idx % 5].toLowerCase()} issues requiring immediate attention.`;
        proData.violation_issued_by = `${p.city} ${['Building Dept', 'Fire Marshal', 'Zoning Board', 'Health Dept', 'Code Enforcement'][idx % 5]}`;
    }

    // Eviction inline info
    if (p.motive === 'EVI') {
        proData.court_docket = `EV-${p.state}-${2025}-${String(idx + 500).slice(-4)}`;
        proData.court_date = futureDate(14 + idx * 7);
        proData.eviction_owner_lawyer_name = `Atty. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'][idx % 5]}`;
    }

    const proaddress = await Proaddress.create(proData);
    await prop.update({ proaddress_id: proaddress.id });
    return proaddress;
};

exports.seedData = async () => {
    try {
        const propCount = await Property.count();
        if (propCount > 0) return console.log(`[SEED] Data exists (${propCount} properties), skipping.`);

        const hp = await bcrypt.hash('Admin@99Sell#2026', 10);
        await UserLogin.findOrCreate({ where: { Username: 'admin@test.com' }, defaults: { Email: 'admin@test.com', Password: hp, FirstName: 'Admin', LastName: 'User', UserType: 'admin' } });

        const hpFree = await bcrypt.hash('Free$User!2026', 10);
        await UserLogin.findOrCreate({ where: { Username: 'free@test.com' }, defaults: { Email: 'free@test.com', Password: hpFree, FirstName: 'Free', LastName: 'User', UserType: 'free' } });

        const hpPaid = await bcrypt.hash('Premium*Pass#2026', 10);
        await UserLogin.findOrCreate({ where: { Username: 'paid@test.com' }, defaults: { Email: 'paid@test.com', Password: hpPaid, FirstName: 'Premium', LastName: 'User', UserType: 'premium' } });

        // Motive Types with proper human-readable names
        const motiveMap = {
            'PRE': 'Pre-foreclosure', 'FOR': 'Foreclosure', 'AUC': 'Auction',
            'PRO': 'Probate', 'COD': 'Code Violations', 'EVI': 'Eviction',
            'DIV': 'Divorce', 'TAX': 'Unpaid Taxes', 'OOS': 'Out of State'
        };
        const mIds = {};
        for (const [code, name] of Object.entries(motiveMap)) {
            const [mt] = await MotiveTypes.findOrCreate({ where: { code }, defaults: { code, name } });
            if (mt.name !== name) await mt.update({ name });
            mIds[code] = mt.id;
        }

        // Seed properties for ALL 9 motive types (10 each = 90 total)
        const props = [
            // PRE - Pre-foreclosure
            { addr: '142 Maple Street', city: 'Portland', state: 'OR', zip: '97201', ownerFirst: 'Sarah', ownerLast: 'Johnson', value: '475000', beds: 3, baths: 2, sqft: '1850', type: 'Single Family', year: '2005', motive: 'PRE', debt: 220000 },
            { addr: '88 Elm Court', city: 'Portland', state: 'OR', zip: '97201', ownerFirst: 'Mike', ownerLast: 'Chen', value: '390000', beds: 2, baths: 1, sqft: '1200', type: 'Townhouse', year: '1998', motive: 'PRE', debt: 310000 },
            { addr: '1520 Pine Ave', city: 'Austin', state: 'TX', zip: '78701', ownerFirst: 'Linda', ownerLast: 'Davis', value: '520000', beds: 4, baths: 3, sqft: '2400', type: 'Single Family', year: '2010', motive: 'PRE', debt: 380000 },
            { addr: '305 Birch Lane', city: 'Denver', state: 'CO', zip: '80202', ownerFirst: 'Tom', ownerLast: 'Wilson', value: '410000', beds: 3, baths: 2, sqft: '1750', type: 'Single Family', year: '2001', motive: 'PRE', debt: 290000 },
            { addr: '77 Walnut Drive', city: 'Seattle', state: 'WA', zip: '98101', ownerFirst: 'Amy', ownerLast: 'Park', value: '680000', beds: 4, baths: 3, sqft: '2800', type: 'Single Family', year: '2015', motive: 'PRE', debt: 520000 },
            { addr: '410 Cedar Blvd', city: 'Miami', state: 'FL', zip: '33101', ownerFirst: 'Carlos', ownerLast: 'Ruiz', value: '355000', beds: 3, baths: 2, sqft: '1600', type: 'Condo', year: '2008', motive: 'PRE', debt: 280000 },
            { addr: '92 Spruce Way', city: 'Atlanta', state: 'GA', zip: '30301', ownerFirst: 'Diana', ownerLast: 'White', value: '295000', beds: 2, baths: 2, sqft: '1350', type: 'Townhouse', year: '2003', motive: 'PRE', debt: 240000 },
            { addr: '600 Oak Hill Rd', city: 'Phoenix', state: 'AZ', zip: '85001', ownerFirst: 'James', ownerLast: 'Brown', value: '340000', beds: 3, baths: 2, sqft: '1900', type: 'Single Family', year: '2006', motive: 'PRE', debt: 310000 },
            { addr: '215 Aspen Circle', city: 'Nashville', state: 'TN', zip: '37201', ownerFirst: 'Rachel', ownerLast: 'Lee', value: '425000', beds: 4, baths: 2, sqft: '2100', type: 'Single Family', year: '2012', motive: 'PRE', debt: 350000 },
            { addr: '180 Willow St', city: 'Charlotte', state: 'NC', zip: '28201', ownerFirst: 'Kevin', ownerLast: 'Taylor', value: '310000', beds: 3, baths: 2, sqft: '1550', type: 'Single Family', year: '2000', motive: 'PRE', debt: 195000 },

            // FOR - Foreclosure
            { addr: '500 Harbor View', city: 'San Diego', state: 'CA', zip: '92101', ownerFirst: 'Robert', ownerLast: 'Garcia', value: '750000', beds: 4, baths: 3, sqft: '2600', type: 'Single Family', year: '2007', motive: 'FOR', debt: 680000 },
            { addr: '1122 River Rd', city: 'Jacksonville', state: 'FL', zip: '32099', ownerFirst: 'Patricia', ownerLast: 'Miller', value: '285000', beds: 3, baths: 2, sqft: '1700', type: 'Single Family', year: '1995', motive: 'FOR', debt: 260000 },
            { addr: '340 Sunset Blvd', city: 'Las Vegas', state: 'NV', zip: '89101', ownerFirst: 'Frank', ownerLast: 'Moore', value: '320000', beds: 3, baths: 2, sqft: '1500', type: 'Single Family', year: '2004', motive: 'FOR', debt: 305000 },
            { addr: '718 Mountain Pass', city: 'Salt Lake City', state: 'UT', zip: '84101', ownerFirst: 'Nancy', ownerLast: 'Anderson', value: '395000', beds: 4, baths: 2, sqft: '2000', type: 'Single Family', year: '2009', motive: 'FOR', debt: 380000 },
            { addr: '55 Lake Shore Dr', city: 'Chicago', state: 'IL', zip: '60601', ownerFirst: 'David', ownerLast: 'Thomas', value: '520000', beds: 3, baths: 2, sqft: '1800', type: 'Condo', year: '2011', motive: 'FOR', debt: 490000 },
            { addr: '930 Valley View', city: 'Dallas', state: 'TX', zip: '75201', ownerFirst: 'Maria', ownerLast: 'Martinez', value: '365000', beds: 3, baths: 2, sqft: '1650', type: 'Single Family', year: '2002', motive: 'FOR', debt: 340000 },
            { addr: '245 Forest Lane', city: 'Orlando', state: 'FL', zip: '32801', ownerFirst: 'Steven', ownerLast: 'Clark', value: '295000', beds: 3, baths: 2, sqft: '1400', type: 'Single Family', year: '1999', motive: 'FOR', debt: 275000 },
            { addr: '1680 Hilltop Rd', city: 'Raleigh', state: 'NC', zip: '27601', ownerFirst: 'Susan', ownerLast: 'Lewis', value: '410000', beds: 4, baths: 3, sqft: '2200', type: 'Single Family', year: '2013', motive: 'FOR', debt: 395000 },
            { addr: '42 Broadway Ave', city: 'Columbus', state: 'OH', zip: '43201', ownerFirst: 'Brian', ownerLast: 'Walker', value: '245000', beds: 2, baths: 1, sqft: '1100', type: 'Duplex', year: '1990', motive: 'FOR', debt: 230000 },
            { addr: '789 Pearl St', city: 'Detroit', state: 'MI', zip: '48201', ownerFirst: 'Lisa', ownerLast: 'Hall', value: '180000', beds: 3, baths: 1, sqft: '1300', type: 'Single Family', year: '1985', motive: 'FOR', debt: 165000 },

            // AUC - Auction
            { addr: '225 Courthouse Sq', city: 'Houston', state: 'TX', zip: '77001', ownerFirst: 'George', ownerLast: 'Allen', value: '290000', beds: 3, baths: 2, sqft: '1500', type: 'Single Family', year: '1997', motive: 'AUC', debt: 275000 },
            { addr: '1400 Market St', city: 'San Antonio', state: 'TX', zip: '78201', ownerFirst: 'Helen', ownerLast: 'Young', value: '225000', beds: 2, baths: 1, sqft: '1100', type: 'Single Family', year: '1992', motive: 'AUC', debt: 210000 },
            { addr: '67 Main St', city: 'Tampa', state: 'FL', zip: '33601', ownerFirst: 'Dennis', ownerLast: 'King', value: '340000', beds: 3, baths: 2, sqft: '1700', type: 'Single Family', year: '2005', motive: 'AUC', debt: 320000 },
            { addr: '890 Grant Ave', city: 'Tucson', state: 'AZ', zip: '85701', ownerFirst: 'Sandra', ownerLast: 'Wright', value: '255000', beds: 3, baths: 2, sqft: '1450', type: 'Single Family', year: '2001', motive: 'AUC', debt: 240000 },
            { addr: '312 Liberty Blvd', city: 'Memphis', state: 'TN', zip: '38101', ownerFirst: 'Paul', ownerLast: 'Lopez', value: '195000', beds: 3, baths: 1, sqft: '1200', type: 'Single Family', year: '1988', motive: 'AUC', debt: 185000 },
            { addr: '1155 Commerce Way', city: 'Oklahoma City', state: 'OK', zip: '73101', ownerFirst: 'Ruth', ownerLast: 'Hill', value: '210000', beds: 2, baths: 1, sqft: '1050', type: 'Townhouse', year: '1995', motive: 'AUC', debt: 200000 },
            { addr: '450 Justice Dr', city: 'Louisville', state: 'KY', zip: '40201', ownerFirst: 'Mark', ownerLast: 'Scott', value: '275000', beds: 3, baths: 2, sqft: '1600', type: 'Single Family', year: '2003', motive: 'AUC', debt: 260000 },
            { addr: '38 Central Park', city: 'Milwaukee', state: 'WI', zip: '53201', ownerFirst: 'Betty', ownerLast: 'Green', value: '230000', beds: 2, baths: 1, sqft: '1150', type: 'Duplex', year: '1993', motive: 'AUC', debt: 215000 },
            { addr: '777 State Capitol', city: 'Richmond', state: 'VA', zip: '23218', ownerFirst: 'Donald', ownerLast: 'Adams', value: '365000', beds: 4, baths: 2, sqft: '2100', type: 'Single Family', year: '2008', motive: 'AUC', debt: 350000 },
            { addr: '520 Republic Ave', city: 'Birmingham', state: 'AL', zip: '35201', ownerFirst: 'Carol', ownerLast: 'Baker', value: '175000', beds: 2, baths: 1, sqft: '950', type: 'Single Family', year: '1982', motive: 'AUC', debt: 160000 },

            // PRO - Probate (inherited properties still carry mortgages)
            { addr: '300 Legacy Lane', city: 'Savannah', state: 'GA', zip: '31401', ownerFirst: 'Eleanor', ownerLast: 'Nelson', value: '385000', beds: 4, baths: 3, sqft: '2500', type: 'Single Family', year: '1975', motive: 'PRO', debt: 165000 },
            { addr: '115 Heritage Dr', city: 'Charleston', state: 'SC', zip: '29401', ownerFirst: 'Walter', ownerLast: 'Carter', value: '450000', beds: 3, baths: 2, sqft: '1900', type: 'Single Family', year: '1968', motive: 'PRO', debt: 245000 },
            { addr: '82 Estate Rd', city: 'Boise', state: 'ID', zip: '83701', ownerFirst: 'Dorothy', ownerLast: 'Mitchell', value: '310000', beds: 3, baths: 2, sqft: '1650', type: 'Single Family', year: '1980', motive: 'PRO', debt: 185000 },
            { addr: '440 Trust Ave', city: 'Lexington', state: 'KY', zip: '40501', ownerFirst: 'Henry', ownerLast: 'Perez', value: '265000', beds: 3, baths: 1, sqft: '1400', type: 'Single Family', year: '1972', motive: 'PRO', debt: 130000 },
            { addr: '975 Memorial Blvd', city: 'Knoxville', state: 'TN', zip: '37901', ownerFirst: 'Margaret', ownerLast: 'Roberts', value: '225000', beds: 2, baths: 1, sqft: '1100', type: 'Single Family', year: '1965', motive: 'PRO', debt: 95000 },
            { addr: '210 Founders Way', city: 'Madison', state: 'WI', zip: '53701', ownerFirst: 'Arthur', ownerLast: 'Turner', value: '340000', beds: 3, baths: 2, sqft: '1750', type: 'Single Family', year: '1978', motive: 'PRO', debt: 210000 },
            { addr: '630 Homestead Ct', city: 'Mobile', state: 'AL', zip: '36601', ownerFirst: 'Virginia', ownerLast: 'Phillips', value: '195000', beds: 3, baths: 1, sqft: '1300', type: 'Single Family', year: '1960', motive: 'PRO', debt: 78000 },
            { addr: '155 Orchard St', city: 'Albuquerque', state: 'NM', zip: '87101', ownerFirst: 'Eugene', ownerLast: 'Campbell', value: '275000', beds: 3, baths: 2, sqft: '1550', type: 'Single Family', year: '1985', motive: 'PRO', debt: 155000 },
            { addr: '808 Settler Rd', city: 'Tulsa', state: 'OK', zip: '74101', ownerFirst: 'Rose', ownerLast: 'Parker', value: '215000', beds: 2, baths: 1, sqft: '1050', type: 'Single Family', year: '1970', motive: 'PRO', debt: 115000 },
            { addr: '27 Generations Dr', city: 'Little Rock', state: 'AR', zip: '72201', ownerFirst: 'Harold', ownerLast: 'Evans', value: '180000', beds: 3, baths: 1, sqft: '1200', type: 'Single Family', year: '1962', motive: 'PRO', debt: 72000 },

            // COD - Code Violations
            { addr: '444 Inspection Way', city: 'Baltimore', state: 'MD', zip: '21201', ownerFirst: 'Charles', ownerLast: 'Reed', value: '195000', beds: 3, baths: 1, sqft: '1250', type: 'Rowhouse', year: '1945', motive: 'COD', debt: 150000 },
            { addr: '1020 Violation St', city: 'Cleveland', state: 'OH', zip: '44101', ownerFirst: 'Janet', ownerLast: 'Cook', value: '135000', beds: 2, baths: 1, sqft: '900', type: 'Single Family', year: '1955', motive: 'COD', debt: 85000 },
            { addr: '670 Code Blvd', city: 'Newark', state: 'NJ', zip: '07101', ownerFirst: 'Raymond', ownerLast: 'Morgan', value: '280000', beds: 3, baths: 1, sqft: '1400', type: 'Multi Family', year: '1940', motive: 'COD', debt: 220000 },
            { addr: '93 Permit Rd', city: 'St Louis', state: 'MO', zip: '63101', ownerFirst: 'Frances', ownerLast: 'Bell', value: '165000', beds: 3, baths: 1, sqft: '1150', type: 'Single Family', year: '1950', motive: 'COD', debt: 110000 },
            { addr: '518 Compliance Ave', city: 'Milwaukee', state: 'WI', zip: '53201', ownerFirst: 'Jack', ownerLast: 'Murphy', value: '180000', beds: 2, baths: 1, sqft: '1000', type: 'Single Family', year: '1948', motive: 'COD', debt: 95000 },
            { addr: '285 Safety Lane', city: 'Kansas City', state: 'MO', zip: '64101', ownerFirst: 'Judith', ownerLast: 'Bailey', value: '210000', beds: 3, baths: 2, sqft: '1350', type: 'Single Family', year: '1958', motive: 'COD', debt: 145000 },
            { addr: '762 Zoning Dr', city: 'Indianapolis', state: 'IN', zip: '46201', ownerFirst: 'Ralph', ownerLast: 'Rivera', value: '155000', beds: 2, baths: 1, sqft: '950', type: 'Single Family', year: '1952', motive: 'COD', debt: 120000 },
            { addr: '401 Health Dept Rd', city: 'Hartford', state: 'CT', zip: '06101', ownerFirst: 'Shirley', ownerLast: 'Cooper', value: '245000', beds: 3, baths: 1, sqft: '1300', type: 'Multi Family', year: '1942', motive: 'COD', debt: 200000 },
            { addr: '195 Ordinance St', city: 'Buffalo', state: 'NY', zip: '14201', ownerFirst: 'Gary', ownerLast: 'Richardson', value: '125000', beds: 2, baths: 1, sqft: '850', type: 'Single Family', year: '1938', motive: 'COD', debt: 75000 },
            { addr: '836 Enforce Ave', city: 'Providence', state: 'RI', zip: '02901', ownerFirst: 'Theresa', ownerLast: 'Cox', value: '290000', beds: 3, baths: 2, sqft: '1500', type: 'Multi Family', year: '1935', motive: 'COD', debt: 230000 },

            // EVI - Eviction
            { addr: '101 Tenant Way', city: 'Los Angeles', state: 'CA', zip: '90001', ownerFirst: 'William', ownerLast: 'Flores', value: '680000', beds: 3, baths: 2, sqft: '1700', type: 'Multi Family', year: '1988', motive: 'EVI', debt: 420000 },
            { addr: '332 Landlord Blvd', city: 'San Jose', state: 'CA', zip: '95101', ownerFirst: 'Anna', ownerLast: 'Washington', value: '850000', beds: 4, baths: 2, sqft: '2000', type: 'Multi Family', year: '1992', motive: 'EVI', debt: 600000 },
            { addr: '567 Rental Dr', city: 'Philadelphia', state: 'PA', zip: '19101', ownerFirst: 'Peter', ownerLast: 'Butler', value: '320000', beds: 3, baths: 1, sqft: '1400', type: 'Multi Family', year: '1975', motive: 'EVI', debt: 250000 },
            { addr: '88 Lease St', city: 'Minneapolis', state: 'MN', zip: '55401', ownerFirst: 'Joan', ownerLast: 'Barnes', value: '275000', beds: 2, baths: 1, sqft: '1100', type: 'Duplex', year: '1980', motive: 'EVI', debt: 180000 },
            { addr: '445 Property Mgmt Lane', city: 'Sacramento', state: 'CA', zip: '95801', ownerFirst: 'Roger', ownerLast: 'Ross', value: '580000', beds: 4, baths: 2, sqft: '2200', type: 'Multi Family', year: '1995', motive: 'EVI', debt: 410000 },
            { addr: '720 Apt Complex Way', city: 'Fresno', state: 'CA', zip: '93701', ownerFirst: 'Marie', ownerLast: 'Henderson', value: '310000', beds: 3, baths: 2, sqft: '1500', type: 'Multi Family', year: '1985', motive: 'EVI', debt: 225000 },
            { addr: '1050 Housing Ct', city: 'Virginia Beach', state: 'VA', zip: '23451', ownerFirst: 'Larry', ownerLast: 'Coleman', value: '345000', beds: 3, baths: 2, sqft: '1600', type: 'Duplex', year: '1998', motive: 'EVI', debt: 260000 },
            { addr: '208 Occupancy Rd', city: 'Long Beach', state: 'CA', zip: '90801', ownerFirst: 'Diane', ownerLast: 'Jenkins', value: '490000', beds: 3, baths: 2, sqft: '1450', type: 'Multi Family', year: '1990', motive: 'EVI', debt: 350000 },
            { addr: '633 Dwelling Ave', city: 'Oakland', state: 'CA', zip: '94601', ownerFirst: 'Russell', ownerLast: 'Perry', value: '720000', beds: 4, baths: 3, sqft: '2400', type: 'Multi Family', year: '1987', motive: 'EVI', debt: 550000 },
            { addr: '915 Unit St', city: 'Bakersfield', state: 'CA', zip: '93301', ownerFirst: 'Carolyn', ownerLast: 'Powell', value: '265000', beds: 2, baths: 1, sqft: '1050', type: 'Duplex', year: '1982', motive: 'EVI', debt: 195000 },

            // DIV - Divorce
            { addr: '150 Split Oak Lane', city: 'San Francisco', state: 'CA', zip: '94101', ownerFirst: 'Michael', ownerLast: 'Rogers', value: '1200000', beds: 4, baths: 3, sqft: '2800', type: 'Single Family', year: '2010', motive: 'DIV', debt: 750000 },
            { addr: '290 Division Way', city: 'Boston', state: 'MA', zip: '02101', ownerFirst: 'Jennifer', ownerLast: 'Stewart', value: '820000', beds: 3, baths: 2, sqft: '2000', type: 'Townhouse', year: '2005', motive: 'DIV', debt: 500000 },
            { addr: '475 Separate Rd', city: 'Seattle', state: 'WA', zip: '98101', ownerFirst: 'Richard', ownerLast: 'Sanchez', value: '695000', beds: 3, baths: 2, sqft: '1800', type: 'Single Family', year: '2008', motive: 'DIV', debt: 420000 },
            { addr: '830 Independent Dr', city: 'Portland', state: 'OR', zip: '97201', ownerFirst: 'Kimberly', ownerLast: 'Morris', value: '485000', beds: 3, baths: 2, sqft: '1650', type: 'Single Family', year: '2003', motive: 'DIV', debt: 310000 },
            { addr: '62 Settlement Ave', city: 'Denver', state: 'CO', zip: '80202', ownerFirst: 'Joseph', ownerLast: 'Rogers', value: '550000', beds: 4, baths: 3, sqft: '2400', type: 'Single Family', year: '2012', motive: 'DIV', debt: 380000 },
            { addr: '1175 Decree Blvd', city: 'Austin', state: 'TX', zip: '78701', ownerFirst: 'Donna', ownerLast: 'Peterson', value: '460000', beds: 3, baths: 2, sqft: '1750', type: 'Single Family', year: '2006', motive: 'DIV', debt: 285000 },
            { addr: '508 Partition Lane', city: 'Nashville', state: 'TN', zip: '37201', ownerFirst: 'Thomas', ownerLast: 'Ramirez', value: '415000', beds: 4, baths: 2, sqft: '2100', type: 'Single Family', year: '2009', motive: 'DIV', debt: 320000 },
            { addr: '333 Mediation Ct', city: 'Tampa', state: 'FL', zip: '33601', ownerFirst: 'Sandra', ownerLast: 'Watson', value: '375000', beds: 3, baths: 2, sqft: '1600', type: 'Single Family', year: '2004', motive: 'DIV', debt: 250000 },
            { addr: '741 Equity Split Dr', city: 'Charlotte', state: 'NC', zip: '28201', ownerFirst: 'Christopher', ownerLast: 'Brooks', value: '525000', beds: 4, baths: 3, sqft: '2600', type: 'Single Family', year: '2014', motive: 'DIV', debt: 400000 },
            { addr: '169 Filing Rd', city: 'Raleigh', state: 'NC', zip: '27601', ownerFirst: 'Barbara', ownerLast: 'Kelly', value: '390000', beds: 3, baths: 2, sqft: '1500', type: 'Single Family', year: '2007', motive: 'DIV', debt: 265000 },

            // TAX - Unpaid Taxes
            { addr: '200 Delinquent Way', city: 'Detroit', state: 'MI', zip: '48201', ownerFirst: 'Edward', ownerLast: 'Howard', value: '95000', beds: 3, baths: 1, sqft: '1200', type: 'Single Family', year: '1960', motive: 'TAX', debt: 35000 },
            { addr: '485 Tax Sale Rd', city: 'Memphis', state: 'TN', zip: '38101', ownerFirst: 'Catherine', ownerLast: 'Ward', value: '145000', beds: 2, baths: 1, sqft: '950', type: 'Single Family', year: '1965', motive: 'TAX', debt: 28000 },
            { addr: '1030 Lien Ave', city: 'Cleveland', state: 'OH', zip: '44101', ownerFirst: 'Patrick', ownerLast: 'Torres', value: '110000', beds: 3, baths: 1, sqft: '1100', type: 'Single Family', year: '1955', motive: 'TAX', debt: 42000 },
            { addr: '278 Revenue Blvd', city: 'Birmingham', state: 'AL', zip: '35201', ownerFirst: 'Laura', ownerLast: 'Gray', value: '130000', beds: 2, baths: 1, sqft: '900', type: 'Single Family', year: '1958', motive: 'TAX', debt: 22000 },
            { addr: '612 Assessment St', city: 'New Orleans', state: 'LA', zip: '70112', ownerFirst: 'George', ownerLast: 'Ramirez', value: '175000', beds: 3, baths: 1, sqft: '1300', type: 'Single Family', year: '1970', motive: 'TAX', debt: 38000 },
            { addr: '55 Arrears Court', city: 'Buffalo', state: 'NY', zip: '14201', ownerFirst: 'Deborah', ownerLast: 'James', value: '120000', beds: 2, baths: 1, sqft: '850', type: 'Single Family', year: '1952', motive: 'TAX', debt: 45000 },
            { addr: '940 Past Due Rd', city: 'Pittsburgh', state: 'PA', zip: '15201', ownerFirst: 'Kenneth', ownerLast: 'Watson', value: '160000', beds: 3, baths: 1, sqft: '1150', type: 'Single Family', year: '1962', motive: 'TAX', debt: 30000 },
            { addr: '135 Penalty Lane', city: 'Dayton', state: 'OH', zip: '45401', ownerFirst: 'Helen', ownerLast: 'Bryant', value: '105000', beds: 2, baths: 1, sqft: '800', type: 'Single Family', year: '1948', motive: 'TAX', debt: 18000 },
            { addr: '707 Default Ave', city: 'Akron', state: 'OH', zip: '44301', ownerFirst: 'Stephen', ownerLast: 'Alexander', value: '90000', beds: 2, baths: 1, sqft: '750', type: 'Single Family', year: '1945', motive: 'TAX', debt: 25000 },
            { addr: '820 Treasurer Blvd', city: 'Toledo', state: 'OH', zip: '43601', ownerFirst: 'Sharon', ownerLast: 'Russell', value: '85000', beds: 2, baths: 1, sqft: '700', type: 'Single Family', year: '1940', motive: 'TAX', debt: 20000 },

            // OOS - Out of State
            { addr: '1200 Desert Vista', city: 'Albuquerque', state: 'NM', zip: '87101', ownerFirst: 'Greg', ownerLast: 'Rodriguez', value: '275000', beds: 3, baths: 2, sqft: '1600', type: 'Single Family', year: '1998', motive: 'OOS', debt: 180000 },
            { addr: '345 Mountain View', city: 'El Paso', state: 'TX', zip: '79901', ownerFirst: 'Cynthia', ownerLast: 'Diaz', value: '195000', beds: 3, baths: 2, sqft: '1400', type: 'Single Family', year: '2001', motive: 'OOS', debt: 145000 },
            { addr: '780 Palm Springs Rd', city: 'Riverside', state: 'CA', zip: '92501', ownerFirst: 'Timothy', ownerLast: 'Price', value: '420000', beds: 4, baths: 2, sqft: '2000', type: 'Single Family', year: '2005', motive: 'OOS', debt: 310000 },
            { addr: '42 Snowbird Lane', city: 'Scottsdale', state: 'AZ', zip: '85251', ownerFirst: 'Angela', ownerLast: 'Bennett', value: '560000', beds: 4, baths: 3, sqft: '2500', type: 'Single Family', year: '2010', motive: 'OOS', debt: 380000 },
            { addr: '611 Vacation Dr', city: 'Sarasota', state: 'FL', zip: '34230', ownerFirst: 'Jeffrey', ownerLast: 'Wood', value: '485000', beds: 3, baths: 2, sqft: '1800', type: 'Single Family', year: '2008', motive: 'OOS', debt: 320000 },
            { addr: '155 Retreat Ct', city: 'Myrtle Beach', state: 'SC', zip: '29577', ownerFirst: 'Martha', ownerLast: 'Barnes', value: '325000', beds: 3, baths: 2, sqft: '1500', type: 'Condo', year: '2006', motive: 'OOS', debt: 240000 },
            { addr: '890 Absentee Rd', city: 'Reno', state: 'NV', zip: '89501', ownerFirst: 'Daniel', ownerLast: 'Ross', value: '365000', beds: 3, baths: 2, sqft: '1650', type: 'Single Family', year: '2003', motive: 'OOS', debt: 270000 },
            { addr: '230 Investment Blvd', city: 'Fort Worth', state: 'TX', zip: '76101', ownerFirst: 'Nicole', ownerLast: 'Henderson', value: '310000', beds: 3, baths: 2, sqft: '1550', type: 'Single Family', year: '2004', motive: 'OOS', debt: 225000 },
            { addr: '505 Landlord Way', city: 'Baton Rouge', state: 'LA', zip: '70801', ownerFirst: 'Eric', ownerLast: 'Coleman', value: '235000', beds: 3, baths: 2, sqft: '1400', type: 'Single Family', year: '2000', motive: 'OOS', debt: 175000 },
            { addr: '1380 Remote Owner Dr', city: 'Spokane', state: 'WA', zip: '99201', ownerFirst: 'Pamela', ownerLast: 'Jenkins', value: '290000', beds: 3, baths: 2, sqft: '1500', type: 'Single Family', year: '2002', motive: 'OOS', debt: 210000 },
        ];

        let created = 0;
        const courts = ['District Court', 'Superior Court', 'Circuit Court', 'County Court', 'Municipal Court'];
        const lenders = ['National Bank', 'Wells Fargo', 'Chase Bank', 'Bank of America', 'US Bank', 'Citibank', 'PNC Bank'];
        const auctionPlaces = ['County Courthouse', 'Municipal Building', 'City Hall', 'Convention Center', 'Public Auction House'];

        for (const p of props) {
            try {
                const appraised = parseFloat(p.value) || 0;
                const landValue = Math.round(appraised * 0.3);
                const buildingValue = Math.round(appraised * 0.7);
                const county = countyMap[p.state] || `${p.city} County`;
                const { streetNum, streetName } = parseAddress(p.addr);
                const lastSoldAmt = Math.round(appraised * (0.6 + Math.random() * 0.3));

                const prop = await Property.create({
                    PStreetAddr1: `${streetNum} ${streetName}`,
                    PStreetAddr2: created % 5 === 0 ? `Suite ${100 + created}` : null,
                    Pcity: p.city, Pstate: p.state, Pzip: p.zip,
                    Pcounty: county,
                    PBase: ['SFR', 'MFR', 'CND', 'TWN', 'DPX'][created % 5],
                    PBeds: String(p.beds), PBaths: String(p.baths),
                    PLandBuilding: `${landValue}/${buildingValue}`,
                    PType: p.type,
                    PLastSoldAmt: String(lastSoldAmt),
                    PLastSoldDate: new Date(2015 + (created % 8), created % 12, 1 + (created % 28)),
                    PTotLandArea: `${(0.1 + (created % 10) * 0.08).toFixed(2)} acres`,
                    PTotBuildingArea: String(parseInt(p.sqft) + Math.round(parseInt(p.sqft) * 0.1)),
                    PTotSQFootage: p.sqft,
                    PYearBuilt: p.year,
                    PAppraisedBuildingAmt: String(buildingValue),
                    PAppraisedLandAmt: String(landValue),
                    PTotAppraisedAmt: p.value,
                    motive_type_id: mIds[p.motive],
                    PComments: `${p.type} in ${p.city}, ${p.state}. ${p.beds}BR/${p.baths}BA, ${parseInt(p.sqft).toLocaleString()} sqft. Built ${p.year}. Appraised at $${appraised.toLocaleString()}.`,
                    PDateFiled: new Date(2025, created % 12, 1 + (created % 28)),
                    PListingID: `MLS-${p.state}-${String(created + 20000).slice(-6)}`,
                });

                await createProaddressForProperty(prop, p, p.motive, created);

                // Create Owner record
                const ownerState = p.motive === 'OOS' ? (['NY', 'CA', 'IL', 'TX', 'FL'][created % 5]) : p.state;
                await Owner.create({
                    OFirstName: p.ownerFirst,
                    OLastName: p.ownerLast,
                    OMiddleName: ['A', 'J', 'M', 'R', 'L'][created % 5],
                    OStreetAddr1: `${500 + created} ${['Oak', 'Main', 'Park', 'Elm', 'Cedar'][created % 5]} Ave`,
                    OStreetAddr2: created % 4 === 0 ? `Apt ${created + 1}` : null,
                    OCity: p.motive === 'OOS' ? (['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'][created % 5]) : p.city,
                    OState: ownerState,
                    OZip: p.motive === 'OOS' ? (['10001', '90001', '60601', '77001', '33101'][created % 5]) : p.zip,
                    OProperty_id: prop.id,
                    is_out_of_state: p.motive === 'OOS',
                    email: `${p.ownerFirst.toLowerCase()}.${p.ownerLast.toLowerCase()}@email.com`
                });

                // Loan record for all properties with debt
                if (p.debt && p.debt > 0) {
                    const loanData = {
                        property_id: prop.id,
                        loan_amount: p.debt,
                        borrower_name: `${p.ownerFirst} ${p.ownerLast}`,
                        lender_name: lenders[created % lenders.length],
                        lender_address: `${100 + created} Finance Blvd, ${p.city}, ${p.state}`,
                        datetime: new Date(2020 + (created % 5), created % 12, 1 + (created % 28)),
                        deed_id: `DEED-${p.state}-${String(created + 1000).slice(-4)}`
                    };

                    // Enhanced loan fields for PRE and FOR
                    if (p.motive === 'PRE' || p.motive === 'FOR') {
                        loanData.total_default_amount = Math.round(p.debt * (0.05 + Math.random() * 0.1));
                        loanData.foreclosure_stage = p.motive === 'PRE' ? 'Pre-Foreclosure' : 'Foreclosure Filed';
                        loanData.lis_pendens_date = new Date(2025, created % 12, 1 + (created % 28));
                        loanData.arrears_amount = Math.round(p.debt * (0.02 + Math.random() * 0.05));
                        loanData.default_status = p.motive === 'PRE' ? 'In Default' : 'Notice of Sale';
                    }
                    await Loan.create(loanData);
                }

                // Motive-specific records
                if (p.motive === 'AUC') {
                    await Auction.create({
                        APropertyID: prop.id,
                        AAuctionDateTime: futureDate(7 + created * 3),
                        AAuctionPlace: auctionPlaces[created % auctionPlaces.length],
                        AAuctionPlaceAddr1: `${200 + created} ${p.city} Main St`,
                        AAuctionCity: p.city,
                        AAuctionState: p.state,
                        AAuctionZip: parseInt(p.zip),
                        minimum_bid: Math.round(parseFloat(p.value) * 0.6),
                        AAuctionDescription: `Foreclosure auction for ${p.addr}, ${p.city}. ${p.beds}BR/${p.baths}BA ${p.type}. Appraised at $${parseInt(p.value).toLocaleString()}.`
                    });
                }

                if (p.motive === 'PRO') {
                    const deathDate = new Date(2024, created % 12, 1 + (created % 28));
                    await Probate.create({
                        property_id: prop.id,
                        case_number: `PRB-${p.state}-${2025}-${String(created + 100).slice(-4)}`,
                        probate_court: `${p.city} ${courts[created % courts.length]}`,
                        probate_court_county: `${p.city} County`,
                        filing_date: new Date(deathDate.getTime() + 30 * 86400000),
                        date_of_death: deathDate,
                        estate_type: created % 3 === 0 ? 'Intestate' : 'Testate',
                        executor_name: `${['John', 'Mary', 'James', 'Patricia', 'Robert'][created % 5]} ${p.ownerLast}`,
                        executor_contact: `(${500 + created % 500}) ${100 + created % 900}-${1000 + created % 9000}`,
                        estate_value: parseFloat(p.value) + (p.debt || 0),
                        status: ['Open', 'Pending', 'In Administration'][created % 3],
                        notes: `Estate of ${p.ownerFirst} ${p.ownerLast}. Property located at ${p.addr}, ${p.city}, ${p.state}.`
                    });
                }

                if (p.motive === 'COD') {
                    const violationTypes = ['Building Code', 'Fire Safety', 'Zoning', 'Health & Sanitation', 'Structural'];
                    const complaints = [
                        'Unsafe structure - missing handrails and damaged steps',
                        'Electrical code violation - exposed wiring',
                        'Plumbing violation - leaking sewage',
                        'Fire safety violation - blocked exits',
                        'Structural damage - cracked foundation',
                        'Overgrown vegetation and debris accumulation',
                        'Unpermitted construction work',
                        'Lead paint hazard - peeling exterior',
                        'Broken windows and unsecured entry points',
                        'Roof damage and water intrusion'
                    ];
                    await Violation.create({
                        property_id: prop.id,
                        complaint: complaints[created % complaints.length],
                        issue_date: new Date(2025, created % 12, 1 + (created % 28)).toISOString().split('T')[0],
                        types: violationTypes[created % violationTypes.length],
                        short_desc: `${violationTypes[created % violationTypes.length]} violation at ${p.addr}`,
                        fine_amount: 500 + (created % 10) * 250,
                        remediation_deadline: futureDate(30 + created * 5),
                        details: `Violation issued for ${p.addr}, ${p.city}, ${p.state} ${p.zip}. Property owner: ${p.ownerFirst} ${p.ownerLast}. Inspection revealed ${complaints[created % complaints.length].toLowerCase()}.`,
                        current_situation: ['Unresolved', 'Partially Addressed', 'Pending Inspection'][created % 3],
                        compliance_status: ['Non-Compliant', 'In Progress', 'Pending Review'][created % 3]
                    });
                }

                if (p.motive === 'EVI') {
                    await Eviction.create({
                        property_id: prop.id,
                        court_date: futureDate(14 + created * 7),
                        court_docket: `EV-${p.state}-${2025}-${String(created + 500).slice(-4)}`,
                        plaintiff_name: `${p.ownerFirst} ${p.ownerLast}`,
                        court_desc: `${p.city} ${courts[created % courts.length]} - Eviction Proceedings`,
                        court_room: `Room ${100 + created % 20}${String.fromCharCode(65 + created % 4)}`,
                        details: `Eviction filing for property at ${p.addr}, ${p.city}, ${p.state}. Landlord/Owner: ${p.ownerFirst} ${p.ownerLast}. Reason: ${['Non-payment of rent', 'Lease violation', 'Property damage', 'Unauthorized occupants', 'Expired lease'][created % 5]}.`
                    });
                }

                if (p.motive === 'DIV') {
                    const filingDate = new Date(2025, created % 12, 1 + (created % 28));
                    const attorneys = ['Smith & Associates', 'Johnson Law Group', 'Williams Legal', 'Davis Family Law', 'Miller & Partners'];
                    await Divorce.create({
                        property_id: prop.id,
                        case_number: `DV-${p.state}-${2025}-${String(created + 200).slice(-4)}`,
                        court_name: `${p.city} ${courts[created % courts.length]} - Family Division`,
                        filing_date: filingDate,
                        legal_filing_date: filingDate,
                        attorney_name: attorneys[created % attorneys.length],
                        divorce_type: ['Contested', 'Uncontested', 'Collaborative'][created % 3],
                        petitioner_name: `${p.ownerFirst} ${p.ownerLast}`,
                        respondent_name: `${['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'][created % 5]} ${p.ownerLast}`,
                        status: ['Filed', 'Pending', 'Discovery', 'Mediation'][created % 4],
                        notes: `Divorce proceedings involving marital property at ${p.addr}, ${p.city}, ${p.state}. Estimated property value: $${parseInt(p.value).toLocaleString()}.`
                    });
                }

                if (p.motive === 'TAX') {
                    const taxYear = 2020 + (created % 4);
                    await TaxLien.create({
                        property_id: prop.id,
                        tax_year: `${taxYear}-${taxYear + 1 + (created % 2)}`,
                        amount_owed: p.debt || 15000,
                        last_tax_year_paid: String(taxYear - 1),
                        lien_date: new Date(2025, created % 12, 1),
                        tax_authority: `${p.city} County Tax Authority`,
                        lien_number: `TL-${p.state}-${String(created + 3000).slice(-4)}`,
                        status: ['Active', 'Pending Sale', 'In Redemption'][created % 3],
                        sale_date: created % 3 === 1 ? futureDate(60 + created * 10) : null,
                        redemption_period_end: futureDate(90 + created * 15),
                        notes: `Unpaid property taxes for ${p.addr}, ${p.city}, ${p.state}. Owner: ${p.ownerFirst} ${p.ownerLast}. Total owed: $${(p.debt || 15000).toLocaleString()}.`
                    });
                }

                try {
                    created++;
                } catch (propErr) {
                    console.error(`[SEED] ERROR on property ${created} (${p.motive} - ${p.city}):`, propErr.message);
                    console.error(`[SEED] Full error:`, JSON.stringify(propErr, Object.getOwnPropertyNames(propErr)));
                }
            } catch (outerPropErr) {
                console.error(`[SEED] OUTER ERROR on property ${created} (${p.motive} - ${p.city}):`, outerPropErr.message);
            }
        }

        console.log(`[SEED] Created ${created} properties across ${Object.keys(motiveMap).length} motive types.`);
        console.log('[SEED] System Initialized.');
    } catch (err) { console.error('[SEED] Error:', err); }
};
