/**
 * seed_auc_max.js
 * Seeds TWO Auction (AUC) properties with maximum detail to exercise
 * every field in AuctionDetailView.tsx — one future auction, one past.
 */
const {
    Property, Proaddress, MotiveTypes,
    Auction, Auctioneer,
    Loan, PropertyTrustDeed,
    TaxLien, Violation, Eviction,
    Owner
} = require('./models');

const future = (days) => new Date(Date.now() + days * 86400000);
const past = (days) => new Date(Date.now() - days * 86400000);

async function seed() {
    try {
        console.log('🚀  AUC Max-Detail Seeder starting...\n');

        const aucMotive = await MotiveTypes.findOne({ where: { code: 'AUC' } });
        if (!aucMotive) {
            console.error('❌  AUC motive type not found. Run motive-type seeder first.');
            process.exit(1);
        }

        /* ═══════════════════════════════════════════════════
           PROPERTY 1 — UPCOMING auction, full data
           Beverly Hills luxury estate — auction in 12 days
        ═══════════════════════════════════════════════════ */
        console.log('📦  [1/2] Creating Auctioneer record...');
        const ae1 = await Auctioneer.create({
            name: 'VICTOR HARTWELL',
            address: '9100 Wilshire Blvd, Suite 600, Beverly Hills, CA 90210',
            phone: '3105550191',
            email: 'victor@hartwell-auctions.com',
            web_site: 'https://hartwell-auctions.com',
            html: '<p><strong>Hartwell Auctions</strong> — California\'s premier luxury property auction house. <a href="https://hartwell-auctions.com/register">Register to Bid Online</a>. Licensed CA Auctioneer #2019-LA-8847.</p>',
            type: 1
        });

        console.log('📦  [1/2] Creating Proaddress...');
        const pa1 = await Proaddress.create({
            listing_id: 'AUC-BH-90210-MAX',
            PStreetNum: '720',
            PStreetName: 'LOMA VISTA',
            street_name_post_type: 'DR',
            Pcity: 'Beverly Hills',
            PState: 'CA',
            Pzip: '90210',
            PMotiveType: 'AUC',
            auctioneer_id: ae1.id,
            owner_name: 'JONATHAN CALDWELL III',
            PFirstName: 'JONATHAN',
            PMiddleName: 'ALAN',
            PLastName: 'CALDWELL',
            price: 4750000.00,
            proptype: 'Single Family Residential',
            beds: '6',
            baths: '8',
            square_feet: 9200,
            floors: 3.0,
            PYearBuilt: '2016',
            garage_size: 4.0,
            lot_size: '1.2 Acres',
            school_district: 'Beverly Hills Unified School District',
            amenities: 'Infinity Pool, Home Theater, Wine Cellar, 4-Car Garage, Smart Home, Chef\'s Kitchen, Guest House',
            comments: 'Trophy estate in prime Beverly Hills, scheduled for public auction due to loan default. Motivated trustees.',
            case_number: 'AUC-2026-BH-00472',
            deed_book_page: 'B9800 / P0044',
            counties: 'Los Angeles',
            url: 'https://hartwell-auctions.com/listings/auc-bh-90210',
            // Auction fields (fallback — Auction table is preferred)
            auctiondatetime: future(12),
            sale_date: future(12),
            sale_time: '10:00:00',
            auction_amt: '2950000',
            auctionplace: 'Beverly Hills City Hall — Steps',
            auctionplaceaddr1: '455 N REXFORD DR',
            auctioncity: 'Beverly Hills',
            auctionstate: 'CA',
            auctionzip: 90210,
            auctiondescription: 'Property to be sold to highest bidder. Minimum opening bid required. Buyer assumes all liens and encumbrances. 10% deposit due immediately.',
            // Auctioneer fallback fields
            auctioneername: 'VICTOR HARTWELL',
            auctioneercompanyname: 'HARTWELL AUCTIONS INC',
            auctioneerphone: '3105550191',
            auctioneeremail: 'victor@hartwell-auctions.com',
            auctioneerweb_site: 'https://hartwell-auctions.com',
            auctioneeraddress: '9100 Wilshire Blvd, Suite 600, Beverly Hills, CA 90210',
            auctioneerhtml: '<p>Licensed California Auctioneer. All sales final. Wire transfer only.</p>',
            // Trustee
            trusteename: 'DIANA FORSYTHE-WOOD',
            trusteecompanyname: 'FORSYTHE LEGAL TRUSTEE GROUP',
            trusteeaddress: '2029 CENTURY PARK EAST, SUITE 1400',
            trusteecity: 'Los Angeles',
            trusteestate: 'CA',
            trusteezip: 90067,
            trusteephone: '3105559876',
            trusteeemail: 'service@forsythelegal.com',
            trusteewebsite: 'https://forsythelegal.com',
            trusteetype: 'Corporate Trustee',
            // Owner contact
            owner_phone: '3105554200',
            owner_mailing_address: '1250 Via Miraleste, Palos Verdes Estates, CA 90274',
            owner_current_state: 'CA',
            // Eviction (Proaddress inline)
            court_docket: 'EV-2026-LA-04455',
            court_date: future(25),
            eviction_owner_lawyer_name: 'CHAMBERS & HUNT LLP',
            // Violation (Proaddress inline)
            violation_complaint: 'Unpermitted guest house addition',
            violation_issue_date: '2025-09-15',
            violation_types: 'Unpermitted Construction, Zoning Violation',
            violation_desc: 'Structure added without building permits, violates setback requirements',
            violation_total: 15000,
            violation_details: 'Owner failed to obtain required permits for 800 sqft rear guest house built in 2023.',
            violation_issued_by: 'City of Beverly Hills Building & Safety Dept',
            DATE_TIMEOFEXTRACTION: new Date()
        });

        console.log('📦  [1/2] Creating Property...');
        const prop1 = await Property.create({
            PStreetAddr1: '720 LOMA VISTA DR',
            Pcity: 'Beverly Hills',
            Pstate: 'CA',
            Pzip: '90210',
            Pcounty: 'Los Angeles',
            PBeds: '6',
            PBaths: '8',
            PType: 'Single Family Residential',
            PLandBuilding: 'Res - Improved',
            PBase: '3SF',
            PTotSQFootage: '9200',
            PTotLandArea: '52272 sqft',
            PTotBuildingArea: '9200 sqft',
            PYearBuilt: '2016',
            PLastSoldAmt: '6200000',
            PLastSoldDate: '2019-06-15',
            PAppraisedBuildingAmt: '3800000',
            PAppraisedLandAmt: '1400000',
            PTotAppraisedAmt: '5200000',
            PListingID: 'AUC-BH-90210-MAX',
            PDateFiled: past(45),
            PComments: 'Trophy estate with ocean views. Distressed sale due to mortgage default. Outstanding tax liens must be satisfied by buyer.',
            motive_type_id: aucMotive.id,
            proaddress_id: pa1.id,
            auctioneer_id: ae1.id
        });

        console.log('📦  [1/2] Creating Auction record...');
        await Auction.create({
            APropertyID: prop1.id,
            AAuctionDateTime: future(12),
            AAuctionPlace: 'Beverly Hills City Hall — Grand Steps',
            AAuctionPlaceAddr1: '455 N REXFORD DR',
            AAuctionPlaceAddr2: 'Main Entrance, Room 1A',
            AAuctionCity: 'Beverly Hills',
            AAuctionState: 'CA',
            AAuctionZip: 90210,
            minimum_bid: 2950000.00,
            AAuctionDescription: 'NOTICE OF TRUSTEE\'S SALE — Public auction of the real property situated at 720 Loma Vista Dr, Beverly Hills CA 90210. Property will be sold to the highest bidder. Minimum bid applies. Prospective buyers must register 48 hours in advance and provide proof of funds. 10% of bid amount due in cashier\'s check at time of sale. Balance due in 30 days. Sold AS-IS. No contingencies.'
        });

        console.log('📦  [1/2] Creating Loan record...');
        await Loan.create({
            property_id: prop1.id,
            deed_id: 'DOC-2019-BH-0044',
            borrower_name: 'JONATHAN CALDWELL III',
            lender_name: 'PACIFIC PREMIER BANK',
            lender_address: '17901 Von Karman Ave, Irvine, CA 92614',
            datetime: '2019-06-15',
            loan_amount: '4100000',
            total_default_amount: '287500',
            arrears_amount: '94000',
            foreclosure_stage: 'Auction Scheduled',
            lis_pendens_date: '2025-10-12',
            default_status: 'Default'
        });

        console.log('📦  [1/2] Creating Trust Deed...');
        await PropertyTrustDeed.create({
            property_id: String(prop1.id),
            deed_id: 'TD-2019',
            datetime: '2019-06-20',
            county: 'Los Angeles',
            property_address: '720 Loma Vista Dr, Beverly Hills, CA 90210',
            owner_name: 'CALDWELL',
            borrower_name: 'CALDWELL J',
            lender_name: 'PACIFIC PREMIER',
            lender_address: '17901 Von Karman Ave, Irvine, CA 92614',
            trustee_name: 'FORSYTHE-WOOD D',
            trustee_address: '2029 Century Park East, Suite 1400, Los Angeles, CA 90067',
            loan_amount: '4100000'
        });

        console.log('📦  [1/2] Creating Tax Liens (2)...');
        await TaxLien.bulkCreate([
            {
                property_id: prop1.id,
                tax_year: '2023-2024',
                amount_owed: 78400.00,
                last_tax_year_paid: '2022',
                lien_date: '2024-07-01',
                tax_authority: 'Los Angeles County Tax Collector',
                lien_number: 'LAC-TL-2024-00081',
                status: 'Active',
                sale_date: future(45),
                redemption_period_end: future(30),
                notes: 'Owner failed to pay 2023 and 2024 property taxes. Tax sale scheduled if not redeemed.'
            },
            {
                property_id: prop1.id,
                tax_year: '2022',
                amount_owed: 39200.00,
                last_tax_year_paid: '2021',
                lien_date: '2023-08-15',
                tax_authority: 'City of Beverly Hills',
                lien_number: 'BH-2023-TL-0044',
                status: 'Active',
                sale_date: null,
                redemption_period_end: past(10),
                notes: 'Redemption period has expired. Lien remains active and must be satisfied at closing.'
            }
        ]);

        console.log('📦  [1/2] Creating Code Violations (2)...');
        await Violation.bulkCreate([
            {
                property_id: prop1.id,
                complaint: 'CV-2025-BH-00892: Unpermitted Structure',
                issue_date: '2025-09-15',
                types: 'Unpermitted Construction, Setback Violation',
                short_desc: 'Guest house built without permit, violates 5-ft setback',
                fine_amount: 15000.00,
                remediation_deadline: past(30),
                details: '800 sqft guest cottage constructed in rear yard in 2023 without building permits. Structure fails to meet minimum setback from eastern property line. Owner notified three times, failed to respond.',
                current_situation: 'Violation unresolved. Owner has not applied for retroactive permits.',
                resolution_date: null,
                compliance_status: 'Non-Compliant'
            },
            {
                property_id: prop1.id,
                complaint: 'CV-2024-BH-00341: Fire Safety Deficiency',
                issue_date: '2024-03-10',
                types: 'Fire Code Violation',
                short_desc: 'Sprinkler system inoperable in west wing',
                fine_amount: 3500.00,
                remediation_deadline: future(15),
                details: 'Fire sprinkler heads in the west wing and secondary structure were found inoperable during routine inspection on March 7, 2024. Owner agreed to repair by April 30, 2024 but repairs remained incomplete.',
                current_situation: 'Re-inspection scheduled for next month.',
                resolution_date: null,
                compliance_status: 'Pending'
            }
        ]);

        console.log('📦  [1/2] Creating Eviction record...');
        await Eviction.create({
            property_id: prop1.id,
            court_date: future(25),
            court_docket: 'EV-2026-LA-04455',
            plaintiff_name: 'FORSYTHE LEGAL TRUSTEE GROUP (as Trustee)',
            court_desc: 'Los Angeles Superior Court — Unlawful Detainer Division',
            court_room: 'Dept. 97 — Stanley Mosk Courthouse',
            details: 'Trustee has filed for unlawful detainer to vacate current occupants prior to auction. Occupants were notified via posted 3-day notice on Feb 1, 2026. Hearing scheduled. Property should be vacant at time of sale.'
        });

        console.log('📦  [1/2] Creating Owner record...');
        await Owner.create({
            OProperty_id: prop1.id,
            OFirstName: 'JONATHAN',
            OMiddleName: 'ALAN',
            OLastName: 'CALDWELL III',
            OStreetAddr1: '1250 Via Miraleste',
            OCity: 'Palos Verdes Estates',
            OState: 'CA',
            OZip: '90274',
            is_out_of_state: false,
            email: 'jcaldwell@privatemail.com'
        });

        console.log('\n✅  Property 1 created! ID:', prop1.id);

        /* ═══════════════════════════════════════════════════
           PROPERTY 2 — PAST auction (Auction Date Passed)
           Chicago South Side — auction happened 8 days ago
        ═══════════════════════════════════════════════════ */
        console.log('\n📦  [2/2] Creating Auctioneer record...');
        const ae2 = await Auctioneer.create({
            name: 'RACHEL DONOVAN',
            address: '77 W Wacker Dr, Suite 4500, Chicago, IL 60601',
            phone: '3125550832',
            email: 'rachel@midwestauctions.com',
            web_site: 'https://midwestauctions.com',
            html: '<p><strong>Midwest Auction Services</strong> — Illinois Licensed Auctioneer #IL-2018-4422. Specializing in court-ordered and estate sales.</p><ul><li>All properties sold as-is</li><li>Cashier\'s check required</li><li>Title insurance available</li></ul>',
            type: 1
        });

        console.log('📦  [2/2] Creating Proaddress...');
        const pa2 = await Proaddress.create({
            listing_id: 'AUC-CHI-60637-MAX',
            PStreetNum: '1847',
            PStreetName: 'S MICHIGAN',
            street_name_post_type: 'AVE',
            Pcity: 'Chicago',
            PState: 'IL',
            Pzip: '60637',
            PMotiveType: 'AUC',
            auctioneer_id: ae2.id,
            owner_name: 'DEMARCO L WASHINGTON',
            PFirstName: 'DEMARCO',
            PMiddleName: 'LAMONT',
            PLastName: 'WASHINGTON',
            price: 285000.00,
            proptype: 'Multi-Family Residential',
            beds: '6',
            baths: '3',
            square_feet: 3800,
            floors: 2.0,
            PYearBuilt: '1962',
            garage_size: 1.0,
            lot_size: '6,250 sqft',
            school_district: 'Chicago Public Schools District 299',
            amenities: 'Enclosed Back Porch, Full Basement, Hardwood Floors',
            comments: 'Two-flat income property. Auction date passed 8 days ago. Property may be relisted.',
            case_number: 'CH-FC-2026-07722',
            deed_book_page: 'OR-88412 / P-003',
            counties: 'Cook',
            url: 'https://midwestauctions.com/listings/chi-60637',
            // Auction fallback fields
            auctiondatetime: past(8),
            sale_date: past(8),
            sale_time: '09:00:00',
            auction_amt: '148000',
            auctionplace: 'Richard J. Daley Center',
            auctionplaceaddr1: '50 W WASHINGTON ST',
            auctionplaceaddr2: 'Room 1303',
            auctioncity: 'Chicago',
            auctionstate: 'IL',
            auctionzip: 60602,
            auctiondescription: 'Cook County Sheriff\'s Sale. Property sold pursuant to judgment of foreclosure. All sales subject to court confirmation.',
            // Auctioneer fallback
            auctioneername: 'RACHEL DONOVAN',
            auctioneercompanyname: 'MIDWEST AUCTION SERVICES LLC',
            auctioneerphone: '3125550832',
            auctioneeremail: 'rachel@midwestauctions.com',
            auctioneerweb_site: 'https://midwestauctions.com',
            auctioneeraddress: '77 W Wacker Dr, Suite 4500, Chicago, IL 60601',
            // Trustee
            trusteename: 'COOK COUNTY SHERIFF\'S OFFICE',
            trusteecompanyname: 'OFFICE OF THE SHERIFF OF COOK COUNTY',
            trusteeaddress: '69 W WASHINGTON ST',
            trusteecity: 'Chicago',
            trusteestate: 'IL',
            trusteezip: 60602,
            trusteephone: '3125552222',
            trusteeemail: 'sheriff.sales@cookcountyil.gov',
            trusteewebsite: 'https://www.cookcountysheriff.org',
            trusteetype: 'Sheriff / Court-Appointed',
            // Owner contact
            owner_phone: '7735558841',
            owner_mailing_address: '2204 N Kimball Ave, Chicago, IL 60647',
            owner_current_state: 'IL',
            // Court / eviction (inline)
            court_docket: 'CH-EV-2026-00881',
            court_date: future(5),
            eviction_owner_lawyer_name: 'PRO SE (self-represented)',
            // Violation inline
            violation_complaint: 'Deferred maintenance — roof and exterior',
            violation_issue_date: '2024-11-20',
            violation_types: 'Exterior Property Maintenance',
            violation_desc: 'Deteriorated roof shingles, broken gutters, peeling exterior paint',
            violation_total: 4500,
            violation_details: 'Inspector cited roof in disrepair with active leaking in attic space. Owner given 90 days to remediate.',
            violation_issued_by: 'City of Chicago Department of Buildings',
            DATE_TIMEOFEXTRACTION: past(2)
        });

        console.log('📦  [2/2] Creating Property...');
        const prop2 = await Property.create({
            PStreetAddr1: '1847 S MICHIGAN AVE',
            Pcity: 'Chicago',
            Pstate: 'IL',
            Pzip: '60637',
            Pcounty: 'Cook',
            PBeds: '6',
            PBaths: '3',
            PType: 'Multi-Family (2-Flat)',
            PLandBuilding: 'Res Income',
            PBase: '2SF',
            PTotSQFootage: '3800',
            PTotLandArea: '6250 sqft',
            PTotBuildingArea: '3800 sqft',
            PYearBuilt: '1962',
            PLastSoldAmt: '198000',
            PLastSoldDate: '2008-04-30',
            PAppraisedBuildingAmt: '165000',
            PAppraisedLandAmt: '55000',
            PTotAppraisedAmt: '220000',
            PListingID: 'AUC-CHI-60637-MAX',
            PDateFiled: past(120),
            PComments: '2-unit income property. First floor tenant occupied (holdover). Seller is Cook County Sheriff pursuant to foreclosure judgment. Title to be conveyed by sheriff\'s deed.',
            motive_type_id: aucMotive.id,
            proaddress_id: pa2.id,
            auctioneer_id: ae2.id
        });

        console.log('📦  [2/2] Creating Auction record...');
        await Auction.create({
            APropertyID: prop2.id,
            AAuctionDateTime: past(8),
            AAuctionPlace: 'Richard J. Daley Center',
            AAuctionPlaceAddr1: '50 W WASHINGTON ST',
            AAuctionPlaceAddr2: 'Room 1303 — 13th Floor',
            AAuctionCity: 'Chicago',
            AAuctionState: 'IL',
            AAuctionZip: 60602,
            minimum_bid: 148000.00,
            AAuctionDescription: 'SHERIFF\'S SALE — In the matter of JPMORGAN CHASE BANK v. WASHINGTON, Case No. CH-FC-2026-07722. Property sold as-is, where-is. Court confirmation required within 30 days of sale. Buyer responsible for all outstanding real estate taxes, water bills, and HOA liens. No warranty of title expressed or implied. Property may be inspected by appointment only — contact auctioneer.'
        });

        console.log('📦  [2/2] Creating Loan records (2)...');
        await Loan.bulkCreate([
            {
                property_id: prop2.id,
                deed_id: 'MTG-2008-CCK-00441',
                borrower_name: 'DEMARCO L WASHINGTON',
                lender_name: 'JPMORGAN CHASE BANK NA',
                lender_address: '3415 Vision Drive, Columbus, OH 43219',
                datetime: '2008-04-30',
                loan_amount: '175000',
                total_default_amount: '48300',
                arrears_amount: '18900',
                foreclosure_stage: 'Judgment of Foreclosure',
                lis_pendens_date: '2025-06-20',
                default_status: 'Default'
            },
            {
                property_id: prop2.id,
                deed_id: 'HELOC-2015-CCK-0088',
                borrower_name: 'DEMARCO L WASHINGTON',
                lender_name: 'MIDWEST COMMUNITY CREDIT UNION',
                lender_address: '1440 N Milwaukee Ave, Chicago, IL 60622',
                datetime: '2015-09-01',
                loan_amount: '42000',
                total_default_amount: '42000',
                arrears_amount: '42000',
                foreclosure_stage: 'Default',
                lis_pendens_date: '2025-08-01',
                default_status: 'Default'
            }
        ]);

        console.log('📦  [2/2] Creating Trust Deed...');
        await PropertyTrustDeed.create({
            property_id: String(prop2.id),
            deed_id: 'MTG-2008',
            datetime: '2008-05-05',
            county: 'Cook',
            property_address: '1847 S Michigan Ave, Chicago, IL 60637',
            owner_name: 'WASHINGTON D',
            borrower_name: 'WASHINGTON D',
            lender_name: 'JPMORGAN CHASE',
            lender_address: '3415 Vision Drive, Columbus, OH 43219',
            trustee_name: 'COOK COUNTY SHERIFF',
            trustee_address: '69 W Washington St, Chicago, IL 60602',
            loan_amount: '175000'
        });

        console.log('📦  [2/2] Creating Tax Lien...');
        await TaxLien.create({
            property_id: prop2.id,
            tax_year: '2022-2023',
            amount_owed: 11840.00,
            last_tax_year_paid: '2021',
            lien_date: '2024-02-14',
            tax_authority: 'Cook County Treasurer',
            lien_number: 'CCT-TL-2024-04912',
            status: 'Active',
            sale_date: future(60),
            redemption_period_end: past(5),
            notes: 'Redemption period expired. Delinquent taxes must be paid in full at closing or by winning bidder.'
        });

        console.log('📦  [2/2] Creating Code Violation...');
        await Violation.create({
            property_id: prop2.id,
            complaint: 'DOB-2024-CHI-88920: Exterior Maintenance',
            issue_date: '2024-11-20',
            types: 'Exterior Property Maintenance, Roof Deficiency',
            short_desc: 'Deteriorated roof, broken gutters, peeling exterior paint',
            fine_amount: 4500.00,
            remediation_deadline: past(60),
            details: 'Inspector cited active roof leak in primary structure attic. Gutters detached above front entrance posing pedestrian hazard. Exterior paint peeling on all four elevations. Owner notified by certified mail. No response received.',
            current_situation: 'Violation unresolved. Property in active foreclosure proceedings.',
            resolution_date: null,
            compliance_status: 'Non-Compliant'
        });

        console.log('📦  [2/2] Creating Eviction record...');
        await Eviction.create({
            property_id: prop2.id,
            court_date: '2026-03-10',
            court_docket: 'CH-EV-2026-00881',
            plaintiff_name: 'COOK COUNTY SHERIFF as Trustee for JPMORGAN CHASE BANK NA',
            court_desc: 'Circuit Court of Cook County — Chancery Division',
            court_room: 'Courtroom 2402',
            details: 'First floor tenant has refused to vacate after sale notice. Trustee filed unlawful detainer action on Feb 3, 2026. Tenant claims lease agreement valid through June 2026. Court to determine. Property purchased at sheriff\'s sale subject to this pending eviction proceeding.'
        });

        console.log('📦  [2/2] Creating Owner record (Out of State)...');
        await Owner.create({
            OProperty_id: prop2.id,
            OFirstName: 'DEMARCO',
            OMiddleName: 'LAMONT',
            OLastName: 'WASHINGTON',
            OStreetAddr1: '2204 N KIMBALL AVE',
            OCity: 'Chicago',
            OState: 'IL',
            OZip: '60647',
            is_out_of_state: false,
            email: 'demarco.washington@gmail.com'
        });

        console.log('\n✅  Property 2 created! ID:', prop2.id);
        console.log('\n🎉  Both AUC properties seeded successfully!');
        console.log(`    Property 1 (Upcoming, Beverly Hills): ID ${prop1.id}`);
        console.log(`    Property 2 (Past, Chicago):           ID ${prop2.id}`);
        console.log('\n    Open http://localhost:3000 → Search → filter by Auction motive type → open either property.\n');
        process.exit(0);
    } catch (err) {
        console.error('\n❌  Seeding error:', err.message);
        if (err.errors) err.errors.forEach(e => console.error('   -', e.message));
        process.exit(1);
    }
}

seed();
