
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = "AIzaSyCYb01w-AR7EqhfFsYILQm_s_r-t5gPfas";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function list() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init to get client
        // Actually, listing models might not be directly exposed easily on the helper, but let's try via direct fetch if SDK doesn't have it handy in the version provided.
        // The node SDK usually doesn't expose listModels on the top level client in older versions, but let's try to just fetch it manually.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("embedContent")) {
                    console.log(`- [EMBEDDING] ${m.name}`);
                } else {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (e) {
        console.error("List failed:", e);
    }
}

list();
