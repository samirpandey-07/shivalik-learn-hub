
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = "https://wopgczttzlkfseqltmmd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";
const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

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
