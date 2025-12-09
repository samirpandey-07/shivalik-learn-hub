
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wopgczttzlkfseqltmmd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";

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
