const fetch = require('node-fetch');

async function testStats() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
        });
        const { token } = await loginRes.json();

        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await statsRes.json();

        console.log('Stats Response:', JSON.stringify(stats, null, 2));
    } catch (err) {
        console.error(err);
    }
}

testStats();
