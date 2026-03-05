const { Property, Proaddress, Loan, Owner, PropertyTrustDeed, Trustee, MotiveTypes } = require('./models');

async function seedPreforeclosure() {
    try {
        console.log('Starting Preforeclosure seeding...');

        // Cleanup existing demo properties for idempotency
        await Property.destroy({ where: { PStreetAddr1: ['123 Risk Road', '456 Safety Lane'] } });
        console.log('Cleaned up previous demo records.');

        // 1. Ensure PRE motive exists (though we already checked, let's be safe)
        const [motive] = await MotiveTypes.findOrCreate({
            where: { code: 'PRE' },
            defaults: { name: 'Pre-foreclosure' }
        });
        const motiveId = motive.id;

        // --- PROPERTY 1: COMPLEX CASE (Out of State, Source A Trustee) ---
        console.log('Creating Property 1 (Complex)...');

        const trusteeA = await Trustee.create({
            TTrusteeName: 'Fallback Trustee (Should not show)',
            TTrusteePhone: '000-000-0000'
        });

        const trustDeed1 = await PropertyTrustDeed.create({
            deed_id: 'TD-99001',
            borrower_name: 'John D. Default',
            lender_name: 'Big Bank National',
            lender_address: '400 Corporate Way, NY 10001',
            trustee_name: 'Legal Services LLC',
            trustee_address: '123 Law Lane, NYC',
            loan_amount: 450000.00,
            county: 'Los Angeles',
            property_address: '123 Risk Road, Los Angeles, CA 90210',
            datetime: '2023-01-15'
        });

        const proaddr1 = await Proaddress.create({
            PStreetNum: '123',
            PStreetName: 'Risk',
            street_name_post_type: 'Road',
            Pcity: 'Los Angeles',
            PState: 'CA',
            Pzip: '90210',
            owner_name: 'John D. Default',
            PMotiveType: 'PRE',
            price: 599000.00,
            beds: '3',
            baths: '2',
            square_feet: 1850,
            lot_size: '0.25',
            trusteename: 'Sarah Solicitor',
            trusteecompanyname: 'Solicitor & Co',
            trusteeaddress: '789 Justice St',
            trusteecity: 'Los Angeles',
            trusteestate: 'CA',
            trusteezip: '90001',
            trusteephone: '213-555-0199',
            trusteeemail: 'sarah@solicitor.com',
            trusteewebsite: 'www.solicitor.com',
            trusteetype: 'Private Trustee',
            property_trust_deed_id: trustDeed1.id,
            owner_phone: '213-555-0100',
            PcompayName: 'Risk Management LLC'
        });

        const prop1 = await Property.create({
            PStreetAddr1: '123 Risk Road',
            Pcity: 'Los Angeles',
            Pstate: 'CA',
            Pzip: '90210',
            Pcounty: 'Los Angeles',
            PBeds: '3',
            PBaths: '2',
            PTotSQFootage: '1850',
            PYearBuilt: '1995',
            PLastSoldAmt: '350000',
            PLastSoldDate: '2015-06-10',
            PTotAppraisedAmt: '575000',
            PAppraisedBuildingAmt: '400000',
            PAppraisedLandAmt: '175000',
            motive_type_id: motiveId,
            proaddress_id: proaddr1.id,
            PDateFiled: '2024-02-01',
            local_image_path: 'preforeclosure_1.jpg'
        });

        await Loan.create({
            property_id: prop1.id,
            borrower_name: 'John D. Default',
            lender_name: 'Big Bank National',
            lender_address: '400 Corporate Way, NY 10001',
            loan_amount: 450000.00,
            total_default_amount: 28500.00,
            arrears_amount: 15200.00,
            foreclosure_stage: 'Notice of Default',
            default_status: 'Delinquent',
            lis_pendens_date: '2024-02-15',
            datetime: '2023-01-10'
        });

        await Owner.create({
            OProperty_id: prop1.id,
            OFirstName: 'John',
            OMiddleName: 'Davis',
            OLastName: 'Default',
            OStreetAddr1: '999 Remote Blvd',
            OCity: 'Portland',
            OState: 'OR',
            OZip: '97201',
            is_out_of_state: true,
            email: 'john.default@remote.com'
        });

        // --- PROPERTY 2: MINIMAL CASE (Owner Occupied, Source B Trustee Fallback) ---
        console.log('Creating Property 2 (Minimal)...');

        const trusteeB = await Trustee.create({
            TTrusteeName: 'Fallback Legal Group',
            TTrusteeAddress: '500 Main St',
            TTRUSTEECity: 'Chicago',
            TTRUSTEEState: 'IL',
            TTRUSTEEZip: '60601',
            TTrusteePhone: '312-555-9988',
            TTrusteeEmail: 'help@fallbacklegal.com',
            TTrusteeWebSite: 'www.fallbacklegal.com',
            type: 'Public Trustee'
        });

        const proaddr2 = await Proaddress.create({
            PStreetNum: '456',
            PStreetName: 'Safety',
            streetnameposttype: 'Lane',
            Pcity: 'Chicago',
            PState: 'IL',
            Pzip: '60605',
            owner_name: 'Mary Minimalist',
            PMotiveType: 'PRE',
            price: 320000.00,
            beds: '2',
            baths: '1.5',
            square_feet: 1200,
            trusteetype: 'Institutional'
            // No trustee details in proaddress - should fall back to Trustee table
        });

        const prop2 = await Property.create({
            PStreetAddr1: '456 Safety Lane',
            Pcity: 'Chicago',
            Pstate: 'IL',
            Pzip: '60605',
            Pcounty: 'Cook',
            PBeds: '2',
            PBaths: '1.5',
            PTotSQFootage: '1200',
            PYearBuilt: '1970',
            motive_type_id: motiveId,
            proaddress_id: proaddr2.id,
            PDateFiled: '2024-02-20'
        });

        await Loan.create({
            property_id: prop2.id,
            borrower_name: 'Mary Minimalist',
            lender_name: 'Small Town Credit Union',
            loan_amount: 180000.00,
            total_default_amount: 5400.00,
            lis_pendens_date: '2024-02-25'
        });

        // Owner at same address
        await Owner.create({
            OProperty_id: prop2.id,
            OFirstName: 'Mary',
            OLastName: 'Minimalist',
            OStreetAddr1: '456 Safety Lane',
            OCity: 'Chicago',
            OState: 'IL',
            OZip: '60605',
            is_out_of_state: false,
            email: 'mary.minimal@example.com'
        });

        console.log('Preforeclosure seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding Preforeclosure data:', error);
        process.exit(1);
    }
}

seedPreforeclosure();
