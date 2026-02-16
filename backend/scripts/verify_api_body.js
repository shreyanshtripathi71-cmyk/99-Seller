const http = require('http');

http.get('http://localhost:5000/api/properties/12', (res) => {
    let data = '';
    console.log('Status Code:', res.statusCode);
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Response Length:', data.length);
        console.log('Response body:', data);
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
