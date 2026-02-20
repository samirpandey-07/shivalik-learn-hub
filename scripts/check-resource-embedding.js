
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wopgczttzlkfseqltmmd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("Checking Resource Embeddings...");
    const { data: resources, error } = await supabase
        .from('resources')
        .select('id, title, embedding')
        .not('embedding', 'is', null)
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (resources && resources.length > 0) {
        const res = resources[0];
        let emb = res.embedding;
        let len = 0;

        // Handle string format from pgvector
        if (typeof emb === 'string') {
            try {
                emb = JSON.parse(emb);
            } catch (e) {
                // If it's "[0.1, ...]" string
                if (emb.startsWith('[')) {
                    // removing brackets and splitting
                    len = emb.slice(1, -1).split(',').length;
                }
            }
        }

        if (Array.isArray(emb)) len = emb.length;

        console.log(`Resource ID: ${res.id}`);
        console.log(`Embedding Dimension: ${len}`);
    } else {
        console.log("No resources found with embeddings.");
    }
}

check();
