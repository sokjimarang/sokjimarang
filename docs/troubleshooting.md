# Troubleshooting Guide

이 문서는 개발 중 자주 발생하는 문제와 해결 방법을 정리합니다.

## 테스트 관련

### Vitest: ESM 호환성 오류

**증상:**
```
Error: require() of ES Module... not supported
html-encoding-sniffer 관련 에러
```

**원인:**
jsdom이 ESM 호환성 문제를 가지고 있음

**해결:**
vitest.config.mts에서 environment를 `happy-dom`으로 변경:
```typescript
export default defineConfig({
  test: {
    environment: 'happy-dom',
    // ...
  },
})
```

### Vitest: Store 테스트에서 DOM 불필요

**문제:**
Store나 lib 테스트에서 불필요하게 DOM 환경 로드

**해결:**
`environmentMatchGlobs`를 사용하여 특정 경로에 다른 환경 적용:
```typescript
test: {
  environmentMatchGlobs: [
    ['src/__tests__/stores/**', 'node'],
    ['src/__tests__/lib/**', 'node'],
  ],
}
```

### Playwright: 브라우저 미설치

**증상:**
```
browserType.launch: Executable doesn't exist
```

**해결:**
```bash
pnpm exec playwright install chromium
```

## React 관련

### ESLint: Effect 내 동기 setState 에러

**증상:**
```
Error: Calling setState synchronously within an effect can trigger cascading renders
```

**문제 코드:**
```typescript
useEffect(() => {
  if (!isAiSpeaking) {
    setAudioBarHeights(Array(12).fill(16)) // 에러!
  }
}, [isAiSpeaking])
```

**해결:**
1. CSS 애니메이션으로 대체
2. 또는 interval 콜백 내에서만 setState 호출

### ESLint: 렌더링 중 불순 함수 호출

**증상:**
```
Error: Cannot call impure function during render
```

**문제 코드:**
```tsx
<div style={{ height: `${Math.random() * 24}px` }} />
```

**해결:**
useState와 useEffect로 랜덤 값을 미리 계산:
```typescript
const [heights, setHeights] = useState<number[]>([])

useEffect(() => {
  const interval = setInterval(() => {
    setHeights(Array(12).fill(0).map(() => Math.random() * 24 + 8))
  }, 100)
  return () => clearInterval(interval)
}, [])
```

## TypeScript 관련

### 타입 단언 에러

**증상:**
```
Argument of type '... | undefined' is not assignable to parameter of type '...'
```

**해결:**
명시적 union type 단언 사용:
```typescript
// 문제
setAgeGroup(e.target.value as typeof context.age_group)

// 해결
setAgeGroup(e.target.value as 'under50' | '50s' | '60s' | '70plus')
```

## Zustand 관련

### Persist 미들웨어 타입 에러

**해결:**
`partialize` 옵션으로 저장할 필드만 지정:
```typescript
persist(
  (set) => ({...}),
  {
    name: 'storage-key',
    partialize: (state) => ({
      sessions: state.sessions,
      selectedScenario: state.selectedScenario,
    }),
  }
)
```

## 빌드 관련

### Chunk 크기 경고

**증상:**
```
Some chunks are larger than 500 kB after minification
```

**대응:**
현재는 무시 가능. 필요시 다음 옵션 고려:
1. Dynamic import로 코드 스플리팅
2. `build.rollupOptions.output.manualChunks` 설정
3. `build.chunkSizeWarningLimit` 조정

## 환경 설정

### ElevenLabs 연결 실패

**원인:**
- VITE_ELEVENLABS_AGENT_ID 미설정
- VITE_SUPABASE_URL 미설정
- Signed URL 발급 실패

**확인:**
1. `.env.local` 파일에 환경변수 설정 확인
2. 브라우저 개발자 도구 > Network 탭에서 `elevenlabs-get-signed-url` 요청 확인
3. ElevenLabs 대시보드에서 Agent 상태 확인 (Error 상태 아닌지)

**해결:**
1. `pnpm agent:update`로 에이전트 설정 동기화
2. Supabase Edge Function 로그 확인

### ElevenLabs Agent Error 상태

**증상:**
ElevenLabs 대시보드에서 Agent가 "Error" 상태로 표시됨

**원인:**
- 프롬프트 설정 오류
- Conversation Config 유효성 검사 실패

**해결:**
```bash
# 로컬 설정으로 에이전트 업데이트
pnpm agent:update
```

### ElevenLabs 음성 지연

**증상:**
AI 응답이 너무 느림 (300ms 이상)

**확인:**
1. 네트워크 연결 상태 확인
2. WebRTC 연결 여부 확인 (WebSocket보다 빠름)

**최적화:**
- `connectionType: "webrtc"` 사용 권장
- [지연시간 최적화 가이드](https://elevenlabs.io/docs/best-practices/latency-optimization) 참고

### Web Speech API 미지원

**증상:**
디브리핑 음성이 재생되지 않음

**원인:**
- 브라우저가 Web Speech API 미지원
- HTTPS가 아닌 환경

**대응:**
자동으로 화면 디브리핑으로 전환됨 (graceful degradation)
