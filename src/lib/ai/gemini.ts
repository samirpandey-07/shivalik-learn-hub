

import { GoogleGenerativeAI } from "@google/generative-ai";

// Access API Key safely from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateSummary(text: string): Promise<string> {
    if (!API_KEY) throw new Error("Missing Gemini API Key");

    // Use gemini-2.5-flash as it is available and working
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Summarize the following educational content in a structured, easy-to-read format with bullet points. Highlight key concepts and definitions. Max 300 words. \n\nContent:\n${text}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (e: any) {
        if (e.message.includes('404') || e.message.includes('not found')) {
            throw new Error("Gemini Model not found. This API Key might not have the 'Generative Language API' enabled in Google AI Studio.");
        }
        throw e;
    }
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index 0-3
}

export async function generateQuiz(text: string): Promise<QuizQuestion[]> {
    if (!API_KEY) throw new Error("Missing Gemini API Key");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Generate a quiz with 5 multiple-choice questions based on the following content. 
    Return ONLY a raw JSON array (no markdown code blocks) in this exact format:
    [
        {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0
        }
    ]
    
    Content:\n${text}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean markdown code blocks if present (Gemini sometimes adds them)
        const cleanedJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedJson);
    } catch (e: any) {
        if (e.message.includes('404') || e.message.includes('not found')) {
            throw new Error("Gemini Model not found. Please check API Key in Google AI Studio.");
        }
        console.error("Failed to parse quiz JSON or API error", e);
        throw new Error("Failed to generate valid quiz.");
    }
}

export async function getEmbedding(text: string) {
    try {
        // gemini-embedding-001 returns 768 dimensions usually, but sometimes 3072 depending on version/updates.
        // We explicitly truncate to 768 to match Supabase vector column.
        const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;
        return embedding.slice(0, 768);
    } catch (error) {
        console.error("Error generating embedding:", error);
        return null;
    }
}

