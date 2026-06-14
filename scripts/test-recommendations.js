import "dotenv/config";

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function test() {
    console.log("1. Testing 'models/gemini-embedding-001'...");
    let embedding = null;

    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
        const result = await model.embedContent("Hello world");
        embedding = result.embedding.values;
        console.log("   Success! Embedding length:", embedding.length);

        console.log("\n2. Testing Supabase RPC 'match_resources' with this embedding...");
        const { data, error } = await supabase.rpc('match_resources', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: 4
        });

        if (error) {
            console.error("   RPC Error:", error);
        } else {
            console.log("   RPC Success! Found:", data?.length, "matches");
        }

    } catch (e) {
        console.error("   Test Failed:", e.message);
    }
}

test();
