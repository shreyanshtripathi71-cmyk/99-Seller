require('dotenv').config();
const {
    sequelize,
    Property,
    Proaddress,
    Owner,
    Ownername,
    MotiveTypes,
    Site,
    County,
    Eviction,
    Loan,
    PropertyTrustDeed,
    TaxLien,
    Violation,
    FilesUrls
} = require('./models');

const fs = require('fs');
const logFile = 'seeding_report.txt';
fs.writeFileSync(logFile, 'Seeding Log Start\n');
const log = (...args) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ');
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

// Enable logging
sequelize.options.logging = (sql) => fs.appendFileSync(logFile, sql + '\n');

async function seed() {
    const transaction = await sequelize.transaction();
    try {
        log("Starting exhaustive EVI seeding...");

        // 1. Motive Type
        const [eviMotive] = await MotiveTypes.findOrCreate({
            where: { code: 'EVI' },
            defaults: { name: 'Eviction' },
            transaction
        });

        const today = new Date();
        const ninetyDaysAgo = new Date(today.getTime() - 90 * 86400000);
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);
        const future14 = new Date(today.getTime() + 14 * 86400000);
        const future6 = new Date(today.getTime() + 6 * 86400000);

        /* ══════════════════════════════════════════
           PROPERTY 1 — Glendale, AZ
           ══════════════════════════════════════════ */

        const site1 = await Site.create({
            url: "https://www.maricopa.gov/1228/Eviction-Process",
            module: "eviction_crawler",
            owner_format: "FirstLast",
            property_format: "StreetNumName",
            last_run: ninetyDaysAgo,
            priority: 1,
            crawler_name: "maricopa_eviction"
        }, { transaction });

        const county1 = await County.findOrCreate({
            where: { index: 'MAR' },
            defaults: {
                name: "Maricopa",
                use: 1,
                address_template: "{num} {street} {type}, {city}, {state} {zip}",
                num_fields: 5
            },
            transaction
        });

        const proAdd1 = await Proaddress.create({
            PStreetNum: "4821",
            PStreetName: "West Cactus",
            street_name_post_type: "Road",
            backup_street_name: "W Cactus Rd",
            Pcity: "Glendale",
            PState: "AZ",
            Pzip: "85304",
            word: "West",
            abbreviation: "W",
            owner_name: "Robert T. Harmon",
            PMotiveType: "EVI",
            counties: "Maricopa",
            price: 385000.00,
            beds: "3",
            baths: "2",
            square_feet: 1820,
            PYearBuilt: "1998",
            floors: 1,
            proptype: "Single Family Residential",
            lot_size: "6,534 sqft",
            garage_size: 2,
            school_district: "Peoria Unified School District",
            amenities: "Central A/C, Covered Patio, Desert Landscaping, Irrigation System",
            comments: "Owner seeking to sell due to non-paying tenant. Property is in good structural condition. Tenant has not paid rent for 4 consecutive months. Owner prefers fast close.",
            owner_phone: "6025551847",
            owner_mailing_address: "9302 North 74th Avenue, Peoria, AZ 85345",
            owner_current_state: "AZ",
            case_number: "CC-2024-EV-094821",
            deed_book_page: "Book 2847 Page 192",
            sale_date: thirtyDaysAgo,
            sale_time: "10:00:00",
            court_docket: "CC2024094821",
            court_date: future14,
            eviction_owner_lawyer_name: "Sandra L. Whitmore, Esq.",
            violation_complaint: "Accumulation of debris and junk vehicles in rear yard",
            violation_issue_date: ninetyDaysAgo.toISOString().split('T')[0],
            violation_types: "Health, Debris",
            violation_total: 450,
            violation_desc: "Tenant allowed junk vehicle accumulation in rear yard in violation of Maricopa County Code Sec 18.4",
            violation_details: "Three inoperative vehicles found in rear yard. Notice issued. Owner notified. Tenant failed to remediate within 30 days.",
            violation_issued_by: "Maricopa County Code Enforcement",
            DATE_TIMEOFEXTRACTION: today,
            parsed: 1,
            PLastName: "Harmon",
            PFirstName: "Robert",
            PMiddleName: "Thomas",
            listing_id: "EVI-2024-AZ-00481",
            site_id: site1.id
        }, { transaction });

        const prop1 = await Property.create({
            proaddress_id: proAdd1.id,
            motive_type_id: eviMotive.id,
            PStreetAddr1: "4821 West Cactus Road",
            Pcity: "Glendale",
            Pstate: "AZ",
            Pzip: "85304",
            Pcounty: "Maricopa",
            PBeds: 3,
            PBaths: 2,
            PLandBuilding: "Residential",
            PType: "Single Family",
            PLastSoldAmt: 310000.00,
            PLastSoldDate: "2018-06-22",
            PTotLandArea: "6534 sqft",
            PTotBuildingArea: "1820 sqft",
            PTotSQFootage: 1820,
            PYearBuilt: 1998,
            PAppraisedLandAmt: "82000",
            PTotAppraisedAmt: "377000",
            motive_type_id: eviMotive.id,
            proaddress_id: proAdd1.id,
            PComments: "Single family home in Glendale. Owner is landlord attempting to evict non-paying tenant.",
            PDateFiled: today,
            PListingID: "EVI-2024-AZ-00481",
            PBase: "0",
            local_image_path: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800"
        }, { transaction });

        const owner1 = await Owner.create({
            OProperty_id: prop1.id,
            OFirstName: "Robert",
            OMiddleName: "Thomas",
            OLastName: "Harmon",
            OStreetAddr1: "9302 North 74th Avenue",
            OCity: "Peoria",
            OState: "AZ",
            OZip: "85345",
            is_out_of_state: false,
            email: "rharmon.properties@gmail.com"
        }, { transaction });

        const ownerName1 = await Ownername.create({
            PFirstName: "Robert",
            PMiddleName: "Thomas",
            PLastName: "Harmon",
            PcompanyName: "Harmon Property Holdings LLC",
            PMotiveType: "EVI",
            counties: "Maricopa",
            html: "<p><strong>Harmon Property Holdings LLC</strong> — Residential rental property owner in Maricopa County since 2008.</p>"
        }, { transaction });

        await proAdd1.update({ ownername_id: ownerName1.id }, { transaction });

        const td1 = await PropertyTrustDeed.create({
            property_id: String(prop1.id),
            deed_id: "D18AZ0847",
            county: "Maricopa",
            property_address: "4821 West Cactus Road, Glendale, AZ 85304",
            owner_name: "Robert Thomas Harmon",
            borrower_name: "Robert Thomas Harmon",
            lender_name: "Desert Financial CU",
            lender_address: "148 N. 48th Street, Phoenix, AZ 85034",
            trustee_name: "First American Title",
            trustee_address: "2800 N. Central Ave Suite 1400, Phoenix, AZ 85004",
            loan_amount: "248000",
            datetime: "2018-06-22"
        }, { transaction });

        await proAdd1.update({ property_trust_deed_id: td1.id }, { transaction });

        await Loan.create({
            property_id: prop1.id,
            deed_id: "D18AZ0847",
            borrower_name: "Robert Thomas Harmon",
            lender_name: "Desert Financial Credit Union",
            lender_address: "148 N. 48th Street, Phoenix, AZ 85034",
            datetime: "2018-06-22",
            loan_amount: 248000.00,
            default_status: "Current"
        }, { transaction });

        await Eviction.create({
            property_id: prop1.id,
            court_date: future14,
            court_docket: "CC2024094821",
            plaintiff_name: "Robert T. Harmon / Harmon Property Holdings LLC",
            court_desc: "Maricopa County Justice Court — Glendale Precinct",
            court_room: "Courtroom 3B",
            details: "Plaintiff filed eviction for non-payment of rent. Tenant, James D. Kowalski, has failed to pay monthly rent of $1,850 for four consecutive months totaling $7,400 in unpaid rent."
        }, { transaction });

        await Eviction.create({
            property_id: prop1.id,
            court_date: ninetyDaysAgo,
            court_docket: "CC2024071204",
            plaintiff_name: "Robert T. Harmon",
            court_desc: "Maricopa County Justice Court — Glendale Precinct",
            court_room: "Courtroom 2A",
            details: "Prior eviction attempt for lease violation — unauthorized occupants. Case was dismissed after tenant came into compliance."
        }, { transaction });

        await TaxLien.create({
            property_id: prop1.id,
            tax_year: "2023",
            amount_owed: 3284.00,
            last_tax_year_paid: "2022",
            lien_date: ninetyDaysAgo,
            tax_authority: "Maricopa County Treasurer",
            lien_number: "MRCPA-TL-2024-048821",
            status: "Active",
            redemption_period_end: new Date(today.getTime() + 400 * 86400000),
            notes: "Property tax lien filed for unpaid 2023 taxes."
        }, { transaction });

        await Violation.create({
            property_id: prop1.id,
            complaint: "Inoperative vehicles and debris accumulation in rear yard",
            issue_date: ninetyDaysAgo.toISOString().split('T')[0],
            types: "Health, Debris",
            short_desc: "Three inoperative junk vehicles in rear yard",
            fine_amount: 450.00,
            remediation_deadline: thirtyDaysAgo,
            details: "Code enforcement officer found three inoperative vehicles on 09/18/2024.",
            current_situation: "Vehicles remain on property.",
            compliance_status: "Overdue"
        }, { transaction });

        await FilesUrls.create({
            proaddress_id: proAdd1.id,
            ownername_id: ownerName1.id,
            motive_type_id: eviMotive.id,
            url: "https://www.maricopa.gov/evictions/CC2024094821",
            contents: "Eviction Case CC2024094821 — Harmon v. Kowalski — Glendale Precinct Maricopa County Justice Court.",
            property_card: "https://assessor.maricopa.gov/parcel/4821-w-cactus-rd-glendale",
            parsed: 1,
            PMotiveType: "EVI"
        }, { transaction });

        /* ══════════════════════════════════════════
           PROPERTY 2 — Chicago, IL
           ══════════════════════════════════════════ */

        const site2 = await Site.create({
            url: "https://www.cookcountyil.gov/service/eviction-court",
            module: "cook_eviction_crawler",
            owner_format: "CompanyLast",
            property_format: "StreetNumName",
            last_run: thirtyDaysAgo,
            priority: 2,
            crawler_name: "cook_county_eviction"
        }, { transaction });

        const county2 = await County.findOrCreate({
            where: { index: 'COO' },
            defaults: {
                name: "Cook",
                use: 1,
                address_template: "{num} {street} {type}, {city}, {state} {zip}",
                num_fields: 5
            },
            transaction
        });

        const proAdd2 = await Proaddress.create({
            PStreetNum: "1147",
            PStreetName: "West 35th",
            street_name_post_type: "Street",
            PSuiteNum: "Suite 200",
            backup_street_name: "W 35th St",
            Pcity: "Chicago",
            PState: "IL",
            Pzip: "60609",
            word: "West",
            abbreviation: "W",
            owner_name: "Meridian Commercial Partners LLC",
            PMotiveType: "EVI",
            counties: "Cook",
            price: 875000.00,
            beds: "0",
            baths: "2",
            square_feet: 4200,
            PYearBuilt: "1962",
            floors: 2,
            proptype: "Commercial — Mixed Use",
            lot_size: "8,712 sqft",
            garage_size: 8,
            school_district: "Chicago Public Schools District 299",
            amenities: "Loading dock, freight elevator, sprinkler system, 3-phase electrical, HVAC 2019",
            comments: "Two-story mixed-use commercial building. Ground floor occupied by restaurant tenant who has ceased paying rent.",
            owner_phone: "3125558833",
            owner_mailing_address: "88 SE 5th Avenue, Suite 1400, Boca Raton, FL 33432",
            owner_current_state: "FL",
            case_number: "2024-M1-721904",
            deed_book_page: "Book 74821 Page 0044",
            sale_date: future6,
            sale_time: "09:00:00",
            court_docket: "2024M1721904",
            court_date: future6,
            eviction_owner_lawyer_name: "Brian K. Goldstein, Esq. — Goldstein & Reeves LLP, Chicago IL",
            violation_complaint: "Grease trap overflow, structural damage, rodent infestation",
            violation_issue_date: ninetyDaysAgo.toISOString().split('T')[0],
            violation_types: "Health, Building, Sanitation",
            violation_total: 12500,
            violation_desc: "Multiple violations cited by Chicago BACP and CDPH",
            violation_issued_by: "City of Chicago — BACP and CDPH",
            DATE_TIMEOFEXTRACTION: today,
            parsed: 1,
            PcompayName: "Meridian Commercial Partners LLC",
            listing_id: "EVI-2024-IL-01147",
            site_id: site2.id,
            trusteename: "Midwest Trust Services Inc",
            trusteecompanyname: "Midwest Trust Services Inc",
            trusteeaddress: "233 South Wacker Drive Suite 8400",
            trusteecity: "Chicago",
            trusteestate: "IL",
            trusteezip: "60606",
            trusteephone: "3125550092",
            trusteeemail: "servicing@midwesttrust.com",
            trusteewebsite: "https://www.midwesttrustservices.com",
            trusteetype: "Corporate Trustee"
        }, { transaction });

        const prop2 = await Property.create({
            proaddress_id: proAdd2.id,
            motive_type_id: eviMotive.id,
            PStreetAddr1: "1147 West 35th Street",
            PStreetAddr2: "Suite 200",
            Pcity: "Chicago",
            Pstate: "IL",
            Pzip: "60609",
            Pcounty: "Cook",
            PBeds: "0",
            PBaths: "2",
            PLandBuilding: "Commercial",
            PType: "Mixed Use Commercial",
            PLastSoldAmt: "640000",
            PLastSoldDate: "2016-03-08",
            PTotLandArea: "8712 sqft",
            PTotBuildingArea: "4200 sqft",
            PTotSQFootage: "4200",
            PYearBuilt: "1962",
            PTotAppraisedAmt: "875000",
            PAppraisedBuildingAmt: "680000",
            PAppraisedLandAmt: "195000",
            PBase: "0",
            PComments: "Two-story commercial building in Bridgeport neighborhood Chicago. Ground floor commercial tenant in eviction.",
            PDateFiled: today,
            PListingID: "EVI-2024-IL-01147",
            local_image_path: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
        }, { transaction });

        const owner2 = await Owner.create({
            OProperty_id: prop2.id,
            OStreetAddr1: "88 SE 5th Avenue Suite 1400",
            OCity: "Boca Raton",
            OState: "FL",
            OZip: "33432",
            is_out_of_state: true,
            email: "acquisitions@meridiancp.com"
        }, { transaction });

        const ownerName2 = await Ownername.create({
            PLastName: "Meridian",
            PcompanyName: "Meridian Commercial Partners LLC",
            PMotiveType: "EVI",
            counties: "Cook",
            html: "<p><strong>Meridian Commercial Partners LLC</strong> is a Florida-based commercial real estate holding company.</p>"
        }, { transaction });

        await proAdd2.update({ ownername_id: ownerName2.id }, { transaction });

        const td2 = await PropertyTrustDeed.create({
            property_id: String(prop2.id),
            deed_id: "D16CK4821",
            county: "Cook",
            property_address: "1147 West 35th Street, Chicago, IL 60609",
            owner_name: "Meridian Commercial Partners",
            borrower_name: "Meridian Commercial Partners",
            lender_name: "Inland Western Lending",
            lender_address: "2901 Butterfield Road, Oak Brook, IL 60523",
            trustee_name: "Midwest Trust Services",
            trustee_address: "233 South Wacker Dr Suite 8400, Chicago, IL 60606",
            loan_amount: "512000",
            datetime: "2016-03-08"
        }, { transaction });

        await proAdd2.update({ property_trust_deed_id: td2.id }, { transaction });

        await Loan.create({
            property_id: prop2.id,
            deed_id: "D16CK4821",
            borrower_name: "Meridian Commercial Partners LLC",
            lender_name: "Inland Western Commercial Lending",
            lender_address: "2901 Butterfield Road, Oak Brook, IL 60523",
            datetime: "2016-03-08",
            loan_amount: 512000.00,
            total_default_amount: 538400.00,
            foreclosure_stage: "Notice of Default",
            lis_pendens_date: thirtyDaysAgo,
            arrears_amount: 26400.00,
            default_status: "Delinquent"
        }, { transaction });

        await Eviction.create({
            property_id: prop2.id,
            court_date: future6,
            court_docket: "2024M1721904",
            plaintiff_name: "Meridian Commercial Partners LLC",
            court_desc: "Circuit Court of Cook County — First Municipal District",
            court_room: "Courtroom 1302",
            details: "Eviction filed for non-payment of commercial lease. Tenant, Fuego Cantina Inc, has failed to pay monthly rent of $8,200 for six months."
        }, { transaction });

        await Eviction.create({
            property_id: prop2.id,
            court_date: thirtyDaysAgo,
            court_docket: "2024M1741882",
            plaintiff_name: "Meridian Commercial Partners LLC",
            court_desc: "Circuit Court of Cook County — First Municipal District",
            court_room: "Courtroom 810",
            details: "Emergency motion for injunctive relief to prevent tenant from operating commercial kitchen."
        }, { transaction });

        await TaxLien.create({
            property_id: prop2.id,
            tax_year: "2022",
            amount_owed: 18420.00,
            last_tax_year_paid: "2021",
            lien_date: ninetyDaysAgo,
            tax_authority: "Cook County Treasurer",
            lien_number: "COOK-TL-2023-118204",
            status: "Active",
            sale_date: new Date(today.getTime() + 300 * 86400000),
            redemption_period_end: new Date(today.getTime() + 600 * 86400000)
        }, { transaction });

        await Violation.create({
            property_id: prop2.id,
            complaint: "Grease trap overflow contaminating stormwater drain",
            issue_date: ninetyDaysAgo.toISOString().split('T')[0],
            types: "Health, Sanitation",
            short_desc: "Grease trap overflow",
            fine_amount: 5000.00,
            remediation_deadline: thirtyDaysAgo,
            compliance_status: "Overdue"
        }, { transaction });

        await FilesUrls.create({
            proaddress_id: proAdd2.id,
            ownername_id: ownerName2.id,
            motive_type_id: eviMotive.id,
            url: "https://www.cookcountycourt.org/case/2024M1721904",
            contents: "Cook County Eviction Case 2024-M1-721904 — Meridian Commercial Partners LLC v. Fuego Cantina Inc.",
            property_card: "https://www.cookcountyassessor.com/pin/17-29-406-007-0000",
            parsed: 1,
            PMotiveType: "EVI"
        }, { transaction });

        await transaction.commit();
        console.log("Seeding complete!");
        console.log(`Seeded Property 1 ID: ${prop1.id} — 4821 West Cactus Road, Glendale AZ`);
        console.log(`Seeded Property 2 ID: ${prop2.id} — 1147 West 35th Street, Chicago IL`);

    } catch (error) {
        await transaction.rollback();
        log("Seeding error:", error);
    } finally {
        process.exit();
    }
}

seed();
