# Feature: API 테스트 코드 작성 기반 세팅

## Context
sokjimarang-2 Next.js 16.1.1 프로젝트 (App Router + Edge Runtime)
- TypeScript strict mode
- pnpm@10.15.1 패키지 매니저
- Path alias: @/* -> ./src/*

## Requirements
1. Vitest 기반 테스트 환경 구축
2. API 통합 테스트 (custom-llm, vapi-webhook)
3. 유닛 테스트 (env.ts, gemini/client.ts)
4. MSW로 외부 API 모킹
5. SSE 스트리밍 응답 테스트 지원

## Implementation Plan
1. 패키지 설치 (vitest, @vitest/coverage-v8, @edge-runtime/vm, msw@^2)
2. vitest.config.ts 생성
3. vitest.setup.ts 생성
4. MSW 핸들러 생성 (src/__tests__/setup/msw-handlers.ts)
5. 환경변수 검증 테스트 작성 (env.test.ts)
6. Gemini 클라이언트 테스트 작성 (client.test.ts)
7. Vapi Webhook API 테스트 작성 (vapi-webhook.test.ts)
8. Custom LLM API 테스트 작성 (custom-llm.test.ts)
9. package.json 스크립트 추가
10. 테스트 실행 및 검증

## Tasks
- [ ] 패키지 설치
- [ ] vitest.config.ts 생성
- [ ] vitest.setup.ts 생성
- [ ] MSW 핸들러 생성
- [ ] env.test.ts 작성
- [ ] client.test.ts 작성
- [ ] vapi-webhook.test.ts 작성
- [ ] custom-llm.test.ts 작성
- [ ] package.json 스크립트 추가
- [ ] 테스트 실행 및 검증

## Technical Notes
- Vitest: ESM 네이티브 지원, 빠른 실행 속도
- MSW v2: http.post, HttpResponse 문법 사용
- 환경변수 격리: vi.resetModules() 필수

## Completion
"FEATURE_DONE" 출력
