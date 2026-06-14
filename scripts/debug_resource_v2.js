import "dotenv/config";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchResource() {
    const id = '3af10b95-7c5d-4ed9-8929-fe1ef8d112b6';
    console.log(`Fetching resource ${id}...`);

    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching resource:', error);
        return;
    }

    console.log('Resource file_url:', data.file_url);

    if (data.file_url) {
        if (!data.file_url.startsWith('http')) {
            console.log('URL is NOT absolute. Generating public URL...');
            const { data: publicUrlData } = supabase.storage
                .from('resources')
                .getPublicUrl(data.file_url);
            console.log('Generated Public URL:', publicUrlData.publicUrl);
        } else {
            console.log('URL IS absolute.');
        }
    } else {
        console.log('file_url is NULL');
    }
}

fetchResource();
