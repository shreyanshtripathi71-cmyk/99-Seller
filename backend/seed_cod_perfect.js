require('dotenv').config();
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
        console.log('Starting COD Perfect Data Seeding...');

        // 1. Delete property ID 21 if it exists
        await Property.destroy({ where: { id: 21 } });
        console.log('Property ID 21 removed (if existed).');

        // 2. Get/Create Motive Type
        const [codMotive] = await MotiveTypes.findOrCreate({
            where: { code: 'COD' },
            defaults: { name: 'Code Violation' }
        });

        const today = new Date();
        const ninetyDaysAgo = new Date(today.getTime() - 90 * 86400000);
        const sixtyDaysAgo = new Date(today.getTime() - 60 * 86400000);
        const fortyFiveDaysAgo = new Date(today.getTime() - 45 * 86400000);
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);
        const inTenDays = new Date(today.getTime() + 10 * 86400000);

        // ====================================================================
        // PROPERTY 1: THE DREADFUL DWELLING (DETROIT)
        // ====================================================================

        const prop1 = await Property.create({
            PStreetAddr1: '500 ABANDONED AVE',
            Pcity: 'DETROIT',
            Pstate: 'MI',
            Pzip: '48201',
            Pcounty: 'WAYNE',
            motive_type_id: codMotive.id,
            PBeds: '5',
            PBaths: '3',
            PTotSQFootage: '3500',
            PYearBuilt: '1915',
            PType: 'Multi-Family',
            PLandBuilding: 'Res High-Density',
            PBase: 'COD',
            PTotLandArea: '0.25 AC',
            PTotBuildingArea: '4000 SF',
            PLastSoldAmt: '150000',
            PLastSoldDate: '2010-08-25',
            PTotAppraisedAmt: '275000',
            PAppraisedBuildingAmt: '200000',
            PAppraisedLandAmt: '75000',
            local_image_path: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
            PComments: 'Imminent Danger Order. Foundational instability detected in basement. Hazardous mold throughout.',
            PListingID: 'DET-COD-2026-X1'
        });

        const owner1 = await Owner.create({
            OFirstName: 'Malachi',
            OLastName: 'Grimm',
            OStreetAddr1: '666 SHADOW LANE',
            OCity: 'DETROIT',
            OState: 'MI',
            OZip: '48201',
            is_out_of_state: false,
            email: 'malachi.grimm@reapermail.com',
            OProperty_id: prop1.id
        });

        const proAdd1 = await Proaddress.create({
            property_id: prop1.id,
            owner_id: owner1.id,
            PMotiveType: 'COD',
            PStreetName: 'ABANDONED AVE',
            PStreetNum: '500',
            Pcity: 'DETROIT',
            PState: 'MI',
            Pzip: '48201',
            owner_name: 'MALACHI GRIMM',
            price: 199000.00,
            proptype: 'Multi-Family',
            beds: '5',
            baths: '3',
            square_feet: 3500,
            violation_complaint: 'Massive Structural Decay & Mold',
            violation_issue_date: thirtyDaysAgo.toISOString(),
            violation_types: 'Structure, Health, Fire',
            violation_desc: 'Critical failure of supporting beams and extensive black mold growth.',
            violation_total: 3,
            violation_issued_by: 'Detroit Buildings, Safety Engineering Dept',
            owner_phone: '3135559988',
            owner_current_state: 'Michigan',
            county_fixed: 26,
            listing_id: 'L-DET-500-A',
            floors: 3,
            school_district: 'Detroit Public Schools',
            garage_size: 2,
            lot_size: '0.25 AC',
            amenities: 'Basement, Historic Trims, Haunted Porch',
            case_number: '2026-COD-991',
            deed_book_page: 'B123/P456',
            sale_date: inTenDays.toISOString().split('T')[0],
            sale_time: '14:00:00'
        });

        await prop1.update({ proaddress_id: proAdd1.id });

        await Violation.bulkCreate([
            {
                property_id: prop1.id,
                complaint: 'Structural Beam Failure',
                issue_date: ninetyDaysAgo.toISOString(),
                types: 'Structure, Building',
                short_desc: 'Main support beam in basement is split.',
                fine_amount: 5000.00,
                remediation_deadline: sixtyDaysAgo.toISOString().split('T')[0],
                details: 'Engineering report #881 confirms that the central beam has suffered a fatal shear crack. Temporary shoring required immediately.',
                current_situation: 'Structure red-tagged. Occupants evacuated.',
                compliance_status: 'Overdue'
            },
            {
                property_id: prop1.id,
                complaint: 'Illegal Waste Dumping',
                issue_date: sixtyDaysAgo.toISOString(),
                types: 'Sanitation, Health',
                short_desc: 'Backyard used for industrial chemical disposal.',
                fine_amount: 25000.00,
                remediation_deadline: inTenDays.toISOString().split('T')[0],
                details: 'Environmental Protection Agency has cited the owner for illegal storage of toxic waste. Biohazard remediation mandatory.',
                current_situation: 'Awaiting specialized cleaners.',
                compliance_status: 'Open'
            }
        ]);

        await TaxLien.create({
            property_id: prop1.id,
            tax_year: '2022-2025',
            amount_owed: 45780.50,
            last_tax_year_paid: '2021',
            lien_date: sixtyDaysAgo.toISOString().split('T')[0],
            tax_authority: 'Wayne County Treasurer',
            status: 'Active',
            redemption_period_end: inTenDays.toISOString().split('T')[0]
        });

        await Eviction.create({
            property_id: prop1.id,
            plaintiff_name: 'Grimm RE Holdings',
            court_date: inTenDays.toISOString().split('T')[0],
            court_docket: 'DET-26-EV-902',
            details: 'Commercial eviction of unauthorized auto-body shop.',
            court_room: '302A'
        });

        await Loan.create({
            property_id: prop1.id,
            lender_name: 'Rust Belt Lending',
            borrower_name: 'Malachi Grimm',
            loan_amount: 320000,
            total_default_amount: 85000,
            foreclosure_stage: 'Final Judgement',
            default_status: 'Default'
        });

        // ====================================================================
        // PROPERTY 2: THE RUSTED RELIC (CLEVEAND)
        // ====================================================================

        const prop2 = await Property.create({
            PStreetAddr1: '789 DECAY DRIVE',
            Pcity: 'CLEVELAND',
            Pstate: 'OH',
            Pzip: '44101',
            Pcounty: 'CUYAHOGA',
            motive_type_id: codMotive.id,
            PBeds: '2',
            PBaths: '1',
            PTotSQFootage: '1100',
            PYearBuilt: '1945',
            PType: 'Single Family',
            PLandBuilding: 'Residential Small',
            PBase: 'COD',
            PTotLandArea: '0.10 AC',
            PTotBuildingArea: '1200 SF',
            PLastSoldAmt: '45000',
            PLastSoldDate: '2005-03-30',
            PTotAppraisedAmt: '89000',
            PAppraisedBuildingAmt: '60000',
            PAppraisedLandAmt: '29000',
            local_image_path: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            PComments: 'Roof collapse in garage. Unsecured structure attracting transients.',
            PListingID: 'CLE-COD-999-Z'
        });

        const owner2 = await Owner.create({
            OFirstName: 'Silas',
            OLastName: 'Stone',
            OStreetAddr1: '789 DECAY DRIVE',
            OCity: 'CLEVELAND',
            OState: 'OH',
            OZip: '44101',
            is_out_of_state: false,
            email: 'silas.stone@rustrepro.com',
            OProperty_id: prop2.id
        });

        const proAdd2 = await Proaddress.create({
            property_id: prop2.id,
            owner_id: owner2.id,
            PMotiveType: 'COD',
            PStreetName: 'DECAY DRIVE',
            PStreetNum: '789',
            Pcity: 'CLEVELAND',
            PState: 'OH',
            Pzip: '44101',
            owner_name: 'SILAS STONE',
            price: 65000.00,
            proptype: 'Single Family',
            beds: '2',
            baths: '1',
            square_feet: 1100,
            PYearBuilt: '1945',
            violation_complaint: 'Roof Collapse & Pests',
            violation_issue_date: ninetyDaysAgo.toISOString(),
            violation_types: 'Structure, Zoning',
            violation_desc: 'Rear garage roof has partially collapsed. Rat nests found in insulation.',
            violation_total: 2,
            violation_issued_by: 'Cleveland Division of Building & Housing',
            owner_phone: '2165551234',
            owner_current_state: 'Ohio',
            counties: 'CUYAHOGA',
            county_fixed: 39,
            listing_id: 'L-CLE-789-Z',
            floors: 1,
            school_district: 'Cleveland Metropolitan Schools',
            garage_size: 1,
            lot_size: '0.10 AC',
            amenities: 'Small Yard, Fenced Perimeter',
            case_number: 'CLE-2025-V-77',
            deed_book_page: 'BK-99/PG-01',
            sale_date: sixtyDaysAgo.toISOString().split('T')[0],
            sale_time: '10:00:00'
        });

        await prop2.update({ proaddress_id: proAdd2.id });

        await Violation.bulkCreate([
            {
                property_id: prop2.id,
                complaint: 'Partial Roof Collapse',
                issue_date: thirtyDaysAgo.toISOString(),
                types: 'Structure, Building',
                fine_amount: 1500.00,
                remediation_deadline: sixtyDaysAgo.toISOString().split('T')[0],
                details: 'Garage roof failed during heavy snow. Owner notified multiple times.',
                current_situation: 'Hazardous. Perimeter taped off.',
                compliance_status: 'Overdue'
            },
            {
                property_id: prop2.id,
                complaint: 'Vermin Overgrowth',
                issue_date: ninetyDaysAgo.toISOString(),
                types: 'Sanitation, Health',
                fine_amount: 750.00,
                remediation_deadline: fortyFiveDaysAgo.toISOString().split('T')[0],
                resolution_date: thirtyDaysAgo.toISOString().split('T')[0],
                details: 'Rats and mice infesting the detached garage.',
                current_situation: 'Resolved via professional exterminator.',
                compliance_status: 'Resolved'
            }
        ]);

        await Loan.create({
            property_id: prop2.id,
            lender_name: 'Midwest Equity Partners',
            borrower_name: 'Silas Stone',
            loan_amount: 35000,
            total_default_amount: 4200,
            foreclosure_stage: 'Notice of Default',
            default_status: 'Delinquent'
        });

        console.log('Seeding complete! 2 perfect COD properties generated.');

    } catch (err) {
        console.error('Seeding error:', err.message, err.stack);
    } finally {
        process.exit();
    }
}

seed();
