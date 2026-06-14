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
    console.log("Checking columns of 'interview_experiences'...");
    const { data, error } = await supabase.from('interview_experiences').select('*').limit(1);
    if (error) {
        console.log("Error selecting:", error.message);
    } else {
        console.log("Data:", data);
        if (data && data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("No rows found to determine columns directly, let's select from information_schema or run a test insert.");
        }
    }
}

run();
