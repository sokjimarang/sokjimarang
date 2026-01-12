# 테스트 가이드

## 개요

sokjimarang-2 프로젝트는 **Vitest** 기반의 테스트 환경을 사용합니다. API 통합 테스트를 중심으로, 외부 서비스(Gemini API 등)는 **MSW(Mock Service Worker)**로 모킹합니다.

---

## 테스트 스택

| 기술 | 버전 | 역할 | 선택 이유 |
|------|------|------|----------|
| **Vitest** | 4.x | 테스트 프레임워크 | ESM 네이티브 지원, 빠른 실행 속도 |
| **@vitest/coverage-v8** | 4.x | 커버리지 | V8 기반 정확한 커버리지 측정 |
| **MSW** | 2.x | API 모킹 | 네트워크 레벨 모킹, 실제 요청과 동일한 테스트 |
| **@edge-runtime/vm** | 5.x | Edge Runtime | Next.js Edge Runtime 환경 시뮬레이션 |

---

## 명령어

```bash
# 테스트 실행 (watch 모드)
pnpm test

# 테스트 1회 실행
pnpm test:run

# 커버리지 리포트 생성
pnpm test:coverage

# 파일 변경 감지 모드
pnpm test:watch
```

---

## 테스트 구조

```
sokjimarang-2/
├── vitest.config.mts           # Vitest 설정
├── vitest.setup.mts            # 전역 테스트 설정 (MSW 서버)
└── src/
    └── __tests__/
        ├── setup/
        │   └── msw-handlers.ts # MSW 핸들러 정의
        ├── api/
        │   ├── custom-llm.test.ts      # Custom LLM API 테스트
        │   └── vapi-webhook.test.ts    # Vapi Webhook 테스트
        ├── config/
        │   └── env.test.ts             # 환경변수 검증 테스트
        └── lib/
            └── gemini/
                └── client.test.ts      # Gemini 클라이언트 테스트
```

---

## 테스트 현황

### API 테스트

| 테스트 파일 | 테스트 케이스 | 설명 |
|------------|--------------|------|
| `custom-llm.test.ts` | 6개 (+ 1 skip) | LLM 응답, SSE 스트리밍, 에러 처리 |
| `vapi-webhook.test.ts` | 6개 | 이벤트 타입별 처리 (status-update, transcript 등) |

### 유닛 테스트

| 테스트 파일 | 테스트 케이스 | 설명 |
|------------|--------------|------|
| `env.test.ts` | 4개 | Zod 환경변수 검증 |
| `client.test.ts` | 3개 | Gemini 클라이언트 팩토리 |

---

## MSW 모킹

### MSW란?

MSW(Mock Service Worker)는 **네트워크 레벨**에서 API를 가로채 모킹합니다. 테스트 코드에서 실제 `fetch`를 사용해도 MSW가 응답을 대신 반환합니다.

```
실제 환경:     fetch() → 네트워크 → Gemini API → 응답
테스트 환경:   fetch() → MSW 가로채기 → 모킹된 응답
```

### 핸들러 정의

```typescript
// src/__tests__/setup/msw-handlers.ts
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const geminiHandlers = [
  http.post(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    async ({ request }) => {
      const body = await request.json();

      // 스트리밍 응답
      if (body.stream) {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        });
        return new HttpResponse(stream, {
          headers: { "Content-Type": "text/event-stream" },
        });
      }

      // 일반 응답
      return HttpResponse.json({
        choices: [{ message: { content: "모킹된 응답" } }],
      });
    }
  ),
];

export const server = setupServer(...geminiHandlers);
```

### 에러 핸들러 교체

특정 테스트에서 에러 응답을 테스트하려면:

```typescript
import { server, geminiErrorHandler } from "../setup/msw-handlers";

it("API 에러 시 500 응답을 반환해야 함", async () => {
  server.use(geminiErrorHandler); // 일시적으로 핸들러 교체
  // 테스트 코드...
});
// afterEach에서 server.resetHandlers()로 원래 핸들러 복원
```

---

## 테스트 작성 가이드

### 환경변수 격리

환경변수를 테스트할 때는 모듈 캐시를 초기화해야 합니다:

```typescript
import { vi, beforeEach, afterEach } from "vitest";

describe("env.ts", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules(); // 모듈 캐시 초기화
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("GEMINI_API_KEY가 없으면 에러", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(import("@/config/env")).rejects.toThrow();
  });
});
```

### API 라우트 테스트

Next.js App Router의 API 라우트를 직접 import해서 테스트:

```typescript
import { POST } from "@/app/api/vapi/webhook/route";
import { NextRequest } from "next/server";

it("status-update 이벤트를 처리해야 함", async () => {
  const request = new NextRequest("http://localhost/api/vapi/webhook", {
    method: "POST",
    body: JSON.stringify({
      message: { type: "status-update", status: "in-progress" },
    }),
  });

  const response = await POST(request);
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.received).toBe(true);
});
```

### SSE 스트리밍 테스트

스트리밍 응답은 ReadableStream을 읽어서 검증:

```typescript
it("스트리밍 응답에서 [DONE] 마커가 있어야 함", async () => {
  const response = await POST(streamRequest);
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullText += decoder.decode(value, { stream: true });
  }

  expect(fullText).toContain("data:");
  expect(fullText).toContain("[DONE]");
});
```

---

## 설정 파일

### vitest.config.mts

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.mts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["node_modules", ".next"],
    testTimeout: 10000,

    // 커버리지 설정
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.d.ts"],
    },

    // 테스트용 환경변수
    env: {
      GEMINI_API_KEY: "test-gemini-api-key",
      VAPI_PRIVATE_KEY: "test-vapi-private-key",
      // ...
    },
  },

  // Path alias (tsconfig.json과 동기화)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### vitest.setup.mts

```typescript
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./src/__tests__/setup/msw-handlers";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
```

---

## 주의사항

### 1. ESM 호환성

Vitest 4.x는 ESM을 필수로 요구합니다. 설정 파일은 `.mts` 확장자를 사용하세요.

### 2. Vitest 4.x 옵션 위치

Vitest 4에서는 테스트 옵션 위치가 변경되었습니다:

```typescript
// Vitest 3 (deprecated)
it("test", async () => {}, { timeout: 30000 });

// Vitest 4 (correct)
it("test", { timeout: 30000 }, async () => {});
```

### 3. OpenAI SDK 재시도

OpenAI SDK는 에러 시 내부적으로 재시도를 수행합니다. 에러 테스트에서 타임아웃이 발생할 수 있으므로, 필요 시 `maxRetries: 0` 옵션을 사용하거나 테스트를 skip 처리합니다.

### 4. Next.js 예약어

`module` 등 Next.js 예약어는 변수명으로 사용하면 ESLint 에러가 발생합니다:

```typescript
// ❌ ESLint 에러
const module = await import("@/app/api/route");

// ✅ 올바른 사용
const routeModule = await import("@/app/api/route");
```

---

## 참고 문서

- [Vitest 공식 문서](https://vitest.dev)
- [MSW 공식 문서](https://mswjs.io)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)
