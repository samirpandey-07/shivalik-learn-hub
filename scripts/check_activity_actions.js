import "dotenv/config";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

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
