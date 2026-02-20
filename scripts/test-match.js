
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = "https://wopgczttzlkfseqltmmd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";
const GEMINI_API_KEY = "AIzaSyCYb01w-AR7EqhfFsYILQm_s_r-t5gPfas";

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
