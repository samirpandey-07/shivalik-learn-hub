
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wopgczttzlkfseqltmmd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("Checking Resource Counts...");

    // Total count
    const { count: total, error: err1 } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true });

    if (err1) console.error("Error fetching total:", err1);
    else console.log(`Total Resources: ${total}`);

    // With embedding
    const { count: withEmb, error: err2 } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .not('embedding', 'is', null);

    if (err2) console.error("Error fetching with embedding:", err2);
    else console.log(`Resources with Embedding: ${withEmb}`);
}

check();
