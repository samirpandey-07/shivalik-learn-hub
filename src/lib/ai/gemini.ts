

import { supabase } from '../supabase/client';

export async function generateSummary(text: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'generateContent', prompt: `Summarize the following educational content in a structured, easy-to-read format with bullet points. Highlight key concepts and definitions. Max 300 words. \n\nContent:\n${text}` }
    });

    if (error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
            throw new Error("Gemini Model not found. This API Key might not have the 'Generative Language API' enabled in Google AI Studio.");
        }
        throw error;
    }

    if (data?.error) throw new Error(data.error);
    return data.text;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index 0-3
}

export async function generateQuiz(text: string): Promise<QuizQuestion[]> {
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

    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'generateContent', prompt }
    });

    if (error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
            throw new Error("Gemini Model not found. Please check API Key in Google AI Studio.");
        }
        throw new Error("Failed to generate valid quiz.");
    }

    if (data?.error) throw new Error(data.error);

    try {
        const textResponse = data.text;
        const cleanedJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedJson);
    } catch (e) {
        console.error("Failed to parse quiz JSON", e);
        throw new Error("Failed to generate valid quiz.");
    }
}

export async function getEmbedding(text: string) {
    try {
        const { data, error } = await supabase.functions.invoke('gemini-proxy', {
            body: { action: 'embedContent', prompt: text }
        });

        if (error || data?.error) {
            console.error("Proxy error generating embedding:", error || data?.error);
            return null;
        }

        const embedding = data.embeddings;
        return embedding ? embedding.slice(0, 768) : null;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return null;
    }
}

// Helper to convert File to base64 for Gemini payload format
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
    const systemPrompt = `
    Think like a patient, expert tutor. Provide a clear, step-by-step explanation. 
    If it's code, explain the logic. 
    If it's math, show the working. 
    Use markdown for formatting (bold, italic, code blocks).
    `;

    const fullPrompt = `${promptText}\n\n${systemPrompt}`;
    let imagePart = undefined;

    if (imageFile) {
        imagePart = await fileToGenerativePart(imageFile);
    }

    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
            action: 'generateContent',
            prompt: fullPrompt,
            imagePart,
            options: { allowOfflineDemo: true }
        }
    });

    if (error || data?.error) {
        // Fallbacks are now handled within the Edge Function.
        throw new Error(error?.message || data?.error || "Unknown error calling Gemini proxy");
    }

    return data.text;
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
    const pdfPart = await urlToGenerativePart(fileUrl, "application/pdf");
    const prompt = `Summarize this document in a structured, easy-to-read format with bullet points. Highlight key concepts and definitions. Max 300 words.`;

    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'generateContent', prompt, imagePart: pdfPart }
    });

    if (error || data?.error) {
        throw new Error(`Gemini Proxy Error: ${error?.message || data?.error}`);
    }

    return data.text;
}

export async function generateQuizFromUrl(fileUrl: string): Promise<QuizQuestion[]> {
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

    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'generateContent', prompt, imagePart: pdfPart }
    });

    if (error || data?.error) {
        throw new Error(`Gemini Proxy Error: ${error?.message || data?.error}`);
    }

    try {
        const textResponse = data.text;
        const cleanedJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedJson);
    } catch (e) {
        throw new Error("Failed to generate and parse PDF quiz");
    }
}

export async function chatWithPDF(fileUrl: string, history: { role: "user" | "model"; content: string }[], message: string): Promise<string> {
    // The proxy needs the history structure. We'll send it directly 
    const pdfPart = await urlToGenerativePart(fileUrl, "application/pdf");
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'generateContent', prompt: message, imagePart: pdfPart, history }
    });

    if (error || data?.error) {
        throw new Error(`Gemini Proxy Error: ${error?.message || data?.error}`);
    }

    return data.text;
}

export interface FlashcardData {
    front: string;
    back: string;
}

export async function generateFlashcards(topic: string): Promise<FlashcardData[]> {
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

    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'generateContent', prompt }
    });

    if (error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
            throw new Error("Gemini Model not found. Please check API Key.");
        }
        throw new Error("Failed to generate flashcards.");
    }

    if (data?.error) throw new Error(data?.error);

    try {
        const textResponse = data.text;
        const cleanedJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedJson);
    } catch (e: any) {
        console.error("Failed to parse flashcards JSON", e);
        throw new Error("Failed to generate flashcards. Please try a more specific topic.");
    }
}

