/**
 * seed_probate_max.js
 * Seeds TWO Probate (PRO) properties with maximum detail to exercise
 * every field in ProbateDetailView.tsx — one Testate, one Intestate.
 */
const {
    Property, Proaddress, MotiveTypes,
    Probate, Ownername, FilesUrls,
    Loan, PropertyTrustDeed,
    TaxLien, Violation, Eviction,
    Owner, Site
} = require('./models');

const past = (days) => new Date(Date.now() - days * 86400000);
const future = (days) => new Date(Date.now() + days * 86400000);

async function seed() {
    try {
        console.log('🚀  PRO Max-Detail Seeder starting...\n');

        const proMotive = await MotiveTypes.findOne({ where: { code: 'PRO' } });
        if (!proMotive) {
            console.error('❌  PRO motive type not found. Run motive-type seeder first.');
            process.exit(1);
        }

        // Create a test site for source links
        const [site] = await Site.findOrCreate({
            where: { url: 'https://probate-registry.example.gov' },
            defaults: { name: 'Official Probate Registry' }
        });

        /* ═══════════════════════════════════════════════════
           PROPERTY 1 — TESTATE (With Will)
           Estate of ALOYSIUS Q. VANDERBILT
        ═══════════════════════════════════════════════════ */
        console.log('📦  [1/2] Creating Ownername & Proaddress...');
        const on1 = await Ownername.create({
            PFirstName: 'ALOYSIUS',
            PMiddleName: 'QUINTON',
            PLastName: 'VANDERBILT',
            PcompanyName: 'VANDERBILT FAMILY TRUST',
            html: '<h3>Estate History</h3><p>The Vanderbilt estate has been under management since 2024. All claims must be filed with the executor by July 2026.</p>'
        });

        const pa1 = await Proaddress.create({
            listing_id: 'PRO-NY-10021-MAX',
            PStreetNum: '1040',
            PStreetName: 'FIFTH',
            street_name_post_type: 'AVE',
            Pcity: 'New York',
            PState: 'NY',
            Pzip: '10021',
            PMotiveType: 'PRO',
            ownername_id: on1.id,
            site_id: site.id,
            owner_name: 'ALOYSIUS Q VANDERBILT',
            price: 12500000.00,
            proptype: 'Luxury Penthouse',
            beds: '5',
            baths: '6',
            square_feet: 8500,
            floors: 2.0,
            PYearBuilt: '1925',
            lot_size: 'N/A (Co-op)',
            school_district: 'Manhattan District 2',
            amenities: 'Central Park Views, Wine Cellar, Staff Quarters, Private Elevator',
            comments: 'Magnificent park-facing penthouse. Estate sale strictly subject to court approval. Executor is highly motivated to settle multiple claims.',
            case_number: 'N-2024-PR-8822',
            deed_book_page: 'M-1120 / P-449',
            counties: 'New York',
            url: 'https://listing-source.com/pro-ny-10021',
            owner_phone: '2125550099',
            owner_mailing_address: '1040 Fifth Ave, New York, NY 10021',
            owner_current_state: 'NY',
            DATE_TIMEOFEXTRACTION: new Date()
        });

        console.log('📦  [1/2] Creating Property...');
        const prop1 = await Property.create({
            PStreetAddr1: '1040 FIFTH AVE',
            Pcity: 'New York',
            Pstate: 'NY',
            Pzip: '10021',
            Pcounty: 'New York',
            PBeds: '5',
            PBaths: '6',
            PType: 'Multi-Family (Penthouse)',
            PBase: '10M',
            PTotSQFootage: '8500',
            PTotLandArea: '0.2 Acres',
            PTotBuildingArea: '8500 sqft',
            PYearBuilt: '1925',
            PLastSoldAmt: '9800000',
            PLastSoldDate: '2012-04-12',
            PAppraisedBuildingAmt: '11000000',
            PAppraisedLandAmt: '1500000',
            PTotAppraisedAmt: '12500000',
            PListingID: 'PRO-NY-10021-MAX',
            PDateFiled: past(60),
            motive_type_id: proMotive.id,
            proaddress_id: pa1.id,
            local_image_path: 'prop_probate_1.jpg'
        });

        console.log('📦  [1/2] Creating Probate Case...');
        await Probate.create({
            property_id: prop1.id,
            case_number: 'N-2024-PR-8822',
            probate_court: 'New York Surrogate\'s Court',
            probate_court_county: 'New York',
            filing_date: past(180),
            date_of_death: past(210),
            estate_type: 'Testate (With Will)',
            executor_name: 'LAWRENCE STERNE, ESQ.',
            executor_contact: 'lsterne@sterne-legal.com',
            estate_value: 25000000.00,
            status: 'Open',
            notes: 'Multiple legatees. Property to be sold to liquidate assets for distribution. Co-executor approval required.'
        });

        console.log('📦  [1/2] Creating FilesUrls...');
        await FilesUrls.create({
            property_card: 'https://cdn.example.com/property_card_10021.pdf',
            url: 'https://cdn.example.com/will_extract_8822.pdf',
            contents: '<h3>Estate Inventory</h3><ul><li>Real Estate: $12.5M</li><li>Art Collection: $5M</li><li>Securities: $7.5M</li></ul>',
            parsed: 1,
            site_id: site.id,
            proaddress_id: pa1.id,
            ownername_id: on1.id,
            motive_type_id: proMotive.id,
            PMotiveType: 'PRO'
        });

        console.log('📦  [1/2] Creating Tax Lien...');
        await TaxLien.create({
            property_id: prop1.id,
            tax_year: '2024',
            amount_owed: 125400.00,
            last_tax_year_paid: '2023',
            lien_date: past(30),
            tax_authority: 'NYC Dept of Finance',
            lien_number: 'NY-TL-2024-001',
            status: 'Active',
            redemption_period_end: future(15),
            notes: 'Unpaid mansion tax and real estate assessments for FY2024.'
        });

        console.log('📦  [1/2] Creating Loan record...');
        await Loan.create({
            property_id: prop1.id,
            borrower_name: 'ALOYSIUS VANDERBILT',
            lender_name: 'CHASE PRIVATE BANK',
            loan_amount: '4000000',
            total_default_amount: '0',
            datetime: '2012-04-12',
            default_status: 'Current'
        });

        console.log('\n✅  Property 1 created! ID:', prop1.id);

        /* ═══════════════════════════════════════════════════
           PROPERTY 2 — INTESTATE (No Will), Out of State
           Estate of MARTHA J. HIGGINS
        ═══════════════════════════════════════════════════ */
        console.log('\n📦  [2/2] Creating Proaddress (Out of State)...');
        const pa2 = await Proaddress.create({
            listing_id: 'PRO-MIA-33139-MAX',
            PStreetNum: '442',
            PStreetName: 'OCEAN',
            street_name_post_type: 'DR',
            Pcity: 'Miami Beach',
            PState: 'FL',
            Pzip: '33139',
            PMotiveType: 'PRO',
            owner_name: 'MARTHA JANE HIGGINS',
            price: 850000.00,
            proptype: 'Condominium',
            beds: '2',
            baths: '2',
            square_feet: 1450,
            PYearBuilt: '1988',
            lot_size: 'Condo Interest',
            school_district: 'Miami-Dade Public Schools',
            comments: 'Seasonal resident deceased. No known heirs locally. Estate being handled by public administrator.',
            case_number: 'M-2025-CP-0091',
            counties: 'Miami-Dade',
            owner_phone: '3055551212',
            owner_mailing_address: '8841 N Wacker Dr, Chicago, IL 60601', // Out of state!
            owner_current_state: 'IL',
            DATE_TIMEOFEXTRACTION: past(1)
        });

        console.log('📦  [2/2] Creating Property...');
        const prop2 = await Property.create({
            PStreetAddr1: '442 OCEAN DR',
            PStreetAddr2: 'UNIT 804',
            Pcity: 'Miami Beach',
            Pstate: 'FL',
            Pzip: '33139',
            Pcounty: 'Miami-Dade',
            PBeds: '2',
            PBaths: '2',
            PTotSQFootage: '1450',
            PYearBuilt: '1988',
            PTotAppraisedAmt: '825000',
            motive_type_id: proMotive.id,
            proaddress_id: pa2.id
        });

        console.log('📦  [2/2] Creating Probate Case (Intestate)...');
        await Probate.create({
            property_id: prop2.id,
            case_number: 'M-2025-CP-0091',
            probate_court: '11th Judicial Circuit Court of Florida',
            probate_court_county: 'Miami-Dade',
            filing_date: past(15),
            date_of_death: past(45),
            estate_type: 'Intestate (No Will)',
            executor_name: 'STEVEN ROSS (Public Administrator)',
            executor_contact: '3055554433',
            estate_value: 950000.00,
            status: 'Pending',
            notes: 'Heir search currently underway. Property is vacant and secured.'
        });

        console.log('📦  [2/2] Creating Violation...');
        await Violation.create({
            property_id: prop2.id,
            complaint: 'V-MIA-2025-112',
            issue_date: past(10).toISOString().split('T')[0],
            types: 'Public Nuisance, Unsecured Property',
            short_desc: 'Balcony door left unsecured, posing safety risk',
            fine_amount: 500.00,
            remediation_deadline: future(30),
            compliance_status: 'Open',
            details: 'Inspector found unit balcony door slightly ajar. Building management notified. Estate has not yet appointed a maintenance service.'
        });

        console.log('📦  [2/2] Creating Eviction (Source B Fallback in Proaddress)...');
        await pa2.update({
            court_docket: 'E-2025-CC-004',
            court_date: future(20),
            eviction_owner_lawyer_name: 'ROBINSON & CO (Estate Counsel)'
        });

        console.log('📦  [2/2] Creating Owner record (Out of State)...');
        await Owner.create({
            OProperty_id: prop2.id,
            OFirstName: 'MARTHA',
            OLastName: 'HIGGINS',
            OStreetAddr1: '8841 N Wacker Dr',
            OCity: 'Chicago',
            OState: 'IL',
            OZip: '60647',
            is_out_of_state: true,
            email: 'mjhiggins@gmail.com'
        });

        console.log('\n✅  Property 2 created! ID:', prop2.id);
        console.log('\n🎉  Both PRO properties seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌  Seeding error:', err.message);
        if (err.errors) err.errors.forEach(e => console.error('   -', e.message));
        process.exit(1);
    }
}

seed();
