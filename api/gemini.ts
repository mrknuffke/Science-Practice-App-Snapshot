import { GoogleGenAI } from "@google/genai";
import { verifySession } from "../utils/jwt";
import { DEFAULT_MODEL } from "../services/ai/core";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    // --- SECURITY CHECK (GOOGLE OAUTH SESSION) ---
    const authSecret = process.env.AUTH_SECRET;
    const sessionHeader = req.headers.get('x-oauth-session');

    // Always enforced. This used to be skipped when the Host header contained
    // "localhost", which a deployment URL can (a preview for a branch named
    // "localhost-*"), opening the Gemini proxy to anyone. Local `npm run dev`
    // never reaches this file: vite.config.ts serves /api/gemini itself, with the
    // same real check.
    if (!authSecret || !sessionHeader || !(await verifySession(sessionHeader, authSecret))) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Please sign in again' }), { status: 401 });
    }

    const { model, contents, config } = await req.json();

    // Initialize GoogleGenAI with the key from the SERVER environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing API Key' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use generateContentStream instead of generateContent
    // This allows us to send chunks back immediately, preventing Vercel timeouts
    const geminiStream = await ai.models.generateContentStream({
      model: model || DEFAULT_MODEL,
      contents: contents,
      config: config
    });

    // Create a ReadableStream to pipe the text chunks to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of geminiStream) {
            // chunk is a GenerateContentResponse object
            // The .text property is a getter that extracts the text
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (e) {
          console.error("Streaming error", e);
          controller.error(e);
        }
      },
    });

    // Return the stream as text/plain
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('Gemini API Setup Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error && error.message ? error.message : 'Internal Server Error' }), { status: 500 });
  }
}
