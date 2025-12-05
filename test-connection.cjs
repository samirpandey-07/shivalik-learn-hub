const https = require('https');

const projectUrl = "https://wopgczttzlkfseqltmmd.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";

const path = "/rest/v1/colleges?select=*&limit=1";
const url = projectUrl + path;

console.log("----------------------------------------");
console.log("Testing Supabase Connection (CJS)");
console.log("URL:", url);
console.log("----------------------------------------");

const options = {
    headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + key
    }
};

const req = https.get(url, options, (res) => {
    console.log(`STATUS: ${res.statusCode} (Expected: 200)`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log("RESPONSE BODY (First 100 chars):", data.substring(0, 100));
        console.log("----------------------------------------");
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log("✅ CONNECTION SUCCESSFUL");
        } else {
            console.log("❌ CONNECTION FAILED (Status Code Error)");
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ CONNECTION ERROR: ${e.message}`);
});

req.end();
