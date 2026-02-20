
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { prompt, image, mimeType } = await req.json();
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

        if (!GEMINI_API_KEY) {
            throw new Error('Missing GEMINI_API_KEY environment variable');
        }

        if (!image) {
            throw new Error('Image data is required');
        }

        // Prepare the payload for Gemini API
        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt || "Analyze this image." },
                        {
                            inline_data: {
                                mime_type: mimeType || "image/jpeg",
                                data: image // Base64 string
                            }
                        }
                    ]
                }
            ]
        };

        // Call Gemini API directly via REST
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Gemini API Failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Extract the text response
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error("No content generated from Gemini.");
        }

        return new Response(
            JSON.stringify({ result: generatedText }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        );
    }
});
