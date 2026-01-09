import OpenAI from "openai";

/**
 * Gemini 클라이언트 (OpenAI 호환 API 사용)
 *
 * Google은 OpenAI 호환 엔드포인트를 제공하므로,
 * openai SDK를 그대로 사용하여 Gemini를 호출할 수 있습니다.
 *
 * @see https://ai.google.dev/gemini-api/docs/openai
 */
export function createGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  return new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
}

export const GEMINI_MODEL = "gemini-2.0-flash";
