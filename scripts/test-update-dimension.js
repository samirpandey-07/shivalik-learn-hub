
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = "https://wopgczttzlkfseqltmmd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";
const GEMINI_API_KEY = "AIzaSyCYb01w-AR7EqhfFsYILQm_s_r-t5gPfas";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testUpdate() {
    console.log("Testing update with 3072-dim embedding...");

    // 1. Get a resource to update
    const { data: resources } = await supabase.from('resources').select('id, title').limit(1);
    if (!resources || resources.length === 0) {
        console.log("No resources found to test.");
        return;
    }
    const resource = resources[0];
    console.log(`Target Resource: ${resource.title} (${resource.id})`);

    // 2. Generate embedding (models/gemini-embedding-001 -> 3072 dim)
    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
        const result = await model.embedContent("Test content");
        const embedding = result.embedding.values;
        console.log(`Generated embedding length: ${embedding.length}`);

        // 3. Try to update
        const { error } = await supabase
            .from('resources')
            .update({ embedding: embedding })
            .eq('id', resource.id);

        if (error) {
            console.error("Update Failed:", error);
            // Check error message for dimension mismatch
        } else {
            console.log("Update Success! Database accepts 3072 dimensions.");
        }
    } catch (e) {
        console.error("Embedding Generation Failed:", e.message);
    }
}

testUpdate();
