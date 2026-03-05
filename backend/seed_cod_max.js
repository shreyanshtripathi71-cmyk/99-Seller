const {
    Property,
    Proaddress,
    Violation,
    TaxLien,
    Eviction,
    Loan,
    Owner,
    MotiveTypes,
    FilesUrls
} = require('./models');

async function seed() {
    try {
        console.log('Starting COD Max Detail Seeding...');

        // 1. Get/Create Motive Type
        const [codMotive] = await MotiveTypes.findOrCreate({
            where: { code: 'COD' },
            defaults: { name: 'Code Violation' }
        });

        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);
        const fortyFiveDaysAgo = new Date(today.getTime() - 45 * 86400000);
        const sixtyDaysAgo = new Date(today.getTime() - 60 * 86400000);
        const ninetyDaysAgo = new Date(today.getTime() - 90 * 86400000);
        const inTenDays = new Date(today.getTime() + 10 * 86400000);
        const inSixtyDays = new Date(today.getTime() + 60 * 86400000);

        // ====================================================================
        // PROPERTY 1: THE HAZARD MANOR (CHICAGO)
        // ====================================================================

        const prop1 = await Property.create({
            PStreetAddr1: '123 HAZARD LANE',
            Pcity: 'CHICAGO',
            Pstate: 'IL',
            Pzip: '60601',
            Pcounty: 'COOK',
            motive_type_id: codMotive.id,
            PBeds: '4',
            PBaths: '2',
            PTotSQFootage: '2800',
            PYearBuilt: '1920',
            PType: 'Residential',
            PLandBuilding: 'Residential',
            PBase: 'COD',
            PTotLandArea: '0.15 AC',
            PTotBuildingArea: '3200 SF',
            PLastSoldAmt: '320000',
            PLastSoldDate: '2015-05-12',
            PTotAppraisedAmt: '525000',
            local_image_path: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
            PComments: 'Critical Hazard. Porch Detached. Vermin Infestation reported by neighbors.',
            PListingID: 'CHI-COD-2024-001',
            PDateFiled: fortyFiveDaysAgo.toISOString()
        });

        const owner1 = await Owner.create({
            OFirstName: 'Roderick',
            OLastName: 'Usher',
            OStreetAddr1: '999 GLOOMY ST',
            OCity: 'BALTIMORE',
            OState: 'MD',
            OZip: '21201',
            is_out_of_state: true,
            email: 'roderick.usher@gloam.com',
            OProperty_id: prop1.id
        });

        const proAdd1 = await Proaddress.create({
            property_id: prop1.id,
            owner_id: owner1.id,
            PMotiveType: 'COD',
            PStreetName: 'HAZARD LANE',
            PStreetNum: '123',
            Pcity: 'CHICAGO',
            PState: 'IL',
            Pzip: '60601',
            owner_name: 'RODERICK USHER',
            price: 395000,
            proptype: 'Single Family',
            beds: '4',
            baths: '2',
            square_feet: 2800,
            violation_complaint: 'Vermin Infestation & Structural Decay',
            violation_issue_date: fortyFiveDaysAgo.toISOString(),
            violation_types: 'Health, Structure',
            violation_desc: 'Severe rat infestation and structural compromises in North-West wing.',
            violation_total: 2,
            violation_issued_by: 'Chicago Dept of Public Health',
            owner_phone: '3125550199',
            owner_current_state: 'Maryland',
            county_fixed: 1
        });

        await prop1.update({ proaddress_id: proAdd1.id });
        console.log('Created Property 1 with ID:', prop1.id);

        await Violation.bulkCreate([
            {
                property_id: prop1.id,
                complaint: 'Unsafe Porch Structure',
                issue_date: sixtyDaysAgo.toISOString(),
                types: 'Structure, Building',
                short_desc: 'Rear porch shows signs of collapse.',
                fine_amount: 1500.00,
                remediation_deadline: thirtyDaysAgo.toISOString().split('T')[0],
                details: 'The rear wooden porch is rotting and detached from the main structure. Immediate tear-down or repair required.',
                current_situation: 'Non-responsive. Fines accruing daily.',
                compliance_status: 'Overdue'
            },
            {
                property_id: prop1.id,
                complaint: 'Inoperable Windows',
                issue_date: ninetyDaysAgo.toISOString(),
                types: 'Fire, Safety',
                short_desc: 'All second-floor windows painted shut.',
                fine_amount: 500.00,
                remediation_deadline: inTenDays.toISOString().split('T')[0],
                details: 'Second floor bedrooms lack emergency egress due to windows being sealed. Violates Fire Code Section 4.5.1.',
                current_situation: 'Pending inspection.',
                compliance_status: 'Open'
            }
        ]);

        await TaxLien.create({
            property_id: prop1.id,
            tax_year: '2023',
            amount_owed: 12450.75,
            last_tax_year_paid: '2021', // REQUIRED
            lien_date: ninetyDaysAgo.toISOString().split('T')[0],
            tax_authority: 'Cook County Treasurer',
            status: 'Active', // REQUIRED
            redemption_period_end: inSixtyDays.toISOString().split('T')[0]
        });

        await Eviction.create({
            property_id: prop1.id,
            plaintiff_name: 'Hazard Management LLC',
            court_date: inTenDays.toISOString(),
            court_docket: '24-CH-99881',
            details: 'Commercial tenant refusal to vacate for remediation.'
        });

        await Loan.create({
            property_id: prop1.id,
            lender_name: 'Doom Bank FSB',
            borrower_name: 'Roderick Usher',
            loan_amount: 275000,
            total_default_amount: 45000,
            foreclosure_stage: 'Notice of Default',
            default_status: 'Delinquent'
        });

        // ====================================================================
        // PROPERTY 2: THE JUNK JUNGLE (MIAMI)
        // ====================================================================

        const prop2 = await Property.create({
            PStreetAddr1: '456 MESSY ROAD',
            Pcity: 'MIAMI',
            Pstate: 'FL',
            Pzip: '33101',
            Pcounty: 'MIAMI-DADE',
            motive_type_id: codMotive.id,
            PBeds: '3',
            PBaths: '2',
            PTotSQFootage: '1500',
            PYearBuilt: '1975',
            PTotAppraisedAmt: '650000',
            local_image_path: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
            PComments: 'Chronic zoning violations. Yard used for unauthorized salvage storage.',
            PListingID: 'MIA-ZON-2024-99'
        });

        const owner2 = await Owner.create({
            OFirstName: 'Oscar',
            OLastName: 'Grouch',
            OStreetAddr1: '456 MESSY ROAD',
            OCity: 'MIAMI',
            OState: 'FL',
            OZip: '33101',
            is_out_of_state: false,
            email: 'oscar.g@trashcan.com',
            OProperty_id: prop2.id
        });

        const proAdd2 = await Proaddress.create({
            property_id: prop2.id,
            owner_id: owner2.id,
            PMotiveType: 'COD',
            PStreetName: 'MESSY ROAD',
            PStreetNum: '456',
            Pcity: 'MIAMI',
            PState: 'FL',
            Pzip: '33101',
            owner_name: 'OSCAR GROUCH',
            price: 599000,
            violation_complaint: 'Unauthorized Debris Accumulation',
            violation_issue_date: thirtyDaysAgo.toISOString(),
            violation_types: 'Debris, Zoning',
            violation_desc: 'Large quantities of scrap metal and tires stored in front yard.',
            violation_total: 3,
            violation_issued_by: 'Miami-Dade Code Enforcement',
            owner_phone: '3055554321',
            county_fixed: 2,
            beds: '3',
            baths: '2',
            square_feet: 1500
        });

        await prop2.update({ proaddress_id: proAdd2.id });
        console.log('Created Property 2 with ID:', prop2.id);

        await Violation.bulkCreate([
            {
                property_id: prop2.id,
                complaint: 'Illegal Fence Height',
                issue_date: ninetyDaysAgo.toISOString(),
                types: 'Zoning, Building',
                fine_amount: 250.00,
                remediation_deadline: sixtyDaysAgo.toISOString().split('T')[0],
                resolution_date: new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0],
                compliance_status: 'Resolved',
                details: 'Front fence reached 8ft. Removed and replaced with standard 4ft fence.'
            },
            {
                property_id: prop2.id,
                complaint: 'Accumulation of Junk',
                issue_date: new Date(today.getTime() - 10 * 86400000).toISOString(),
                types: 'Debris, Sanitation',
                fine_amount: 1000.00,
                remediation_deadline: inTenDays.toISOString().split('T')[0],
                compliance_status: 'Open',
                details: 'Yard must be cleared of all metal scrap and waste products.'
            }
        ]);

        console.log('Seeding complete! COD properties generated.');

    } catch (err) {
        console.error('Seeding error:', err.message, err.stack);
        if (err.errors) {
            console.error('Validation errors:', err.errors.map(e => e.message));
        }
    } finally {
        process.exit();
    }
}

seed();
