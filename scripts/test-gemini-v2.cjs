const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
const API_KEY = match ? match[1].trim() : null;

console.log("----------------------------------------");
console.log("Testing Gemini API Connection (v2)");
console.log("API Key Found:", API_KEY ? "YES (Length: " + API_KEY.length + ")" : "NO");
console.log("----------------------------------------");

if (!API_KEY) {
    console.error("❌ No API Key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
    try {
        // 1. Test Text Generation (Sanity Check)
        console.log("1. Testing Model Access (gemini-1.5-flash)...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you online?");
        const response = await result.response;
        console.log("✅ Text Generation Success:", response.text().substring(0, 50) + "...");

        // 2. Test Vision (with a dummy 1x1 pixel image)
        console.log("\n2. Testing Vision Capabilities...");
        // 1x1 transparent GIF base64
        const dummyImage = {
            inlineData: {
                data: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
                mimeType: "image/gif"
            }
        };

        const resultVision = await model.generateContent(["Describe this image", dummyImage]);
        const responseVision = await resultVision.response;
        console.log("✅ Vision Generation Success:", responseVision.text());

    } catch (error) {
        const errorLog = `
❌ TEST FAILED:
Error Name: ${error.name}
Error Message: ${error.message}
Stack: ${error.stack}
`;
        console.error(errorLog);
        fs.writeFileSync(path.resolve(__dirname, 'gemini_error.log'), errorLog);
    }
}

test();
