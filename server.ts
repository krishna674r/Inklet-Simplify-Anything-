import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use large body limit for pasted text and files
  app.use(express.json({ limit: '10mb' }));

  // API route for Gemini
  app.post("/api/explain", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6ITKGhYYrF5QIAdmn2lMcfY8tgzw65owFArsaLmsWx8TQ";
      if (!apiKey) {
        return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert at simplifying complex text. Break down the following text into plain, easy-to-understand English.

Structure your response EXACTLY with these four markdown headers:
## Summary
## Key points
## Watch out for
## Bottom line

Keep it concise and clear, no jargon. Use bullet points under the headers where appropriate.

Text to explain:
"""
${text}
"""`;

      let response;
      let retries = 3;
      let delay = 1000;

      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
          });
          break;
        } catch (error: any) {
          if (
            error?.status === 503 || 
            error?.status === "UNAVAILABLE" || 
            error?.message?.includes("503") || 
            error?.message?.includes("high demand")
          ) {
            retries--;
            if (retries === 0) {
              throw new Error("The AI model is currently experiencing high demand. Please try again in a few moments.");
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            throw error;
          }
        }
      }

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: error.message || "Failed to process text" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler to ensure JSON responses for all API errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/')) {
      console.error('API Error:', err);
      res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    } else {
      next(err);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
