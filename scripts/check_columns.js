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
    console.log("Checking specifically for 'approved_by'...");
    const { data, error } = await supabase.from('resources').select('approved_by').limit(1);
    if (error) {
        console.log("Column 'approved_by' DOES NOT EXIST (or error):", error.message);
    } else {
        console.log("Column 'approved_by' EXISTS.");
    }
}

run();
