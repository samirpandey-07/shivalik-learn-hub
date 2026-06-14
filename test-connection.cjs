const https = require("https");
require("dotenv/config");

const projectUrl = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!projectUrl || !key) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
    process.exit(1);
}

const path = "/rest/v1/colleges?select=*&limit=1";
const url = projectUrl + path;

console.log("----------------------------------------");
console.log("Testing Supabase Connection (CJS)");
console.log("URL:", url);
console.log("Key:", `${key.slice(0, 8)}...${key.slice(-6)}`);
console.log("----------------------------------------");

const options = {
    headers: {
        apikey: key,
        Authorization: "Bearer " + key,
    },
};

const req = https.get(url, options, (res) => {
    console.log(`STATUS: ${res.statusCode} (Expected: 200)`);

    let data = "";
    res.on("data", (chunk) => {
        data += chunk;
    });

    res.on("end", () => {
        console.log("RESPONSE BODY (First 100 chars):", data.substring(0, 100));
        console.log("----------------------------------------");
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log("CONNECTION SUCCESSFUL");
        } else {
            console.log("CONNECTION FAILED (Status Code Error)");
        }
    });
});

req.on("error", (error) => {
    console.error(`CONNECTION ERROR: ${error.message}`);
});

req.end();
