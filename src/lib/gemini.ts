export type GeminiResponse = {
  text: string;
  raw: unknown;
};

const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 3000]; // ms between retries
const REQUEST_TIMEOUT = 30000; // 30 seconds

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGemini(
  params: { systemInstruction?: string; userPrompt: string },
  apiKey: string,
  model: string
): Promise<GeminiResponse> {
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }
  if (!params.userPrompt.trim()) {
    throw new Error("User prompt cannot be empty");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const body = JSON.stringify({
    contents: [
      {
        role: "user",
        parts: [{ text: params.userPrompt }],
      },
    ],
    systemInstruction: params.systemInstruction
      ? {
          parts: [{ text: params.systemInstruction }],
        }
      : undefined,
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 2048,
    },
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
          lastError = new Error(`Gemini API error ${response.status}: ${errorText}`);
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts;
      const text = Array.isArray(parts)
        ? parts.map((part: { text?: string }) => part.text || "").join("")
        : "";

      return { text, raw: data };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = new Error(`Gemini API request timed out after ${REQUEST_TIMEOUT}ms`);
      } else if (error instanceof Error) {
        lastError = error;
      } else {
        lastError = new Error("Unknown error calling Gemini API");
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAYS[attempt]);
        continue;
      }
    }
  }

  throw lastError || new Error("Gemini API call failed after retries");
}