// Helper to convert File to base64 for Gemini
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Unified solver for Text + Image or just Text
export async function solveDoubt(promptText: string, imageFile?: File | null): Promise<string> {
    if (!API_KEY) throw new Error("Missing Gemini API Key");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
    Think like a patient, expert tutor. Provide a clear, step-by-step explanation. 
    If it's code, explain the logic. 
    If it's math, show the working. 
    Use markdown for formatting (bold, italic, code blocks).
    `;

    const fullPrompt = `${promptText}\n\n${systemPrompt}`;

    // 3-Layer Fallback System for Zero-Fail Demo

    // 1. Try Primary Model (Gemini 2.5 - Newest)
    try {
        let result;
        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            result = await model.generateContent([fullPrompt, imagePart]);
        } else {
            result = await model.generateContent(fullPrompt);
        }
        const response = await result.response;
        return response.text();
    } catch (primaryError: any) {
        console.warn("Primary AI (2.5) Failed:", primaryError);

        // 2. Try Fallback Model (Gemini 1.5 - Stable)
        try {
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            let result;
            if (imageFile) {
                // Note: fileToGenerativePart might fail if offline, but we try.
                const imagePart = await fileToGenerativePart(imageFile);
                result = await fallbackModel.generateContent([fullPrompt, imagePart]);
            } else {
                result = await fallbackModel.generateContent(fullPrompt);
            }
            return result.response.text();
        } catch (fallbackError: any) {
            console.error("All AI Models Failed (Offline?):", fallbackError);

            // 3. Demo Cache (Offline Mode)
            const lowerPrompt = promptText.toLowerCase();

            if (lowerPrompt.includes("quantum")) return "**Quantum Physics** (Offline Demo)\n\nQuantum physics is the study of matter and energy at the most fundamental level.\n\n*   **Wave-Particle Duality**: Particles act like waves.\n*   **Superposition**: Items can be in multiple states.\n*   **Entanglement**: Spooky action at a distance.";

            if (lowerPrompt.includes("react")) return "**React Hooks** (Offline Demo)\n\nReact Hooks let you use state and other React features without writing a class.\n\n*   `useState`: For state management.\n*   `useEffect`: For side effects.";

            return "I am unable to connect to the AI right now, but I'm ready to solve your doubts once you're back online! (This is a fallback response for the demo).";
        }
    }
}

export async function solveWithImage(imageFile: File, promptText: string = "Solve this problem step-by-step."): Promise<string> {
    return solveDoubt(promptText, imageFile);
}

// Helper to fetch file from URL and convert to base64
async function urlToGenerativePart(url: string, mimeType: string): Promise<{ inlineData: { data: string; mimeType: string } }> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export async function generateSummaryFromUrl(fileUrl: string): Promise<string> {
    if (!API_KEY) throw new Error("Missing Gemini API Key");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const pdfPart = await urlToGenerativePart(fileUrl, "application/pdf");

    const prompt = `Summarize this document in a structured, easy-to-read format with bullet points. Highlight key concepts and definitions. Max 300 words.`;

    try {
        const result = await model.generateContent([prompt, pdfPart]);
        const response = await result.response;
        return response.text();
    } catch (e: any) {
        console.error("Gemini PDF Summary Error:", e);
        throw new Error(`Gemini Error: ${e.message}`);
    }
}

export async function generateQuizFromUrl(fileUrl: string): Promise<QuizQuestion[]> {
    if (!API_KEY) throw new Error("Missing Gemini API Key");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const pdfPart = await urlToGenerativePart(fileUrl, "application/pdf");

    const prompt = `Generate a quiz with 5 multiple-choice questions based on this document. 
    Return ONLY a raw JSON array (no markdown code blocks) in this exact format:
    [
        {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0
        }
    ]`;

    try {
        const result = await model.generateContent([prompt, pdfPart]);
        const response = await result.response;
        const textResponse = response.text();
        const cleanedJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedJson);

    } catch (e: any) {
        console.error("Gemini PDF Quiz Error:", e);
        throw new Error(`Gemini Error: ${e.message}`);
    }
}

export async function chatWithPDF(fileUrl: string, history: { role: "user" | "model"; content: string }[], message: string): Promise<string> {
    if (!API_KEY) throw new Error("Missing Gemini API Key");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const pdfPart = await urlToGenerativePart(fileUrl, "application/pdf");

    // Construct the prompt with history
    const historyPrompt = history.map(h => `${h.role === "user" ? "User" : "AI"}: ${h.content}`).join("\n");

    const finalPrompt = `You are a helpful teaching assistant. Answer the user's question based on the provided PDF document.
    
    Chat History:
    ${historyPrompt}
    
    User: ${message}
    AI:`;

    try {
        const result = await model.generateContent([finalPrompt, pdfPart]);
        const response = await result.response;
        return response.text();
    } catch (e: any) {
        console.error("Gemini PDF Chat Error:", e);
        throw new Error(`Gemini Error: ${e.message}`);
    }
}

export interface FlashcardData {
    front: string;
    back: string;
}

export async function generateFlashcards(topic: string): Promise<FlashcardData[]> {
    if (!API_KEY) throw new Error("Missing Gemini API Key");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Create 10-15 high-quality flashcards for the following topic or syllabus.
    
    Topic/Syllabus:
    "${topic}"
    
    Return ONLY a raw JSON array (no markdown code blocks, no other text) in this exact format:
    [
        {
            "front": "Question or Term",
            "back": "Answer or Definition"
        }
    ]`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean markdown code blocks if present
        const cleanedJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedJson);
    } catch (e: any) {
        if (e.message.includes('404') || e.message.includes('not found')) {
            throw new Error("Gemini Model not found. Please check API Key.");
        }
        console.error("Failed to parse flashcards JSON or API error", e);
        throw new Error("Failed to generate flashcards. Please try a more specific topic.");
    }
}

