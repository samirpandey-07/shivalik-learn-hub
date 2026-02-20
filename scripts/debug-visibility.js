
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wopgczttzlkfseqltmmd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debug() {
    console.log("--- Debugging Profiles ---");
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, study_preferences')
        .limit(5);

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
    } else {
        console.log(`Found ${profiles.length} profiles.`);
        profiles.forEach(p => {
            console.log(`- User: ${p.full_name || p.id}`);
            console.log(`  Preferences:`, JSON.stringify(p.study_preferences, null, 2));
        });
    }

    console.log("\n--- Debugging Resources ---");
    // Fetch a resource that has an embedding
    const { data: resources, error: resourceError } = await supabase
        .from('resources')
        .select('id, title, embedding')
        .not('embedding', 'is', null)
        .limit(1);

    if (resourceError) {
        console.error("Error fetching resources:", resourceError);
    } else {
        if (resources && resources.length > 0) {
            const res = resources[0];
            // Access embedding. If it's a string, parse it. If it's array, check length.
            // supabase-js might return it as a string if using pgvector
            let embedding = res.embedding;
            let length = 0;
            if (typeof embedding === 'string') {
                try {
                    embedding = JSON.parse(embedding);
                    length = embedding.length;
                } catch (e) {
                    console.log("  Embedding is a string but not JSON parsable:", embedding.substring(0, 50) + "...");
                    // simple vector string format is [1,2,3]
                    if (embedding.startsWith('[')) {
                        length = embedding.split(',').length;
                    }
                }
            } else if (Array.isArray(embedding)) {
                length = embedding.length;
            }

            console.log(`Found resource: ${res.title}`);
            console.log(`Embedding dimension: ${length}`);
        } else {
            console.log("No resources found with embeddings.");
        }
    }
}

debug();
