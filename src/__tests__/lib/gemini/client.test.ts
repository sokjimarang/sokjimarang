import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Gemini Client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("createGeminiClient", () => {
    it("GEMINI_API_KEY가 있으면 OpenAI 클라이언트를 반환해야 함", async () => {
      process.env.GEMINI_API_KEY = "test-api-key";

      const { createGeminiClient } = await import("@/lib/gemini/client");
      const client = createGeminiClient();

      expect(client).toBeDefined();
      expect(client.chat).toBeDefined();
      expect(client.chat.completions).toBeDefined();
    });

    it("GEMINI_API_KEY가 없으면 에러를 던져야 함", async () => {
      delete process.env.GEMINI_API_KEY;

      const { createGeminiClient } = await import("@/lib/gemini/client");

      expect(() => createGeminiClient()).toThrow("GEMINI_API_KEY is not set");
    });
  });

  describe("GEMINI_MODEL", () => {
    it("올바른 모델 이름을 export해야 함", async () => {
      process.env.GEMINI_API_KEY = "test";

      const { GEMINI_MODEL } = await import("@/lib/gemini/client");

      expect(GEMINI_MODEL).toBe("gemini-2.0-flash");
    });
  });
});
