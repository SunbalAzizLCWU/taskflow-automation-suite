// Groq AI client. Uses Groq's OpenAI-compatible chat completions API.
// Free key: https://console.groq.com . Set GROQ_API_KEY in the environment.
// Uses Node 20+ global fetch; no SDK dependency.

import { ApiError } from '../utils/ApiError.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// A fast, free, generally-available Groq model. Override with GROQ_MODEL.
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

// Low-level call. messages is an array of { role, content }.
// Returns the assistant message content string.
export async function groqChat(messages, { temperature = 0.2, json = false } = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ApiError(503, 'AI is not configured (GROQ_API_KEY missing)');
  }
  const body = {
    model: process.env.GROQ_MODEL || DEFAULT_MODEL,
    messages,
    temperature,
  };
  // Ask Groq to constrain output to valid JSON when we need structured data.
  if (json) body.response_format = { type: 'json_object' };

  let res;
  try {
    res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(502, `Could not reach AI provider: ${err.message}`);
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    // 429 = rate limited on the free tier; surface it clearly.
    if (res.status === 429) {
      throw new ApiError(429, 'AI rate limit reached, please retry shortly');
    }
    throw new ApiError(502, `AI provider error ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new ApiError(502, 'AI returned an empty response');
  }
  return content;
}

// Safely parse a JSON string the model produced. Strips markdown code fences
// that some models add despite json mode, and throws a clean error otherwise.
export function parseModelJSON(raw) {
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(502, 'AI returned malformed JSON');
  }
}
