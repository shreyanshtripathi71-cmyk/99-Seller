const http = require('http');

const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    console.error('JSON Parse Error:', data);
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const runTest = async () => {
    try {
        console.log('1. Logging in...');
        const loginRes = await request('POST', '/login', {
            email: 'admin@test.com',
            password: 'password123'
        });

        if (loginRes.statusCode !== 200) {
            throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
        }

        const token = loginRes.data.token;
        console.log('   Login successful.');

        // 2. Save Property ID 1
        console.log('\n2. Saving Property ID 1...');
        const saveRes = await request('POST', '/saved-properties', { propertyId: 1 }, token);
        console.log('   Save Status:', saveRes.statusCode);
        console.log('   Save Response:', JSON.stringify(saveRes.data));

        // 3. Get Saved Properties
        console.log('\n3. Fetching Saved Properties...');
        const listRes = await request('GET', '/saved-properties', null, token);
        console.log('   List Status:', listRes.statusCode);
        if (listRes.data.success) {
            console.log('   Saved Count:', listRes.data.data.length);
        } else {
            console.log('   List Failed:', listRes.data);
        }

        // 4. Remove Saved Property ID 1
        console.log('\n4. Removing Saved Property ID 1...');
        const removeRes = await request('DELETE', '/saved-properties/1', null, token);
        console.log('   Remove Status:', removeRes.statusCode);

        console.log('\nTest Completed.');

    } catch (err) {
        console.error('Test Error:', err.message);
    }
};

runTest();
