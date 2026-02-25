
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = "https://wopgczttzlkfseqltmmd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";
const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

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
