const axios = require('axios');
require('dotenv').config();

const API_URL = `http://127.0.0.1:${process.env.PORT || 5000}/api/properties`;

async function verify() {
    try {
        console.log(`Verifying API at ${API_URL}`);

        // Fetch last 2 properties
        const { data } = await axios.get(`${API_URL}`);
        const props = data.properties.slice(0, 5); // Get first 5 to be sure

        const vanderbilt = props.find(p => p.address?.includes('FIFTH') || p.PStreetAddr1?.includes('FIFTH'));
        const higgins = props.find(p => p.address?.includes('OCEAN') || p.PStreetAddr1?.includes('OCEAN'));

        if (vanderbilt) {
            console.log('✅ Found Vanderbilt Property in list');
            const { data: detail } = await axios.get(`${API_URL}/${vanderbilt.id}`);
            console.log('✅ Vanderbilt Full Data Fetched');
            console.log('Probates count:', detail.probates?.length);
            console.log('TaxLiens count:', detail.taxLiens?.length);
            console.log('FilesUrls count:', detail.filesUrls?.length);
        } else {
            console.log('❌ Vanderbilt NOT FOUND in list');
        }

        if (higgins) {
            console.log('✅ Found Higgins Property in list');
            const { data: detail } = await axios.get(`${API_URL}/${higgins.id}`);
            console.log('✅ Higgins Full Data Fetched');
            console.log('Owner is out of state:', detail.owners?.[0]?.is_out_of_state);
            console.log('Violations count:', detail.violations?.length);
        } else {
            console.log('❌ Higgins NOT FOUND in list');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Verification failed:', err.message);
        if (err.response) console.error('Data:', err.response.data);
        process.exit(1);
    }
}

verify();
