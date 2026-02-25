
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = "https://wopgczttzlkfseqltmmd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";
const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

async function backfill() {
    console.log("Starting Backfill...");

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
        console.log(`Processing: ${res.title}`);
        try {
            const text = `${res.title} ${res.description || ''} ${res.subject || ''} ${res.type || ''}`;
            const result = await model.embedContent(text);
            const embedding = result.embedding.values;

            const { error: updateError } = await supabase
                .from('resources')
                .update({ embedding: embedding })
                .eq('id', res.id);

            if (updateError) {
                console.error(`  Update Failed for ${res.id}:`, updateError.message);
            } else {
                console.log(`  Updated.`);
            }

            // Rate limit pause
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error(`  Embedding Failed for ${res.id}:`, e.message);
        }
    }
    console.log("Backfill Complete.");
}

backfill();
