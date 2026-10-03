// Talks to Groq's free, fast API. Function names/signatures are unchanged
// so every route that imports from "@/lib/anthropic" keeps working without
// any other edits.

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
export const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

async function groqChat(params: {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  json?: boolean;
  model?: string;
}): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to your .env file (get a free key at console.groq.com)."
    );
  }

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: params.model || MODEL,
      messages: [{ role: "system", content: params.system }, ...params.messages],
      // This model family uses max_completion_tokens, not max_tokens.
      max_completion_tokens: params.maxTokens ?? 2048,
      // Keep reasoning light so the token budget goes to the actual answer,
      // not invisible "thinking" — this is what truncated the Gemini JSON
      // earlier, and gpt-oss-120b has the same kind of internal reasoning.
      reasoning_effort: "low",
      ...(params.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Groq API error (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

export async function askClaudeForJson<T = unknown>(params: {
  system: string;
  user: string;
  maxTokens?: number;
  model?: string;
}): Promise<T> {
  const raw = await groqChat({
    system: `${params.system}\n\nCRITICAL: Respond with ONLY valid JSON. No markdown fences, no preamble, no commentary before or after the JSON.`,
    messages: [{ role: "user", content: params.user }],
    maxTokens: params.maxTokens,
    model: params.model,
    json: true,
  });

  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Groq did not return valid JSON. Raw response: ${cleaned.slice(0, 500)}`);
  }
}

export async function askClaude(params: {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  return groqChat({
    system: params.system,
    messages: params.messages,
    maxTokens: params.maxTokens,
    model: params.model,
  });
}