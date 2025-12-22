
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wopgczttzlkfseqltmmd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCounts() {
    console.log("Checking button counts...");
    const counts = [];

    // 1. Check Downloads
    try {
        const { data: resources, error } = await supabase
            .from('resources')
            .select('downloads');

        if (error) {
            console.log("Error fetching resources:", error.message);
        } else {
            const totalDownloads = resources.reduce((sum, r) => sum + (r.downloads || 0), 0);
            counts.push({ name: 'Download Button', count: totalDownloads });
        }
    } catch (e) { console.log("Exception in downloads:", e.message); }

    // 2. Check Likes (v2)
    try {
        const { count, error } = await supabase
            .from('resource_likes_v2')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log("Error fetching likes v2:", error.message);
        } else {
            counts.push({ name: 'Like Button', count: count || 0 });
        }
    } catch (e) { console.log("Exception in likes:", e.message); }

    // 3. Check Ratings (Count)
    try {
        const { count, error } = await supabase
            .from('resource_ratings')
            .select('*', { count: 'exact', head: true });

        if (error) console.log("Error fetching ratings:", error.message);
        else counts.push({ name: 'Rating Button', count: count || 0 });
    } catch (e) { console.log("Exception in ratings:", e.message); }

    // 4. Check Saves
    try {
        const { count, error } = await supabase
            .from('saved_resources')
            .select('*', { count: 'exact', head: true });

        if (error) console.log("Error fetching saves:", error.message);
        else counts.push({ name: 'Save Button', count: count || 0 });
    } catch (e) { console.log("Exception in saves:", e.message); }

    // 5. Check Views (User Activity)
    try {
        const { count, error } = await supabase
            .from('user_activity')
            .select('*', { count: 'exact', head: true })
            .eq('action', 'view');

        if (error) console.log("Error fetching views:", error.message);
        else counts.push({ name: 'View/Preview', count: count || 0 });
    } catch (e) { console.log("Exception in views:", e.message); }

    // 6. Check Fullscreen (User Activity)
    try {
        const { count, error } = await supabase
            .from('user_activity')
            .select('*', { count: 'exact', head: true })
            .eq('action', 'fullscreen');

        if (error) console.log("Error fetching fullscreen:", error.message);
        else counts.push({ name: 'Open Fullscreen', count: count || 0 });
    } catch (e) { console.log("Exception in fullscreen:", e.message); }


    // Sort and display
    counts.sort((a, b) => b.count - a.count);

    console.log("\n--- Results ---");
    counts.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}: ${item.count}`);
    });

    if (counts.length > 0) {
        console.log(`\nHighest count is of: ${counts[0].name} (${counts[0].count})`);
    } else {
        console.log("No counts found.");
    }
}

checkCounts();
