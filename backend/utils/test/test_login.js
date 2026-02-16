const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing Login...');
        const response = await axios.post('http://localhost:5000/api/login', {
            email: 'admin@test.com',
            password: 'Admin@99Sell#2026'
        });
        console.log('Login Success!');
        console.log('Token:', response.data.token);
    } catch (error) {
        console.error('Login Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
