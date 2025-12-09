
import { GoogleGenerativeAI } from "@google/generative-ai";

// Access API Key safely from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateSummary(text: string): Promise<string> {
    if (!API_KEY) throw new Error("Missing Gemini API Key");

    // Use gemini-1.5-flash for faster, cheaper inference (free tier friendly)
    // If this fails with 404, it means the API Key doesn't have access or the API isn't enabled.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        return embedding.values;
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

export async function solveWithImage(imageFile: File, promptText: string = "Solve this problem step-by-step."): Promise<string> {
    if (!API_KEY) throw new Error("Missing Gemini API Key");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `${promptText}
    
    Think like a patient, expert tutor. Provide a clear, step-by-step explanation. 
    If it's code, explain the logic. 
    If it's math, show the working. 
    Use markdown for formatting (bold, italic, code blocks).`;

    try {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text();
    } catch (e: any) {
        console.error("Gemini Vision Error:", e);
        throw new Error("Failed to analyze image. Ensure it's clear and the API key has Vision access.");
    }
}
