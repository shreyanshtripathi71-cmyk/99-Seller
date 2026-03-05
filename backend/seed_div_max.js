/**
 * seed_div_max.js
 * Seeds TWO Divorce (DIV) properties with maximum detail to exercise
 * every field in DivorceDetailView.tsx.
 * Property 1 — "The Contested Divorce" — Orlando, FL
 * Property 2 — "The High-Value Uncontested Divorce" — Dallas, TX
 */
const {
    Property, Proaddress, MotiveTypes,
    Divorce, Ownername, FilesUrls,
    Loan, PropertyTrustDeed,
    TaxLien, Violation, Eviction,
    Owner, Site
} = require('./models');

const past = (days) => new Date(Date.now() - days * 86400000);
const future = (days) => new Date(Date.now() + days * 86400000);
const fmtDate = (d) => d.toISOString().split('T')[0];

async function seed() {
    try {
        console.log('🚀  DIV Max-Detail Seeder starting...\n');

        // ── Motive Type ──
        const [divMotive] = await MotiveTypes.findOrCreate({
            where: { code: 'DIV' },
            defaults: { name: 'Divorce' }
        });
        console.log(`✅  DIV motive type ID: ${divMotive.id}`);

        // ── Shared Site ──
        const [site] = await Site.findOrCreate({
            where: { url: 'https://orange-county-courts.fl.gov' },
            defaults: { name: 'Orange County FL Court Records' }
        });

        /* ═══════════════════════════════════════════════════════════════
           PROPERTY 1 — THE CONTESTED DIVORCE
           3812 Magnolia Crest Dr, Orlando FL 32812
           Contested case; court-ordered sale; active tax lien + violation
        ═══════════════════════════════════════════════════════════════ */
        console.log('\n📦  [1/2] Checking if Property 1 already exists...');
        const existingProp1 = await Property.findOne({ where: { PListingID: 'DIV-ORL-32812-MAX' } });
        if (existingProp1) {
            console.log('⚠   Property 1 already seeded (ID:', existingProp1.id, '). Skipping.');
        } else {
            const on1 = await Ownername.create({
                PFirstName: 'RAYMOND',
                PMiddleName: 'ALAN',
                PLastName: 'CASTELLANO',
                PcompanyName: 'CASTELLANO FAMILY TRUST',
                html: '<h3>Ownership History</h3><p>RAYMOND CASTELLANO acquired this property jointly with his former spouse DIANA CASTELLANO in 2018. The property is subject to an active divorce proceeding and court-ordered sale per Case No. FL-2025-DR-004411.</p>'
            });

            const pa1 = await Proaddress.create({
                listing_id: 'DIV-ORL-32812-MAX',
                PStreetNum: '3812',
                PStreetName: 'MAGNOLIA CREST',
                street_name_post_type: 'DR',
                Pcity: 'Orlando',
                PState: 'FL',
                Pzip: '32812',
                PMotiveType: 'DIV',
                ownername_id: on1.id,
                site_id: site.id,
                owner_name: 'RAYMOND A CASTELLANO',
                price: 489000,
                proptype: 'Single Family',
                beds: '4',
                baths: '3',
                square_feet: 2650,
                PYearBuilt: '2004',
                lot_size: '0.22 AC',
                school_district: 'Orange County Public Schools',
                amenities: 'Pool, 2-Car Garage, Fenced Yard, Screened Lanai',
                comments: 'Court-ordered sale pursuant to Final Judgment of Dissolution of Marriage. Both parties required to cooperate. Excellent pool home in established neighborhood. Priced for quick court-approved sale.',
                case_number: 'FL-2025-DR-004411',
                counties: 'Orange',
                url: 'https://orange-county-courts.fl.gov/case/FL-2025-DR-004411',
                owner_phone: '4075550192',
                owner_mailing_address: '3812 Magnolia Crest Dr, Orlando, FL 32812',
                owner_current_state: 'FL',
                // Violation sub-fields
                violation_complaint: 'Overgrown vegetation and pool water stagnation',
                violation_issue_date: fmtDate(past(25)),
                violation_types: 'Health, Sanitation',
                violation_desc: 'Pool water has turned green due to lack of maintenance during divorce proceedings. Yard vegetation exceeds code limits.',
                violation_total: 1,
                violation_issued_by: 'City of Orlando Code Enforcement',
                DATE_TIMEOFEXTRACTION: new Date()
            });

            const prop1 = await Property.create({
                PStreetAddr1: '3812 MAGNOLIA CREST DR',
                Pcity: 'Orlando',
                Pstate: 'FL',
                Pzip: '32812',
                Pcounty: 'Orange',
                PBeds: '4',
                PBaths: '3',
                PType: 'Single Family',
                PBase: '35K',
                PTotSQFootage: '2650',
                PTotLandArea: '0.22 Acres',
                PTotBuildingArea: '2650 sqft',
                PYearBuilt: '2004',
                PLastSoldAmt: '385000',
                PLastSoldDate: '2018-03-15',
                PAppraisedBuildingAmt: '420000',
                PAppraisedLandAmt: '69000',
                PTotAppraisedAmt: '489000',
                PListingID: 'DIV-ORL-32812-MAX',
                PDateFiled: past(90),
                PLandBuilding: 'Residential',
                motive_type_id: divMotive.id,
                proaddress_id: pa1.id,
                local_image_path: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80',
                PComments: 'Court-ordered sale. Motivated — both parties bound by dissolution judgment. Pool needs service. Outstanding tax lien must be resolved at closing.',
            });

            await Owner.create({
                OProperty_id: prop1.id,
                OFirstName: 'RAYMOND',
                OMiddleName: 'ALAN',
                OLastName: 'CASTELLANO',
                OStreetAddr1: '3812 Magnolia Crest Dr',
                OCity: 'Orlando',
                OState: 'FL',
                OZip: '32812',
                is_out_of_state: false,
                email: 'raymond.castellano@outlook.com'
            });

            const td1 = await PropertyTrustDeed.create({
                property_id: prop1.id,
                deed_id: 'OR-TD-0034',
                owner_name: 'R & D CASTELLANO',
                borrower_name: 'RAYMOND CASTELLANO',
                lender_name: 'SUNTRUST MORTGAGE',
                lender_address: '303 Peachtree St NE, Atlanta, GA 30308',
                trustee_name: 'MERS INC',
                trustee_address: 'P.O. Box 2026, Flint, MI 48501',
                loan_amount: '308000',
                county: 'Orange',
                property_address: '3812 Magnolia Crest Dr, Orlando, FL 32812',
                datetime: '2018-03-15'
            });
            await pa1.update({ property_trust_deed_id: td1.id });

            await Loan.create({
                property_id: prop1.id,
                borrower_name: 'RAYMOND A CASTELLANO',
                lender_name: 'SUNTRUST MORTGAGE INC',
                lender_address: '303 Peachtree St NE, Atlanta, GA 30308',
                loan_amount: 308000,
                total_default_amount: 0,
                default_status: 'Current',
                foreclosure_stage: null,
                datetime: '2018-03-15',
                deed_id: 'OR-TD-2018-0034512'
            });

            await Divorce.create({
                property_id: prop1.id,
                case_number: 'FL-2025-DR-004411',
                court_name: 'Ninth Judicial Circuit Court of Florida — Orange County',
                filing_date: fmtDate(past(120)),
                legal_filing_date: fmtDate(past(118)),
                attorney_name: 'KAREN M. HOLLOWAY, ESQ. — 407-555-0177 — kholloway@holloway-family-law.com',
                divorce_type: 'Contested',
                petitioner_name: 'DIANA P CASTELLANO',
                respondent_name: 'RAYMOND A CASTELLANO',
                status: 'Active',
                settlement_date: fmtDate(future(45)),
                notes: 'Both parties have submitted competing appraisals. Court has ordered sale at the average of two appraisals ($489,000). Net proceeds to be split 55/45 per the dissolution judgment. Buyer must obtain a Release of Lien from Orange County Tax Collector at closing.'
            });

            await TaxLien.create({
                property_id: prop1.id,
                tax_year: '2024',
                amount_owed: 8920.50,
                last_tax_year_paid: '2023',
                lien_date: fmtDate(past(60)),
                tax_authority: 'Orange County Tax Collector',
                lien_number: 'OC-TL-2024-009812',
                status: 'Active',
                redemption_period_end: fmtDate(future(30)),
                notes: 'Property taxes for FY2024 unpaid due to ownership dispute during proceedings.'
            });

            await Violation.create({
                property_id: prop1.id,
                complaint: 'Unmaintained Pool & Overgrown Vegetation',
                issue_date: fmtDate(past(25)),
                types: 'Health, Sanitation',
                short_desc: 'Pool water stagnant and green. Yard vegetation exceeds 12-inch code limit.',
                fine_amount: 250.00,
                remediation_deadline: fmtDate(future(5)),
                compliance_status: 'Open',
                current_situation: 'Owner notified. No action taken. Fine accruing at $50/day.',
                details: 'Inspector observed the rear pool has not been maintained and is a potential mosquito breeding site. Front and side yard grass exceeds municipal height limit. No maintenance service has been scheduled. Ongoing financial dispute between divorcing parties has prevented property upkeep.'
            });

            await FilesUrls.create({
                property_card: 'https://cdn.example.com/div-orl-32812-property-card.pdf',
                url: 'https://cdn.example.com/div-orl-32812-dissolution-order.pdf',
                contents: '<h3>Final Judgment of Dissolution of Marriage</h3><p>Case No. FL-2025-DR-004411 — Ninth Judicial Circuit. The Court hereby orders the sale of the marital home at 3812 Magnolia Crest Dr. Net proceeds to be divided per Section 7(b) of this Judgment.</p>',
                parsed: 1,
                site_id: site.id,
                proaddress_id: pa1.id,
                ownername_id: on1.id,
                motive_type_id: divMotive.id,
                PMotiveType: 'DIV'
            });

            await prop1.update({ PFilesUrlsId: prop1.id });
            console.log('\n✅  Property 1 created! ID:', prop1.id);
        }

        /* ═══════════════════════════════════════════════════════════════
           PROPERTY 2 — THE HIGH-VALUE UNCONTESTED DIVORCE
           6204 Turtle Creek Blvd, Dallas TX 75219
           Uncontested, LLC ownership, 2 tax liens + 2 violations
        ═══════════════════════════════════════════════════════════════ */
        console.log('\n📦  [2/2] Checking if Property 2 already exists...');
        const existingProp2 = await Property.findOne({ where: { PListingID: 'DIV-DAL-75219-MAX' } });
        if (existingProp2) {
            console.log('⚠   Property 2 already seeded (ID:', existingProp2.id, '). Skipping.');
        } else {
            const [site2] = await Site.findOrCreate({
                where: { url: 'https://dallas-county-courts.tx.gov' },
                defaults: { name: 'Dallas County TX Court Records' }
            });

            const on2 = await Ownername.create({
                PFirstName: 'VICTORIA',
                PLastName: 'ASHWORTH',
                PcompanyName: 'ASHWORTH REALTY HOLDINGS LLC',
                html: '<h3>Ownership Notes</h3><p>Property is held in an LLC. Both divorcing parties are equal members of ASHWORTH REALTY HOLDINGS LLC. This is an agreed uncontested dissolution with a signed MOU.</p>'
            });

            const pa2 = await Proaddress.create({
                listing_id: 'DIV-DAL-75219-MAX',
                PStreetNum: '6204',
                PStreetName: 'TURTLE CREEK',
                street_name_post_type: 'BLVD',
                Pcity: 'Dallas',
                PState: 'TX',
                Pzip: '75219',
                PMotiveType: 'DIV',
                ownername_id: on2.id,
                site_id: site2.id,
                owner_name: 'ASHWORTH REALTY HOLDINGS LLC',
                price: 2950000,
                proptype: 'Luxury Townhome',
                beds: '5',
                baths: '5.5',
                square_feet: 5100,
                floors: 3.0,
                PYearBuilt: '2016',
                lot_size: '0.18 AC',
                school_district: 'Highland Park ISD',
                amenities: 'Private Rooftop Terrace, Chef\'s Kitchen, Wine Cellar, Smart Home, 3-Car Underground Garage, Concierge Elevator',
                comments: 'Uncontested divorce liquidation of jointly-held LLC asset. Both parties represented by high-net-worth family law counsel. Property recently purchased new HVAC and roof. Highest quality finishes throughout. LLC dissolution proceeding in parallel.',
                case_number: 'TX-2025-FAM-088243',
                deed_book_page: 'B-44120 / P-881',
                counties: 'Dallas',
                url: 'https://dallas-county-courts.tx.gov/case/TX-2025-FAM-088243',
                // Trustee fields
                trusteename: 'TITLE RESOURCES GUARANTY COMPANY',
                trusteeaddress: '8111 LBJ Freeway Suite 1200',
                trusteecity: 'Dallas',
                trusteestate: 'TX',
                trusteezip: '75251',
                trusteephone: '2145550312',
                trusteeemail: 'closings@titleresources.com',
                trusteewebsite: 'https://www.titleresources.com',
                trusteetype: 'Title Company / Escrow Agent',
                owner_phone: '2145550188',
                owner_mailing_address: '4200 Avondale Ave, Suite 300, Dallas, TX 75219',
                owner_current_state: 'TX',
                DATE_TIMEOFEXTRACTION: new Date()
            });

            const prop2 = await Property.create({
                PStreetAddr1: '6204 TURTLE CREEK BLVD',
                Pcity: 'Dallas',
                Pstate: 'TX',
                Pzip: '75219',
                Pcounty: 'Dallas',
                PBeds: '5',
                PBaths: '5',
                PType: 'Luxury Townhome',
                PBase: '2.5',
                PTotSQFootage: '5100',
                PTotLandArea: '0.18 Acres',
                PTotBuildingArea: '5100 sqft',
                PYearBuilt: '2016',
                PLastSoldAmt: '2600000',
                PLastSoldDate: '2019-08-10',
                PAppraisedBuildingAmt: '2700000',
                PAppraisedLandAmt: '250000',
                PTotAppraisedAmt: '2950000',
                PListingID: 'DIV-DAL-75219-MAX',
                PDateFiled: past(55),
                PLandBuilding: 'Residential',
                motive_type_id: divMotive.id,
                proaddress_id: pa2.id,
                local_image_path: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
                PComments: 'Uncontested — both parties cooperative. LLC holds title; selling to distribute member equity upon dissolution. LLC attorney is point of contact. Outstanding tax liens from 2022-23 to be cleared at closing.'
            });

            await Owner.create({
                OProperty_id: prop2.id,
                OFirstName: 'VICTORIA',
                OLastName: 'ASHWORTH',
                OStreetAddr1: '4200 Avondale Ave',
                OStreetAddr2: 'Suite 300',
                OCity: 'Dallas',
                OState: 'TX',
                OZip: '75219',
                is_out_of_state: false,
                email: 'v.ashworth@ashworthlegal.com'
            });

            const td2 = await PropertyTrustDeed.create({
                property_id: prop2.id,
                deed_id: 'DL-TD-0077',
                owner_name: 'ASHWORTH REALTY HOLDINGS',
                borrower_name: 'ASHWORTH REALTY LLC',
                lender_name: 'FIRST REPUBLIC BANK',
                lender_address: '111 Pine St, San Francisco, CA 94111',
                trustee_name: 'TITLE RESOURCES CO',
                trustee_address: '8111 LBJ Freeway Suite 1200, Dallas, TX 75251',
                loan_amount: '1820000',
                county: 'Dallas',
                property_address: '6204 Turtle Creek Blvd, Dallas, TX 75219',
                datetime: '2019-08-10'
            });
            await pa2.update({ property_trust_deed_id: td2.id });

            await Loan.create({
                property_id: prop2.id,
                borrower_name: 'ASHWORTH REALTY HOLDINGS LLC',
                lender_name: 'FIRST REPUBLIC BANK',
                lender_address: '111 Pine St, San Francisco, CA 94111',
                loan_amount: 1820000,
                total_default_amount: 98500,
                arrears_amount: 98500,
                default_status: 'Delinquent',
                foreclosure_stage: 'Notice of Default',
                lis_pendens_date: fmtDate(past(30)),
                datetime: '2019-08-10',
                deed_id: 'DL-TD-2019-0077403'
            });

            await Divorce.create({
                property_id: prop2.id,
                case_number: 'TX-2025-FAM-088243',
                court_name: '302nd District Court of Dallas County, Texas',
                filing_date: fmtDate(past(55)),
                legal_filing_date: fmtDate(past(55)),
                attorney_name: 'JONATHAN S. WORTH, ESQ. (Petitioner) & CLAIRE M. ASHWORTH, ESQ. (Respondent)',
                divorce_type: 'Uncontested',
                petitioner_name: 'VICTORIA ASHWORTH',
                respondent_name: 'MARCUS ASHWORTH',
                status: 'Pending',
                settlement_date: fmtDate(future(28)),
                notes: 'Both parties have signed an MOU to sell the property at list price ($2.95M) and split net proceeds equally. LLC accountant is handling asset valuation. Both attorneys have approved the sale terms. Recommend buyer submit through listing attorney for court notification.'
            });

            await TaxLien.bulkCreate([
                {
                    property_id: prop2.id,
                    tax_year: '2022',
                    amount_owed: 42180.00,
                    last_tax_year_paid: '2021',
                    lien_date: fmtDate(past(480)),
                    tax_authority: 'Dallas County Appraisal District',
                    lien_number: 'DC-TL-2022-033901',
                    status: 'Active',
                    redemption_period_end: fmtDate(past(10)),
                    notes: 'FY2022 taxes unpaid. Redemption period has expired — lien is now foreclosable.'
                },
                {
                    property_id: prop2.id,
                    tax_year: '2023',
                    amount_owed: 44650.00,
                    last_tax_year_paid: '2021',
                    lien_date: fmtDate(past(120)),
                    tax_authority: 'Dallas County Appraisal District',
                    lien_number: 'DC-TL-2023-019004',
                    status: 'Active',
                    redemption_period_end: fmtDate(future(60)),
                    notes: 'FY2023 taxes unpaid as both parties dispute who bears tax obligation during proceedings.'
                }
            ]);

            await Violation.bulkCreate([
                {
                    property_id: prop2.id,
                    complaint: 'Unsecured Construction Equipment on Premises',
                    issue_date: fmtDate(past(40)),
                    types: 'Zoning, Building Safety',
                    short_desc: 'Materials from incomplete remodel left in driveway and public sidewalk.',
                    fine_amount: 500.00,
                    remediation_deadline: fmtDate(past(10)),
                    compliance_status: 'Overdue',
                    current_situation: 'Non-compliant. Dispute between parties on who should remove materials. Fines accruing daily at $100/day.',
                    details: 'Remodeling project abandoned mid-progress when divorce proceedings started. Dumpster and construction debris remain on driveway and impede sidewalk. City has issued final warning.'
                },
                {
                    property_id: prop2.id,
                    complaint: 'Exterior Lighting Malfunction — Safety Code',
                    issue_date: fmtDate(past(18)),
                    types: 'Electrical, Safety',
                    short_desc: 'Front entrance lighting not functioning, creating a pedestrian safety hazard after dark.',
                    fine_amount: 150.00,
                    remediation_deadline: fmtDate(future(12)),
                    compliance_status: 'Open',
                    current_situation: 'Contractors notified. Electrical repair scheduled.',
                    details: 'The exterior front-entry and parking area lighting circuit failed. The city inspector flagged this as a safety issue. Owner has engaged an electrician but has not yet completed repairs.'
                }
            ]);

            await Eviction.create({
                property_id: prop2.id,
                plaintiff_name: 'ASHWORTH REALTY HOLDINGS LLC',
                court_date: fmtDate(future(21)),
                court_docket: 'CC-2025-CIVIL-04419',
                details: 'Tenant in second-floor unit has refused to vacate after receiving 60-day notice. Eviction filed by LLC management. Hearing scheduled. Buyer should be aware that unit occupancy may affect closing timeline.'
            });

            await FilesUrls.create({
                property_card: 'https://cdn.example.com/div-dal-75219-property-card.pdf',
                url: 'https://cdn.example.com/div-dal-75219-mou.pdf',
                contents: '<h3>Memorandum of Understanding — Asset Division</h3><p>Effective upon execution by both parties: Victoria Ashworth and Marcus Ashworth agree to the sale of 6204 Turtle Creek Blvd, Dallas TX. Sale proceeds after lien clearance and closing costs to be divided 50/50. Attorney fees to be deducted proportionally. Case No. TX-2025-FAM-088243.</p>',
                parsed: 1,
                site_id: site2.id,
                proaddress_id: pa2.id,
                ownername_id: on2.id,
                motive_type_id: divMotive.id,
                PMotiveType: 'DIV'
            });

            console.log('\n✅  Property 2 created! ID:', prop2.id);
        }

        console.log('\n🎉  DIV seeder complete!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌  Seeding error:', err.message);
        if (err.errors) err.errors.forEach(e => console.error('   -', e.message));
        console.error(err.stack);
        process.exit(1);
    }
}

seed();
