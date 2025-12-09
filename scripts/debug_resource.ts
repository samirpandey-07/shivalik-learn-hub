
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

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
        console.error('Error:', error);
        return;
    }

    console.log('Resource Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.file_url) {
        console.log('\nAnalysing file_url:', data.file_url);
        if (!data.file_url.startsWith('http')) {
            console.log('WARNING: file_url is not a full URL. It might be a storage path.');

            // Try to generate a public URL
            const { data: publicUrlData } = supabase.storage
                .from('resources')
                .getPublicUrl(data.file_url);

            console.log('Generated Public URL:', publicUrlData.publicUrl);
        }
    }
}

fetchResource();
