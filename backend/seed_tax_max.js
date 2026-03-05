/**
 * seed_tax_max.js
 * Seeds 2 Tax Lien (TAX) properties with maximum detail.
 *
 * Property 1: 3418 East 12th Street, Kansas City, MO 64127 (The Struggling Landlord)
 *   - 3 Tax Liens, 1 Violation, 1 Eviction, Loan, Trust Deed
 * 
 * Property 2: 15400 St Clair Avenue, Cleveland, OH 44110 (The Abandoned Commercial Property)
 *   - Vacant strip retail, Delaware LLC owner (OOS)
 *   - 4 Tax Liens, 3 Violations, Foreclosure Loan
 *
 * Schema constraints handled explicitly as learned from prior scripts.
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { Sequelize, QueryTypes } = require('sequelize');
const db = require('./models');

async function seedTax() {
    await db.sequelize.authenticate();
    console.log('✅ Connected to DB');

    // ══════════════════════════════════════════════════════
    // PROPERTY 1 — The Struggling Landlord, Kansas City MO
    // ══════════════════════════════════════════════════════
    const p1ListingId = 'TAX-KCM-0001';
    const existP1 = await db.Proaddress.findOne({ where: { listing_id: p1ListingId } });

    if (existP1) {
        console.log(`\u23ed  Property 1 (${p1ListingId}) already exists, skipping.`);
    } else {
        await db.sequelize.transaction(async (t) => {
            // 1. MotiveTypes — get or create TAX
            const [mt] = await db.sequelize.query(
                "SELECT id FROM motive_types WHERE code = 'TAX' LIMIT 1",
                { type: QueryTypes.SELECT, transaction: t }
            );
            let motiveTypeId = mt?.id;
            if (!motiveTypeId) {
                const [newMt] = await db.sequelize.query(
                    "INSERT INTO motive_types (code, name) VALUES ('TAX', 'Tax Lien / Default')",
                    { type: QueryTypes.INSERT, transaction: t }
                );
                motiveTypeId = newMt;
            }

            // 2. Site
            const [siteResult] = await db.sequelize.query(
                "INSERT INTO site (url) VALUES ('https://jacksoncounty.mo.gov/tax') ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)",
                { type: QueryTypes.INSERT, transaction: t }
            );
            const siteId = siteResult;

            // 3. Ownername
            const ownername = await db.Ownername.create({
                PLastName: 'Washington',
                PMiddleName: '',
                PFirstName: 'Darius',
                PcompanyName: '',
                PMotiveType: 'TAX',
                counties: 'Jackson',
                html: '<p><strong>Darius Washington</strong> is a local landlord. Property has active eviction and multiple years of unpaid taxes due to tenant disputes and loss of rental income.</p>'
            }, { transaction: t });

            // 4. Proaddress
            const proaddress = await db.Proaddress.create({
                listing_id: p1ListingId,
                PStreetNum: '3418',
                PStreetName: 'East 12th',
                street_name_post_type: 'Street',
                PSuiteNum: null,
                Pcity: 'Kansas City',
                PState: 'MO',
                Pzip: '64127',
                owner_name: 'Darius Washington',
                PMotiveType: 'TAX',
                counties: 'Jackson',
                price: 65000,
                beds: '3',
                baths: '1.5',
                owner_mailing_address: '3418 East 12th Street, Kansas City, MO 64127',
                owner_current_state: 'MO',
                owner_phone: '8165550293',
                proptype: 'Single Family Residential',
                square_feet: 1450,
                PYearBuilt: '1915',
                floors: 2,
                school_district: 'Kansas City Public Schools',
                garage_size: 0,
                lot_size: '0.11 acres',
                amenities: 'Front porch, unfinished basement',
                comments: 'Tax default property. Active eviction ongoing. Owner struggling with financial obligations.',
                site_id: siteId,
                parsed: 'success',
                violation_complaint: 'Trash accumulation in rear yard',
                violation_issue_date: '2025-01-10',
                violation_types: 'Nuisance / Sanitation',
                violation_total: 250,
                violation_desc: 'Tenant left bulk trash items in yard, city cited owner.',
                violation_issued_by: 'KCMO Neighborhood Services',
                ownername_id: ownername.id,
                PLastName: 'Washington',
                PMiddleName: '',
                PFirstName: 'Darius',
                PcompayName: '',
                deed_book_page: 'BK 2008 PG 1122',
                case_number: 'KC-TAX-25-104',
                sale_date: '2025-08-11', // Jackson County Tax Sale often in August
                trusteename: '',
                trusteecompanyname: 'Jackson County Dept of Collection',
                trusteeaddress: '415 E 12th St, Suite 100',
                trusteecity: 'Kansas City',
                trusteestate: 'MO',
                trusteezip: 64106,
                trusteephone: '8168813232',
                trusteeemail: 'collections@jacksongov.org',
                trusteewebsite: 'https://jacksongov.org',
                trusteetype: 'Government',
                DATE_TIMEOFEXTRACTION: new Date('2025-11-01'),
                backup_street_name: 'E 12th St'
            }, { transaction: t });

            // 5. Property
            const property = await db.Property.create({
                PBeds: '3',
                PBaths: '1.5',
                PTotSQFootage: '1450',
                PYearBuilt: '1915',
                PType: 'Single Family Residential',
                PTotAppraisedAmt: '72500',
                Pcity: 'Kansas City',
                Pstate: 'MO',
                Pzip: '64127',
                Pcounty: 'Jackson',
                proaddress_id: proaddress.id,
                PLandBuilding: 'Residential',
                PBase: 'Yes',
                PTotLandArea: '4791',
                PTotBuildingArea: '1450',
                PLastSoldAmt: '45000',
                PLastSoldDate: new Date('2008-04-12'),
                PAppraisedBuildingAmt: '60000',
                PAppraisedLandAmt: '12500',
                PListingID: p1ListingId,
                PDateFiled: new Date('2025-11-01'),
                PComments: 'Multiple tax liens. Needs work.',
                motive_type_id: motiveTypeId,
            }, { transaction: t });

            // 6. Owner
            const owner = await db.Owner.create({
                OFirstName: 'Darius',
                OMiddleName: '',
                OLastName: 'Washington',
                OStreetAddr1: '3418 East 12th Street',
                OStreetAddr2: '',
                OCity: 'Kansas City',
                OState: 'MO',
                OZip: '64127',
                OProperty_id: property.id,
                is_out_of_state: false,
                email: 'dw.kcmo.investments@gmail.com'
            }, { transaction: t });

            // 7. Update Proaddress.ownername_id
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
                        'TDKC081122', 'Darius Washington', 'Darius Washington', 'Central Bank of the Midwest', '1111 Main St, Kansas City, MO 64105', 'N/A', '', 36000, 'Jackson', '3418 East 12th Street, Kansas City, MO 64127', new Date('2008-04-12')
                    ], type: QueryTypes.INSERT, transaction: t
                }
            );
            await db.Proaddress.update({ property_trust_deed_id: tdResult }, { where: { id: proaddress.id }, transaction: t });

            // 9. Loan
            await db.Loan.create({
                borrower_name: 'Darius Washington', lender_name: 'Central Bank of the Midwest', lender_address: '1111 Main St, Kansas City, MO 64105',
                loan_amount: 36000, total_default_amount: 4500, arrears_amount: 1200, foreclosure_stage: 'Pre-foreclosure', lis_pendens_date: new Date('2025-05-10'),
                default_status: 'Delinquent', deed_id: 'TDKC081122', datetime: new Date('2008-04-12'), OProperty_id: property.id
            }, { transaction: t });

            // 10. Tax Liens (×3)
            await db.TaxLien.bulkCreate([
                { tax_year: '2022', amount_owed: 1850.50, last_tax_year_paid: '2021', lien_date: new Date('2023-01-01'), tax_authority: 'Jackson County Dept of Collection', status: 'Unpaid', redemption_period_end: new Date('2025-08-10'), property_id: property.id, certificate_number: '23-KCM-412', notes: 'Delinquent taxes for 2022. Eligible for August tax sale.' },
                { tax_year: '2023', amount_owed: 1920.00, last_tax_year_paid: '2021', lien_date: new Date('2024-01-01'), tax_authority: 'Jackson County Dept of Collection', status: 'Unpaid', redemption_period_end: new Date('2026-08-10'), property_id: property.id, certificate_number: '24-KCM-118' },
                { tax_year: '2024', amount_owed: 2100.25, last_tax_year_paid: '2021', lien_date: new Date('2025-01-01'), tax_authority: 'Jackson County Dept of Collection', status: 'Unpaid', redemption_period_end: new Date('2027-08-10'), property_id: property.id, certificate_number: '25-KCM-092' }
            ], { transaction: t });

            // 11. Eviction (×1)
            await db.Eviction.create({
                plaintiff_name: 'Darius Washington', court_date: new Date('2025-11-15'), court_docket: '2516-CV24412', court_room: 'Div 41', OProperty_id: property.id
            }, { transaction: t });

            // 12. Violation (×1)
            await db.Violation.create({
                complaint: 'Excessive trash / bulk items in rear yard', issue_date: '2025-01-10', remediation_deadline: new Date('2025-02-10'), fine_amount: 250, compliance_status: 'Open', types: 'Nuisance', short_desc: 'Tenant abandoned furniture in yard.', OProperty_id: property.id
            }, { transaction: t });

            // 13. FilesUrls
            const [fuResult] = await db.sequelize.query(
                "INSERT INTO files_urls (url, contents, parsed, site_id, proaddress_id, PMotiveType) VALUES (?, ?, ?, ?, ?, ?)",
                { replacements: ['https://jacksongov.org/tax/3418e12/notice.pdf', 'Tax Sale Notice — Jackson County MO. 3 Years Delinquent (2022-2024). Amount: $5870.75.', 1, siteId, proaddress.id, 'TAX'], type: QueryTypes.INSERT, transaction: t }
            );

            // 14. Update Property
            await db.Property.update({ motive_type_id: motiveTypeId, PFilesUrlsId: fuResult }, { where: { id: property.id }, transaction: t });
            console.log(`\u2705 Property 1 seeded — ID: ${property.id} | Kansas City, MO (TAX)`);
        });
    }

    // ══════════════════════════════════════════════════════
    // PROPERTY 2 — The Abandoned Commercial, Cleveland OH
    // ══════════════════════════════════════════════════════
    const p2ListingId = 'TAX-CLE-0002';
    const existP2 = await db.Proaddress.findOne({ where: { listing_id: p2ListingId } });

    if (existP2) {
        console.log(`\u23ed  Property 2 (${p2ListingId}) already exists, skipping.`);
    } else {
        await db.sequelize.transaction(async (t) => {
            const [mt] = await db.sequelize.query("SELECT id FROM motive_types WHERE code = 'TAX' LIMIT 1", { type: QueryTypes.SELECT, transaction: t });
            const motiveTypeId = mt?.id;

            const [siteResult] = await db.sequelize.query("INSERT INTO site (url) VALUES ('https://cuyahogacounty.gov/treasurer') ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)", { type: QueryTypes.INSERT, transaction: t });
            const siteId = siteResult;

            const ownername = await db.Ownername.create({
                PLastName: '', PMiddleName: '', PFirstName: '', PcompanyName: 'Midwest Retail Holding LLC', PMotiveType: 'TAX', counties: 'Cuyahoga',
                html: '<p><strong>Midwest Retail Holdings LLC</strong> is a Delaware-registered entity. Property is a vacant commercial strip on St Clair Ave, abandoned since 2020. Acquired severe tax delinquency and major code violations.</p>'
            }, { transaction: t });

            const proaddress = await db.Proaddress.create({
                listing_id: p2ListingId, PStreetNum: '15400', PStreetName: 'St Clair', street_name_post_type: 'Avenue', PSuiteNum: null, Pcity: 'Cleveland', PState: 'OH', Pzip: '44110', owner_name: 'Midwest Retail Holding LLC', PMotiveType: 'TAX', counties: 'Cuyahoga', price: 120000, beds: '0', baths: '0', owner_mailing_address: '1209 North Orange Street, Wilmington, DE 19801', owner_current_state: 'DE', owner_phone: null, proptype: 'Commercial - Retail', square_feet: 4500, PYearBuilt: '1962', floors: 1, school_district: 'Cleveland Metropolitan', garage_size: 0, lot_size: '0.45 acres', amenities: 'Paved parking lot, high traffic frontage', comments: 'Vacant commercial retail building. Out of state LLC owner. 4 years of unpaid taxes. Roof caved in. Slated for tax foreclosure or demolition.', site_id: siteId, parsed: 'success', violation_complaint: 'Structural degradation, roof collapse, unsecured entry', violation_issue_date: '2023-05-20', violation_types: 'Structural, Safety', violation_total: 12500, violation_desc: 'Building deemed unsafe. Emergency boarding performed by city.', violation_issued_by: 'Cleveland Dept of Building & Housing', ownername_id: ownername.id, PLastName: '', PMiddleName: '', PFirstName: '', PcompayName: 'Midwest Retail Holding LLC', deed_book_page: 'AFN: 201809210088', case_number: 'CV-24-998112', sale_date: '2025-11-20', trusteename: 'W. Christopher Murray II', trusteecompanyname: 'Cuyahoga County Treasurer', trusteeaddress: '2079 East 9th Street', trusteecity: 'Cleveland', trusteestate: 'OH', trusteezip: 44115, trusteephone: '2164437400', trusteeemail: 'treasurer@cuyahogacounty.us', trusteewebsite: 'https://cuyahogacounty.gov/treasurer', trusteetype: 'Government', DATE_TIMEOFEXTRACTION: new Date('2025-11-01'), backup_street_name: 'St Clair Ave'
            }, { transaction: t });

            const property = await db.Property.create({
                PBeds: '0', PBaths: '0', PTotSQFootage: '4500', PYearBuilt: '1962', PType: 'Commercial', PTotAppraisedAmt: '85000', Pcity: 'Cleveland', Pstate: 'OH', Pzip: '44110', Pcounty: 'Cuyahoga', proaddress_id: proaddress.id, PLandBuilding: 'Commercial', PBase: 'Yes', PTotLandArea: '19602', PTotBuildingArea: '4500', PLastSoldAmt: '210000', PLastSoldDate: new Date('2018-09-20'), PAppraisedBuildingAmt: '25000', PAppraisedLandAmt: '60000', PListingID: p2ListingId, PDateFiled: new Date('2025-11-01'), PComments: 'Severe distress. Commercial vacant.', motive_type_id: motiveTypeId,
            }, { transaction: t });

            await db.Owner.create({
                OFirstName: '', OMiddleName: '', OLastName: '', OStreetAddr1: '1209 North Orange Street', OStreetAddr2: '', OCity: 'Wilmington', OState: 'DE', OZip: '19801', OProperty_id: property.id, is_out_of_state: true, email: 'legal@ctcorp.com'
            }, { transaction: t });

            await db.Proaddress.update({ ownername_id: ownername.id }, { where: { id: proaddress.id }, transaction: t });

            const [tdResult] = await db.sequelize.query(
                `INSERT INTO property_trust_deed (deed_id, owner_name, borrower_name, lender_name, lender_address, trustee_name, trustee_address, loan_amount, county, property_address, datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                { replacements: ['TDCLE18090', 'Midwest Retail Holding LLC', 'Midwest Retail Holding LLC', 'Commercial Real Estate Funding Group', '200 Public Sq, Cleveland, OH', 'N/A', '', 160000, 'Cuyahoga', '15400 St Clair Avenue, Cleveland, OH 44110', new Date('2018-09-20')], type: QueryTypes.INSERT, transaction: t }
            );
            await db.Proaddress.update({ property_trust_deed_id: tdResult }, { where: { id: proaddress.id }, transaction: t });

            await db.Loan.create({
                borrower_name: 'Midwest Retail Holding LLC', lender_name: 'Commercial Real Estate Funding Group', lender_address: '200 Public Sq, Cleveland, OH', loan_amount: 160000, total_default_amount: 145000, arrears_amount: 45000, foreclosure_stage: 'Active Foreclosure', lis_pendens_date: new Date('2024-02-15'), default_status: 'Foreclosure', deed_id: 'TDCLE18090', datetime: new Date('2018-09-20'), OProperty_id: property.id
            }, { transaction: t });

            await db.TaxLien.bulkCreate([
                { tax_year: '2021', amount_owed: 5200.00, last_tax_year_paid: '2020', lien_date: new Date('2022-06-01'), tax_authority: 'Cuyahoga County Treasurer', status: 'Unpaid', redemption_period_end: new Date('2025-06-01'), property_id: property.id, certificate_number: 'TAX-21-9988' },
                { tax_year: '2022', amount_owed: 5450.00, last_tax_year_paid: '2020', lien_date: new Date('2023-06-01'), tax_authority: 'Cuyahoga County Treasurer', status: 'Unpaid', redemption_period_end: new Date('2026-06-01'), property_id: property.id, certificate_number: 'TAX-22-1102' },
                { tax_year: '2023', amount_owed: 5800.00, last_tax_year_paid: '2020', lien_date: new Date('2024-06-01'), tax_authority: 'Cuyahoga County Treasurer', status: 'Unpaid', redemption_period_end: new Date('2027-06-01'), property_id: property.id, certificate_number: 'TAX-23-4412' },
                { tax_year: '2024', amount_owed: 6100.00, last_tax_year_paid: '2020', lien_date: new Date('2025-06-01'), tax_authority: 'Cuyahoga County Treasurer', status: 'Unpaid', redemption_period_end: new Date('2028-06-01'), property_id: property.id, certificate_number: 'TAX-24-0012' }
            ], { transaction: t });

            await db.Violation.bulkCreate([
                { complaint: 'Partial Roof Collapse', issue_date: '2023-05-20', remediation_deadline: new Date('2023-06-20'), fine_amount: 5000, compliance_status: 'Open', types: 'Structural Safety', short_desc: 'Severe structural failure.', OProperty_id: property.id },
                { complaint: 'Unsecured structure / Squatters', issue_date: '2023-08-11', remediation_deadline: new Date('2023-09-11'), fine_amount: 3500, compliance_status: 'Pending', types: 'Safety', short_desc: 'City boarded up property. Billed owner.', OProperty_id: property.id },
                { complaint: 'Failure to register vacant building', issue_date: '2024-01-15', remediation_deadline: new Date('2024-02-15'), fine_amount: 4000, compliance_status: 'Open', types: 'Administrative', short_desc: 'Vacant property registry fee unpaid.', OProperty_id: property.id }
            ], { transaction: t });

            const [fuResult] = await db.sequelize.query(
                "INSERT INTO files_urls (url, contents, parsed, site_id, proaddress_id, PMotiveType) VALUES (?, ?, ?, ?, ?, ?)",
                { replacements: ['https://cuyahogacounty.gov/tax/15400stclair/demolition-notice.pdf', 'Demolition / Foreclosure Warning. 15400 St Clair Ave. Cuyahoga Land Bank slated for demo due to structural issues and extreme tax delinquency.', 1, siteId, proaddress.id, 'TAX'], type: QueryTypes.INSERT, transaction: t }
            );

            await db.Property.update({ motive_type_id: motiveTypeId, PFilesUrlsId: fuResult }, { where: { id: property.id }, transaction: t });
            console.log(`\u2705 Property 2 seeded — ID: ${property.id} | Cleveland, OH (TAX / OOS)`);
        });
    }

    console.log('\n🎉 TAX seeding complete!');
    await db.sequelize.close();
}

seedTax().catch((err) => {
    console.error('❌ Seeding failed:', err.message);
    require('fs').writeFileSync('seed_error.json', JSON.stringify({ message: err.message, stack: err.stack }));
    process.exit(1);
});
