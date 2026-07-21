import type { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { text } = JSON.parse(event.body || "{}");

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No text provided" }),
      };
    }

    // Read the key ONLY from environment variables — never hardcode a real key here.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      };
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
        const isRetryable =
          error?.status === 503 ||
          error?.status === "UNAVAILABLE" ||
          error?.message?.includes("503") ||
          error?.message?.includes("high demand");

        if (isRetryable) {
          retries--;
          if (retries === 0) {
            throw new Error(
              "The AI model is currently experiencing high demand. Please try again in a few moments."
            );
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          throw error;
        }
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: response!.text }),
    };
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Failed to process text" }),
    };
  }
};
