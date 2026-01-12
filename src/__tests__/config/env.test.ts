import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("env.ts - 환경변수 검증", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("모든 필수 환경변수가 있을 때 정상적으로 파싱해야 함", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.VAPI_PRIVATE_KEY = "test-vapi-private";
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY = "test-vapi-public";
    process.env.WEBHOOK_SECRET = "test-secret";
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";

    const { env } = await import("@/config/env");

    expect(env.GEMINI_API_KEY).toBe("test-gemini-key");
    expect(env.VAPI_PRIVATE_KEY).toBe("test-vapi-private");
    expect(env.NEXT_PUBLIC_BASE_URL).toBe("https://example.com");
  });

  it("GEMINI_API_KEY가 없으면 에러를 던져야 함", async () => {
    process.env.VAPI_PRIVATE_KEY = "test";
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY = "test";
    process.env.WEBHOOK_SECRET = "test";
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";
    delete process.env.GEMINI_API_KEY;

    await expect(import("@/config/env")).rejects.toThrow();
  });

  it("NEXT_PUBLIC_BASE_URL이 유효하지 않은 URL이면 에러를 던져야 함", async () => {
    process.env.GEMINI_API_KEY = "test";
    process.env.VAPI_PRIVATE_KEY = "test";
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY = "test";
    process.env.WEBHOOK_SECRET = "test";
    process.env.NEXT_PUBLIC_BASE_URL = "not-a-valid-url";

    await expect(import("@/config/env")).rejects.toThrow();
  });

  it("VAPI_PHONE_NUMBER_ID는 선택적이어야 함", async () => {
    process.env.GEMINI_API_KEY = "test";
    process.env.VAPI_PRIVATE_KEY = "test";
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY = "test";
    process.env.WEBHOOK_SECRET = "test";
    process.env.NEXT_PUBLIC_BASE_URL = "https://example.com";
    delete process.env.VAPI_PHONE_NUMBER_ID;

    const { env } = await import("@/config/env");
    expect(env.VAPI_PHONE_NUMBER_ID).toBeUndefined();
  });
});
