const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'Admin@99Sell#2026';

async function verify() {
    try {
        console.log('--- Verifying Admin Auctions API ---');

        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            captchaToken: 'SKIP_CAPTCHA'
        });

        if (!loginRes.data.success || !loginRes.data.token) {
            console.error('Login Response:', loginRes.data);
            throw new Error('Login failed');
        }

        const token = loginRes.data.token;
        console.log('Login successful. Token acquired.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Get Auctions
        console.log('Fetching auctions...');
        const getRes = await axios.get(`${API_URL}/admin/auctions`, config);
        console.log(`Fetched ${getRes.data.data.length} auctions.`);

        // 3. Create Auction
        // Need a property ID first
        console.log('Fetching properties to find a target...');
        const propsRes = await axios.get(`${API_URL}/admin/properties`, config);
        if (!propsRes.data.data || propsRes.data.data.length === 0) {
            throw new Error('No properties found to create auction for');
        }
        const propertyId = propsRes.data.data[0].id;
        console.log(`Using Property ID: ${propertyId}`);

        console.log('Creating auction...');
        const createRes = await axios.post(`${API_URL}/admin/auctions`, {
            APropertyID: propertyId,
            AAuctionDateTime: new Date(Date.now() + 86400000).toISOString(),
            AAuctionPlace: 'Test Venue',
            minimum_bid: 50000,
            AAuctionCity: 'Test City',
            AAuctionState: 'TS'
        }, config);

        if (!createRes.data.success) {
            throw new Error('Auction creation failed');
        }
        const auctionId = createRes.data.data.AAuctionID;
        console.log(`Auction created with ID: ${auctionId}`);

        // 4. Update Auction
        console.log('Updating auction...');
        const updateRes = await axios.put(`${API_URL}/admin/auctions/${auctionId}`, {
            minimum_bid: 60000,
            AAuctionPlace: 'Updated Venue'
        }, config);

        if (!updateRes.data.success) {
            throw new Error('Auction update failed');
        }
        console.log('Auction updated successfully.');

        // 5. Delete Auction
        console.log('Deleting auction...');
        const deleteRes = await axios.delete(`${API_URL}/admin/auctions/${auctionId}`, config);
        if (!deleteRes.data.success) {
            throw new Error('Auction deletion failed');
        }
        console.log('Auction deleted successfully.');

        console.log('\n--- VERIFICATION SUCCESSFUL ---');
    } catch (err) {
        console.error('--- VERIFICATION FAILED ---');
        console.error(err.message);
        if (err.response) {
            console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
        }
        process.exit(1);
    }
}

verify();
