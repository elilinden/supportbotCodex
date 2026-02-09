export type GeminiResponse = {
  text: string;
  raw: unknown;
};

export async function callGemini(
  params: { systemInstruction?: string; userPrompt: string },
  apiKey: string,
  model: string
): Promise<GeminiResponse> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: params.userPrompt }]
          }
        ],
        systemInstruction: params.systemInstruction
          ? {
              parts: [{ text: params.systemInstruction }]
            }
          : undefined,
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 1200
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts.map((part: { text?: string }) => part.text || "").join("")
    : "";

  return { text, raw: data };
}
