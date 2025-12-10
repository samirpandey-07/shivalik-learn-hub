import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");

let env = {};
try {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach(line => {
        const [key, val] = line.split("=");
        if (key && val) env[key.trim()] = val.trim().replace(/"/g, '');
    });
} catch (e) {
    console.error("Could not read .env", e);
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
    // 1. Login or just use Anon? Policies require 'authenticated'.
    // Using Anon key without login yields 'anon' role.
    // We need to simulate a user. I can't easily sign in as a user without password.
    // BUT I can check if "Public" read works for Anon? My policy says `auth.role() = 'authenticated'`.
    // So 'anon' can't read.

    // I need to update policy to allow 'anon' IF I want to test with this script without auth.
    // OR I can use the debug RPC to check rows directly (bypassing RLS).

    // Let's use RPC to inspect the table content regardless of RLS.
    // This confirms if rows EXIST.

    const { data, error } = await supabase.rpc('debug_get_latest_posts');
    if (error) {
        // RPC might not exist, I'll create it via migration first.
        console.log("RPC debug_get_latest_posts failed (not exists?)", error.message);
    } else {
        console.log("Latest Posts in DB:", JSON.stringify(data, null, 2));
    }
}

// I'll skip writing the RPC call logic until I create the RPC.
// Instead, I'll write the MIGRATION to create this RPC inspector.
