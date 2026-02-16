const mysql = require('mysql2/promise');

async function createVercelConfig() {
    try {
        console.log('📝 Creating Vercel configuration...');
        
        const vercelConfig = {
            "version": 2,
            "builds": [
                {
                    "src": "backend/index.js",
                    "use": "@vercel/node"
                }
            ],
            "routes": [
                {
                    "src": "/api/(.*)",
                    "dest": "backend/index.js"
                }
            ],
            "functions": {
                "backend/index.js": {
                    "maxDuration": 10
                }
            },
            "env": {
                "NODE_ENV": "production"
            }
        };
        
        console.log('✅ Vercel configuration created');
        console.log('📋 Config:', JSON.stringify(vercelConfig, null, 2));
        
        return vercelConfig;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createVercelConfig();
