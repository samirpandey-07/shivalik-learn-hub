import "dotenv/config";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchResource() {
    const id = '3af10b95-7c5d-4ed9-8929-fe1ef8d112b6';

    // We mirror the query from ResourcePage.tsx
    const { data, error } = await supabase
        .from("resources")
        .select(`
        *,
        college:colleges(name),
        course:courses(name),
        uploader:profiles(full_name)
    `)
        .eq("id", id)
        .single();

    if (error) {
        console.log('ERROR:', error);
        return;
    }

    console.log('FULL JSON:');
    console.log(JSON.stringify(data, null, 2));
}

fetchResource();
