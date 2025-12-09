
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyD373YiA2mQquSLVe1DMTUgn_xH_rBPArs"; // Hardcoded for debugging

const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
    console.log("Testing Gemini API Key directly...");

    // Try to list models? The SDK doesn't expose listModels easily on the main client 
    // without the ModelManager, which might be hidden. 
    // Let's brute force checking a few specific models.

    const models = ["gemini-1.5-flash", "models/gemini-1.5-flash", "gemini-pro", "models/gemini-pro"];

    for (const m of models) {
        try {
            console.log(`\n--- Attempting: ${m} ---`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Test.");
            const response = await result.response;
            console.log(`✅ SUCCESS with ${m}!`);
            return;
        } catch (e) {
            console.log(`❌ FAILED ${m}: ${e.message.split('\n')[0]}`);
        }
    }
    console.log("\nAll attempts failed.");
}

test();
