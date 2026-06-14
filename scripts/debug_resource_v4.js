import "dotenv/config";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUrl() {
    const id = '3af10b95-7c5d-4ed9-8929-fe1ef8d112b6';

    const { data } = await supabase
        .from('resources')
        .select('file_url')
        .eq('id', id)
        .single();

    if (!data?.file_url) return console.log('No URL');

    console.log('Testing URL:', data.file_url);
    try {
        const response = await fetch(data.file_url);
        console.log('Status:', response.status);
        console.log('StatusText:', response.statusText);
        const text = await response.text();
        console.log('Body Preview:', text.substring(0, 100));
    } catch (e) {
        console.error('Fetch Error:', e.message);
    }
}

checkUrl();
