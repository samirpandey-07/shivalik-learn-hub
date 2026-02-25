import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

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
        const { action, modelType, prompt, imagePart, history, options } = await req.json();
        const API_KEY = Deno.env.get('GEMINI_API_KEY');

        if (!API_KEY) {
            throw new Error('Missing GEMINI_API_KEY environment variable');
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        // Default models
        const defaultTextModel = "gemini-2.5-flash";
        const fallbackTextModel = "gemini-1.5-flash";
        const defaultEmbeddingModel = "models/gemini-embedding-001";

        let resultData = null;

        switch (action) {
            case 'generateContent': {
                const modelName = modelType || defaultTextModel;
                const model = genAI.getGenerativeModel({ model: modelName });

                let generationResult;
                const contents = [];

                // Reconstruct history if provided (for ChatWithPDF)
                if (history && Array.isArray(history)) {
                    const historyText = history.map((h: any) => `${h.role === "user" ? "User" : "AI"}: ${h.content}`).join("\n");
                    contents.push(`Chat History:\n${historyText}\n\nUser: ${prompt}\nAI:`);
                } else if (prompt) {
                    contents.push(prompt);
                }

                if (imagePart) {
                    contents.push(imagePart);
                }

                try {
                    generationResult = await model.generateContent(contents);
                } catch (primaryError: any) {
                    // 1.5 Fallback Logic for Doubt Solver
                    console.warn(`Primary model ${modelName} failed, trying fallback. Error:`, primaryError.message);
                    const fallbackModel = genAI.getGenerativeModel({ model: fallbackTextModel });
                    try {
                        generationResult = await fallbackModel.generateContent(contents);
                    } catch (fallbackError: any) {
                        if (options?.allowOfflineDemo) {
                            const lowerPrompt = prompt ? prompt.toLowerCase() : "";
                            if (lowerPrompt.includes("quantum")) {
                                return new Response(JSON.stringify({ text: "**Quantum Physics** (Offline Demo)\n\nQuantum physics is the study of matter and energy at the most fundamental level.\n\n*   **Wave-Particle Duality**: Particles act like waves.\n*   **Superposition**: Items can be in multiple states.\n*   **Entanglement**: Spooky action at a distance." }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                            }
                            if (lowerPrompt.includes("react")) {
                                return new Response(JSON.stringify({ text: "**React Hooks** (Offline Demo)\n\nReact Hooks let you use state and other React features without writing a class.\n\n*   `useState`: For state management.\n*   `useEffect`: For side effects." }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                            }
                            return new Response(JSON.stringify({ text: "I am unable to connect to the AI right now, but I'm ready to solve your doubts once you're back online! (This is a fallback response for the demo)." }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
                        }
                        throw new Error(`All Gemini models failed: ${fallbackError.message}`);
                    }
                }

                const response = await generationResult.response;
                resultData = { text: response.text() };
                break;
            }

            case 'embedContent': {
                const model = genAI.getGenerativeModel({ model: defaultEmbeddingModel });
                const embeddingResult = await model.embedContent(prompt);
                // The frontend expected this to be truncated, we do it here or client side. We'll do client side to match old behavior exactly.
                resultData = { embeddings: embeddingResult.embedding.values };
                break;
            }

            default:
                throw new Error(`Unsupported action: ${action}`);
        }

        return new Response(
            JSON.stringify(resultData),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        );

    } catch (error: any) {
        console.error("Edge Function Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        );
    }
});
