import "dotenv/config";

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkRLS() {
    console.log("Checking RLS on Update...");

    // 1. Get a resource
    const { data: resources } = await supabase.from('resources').select('id').limit(1);
    if (!resources || resources.length === 0) return;
    const id = resources[0].id;

    // 2. Try update and select return
    const { data, error, count } = await supabase
        .from('resources')
        .update({ description: 'RLS Check' }) // trivial update
        .eq('id', id)
        .select(); // Request return data

    if (error) {
        console.error("Update Error:", error);
    } else {
        console.log(`Update Result: Matches ${data?.length}`);
        if (data && data.length === 0) {
            console.log("!!! Update returned 0 rows. RLS is likely blocking generic updates !!!");
        } else {
            console.log("Update succeeded.");
        }
    }
}

checkRLS();
