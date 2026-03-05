require('dotenv').config();
const { Property, MotiveTypes } = require('./models');

async function debug() {
    try {
        const codMotive = await MotiveTypes.findOne({ where: { code: 'COD' } });
        console.log('Motive ID:', codMotive ? codMotive.id : 'NOT FOUND');

        await Property.create({
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
            PLandBuilding: 'Residential High-Density',
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
        console.log('Success!');
    } catch (err) {
        console.error('ERROR_MESSAGE:', err.message);
        if (err.errors) {
            err.errors.forEach(e => console.error('VALIDATION_ERROR:', e.message, e.path));
        }
    } finally {
        process.exit();
    }
}

debug();
