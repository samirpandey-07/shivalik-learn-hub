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
    console.log("Testing insert with profession column...");
    const { data, error } = await supabase.from('interview_experiences').insert({
        company_name: "Test Company",
        role: "Test Role",
        batch_year: 2025,
        difficulty: 3,
        status: "Offer Selected",
        content: "Test Content",
        profession: "Software Engineering" // testing if this works
    });
    if (error) {
        console.log("Insert failed:", error.message);
    } else {
        console.log("Insert succeeded!", data);
    }
}

run();
