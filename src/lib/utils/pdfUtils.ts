
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from '@/lib/supabase/client';

// Use local worker to avoid CDN/Version issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export async function extractTextFromPDF(url: string, maxPages = 5): Promise<string> {
    let sdkErrorMessage = '';

    try {
        console.log(`[PDF] Starting extraction for: ${url}`);
        let arrayBuffer: ArrayBuffer | null = null;

        // --- STRATEGY 1: SUPABASE SDK DOWNLOAD ---
        // This is the preferred method as it uses auth headers
        try {
            let path = '';
            // Extract path from URL (e.g., .../resources/folder/file.pdf -> folder/file.pdf)
            if (url.includes('/resources/')) {
                const parts = url.split('/resources/');
                if (parts.length > 1) {
                    path = parts[1].split('?')[0]; // Remove query params like ?t=...
                    path = decodeURIComponent(path); // Handle spaces/special chars
                }
            }

            if (path) {
                console.log(`[PDF] Attempting SDK download for path: ${path}`);
                const { data, error } = await supabase.storage
                    .from('resources')
                    .download(path);

                if (error) {
                    console.error("SDK Download Error:", error);
                    sdkErrorMessage = `SDK Error: ${error.message}`;
                    throw error;
                }
                if (!data) throw new Error("No data received from download");

                arrayBuffer = await data.arrayBuffer();
            } else {
                console.log("[PDF] Not a recognized '/resources/' path, skipping SDK.");
            }
        } catch (e: any) {
            console.warn("[PDF] SDK strategy failed:", e);
            // We continue to Strategy 2, but keep the error message
            if (!sdkErrorMessage) sdkErrorMessage = e.message;
        }

        // --- STRATEGY 2: DIRECT FETCH (Fallback) ---
        if (!arrayBuffer) {
            console.log("[PDF] Falling back to direct fetch...");
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
                }
                const blob = await response.blob();
                arrayBuffer = await blob.arrayBuffer();
            } catch (fetchError: any) {
                // If both failed, throw a combined error
                throw new Error(`Download failed. ${sdkErrorMessage ? 'Method A: ' + sdkErrorMessage : ''}. Method B: ${fetchError.message}`);
            }
        }

        // --- PARSING ---
        if (!arrayBuffer) throw new Error("Could not acquire file data.");

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';
        const numPages = Math.min(pdf.numPages, maxPages);

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText;

    } catch (error: any) {
        console.error("Error extracting PDF text:", error);

        // Pass the specific error up to the UI
        throw new Error(error.message || "Unknown PDF processing error");
    }
}
