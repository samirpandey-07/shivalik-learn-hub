
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = "AIzaSyCYb01w-AR7EqhfFsYILQm_s_r-t5gPfas";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function test() {
    console.log("Testing 'models/text-embedding-004'...");
    try {
        const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
        const result = await model.embedContent("Hello world");
        const embedding = result.embedding.values;
        console.log("Success! Dimension:", embedding.length);
    } catch (e) {
        console.error("Failed:", e.message);
    }
}

test();
