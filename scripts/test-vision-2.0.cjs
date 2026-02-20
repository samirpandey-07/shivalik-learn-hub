const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ No API Key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function testVision() {
    console.log("----------------------------------------");
    console.log("Testing Gemini 2.0 Flash Vision");
    console.log("Model: gemini-2.0-flash-lite");
    console.log("----------------------------------------");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        // 1x1 transparent GIF base64
        const dummyImage = {
            inlineData: {
                data: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
                mimeType: "image/gif"
            }
        };

        console.log("Sending request with 1x1 GIF...");
        const result = await model.generateContent(["Describe this image", dummyImage]);
        const response = await result.response;
        console.log("✅ Vision Success!");
        console.log("Response:", response.text());

    } catch (error) {
        console.error("\n❌ TEST FAILED:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("StatusText:", error.response.statusText);
        }
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        // console.error("Full Error:", JSON.stringify(error, null, 2));
    }
}

testVision();
