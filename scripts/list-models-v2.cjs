require("dotenv").config();

const fetch = global.fetch;

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("API key not found in .env");
    process.exit(1);
}

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro"
];

async function listAllModels() {
    try {
        console.log(`Checking available models for key ending in ...${API_KEY.slice(-4)}`);
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        if (res.ok) {
            const data = await res.json();
            console.log("✅ API Connection Successful. Available Models:");
            if (data.models) {
                data.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log("No models returned in list.");
            }
        } else {
            console.log("❌ Failed to list models:");
            const text = await res.text();
            console.log(text);
        }
    } catch (err) {
        console.error(err);
    }
}

async function testModel(model) {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: "Hello" }]
                        }
                    ]
                })
            }
        );

        if (res.ok) {
            console.log(`✅ ${model}: WORKING`);
        } else {
            console.log(`❌ ${model}: NOT FOUND`);
            const text = await res.text();
            console.log(text);
        }
    } catch (err) {
        console.error(err);
    }
}

(async () => {
    await listAllModels();

    for (const model of models) {
        console.log(`\nTesting ${model}...`);
        await testModel(model);
    }
})();
