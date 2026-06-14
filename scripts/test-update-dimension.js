import "dotenv/config";

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

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
