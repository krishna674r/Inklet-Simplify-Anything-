import { GoogleGenAI } from "@google/genai";

export default async (req: Request) => {
  // Only allow POST
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { text } = await req.json().catch(() => ({}));

    if (!text) {
      return Response.json({ error: "No text provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    // Zero-config: the SDK auto-detects GEMINI_API_KEY and the AI Gateway base URL
    // from environment variables. Passing apiKey explicitly would bypass the gateway
    // base URL and send the gateway credential straight to Google's API, which rejects it.
    const ai = new GoogleGenAI({});

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

    return Response.json({ result: response!.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return Response.json(
      { error: error.message || "Failed to process text" },
      { status: 500 }
    );
  }
};
