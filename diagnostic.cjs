const https = require('https');
const PROJECT_URL = 'https://wopgczttzlkfseqltmmd.supabase.co';
const API_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Node might not see this if not in .env, but we'll try

const fs = require('fs');
const path = require('path');

function getEnvValue(key) {
    try {
        const envPath = path.resolve(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const data = fs.readFileSync(envPath, 'utf8');
            const match = data.match(new RegExp(`${key}=(.*)`));
            if (match) return match[1].trim();
        }
    } catch (e) { }
    return null;
}

const SUPABASE_KEY = getEnvValue('VITE_SUPABASE_PUBLISHABLE_KEY');

// Helper to make requests
function checkEndpoint(name, url, headers = {}) {
    return new Promise((resolve) => {
        console.log(`\nTesting ${name}...`);
        console.log(`URL: ${url}`);

        const req = https.get(url, { headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
                // Log body for errors or health checks
                if (res.statusCode !== 200 || data.length < 500) {
                    console.log(`Body: ${data.substring(0, 500)}`);
                }
                resolve({ code: res.statusCode, body: data });
            });
        });

        req.on('error', (e) => {
            console.error(`❌ NETWORK ERROR: ${e.message}`);
            resolve({ error: e });
        });

        req.end();
    });
}

(async () => {
    console.log(`\n=== Supabase Diagnostic Tool [Timestamp: ${new Date().toISOString()}] ===`);

    // 1. Check Root
    await checkEndpoint('Root URL', PROJECT_URL);

    // 2. Check Auth Health (Specific)
    await checkEndpoint('Auth Health', `${PROJECT_URL}/auth/v1/health`);

    // 3. Check REST API (Colleges)
    if (SUPABASE_KEY) {
        await checkEndpoint('REST API (Colleges)',
            `${PROJECT_URL}/rest/v1/colleges?select=id&limit=1`,
            {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        );
    } else {
        console.log("\nSkipping REST check (No Key found in .env)");
    }
})();
