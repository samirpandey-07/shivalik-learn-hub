
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SUPABASE_URL = "https://wopgczttzlkfseqltmmd.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg0NDYyMSwiZXhwIjoyMDgwNDIwNjIxfQ.btmM2NblCHgJM8T1GkP1CcjYDTVhMxzjLiktGQhdrJ4";
const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

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
