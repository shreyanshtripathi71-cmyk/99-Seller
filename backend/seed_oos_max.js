/**
 * seed_oos_max.js
 * Seeds 2 Out of State Owner (OOS) properties with maximum detail.
 *
 * Property 1: 2247 Vollintine Avenue, Memphis, TN 38107
 *   Owner: Marcus Ellington — resides in New York, NY
 *
 * Property 2: 1482 South Gilpin Street, Denver, CO 80210
 *   Owner: Theodore Voss — resides in London, UK (international OOS)
 *
 * Schema constraints handled:
 *   - Proaddress.parsed    → ENUM('2 exact matches','success','address not found')
 *   - Proaddress.violation_total → INTEGER (no decimals)
 *   - Proaddress.garage_size    → DOUBLE (number, not string)
 *   - Ownername.PcompanyName    → NOT NULL (pass '')
 *   - Owner.email               → NOT NULL (pass '' if empty)
 *   - Proaddress.price          → DOUBLE.UNSIGNED allowNull:false
 *   - Proaddress.beds/baths     → STRING
 *   - Proaddress.square_feet    → INTEGER.UNSIGNED allowNull:false
 *   - Property: beds/baths/sqft/yearBuilt → use actual column names from model
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { Sequelize, QueryTypes } = require('sequelize');
const db = require('./models');

async function seedOOS() {
    await db.sequelize.authenticate();
    console.log('✅ Connected to DB');

    // ══════════════════════════════════════════════════════
    // PROPERTY 1 — Marcus Ellington, Memphis TN (OOS to NY)
    // ══════════════════════════════════════════════════════
    const p1ListingId = 'OOS-MEM-0001';
    const existP1 = await db.Proaddress.findOne({ where: { listing_id: p1ListingId } });

    if (existP1) {
        console.log(`⏭  Property 1 (${p1ListingId}) already exists, skipping.`);
    } else {
        await db.sequelize.transaction(async (t) => {

            // 1. MotiveTypes — get or create OOS
            const [mt] = await db.sequelize.query(
                "SELECT id FROM motive_types WHERE code = 'OOS' LIMIT 1",
                { type: QueryTypes.SELECT, transaction: t }
            );
            let motiveTypeId = mt?.id;
            if (!motiveTypeId) {
                const [newMt] = await db.sequelize.query(
                    "INSERT INTO motive_types (code, name) VALUES ('OOS', 'Out of State Owner')",
                    { type: QueryTypes.INSERT, transaction: t }
                );
                motiveTypeId = newMt;
                console.log(`  ➕ Created motive_type OOS (id=${motiveTypeId})`);
            } else {
                console.log(`  ✓ Found motive_type OOS (id=${motiveTypeId})`);
            }

            // 2. Site
            const [siteResult] = await db.sequelize.query(
                "INSERT INTO site (url) VALUES ('https://shelby.tennessee.gov/property') ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
                { type: QueryTypes.INSERT, transaction: t }
            );
            const siteId = siteResult;

            // 3. Ownername
            const ownername = await db.Ownername.create({
                PLastName: 'Ellington',
                PMiddleName: 'James',
                PFirstName: 'Marcus',
                PcompanyName: '',           // NOT NULL — empty string
                PMotiveType: 'OOS',
                counties: 'Shelby',
                html: '<p><strong>Marcus J. Ellington</strong> is a real estate investor based in New York, NY. Acquired this Memphis property as a rental investment in 2019. Current management challenges due to remote ownership and ongoing code violations.</p>'
            }, { transaction: t });

            // 4. Proaddress
            const proaddress = await db.Proaddress.create({
                listing_id: p1ListingId,
                PStreetNum: '2247',
                PStreetName: 'Vollintine',
                street_name_post_type: 'Avenue',
                PSuiteNum: null,
                Pcity: 'Memphis',
                PState: 'TN',
                Pzip: '38107',
                owner_name: 'Marcus James Ellington',
                PMotiveType: 'OOS',
                counties: 'Shelby',
                price: 127500,
                beds: '3',
                baths: '1',
                owner_mailing_address: '418 West 45th Street, Apt 12C, New York, NY 10036',
                owner_current_state: 'NY',
                owner_phone: '9173882940',
                proptype: 'Single Family Residential',
                square_feet: 1320,
                PYearBuilt: '1952',
                floors: 1,
                school_district: 'Memphis-Shelby County Schools',
                garage_size: 0,             // DOUBLE not string
                lot_size: '0.14 acres',
                amenities: 'Hardwood floors, covered porch, basement storage',
                comments: 'Long-term rental property. Owner is New York-based and non-resident. Property has been tenant-occupied but currently vacant between leases. Roof replaced 2021.',
                site_id: siteId,
                parsed: 'success',          // ENUM value
                violation_complaint: 'Overgrown vegetation, exterior paint deterioration',
                violation_issue_date: '2024-09-15',
                violation_types: 'Property Maintenance, Exterior Condition',
                violation_total: 800,       // INTEGER not decimal
                violation_desc: 'Property exterior not maintained to code standards',
                violation_issued_by: 'Memphis Code Enforcement Division',
                ownername_id: ownername.id,
                PLastName: 'Ellington',
                PMiddleName: 'James',
                PFirstName: 'Marcus',
                PcompayName: '',
                deed_book_page: 'BK 9871 PG 0044',
                case_number: 'MEM-COE-2024-4471',
                sale_date: null,
                trusteename: 'Raymond K. Doyle',
                trusteecompanyname: 'Mid-South Title & Escrow LLC',
                trusteeaddress: '100 N Main Street Suite 1400',
                trusteecity: 'Memphis',
                trusteestate: 'TN',
                trusteezip: 38103,
                trusteephone: '9015554887',
                trusteeemail: 'rdoyle@midsouthtitle.com',
                trusteewebsite: 'https://midsouthtitle.com',
                trusteetype: 'Corporate Trustee',
                DATE_TIMEOFEXTRACTION: new Date('2025-11-01'),
                backup_street_name: 'Vollintine Ave'
            }, { transaction: t });

            // 5. Property
            const property = await db.Property.create({
                PBeds: '3',
                PBaths: '1',
                PTotSQFootage: '1320',
                PYearBuilt: '1952',
                PType: 'Single Family Residential',
                PTotAppraisedAmt: '145000',
                Pcity: 'Memphis',
                Pstate: 'TN',
                Pzip: '38107',
                Pcounty: 'Shelby',
                proaddress_id: proaddress.id,
                PLandBuilding: 'Residential',
                PBase: 'Yes',
                PTotLandArea: '6098',
                PTotBuildingArea: '1320',
                PLastSoldAmt: '89500',
                PLastSoldDate: new Date('2019-03-22'),
                PAppraisedBuildingAmt: '98000',
                PAppraisedLandAmt: '47000',
                PListingID: p1ListingId,
                PDateFiled: new Date('2025-11-01'),
                PComments: 'Out of state owner — currently vacant between tenants. Motivated seller. Some deferred maintenance.',
                motive_type_id: motiveTypeId,
            }, { transaction: t });

            // 6. Owner
            const owner = await db.Owner.create({
                OFirstName: 'Marcus',
                OMiddleName: 'James',
                OLastName: 'Ellington',
                OStreetAddr1: '418 West 45th Street',
                OStreetAddr2: 'Apt 12C',
                OCity: 'New York',
                OState: 'NY',
                OZip: '10036',
                OProperty_id: property.id,
                is_out_of_state: true,
                email: 'marcus.ellington.nyc@gmail.com'
            }, { transaction: t });

            // 7. Update Proaddress.ownername_id — already set above via create
            //    but ensure it's linked
            await db.Proaddress.update(
                { ownername_id: ownername.id },
                { where: { id: proaddress.id }, transaction: t }
            );

            // 8. PropertyTrustDeed
            const [tdResult] = await db.sequelize.query(
                `INSERT INTO property_trust_deed (deed_id, owner_name, borrower_name, lender_name, lender_address, trustee_name, trustee_address, loan_amount, county, property_address, datetime)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                {
                    replacements: [
                        'TDMEM19322',
                        'Marcus James Ellington',
                        'Marcus James Ellington',
                        'First Tennessee Bank, N.A.',
                        '165 Madison Ave, Memphis, TN 38103',
                        'Raymond K. Doyle',
                        '100 N Main St Suite 1400, Memphis, TN 38103',
                        112000,
                        'Shelby',
                        '2247 Vollintine Avenue, Memphis, TN 38107',
                        new Date('2019-03-22')
                    ],
                    type: QueryTypes.INSERT,
                    transaction: t
                }
            );
            const tdId = tdResult;
            await db.Proaddress.update({ property_trust_deed_id: tdId }, { where: { id: proaddress.id }, transaction: t });

            // 9. Loan
            await db.Loan.create({
                borrower_name: 'Marcus James Ellington',
                lender_name: 'First Tennessee Bank, N.A.',
                lender_address: '165 Madison Ave, Memphis, TN 38103',
                loan_amount: 112000,
                total_default_amount: 0,
                arrears_amount: 0,
                foreclosure_stage: null,
                lis_pendens_date: null,
                default_status: 'Current',
                deed_id: 'TDMEM19322',
                datetime: new Date('2019-03-22'),
                OProperty_id: property.id
            }, { transaction: t });

            // 10. Tax Liens (×2)
            await db.TaxLien.bulkCreate([
                {
                    tax_year: '2023',
                    amount_owed: 2140,
                    last_tax_year_paid: '2022',
                    lien_date: new Date('2024-04-01'),
                    tax_authority: 'Shelby County Trustee',
                    status: 'Unpaid',
                    redemption_period_end: new Date('2025-04-01'),
                    property_id: property.id
                },
                {
                    tax_year: '2024',
                    amount_owed: 2280,
                    last_tax_year_paid: '2022',
                    lien_date: new Date('2025-04-01'),
                    tax_authority: 'Shelby County Trustee',
                    status: 'Unpaid',
                    redemption_period_end: new Date('2026-04-01'),
                    property_id: property.id
                }
            ], { transaction: t });

            // 11. Code Violation (×1)
            await db.Violation.create({
                complaint: 'Exterior vegetation overgrowth and peeling paint violating municipal code §14-200.4',
                issue_date: '2024-09-15',
                remediation_deadline: new Date('2025-04-30'),
                fine_amount: 800,
                compliance_status: 'Open',
                types: 'Property Maintenance, Exterior Condition',
                short_desc: 'Owner has been notified via certified mail to the New York mailing address. No response received.',
                OProperty_id: property.id
            }, { transaction: t });

            // 12. FilesUrls
            const [fuResult] = await db.sequelize.query(
                `INSERT INTO files_urls (url, contents, parsed, site_id, proaddress_id, PMotiveType)
         VALUES (?, ?, ?, ?, ?, ?)`,
                {
                    replacements: [
                        'https://shelby.tennessee.gov/property/2247-vollintine/inspection-report.pdf',
                        'Code Enforcement Inspection Report — 2247 Vollintine Avenue, Memphis TN. Violation issued: Sep 15 2024. Owner notified at 418 W 45th St Apt 12C, New York NY 10036.',
                        1,
                        siteId,
                        proaddress.id,
                        'OOS'
                    ],
                    type: QueryTypes.INSERT,
                    transaction: t
                }
            );
            const fuId = fuResult;

            // 13. Update Property with motive_type_id and files_urls
            await db.Property.update(
                { motive_type_id: motiveTypeId, PFilesUrlsId: fuId },
                { where: { id: property.id }, transaction: t }
            );

            console.log(`✅ Property 1 seeded — ID: ${property.id} | 2247 Vollintine Avenue, Memphis TN (OOS Owner: Marcus Ellington, NY)`);
        });
    }

    // ══════════════════════════════════════════════════════════════
    // PROPERTY 2 — Theodore Voss, Denver CO (OOS to London, UK)
    // ══════════════════════════════════════════════════════════════
    const p2ListingId = 'OOS-DEN-0002';
    const existP2 = await db.Proaddress.findOne({ where: { listing_id: p2ListingId } });

    if (existP2) {
        console.log(`⏭  Property 2 (${p2ListingId}) already exists, skipping.`);
    } else {
        await db.sequelize.transaction(async (t) => {

            // 1. MotiveTypes
            const [mt] = await db.sequelize.query(
                "SELECT id FROM motive_types WHERE code = 'OOS' LIMIT 1",
                { type: QueryTypes.SELECT, transaction: t }
            );
            const motiveTypeId = mt?.id;

            // 2. Site
            const [siteResult] = await db.sequelize.query(
                "INSERT INTO site (url) VALUES ('https://assessor.denvercounty.gov') ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
                { type: QueryTypes.INSERT, transaction: t }
            );
            const siteId = siteResult;

            // 3. Ownername
            const ownername = await db.Ownername.create({
                PLastName: 'Voss',
                PMiddleName: 'Heinrich',
                PFirstName: 'Theodore',
                PcompanyName: 'Voss International Holdings Ltd',
                PMotiveType: 'OOS',
                counties: 'Denver',
                html: '<p><strong>Theodore H. Voss</strong> is a German national residing in London, England. He acquired this Denver property in 2017 as part of a U.S. real estate portfolio. He manages the property through a local property manager but has struggled with cash flow due to multiple loan defaults and rising HOA fees.</p>'
            }, { transaction: t });

            // 4. Proaddress
            const proaddress = await db.Proaddress.create({
                listing_id: p2ListingId,
                PStreetNum: '1482',
                PStreetName: 'South Gilpin',
                street_name_post_type: 'Street',
                PSuiteNum: null,
                Pcity: 'Denver',
                PState: 'CO',
                Pzip: '80210',
                owner_name: 'Theodore Heinrich Voss',
                PMotiveType: 'OOS',
                counties: 'Denver',
                price: 598000,
                beds: '4',
                baths: '2.5',
                owner_mailing_address: '12 Belgrave Square, London, SW1X 8PH, United Kingdom',
                owner_current_state: 'International',
                owner_phone: null,
                proptype: 'Single Family Residential',
                square_feet: 2840,
                PYearBuilt: '1973',
                floors: 2,
                school_district: 'Denver Public Schools — South High School District',
                garage_size: 2.0,           // DOUBLE
                lot_size: '0.22 acres',
                amenities: 'Finished basement, attached 2-car garage, updated kitchen, central A/C, back patio',
                comments: 'International out of state owner. Property has been managed remotely via third-party company. Owner highly motivated to sell due to loan default. Property is currently vacant.',
                site_id: siteId,
                parsed: 'success',          // valid ENUM value
                violation_complaint: 'Unregistered rental unit, expired permits, HVAC code non-compliance',
                violation_issue_date: '2024-06-10',
                violation_types: 'Rental Registration, Mechanical, Building Code',
                violation_total: 3200,      // INTEGER
                violation_desc: 'Multiple code violations due to deferred maintenance and failure to register rental unit',
                violation_issued_by: 'Denver Community Planning and Development',
                ownername_id: ownername.id,
                PLastName: 'Voss',
                PMiddleName: 'Heinrich',
                PFirstName: 'Theodore',
                PcompayName: 'Voss International Holdings Ltd',
                deed_book_page: 'BK 2017 PG 0884',
                case_number: 'DEN-CPD-2024-0881',
                sale_date: null,
                trusteename: 'Carolyn F. Whitmore',
                trusteecompanyname: 'Rocky Mountain Foreclosure Services Inc.',
                trusteeaddress: '7600 E Eastman Ave Suite 400',
                trusteecity: 'Denver',
                trusteestate: 'CO',
                trusteezip: 80231,
                trusteephone: '7205553901',
                trusteeemail: 'cwhitmore@rmforeclosure.com',
                trusteewebsite: 'https://rmforeclosure.com',
                trusteetype: 'Corporate Trustee',
                DATE_TIMEOFEXTRACTION: new Date('2025-10-15'),
                backup_street_name: 'S Gilpin St'
            }, { transaction: t });

            // 5. Property
            const property = await db.Property.create({
                PBeds: '4',
                PBaths: '2',
                PTotSQFootage: '2840',
                PYearBuilt: '1973',
                PType: 'Single Family Residential',
                PTotAppraisedAmt: '641000',
                Pcity: 'Denver',
                Pstate: 'CO',
                Pzip: '80210',
                Pcounty: 'Denver',
                proaddress_id: proaddress.id,
                PLandBuilding: 'Residential',
                PBase: 'Yes',
                PTotLandArea: '9583',
                PTotBuildingArea: '2840',
                PLastSoldAmt: '524000',
                PLastSoldDate: new Date('2017-06-15'),
                PAppraisedBuildingAmt: '481000',
                PAppraisedLandAmt: '160000',
                PListingID: p2ListingId,
                PDateFiled: new Date('2025-10-15'),
                PComments: 'International out of state owner. Currently vacant. Active loan default. Owner motivated to sell quickly. Property needs cosmetic updates.',
                motive_type_id: motiveTypeId,
            }, { transaction: t });

            // 6. Owner
            await db.Owner.create({
                OFirstName: 'Theodore',
                OMiddleName: 'Heinrich',
                OLastName: 'Voss',
                OStreetAddr1: '12 Belgrave Square',
                OStreetAddr2: null,
                OCity: 'London',
                OState: 'International',
                OZip: 'SW1X 8PH',
                OProperty_id: property.id,
                is_out_of_state: true,
                email: 'theodore.voss@vossholdings.co.uk'
            }, { transaction: t });

            // 7. PropertyTrustDeed
            const [tdResult] = await db.sequelize.query(
                `INSERT INTO property_trust_deed (deed_id, owner_name, borrower_name, lender_name, lender_address, trustee_name, trustee_address, loan_amount, county, property_address, datetime)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                {
                    replacements: [
                        'TDDEN17615',
                        'Theodore Heinrich Voss',
                        'Theodore Heinrich Voss',
                        'Wells Fargo Bank, N.A.',
                        '1700 Lincoln St, Denver, CO 80203',
                        'Carolyn F. Whitmore',
                        '7600 E Eastman Ave Suite 400, Denver, CO 80231',
                        418000,
                        'Denver',
                        '1482 South Gilpin Street, Denver, CO 80210',
                        new Date('2017-06-15')
                    ],
                    type: QueryTypes.INSERT,
                    transaction: t
                }
            );
            const tdId = tdResult;
            await db.Proaddress.update({ property_trust_deed_id: tdId }, { where: { id: proaddress.id }, transaction: t });

            // 8. Loan (in default)
            await db.Loan.create({
                borrower_name: 'Theodore Heinrich Voss',
                lender_name: 'Wells Fargo Bank, N.A.',
                lender_address: '1700 Lincoln St, Denver, CO 80203',
                loan_amount: 418000,
                total_default_amount: 51200,
                arrears_amount: 18400,
                foreclosure_stage: 'Notice of Election and Demand',
                lis_pendens_date: new Date('2025-01-14'),
                default_status: 'Delinquent',
                deed_id: 'TDDEN17615',
                datetime: new Date('2017-06-15'),
                OProperty_id: property.id
            }, { transaction: t });

            // 9. Tax Liens (×2)
            await db.TaxLien.bulkCreate([
                {
                    tax_year: '2022',
                    amount_owed: 11200,
                    last_tax_year_paid: '2021',
                    lien_date: new Date('2023-06-01'),
                    tax_authority: 'Denver County Treasurer',
                    status: 'Unpaid',
                    redemption_period_end: new Date('2026-06-01'),
                    property_id: property.id
                },
                {
                    tax_year: '2023',
                    amount_owed: 12400,
                    last_tax_year_paid: '2021',
                    lien_date: new Date('2024-06-01'),
                    tax_authority: 'Denver County Treasurer',
                    status: 'Unpaid',
                    redemption_period_end: new Date('2027-06-01'),
                    property_id: property.id
                }
            ], { transaction: t });

            // 10. Code Violations (×3)
            await db.Violation.bulkCreate([
                {
                    complaint: 'Rental unit not registered with Denver Excise & Licenses as required by DRMC §32-5',
                    issue_date: '2024-06-10',
                    remediation_deadline: new Date('2025-09-30'),
                    fine_amount: 1500,
                    compliance_status: 'Open',
                    types: 'Rental Registration',
                    short_desc: 'Owner failed to renew rental license since 2023.',
                    OProperty_id: property.id
                },
                {
                    complaint: 'HVAC system non-compliant with current mechanical code. System installed pre-2008.',
                    issue_date: '2024-07-22',
                    remediation_deadline: new Date('2025-12-31'),
                    fine_amount: 1000,
                    compliance_status: 'Pending',
                    types: 'Mechanical',
                    short_desc: 'Inspector noted deteriorating HVAC ductwork and no CO2 detector.',
                    OProperty_id: property.id
                },
                {
                    complaint: 'Unpermitted deck extension in rear yard constructed without building permit',
                    issue_date: '2024-08-05',
                    remediation_deadline: new Date('2025-06-01'),
                    fine_amount: 700,
                    compliance_status: 'Open',
                    types: 'Building Permit',
                    short_desc: 'Deck added 2022. No permit on file. Structural review required.',
                    OProperty_id: property.id
                }
            ], { transaction: t });

            // 11. FilesUrls (×2)
            const [fuResult] = await db.sequelize.query(
                `INSERT INTO files_urls (url, contents, parsed, site_id, proaddress_id, PMotiveType)
         VALUES (?, ?, ?, ?, ?, ?)`,
                {
                    replacements: [
                        'https://assessor.denvercounty.gov/property/1482-s-gilpin/notice-of-default.pdf',
                        'Notice of Election and Demand — 1482 S Gilpin St, Denver CO 80210. Borrower: Theodore H. Voss. Lender: Wells Fargo. Default amt: $51,200. Filed: Jan 14, 2025.',
                        1,
                        siteId,
                        proaddress.id,
                        'OOS'
                    ],
                    type: QueryTypes.INSERT,
                    transaction: t
                }
            );
            const fuId = fuResult;

            await db.sequelize.query(
                `INSERT INTO files_urls (url, contents, parsed, site_id, proaddress_id, PMotiveType)
         VALUES (?, ?, ?, ?, ?, ?)`,
                {
                    replacements: [
                        'https://assessor.denvercounty.gov/property/1482-s-gilpin/violation-report.pdf',
                        'Denver CPD Violation Report — 1482 S Gilpin St. Violations: Rental Registration (Open), HVAC Non-Compliance (Pending), Unpermitted Deck (Open). Total fines: $3,200.',
                        1,
                        siteId,
                        proaddress.id,
                        'OOS'
                    ],
                    type: QueryTypes.INSERT,
                    transaction: t
                }
            );

            // 12. Update Property
            await db.Property.update(
                { motive_type_id: motiveTypeId, PFilesUrlsId: fuId },
                { where: { id: property.id }, transaction: t }
            );

            console.log(`✅ Property 2 seeded — ID: ${property.id} | 1482 South Gilpin Street, Denver CO (OOS Owner: Theodore Voss, London UK)`);
        });
    }

    console.log('\n🎉 OOS seeding complete!');
    console.log('---');
    console.log('Next: Visit http://localhost:3000/search and open each OOS property to verify the Out of State Owner section.');
    await db.sequelize.close();
}

seedOOS().catch((err) => {
    console.error('❌ Seeding failed:', err.message);
    require('fs').writeFileSync('seed_error.json', JSON.stringify({ message: err.message, stack: err.stack }));
    process.exit(1);
});
