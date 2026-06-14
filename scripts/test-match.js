import "dotenv/config";

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

async function testMatch() {
    console.log("Testing Recommendation Match...");

    // Simulating the user's query
    const prompt = "Data Structures deep learning study material";
    console.log(`Query: "${prompt}"`);

    try {
        const result = await model.embedContent(prompt);
        const embedding = result.embedding.values;
        console.log(`Embedding generated (len: ${embedding.length})`);

        const { data, error } = await supabase.rpc('match_resources', {
            query_embedding: embedding,
            match_threshold: 0.3, // Lower threshold for test
            match_count: 4
        });

        if (error) {
            console.error("Match Error:", error);
        } else {
            console.log(`Found ${data?.length || 0} matches.`);
            if (data) {
                data.forEach(d => console.log(`- [${(d.similarity * 100).toFixed(1)}%] Resource ID: ${d.id}`));
            }
        }
    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

testMatch();
