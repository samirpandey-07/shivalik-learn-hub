
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wopgczttzlkfseqltmmd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcGdjenR0emxrZnNlcWx0bW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NDQ2MjEsImV4cCI6MjA4MDQyMDYyMX0.DcG7riHOe5aJqrG0vFqP3WyXX_hqqBAtrxj9V6rTjrw";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkActivity() {
    console.log("Checking User Activity Actions...");

    // Fetch all unique actions from user_activity
    const { data, error } = await supabase
        .from('user_activity')
        .select('action');

    if (error) {
        console.log("Error fetching user_activity:", error.message);
        return;
    }

    // Count occurrences of each action
    const actionCounts = {};
    if (data && data.length > 0) {
        data.forEach(item => {
            const action = item.action || 'unknown';
            actionCounts[action] = (actionCounts[action] || 0) + 1;
        });

        console.log("\n--- User Activity Counts by Action ---");
        Object.keys(actionCounts).forEach(action => {
            console.log(`${action}: ${actionCounts[action]}`);
        });
    } else {
        console.log("No user activity records found.");
    }
}

checkActivity();
