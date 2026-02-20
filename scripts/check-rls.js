
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wopgczttzlkfseqltmmd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";

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
