require("dotenv").config();
const fetch = global.fetch;
const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("API key not found in .env");
    process.exit(1);
}

const models = [
    "gemini-1.5-flash-001",
    "gemini-2.5-flash",
    "text-embedding-004"
];

async function testModel(model) {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }]
                })
            }
        );

        if (res.ok) {
            console.log(`✅ ${model}: WORKING (200 OK)`);
        } else {
            console.log(`❌ ${model}: FAILED (${res.status})`);
            const text = await res.text();
            if (text.includes("404")) console.log("   -> Not Found");
            else if (text.includes("429")) console.log("   -> Quota/Rate Limit");
            else console.log("   -> " + text.substring(0, 100));
        }
    } catch (err) {
        console.error(err);
    }
}

(async () => {
    for (const model of models) {
        console.log(`Testing ${model}...`);
        await testModel(model);
    }
})();
