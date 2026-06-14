import "dotenv/config";

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

async function backfill() {
    console.log("Starting ADMIN Backfill with TRUNCATION (3072 -> 768)...");

    // Fetch all resources with NULL embeddings
    const { data: resources, error } = await supabase
        .from('resources')
        .select('id, title, description, subject, type')
        .is('embedding', null);

    if (error) {
        console.error("Fetch Error:", error);
        return;
    }

    console.log(`Found ${resources.length} resources to backfill.`);

    for (const res of resources) {
        process.stdout.write(`Processing: ${res.title}... `);
        try {
            const text = `${res.title} ${res.description || ''} ${res.subject || ''} ${res.type || ''}`;
            const result = await model.embedContent(text);
            const embedding = result.embedding.values;

            // Truncate to 768 dimensions
            const truncatedEmbedding = embedding.slice(0, 768);

            const { error: updateError } = await supabase
                .from('resources')
                .update({ embedding: truncatedEmbedding })
                .eq('id', res.id);

            if (updateError) {
                console.log(`FAILED: ${updateError.message}`);
            } else {
                console.log(`OK`);
            }

            // Rate limit pause
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.log(`ERROR: ${e.message}`);
        }
    }
    console.log("Backfill Complete.");
}

backfill();
