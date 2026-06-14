import "dotenv/config";

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
