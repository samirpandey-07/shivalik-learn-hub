
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function debugComments() {
    const resourceId = '3af10b95-7c5d-4ed9-8929-fe1ef8d112b6';
    console.log("Fetching comments for:", resourceId);

    // 1. Fetch comments
    const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('resource_id', resourceId);

    if (commentsError) {
        console.error("Comments Error:", commentsError);
        return;
    }
    console.log(`Found ${comments.length} comments`);
    if (comments.length === 0) return;

    // 2. Extract IDs
    const userIds = Array.from(new Set(comments.map(c => c.user_id)));
    console.log("User IDs:", userIds);

    // 3. Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

    if (profilesError) {
        console.error("Profiles Error:", profilesError);
    } else {
        console.log("Profiles found:", profiles);
    }
}

debugComments();
