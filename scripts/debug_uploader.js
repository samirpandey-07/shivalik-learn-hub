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
    console.log("Fetching a random resource...");
    const { data: resources, error } = await supabase.from('resources').select('*').limit(1);
    if (error || !resources || resources.length === 0) {
        console.log("No resources found or error:", error);
        return;
    }

    const res = resources[0];
    console.log("Resource:", res.title, "Uploader ID:", res.uploader_id);

    if (!res.uploader_id) {
        console.log("Resource has NO uploader_id");
        return;
    }

    console.log("Fetching profile for", res.uploader_id);
    const { data: profile, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', res.uploader_id)
        .single();

    console.log("Profile Result:", profile || "NULL");
    console.log("Profile Error:", profError ? profError.message : "None");
}

run();
