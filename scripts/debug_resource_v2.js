
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wopgczttzlkfseqltmmd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";

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
