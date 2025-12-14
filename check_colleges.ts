
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listColleges() {
    const { data, error } = await supabase
        .from('colleges')
        .select('*');

    if (error) {
        console.error("Error fetching colleges:", error);
        return;
    }

    console.log("Colleges found:");
    data.forEach(c => {
        console.log(`- ${c.name} (ID: ${c.id})`);
    });
}

listColleges();
