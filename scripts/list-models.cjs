const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
const API_KEY = match ? match[1].trim() : null;

if (!API_KEY) {
    console.error("❌ No API Key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        console.log("Fetching available models...");
        // There isn't a direct listModels on genAI instance in the node SDK easily exposed in all versions,
        // but let's try to just hit the API or use a known fallback.
        // Actually the SDK has a model manager in some versions.
        // Let's try to infer from error or just try common ones.

        const modelsToTest = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-pro-vision"
        ];

        console.log("Testing specific models availability by running a quick generation...");

        for (const modelName of modelsToTest) {
            console.log(`\nTesting ${modelName}:`);
            const model = genAI.getGenerativeModel({ model: modelName });
            try {
                await model.generateContent("Hi");
                console.log(`✅ ${modelName} is AVAILABLE`);
            } catch (e) {
                if (e.message.includes("404")) {
                    console.log(`❌ ${modelName} NOT FOUND (404)`);
                } else {
                    console.log(`⚠️ ${modelName} Error: ${e.message.split('\n')[0]}`);
                }
            }
        }

    } catch (error) {
        console.error("Critical Error:", error);
    }
}

listModels();
