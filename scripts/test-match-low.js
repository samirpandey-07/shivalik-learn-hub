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
    console.log("Testing Recommendation Match (Threshold -1.0)...");

    // Simulating the user's query
    const prompt = "Data Structures deep learning study material";

    try {
        const result = await model.embedContent(prompt);
        const embedding = result.embedding.values;

        const { data, error } = await supabase.rpc('match_resources', {
            query_embedding: embedding,
            match_threshold: -1.0,
            match_count: 4
        });

        if (error) {
            console.error("Match Error:", error);
        } else {
            console.log(`Found ${data?.length || 0} matches.`);
            if (data) {
                // Supabase typically returns similarity, or 1 - distance
                data.forEach(d => console.log(`- [${d.similarity}] Resource ID: ${d.id}`));
            }
        }
    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

testMatch();
