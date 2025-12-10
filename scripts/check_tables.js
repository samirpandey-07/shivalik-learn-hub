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
    console.log("Checking Forum tables...");

    const { error: err1 } = await supabase.from('forum_questions').select('count', { count: 'exact', head: true });
    console.log("Table 'forum_questions':", err1 ? "Error/Not Found" : "Exists");

    const { error: err2 } = await supabase.from('forum_answers').select('count', { count: 'exact', head: true });
    console.log("Table 'forum_answers':", err2 ? "Error/Not Found" : "Exists");

    const { error: err3 } = await supabase.from('forum_votes').select('count', { count: 'exact', head: true });
    console.log("Table 'forum_votes':", err3 ? "Error/Not Found" : "Exists");
}

run();
