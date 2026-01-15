# ElevenLabs Conversational AI Agent 기술 스펙

> 보이스피싱 예방 교육을 위한 검찰 사칭 시나리오 시뮬레이션 에이전트

---

## 1. 개요

### 1.1 목적
- 보이스피싱 예방 교육용 AI 시뮬레이션
- 검찰 사칭형 보이스피싱 패턴 체험
- 사용자의 대응 능력 향상

### 1.2 플랫폼
- **Provider**: ElevenLabs Conversational AI
- **SDK**: `@elevenlabs/elevenlabs-js`
- **Backend**: Supabase Edge Functions

### 1.3 시나리오
| 항목 | 값 |
|------|-----|
| 시나리오 타입 | `prosecutor` (검찰 사칭형) |
| 노드 수 | 14개 (stage 5 + persuade 5 + end 3 + start 1) |
| 엣지 수 | 25개 |
| 분기 조건 | LLM Condition (자연어 기반) |

---

## 2. 에이전트 설정

### 2.1 기본 설정
| 항목 | 값 | 비고 |
|------|-----|------|
| agent_id | `agent_8701kevwbv8sf8c9f24ky04nd2qm` | 환경변수: `VITE_ELEVENLABS_AGENT_ID` |
| LLM | `gpt-4o` | conversation_config에 명시 필요 |
| Voice | `nPczCjzI2devNBz1zQrb` | Brian (영어/한국어 지원) |
| TTS Model | `eleven_turbo_v2_5` | 한국어 필수 (turbo/flash v2_5만 지원) |
| ASR | `elevenlabs` + `ko` | 한국어 음성 인식 |

### 2.2 conversation_config
```typescript
{
  tts: {
    voice_id: 'nPczCjzI2devNBz1zQrb',
    model_id: 'eleven_turbo_v2_5',
    optimize_streaming_latency: 3,
  },
  asr: {
    provider: 'elevenlabs',
    language: 'ko',
  },
  agent: {
    prompt: {
      llm: 'gemini-3-flash-preview',       // ⚠️ 필수 필드
      prompt: BASE_SYSTEM_PROMPT,
    },
    first_message: FIRST_MESSAGE,
    language: 'ko',
  },
}
```

> **⚠️ 주의사항**
> - `agent.prompt.llm` 필드는 **필수**입니다. 누락 시 API 에러 발생
> - 한국어 에이전트는 `eleven_turbo_v2_5` 또는 `eleven_flash_v2_5` TTS 모델만 지원

---

## 3. 워크플로우 구조

### 3.1 노드 다이어그램

> **⚠️ 중요**: 노드 ID로 `"start"`는 사용 불가 (ElevenLabs API 예약어)
> 반드시 `"start_node"` 등 다른 이름 사용

```
┌────────────┐
│ start_node │
└─────┬──────┘
     │
     ▼
┌────────────────┐    의심     ┌────────────────┐
│ stage1_contact │ ─────────▶ │ persuade1_soft │
└───────┬────────┘            └───────┬────────┘
        │ 순응                        │
        ▼                             │ 재설득 성공
┌────────────────┐    의심     ┌─────────────────────┐
│  stage2_fear   │ ─────────▶ │ persuade2_reassure  │
└───────┬────────┘            └─────────┬───────────┘
        │ 순응                          │
        ▼                               │
┌─────────────────┐    의심    ┌──────────────────────┐
│ stage3_isolate  │ ────────▶ │ persuade3_aggressive │
└───────┬─────────┘           └──────────┬───────────┘
        │ 순응                           │
        ▼                                │
┌─────────────────┐    의심    ┌────────────────────┐
│ stage4_action   │ ────────▶ │  persuade4_legal   │
└───────┬─────────┘           └─────────┬──────────┘
        │ 순응                          │
        ▼                               │
┌─────────────────┐    의심    ┌────────────────────┐
│ stage5_transfer │ ────────▶ │  persuade5_final   │
└───────┬─────────┘           └─────────┬──────────┘
        │                               │
        │                               │
        │       ┌──────────────────┐    │
        │       │   end_rejected   │◀───┼── (거부 시)
        │       └──────────────────┘    │
        │       ┌──────────────────┐    │
        └─────▶ │   end_fooled     │◀───┘ (완전히 속음)
                └──────────────────┘
                ┌──────────────────┐
                │  end_suspected   │◀── (의심 유지)
                └──────────────────┘
```

### 3.2 노드 역할

| 노드 | 타입 | 역할 |
|------|------|------|
| `start_node` | start | 대화 시작점 (⚠️ "start" ID 사용 불가) |
| `stage1_contact` | override_agent | 접촉 및 신뢰 구축 |
| `stage2_fear` | override_agent | 공포 유발 |
| `stage3_isolate` | override_agent | 고립 유도 |
| `stage4_action` | override_agent | 행동 유도 |
| `stage5_transfer` | override_agent | 자산 이전 요구 |
| `persuade1~5` | override_agent | 의심 대응 설득 |
| `end_rejected` | end | 거부로 종료 (교육 성공) |
| `end_suspected` | end | 의심 유지로 종료 |
| `end_fooled` | end | 완전히 속음 (교육 필요) |

### 3.3 분기 조건 (LLM Condition)

각 stage 노드에서 3방향 분기:
1. **순응** → 다음 stage로 진행
2. **의심** → 해당 persuade 노드로 이동
3. **거부** → end_rejected로 종료

예시 (stage1):
```typescript
// 순응
'사용자가 질문에 답하거나, 협조적인 태도를 보이거나, 무슨 일인지 물어봄'

// 의심
'사용자가 "정말 검찰이에요?", "사기 아니에요?" 등 의심을 표현하지만 아직 끊겠다고 하지는 않음'

// 거부
'사용자가 "끊을게요", "112에 확인할게요" 등 명확히 거부하거나 외부 확인 의사를 밝힘'
```

---

## 4. Dynamic Variables (컨텍스트 주입)

### 4.1 지원 변수

| 변수명 | 타입 | 설명 | 예시 값 |
|--------|------|------|---------|
| `{{age_group}}` | string | 연령대 | "50대", "60대", "70대 이상" |
| `{{region}}` | string | 거주 지역 | "서울", "경기", "기타 지역" |
| `{{children}}` | string | 자녀 수 | "0", "1", "2" |
| `{{grandchildren}}` | string | 손주 수 | "0", "1", "2" |

### 4.2 프롬프트에서 사용

```
# 대상 정보
- 연령대: {{age_group}}
- 거주 지역: {{region}}
- 자녀 수: {{children}}명
- 손주 수: {{grandchildren}}명

# 호칭 규칙
- 70대 이상이거나 손주가 있으면: "어르신"
- 그 외: "고객님"
```

### 4.3 클라이언트 코드

```typescript
import { startConversationWithContext } from '@/lib/elevenlabs'

const conversation = await startConversationWithContext({
  signedUrl,
  userContext: {
    age_group: '60s',
    region: 'seoul',
    children: 2,
    grandchildren: 1,
  },
})
```

---

## 5. API 연동

### 5.1 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        ElevenLabs API                           │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ xi-api-key (서버만)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Supabase Edge Functions                       │
│  ┌─────────────────────┐    ┌─────────────────────────────┐     │
│  │ elevenlabs-create-  │    │ elevenlabs-get-signed-url   │     │
│  │ agent (관리용)      │    │ (대화 시작용)                │     │
│  └─────────────────────┘    └─────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ Supabase Auth JWT
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   React Client                                   │
│  - useSignedUrl 훅으로 Signed URL 획득                          │
│  - startConversationWithContext로 대화 시작                      │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Signed URL 발급 Flow

```typescript
// 1. 훅 초기화
const { fetchSignedUrl } = useSignedUrl(AGENT_ID)

// 2. 대화 시작 전 Signed URL 획득
const signedUrl = await fetchSignedUrl()

// 3. 대화 연결
const conversation = await startConversationWithContext({
  signedUrl,
  userContext,
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected'),
})

// 4. 대화 종료
await endConversation(conversation)
```

### 5.3 Signed URL 특성

| 항목 | 값 |
|------|-----|
| 유효 시간 | 15분 |
| 사용 횟수 | 1회성 |
| 캐싱 | 10분 (여유 확보) |
| 인증 | Supabase Auth JWT 필요 |

---

## 6. 환경 변수

### 6.1 Supabase Secrets (Edge Functions)
```bash
# 설정 방법
supabase secrets set ELEVENLABS_API_KEY=xi-xxxxx
```

| 변수 | 용도 |
|------|------|
| `ELEVENLABS_API_KEY` | ElevenLabs API 인증 |

### 6.2 클라이언트 환경변수 (.env.local)
```env
VITE_ELEVENLABS_AGENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## 7. 파일 구조

```
src/lib/elevenlabs/
├── index.ts                     # 모듈 진입점
├── conversation.ts              # 대화 시작/종료 + Dynamic Variables
├── types.ts                     # 워크플로우 타입 정의
├── hooks/
│   ├── index.ts
│   └── useSignedUrl.ts          # Signed URL 캐싱 훅
└── agents/
    └── prosecutor/              # 검찰 사칭 시나리오
        ├── index.ts             # 에이전트 생성 함수
        ├── config.ts            # conversation_config
        ├── workflow.ts          # 노드 & 엣지 정의 (14개 노드, 25개 엣지)
        └── prompts/
            ├── base.ts          # 공통 시스템 프롬프트
            ├── stages.ts        # stage1~5 프롬프트
            ├── persuades.ts     # persuade1~5 프롬프트
            └── endings.ts       # end 노드 프롬프트

supabase/functions/
├── elevenlabs-create-agent/     # 에이전트 생성 (관리용, 1회성)
└── elevenlabs-get-signed-url/   # Signed URL 발급 (클라이언트용)
```

---

## 8. 에러 처리

### 8.1 일반적인 에러

| 에러 | 원인 | 해결 |
|------|------|------|
| `Unauthorized` | JWT 없음/만료 | 로그인 필요 |
| `ELEVENLABS_API_KEY not configured` | 환경변수 누락 | Supabase secrets 설정 |
| `Signed URL 획득 실패` | 네트워크/인증 오류 | 재시도 |

### 8.2 대화 중 에러

```typescript
const conversation = await startConversationWithContext({
  signedUrl,
  userContext,
  onError: (error) => {
    console.error('Conversation error:', error)
    // 사용자에게 알림
  },
})
```

---

## 9. 테스트 체크리스트

### 9.1 에이전트 생성
- [x] 스크립트 `pnpm tsx scripts/create-elevenlabs-agent.ts` 실행 성공
- [x] agent_id 반환 확인: `agent_8701kevwbv8sf8c9f24ky04nd2qm`
- [x] ElevenLabs 대시보드에서 에이전트 확인

### 9.2 대화 연결
- [ ] Signed URL 발급 성공
- [ ] WebSocket 연결 성공
- [ ] 첫 메시지 수신 확인

### 9.3 워크플로우 분기
- [ ] **순응 경로**: stage1 → stage2 → ... → stage5 → end_fooled
- [ ] **의심 경로**: stage → persuade → (재설득 성공) → 다음 stage
- [ ] **거부 경로**: stage → end_rejected

### 9.4 Dynamic Variables
- [ ] `{{age_group}}` 치환 확인
- [ ] `{{region}}` 치환 확인
- [ ] `{{children}}` 치환 확인
- [ ] `{{grandchildren}}` 치환 확인

### 9.5 종료 조건
- [ ] `end_rejected`: 사용자가 명확히 거부 시
- [ ] `end_suspected`: 의심 유지로 설득 실패 시
- [ ] `end_fooled`: 사용자가 완전히 속아 이체 의사 표명 시

---

## 10. API 에러 해결 가이드

### 10.1 "Workflow must contain a start node" (422)

**원인**: 노드 ID로 `"start"`를 사용함

**해결**: 노드 ID를 `"start_node"` 등 다른 이름으로 변경

```typescript
// ❌ 잘못된 예
nodes: {
  start: { type: 'start', ... }
}

// ✅ 올바른 예
nodes: {
  start_node: { type: 'start', ... }
}
```

### 10.2 "Non-english Agents must use turbo or flash v2_5" (400)

**원인**: 한국어 에이전트에 `eleven_turbo_v2` 등 구버전 TTS 모델 사용

**해결**: `model_id`를 `eleven_turbo_v2_5` 또는 `eleven_flash_v2_5`로 변경

```typescript
tts: {
  voice_id: 'nPczCjzI2devNBz1zQrb',
  model_id: 'eleven_turbo_v2_5',  // ✅ v2_5 필수
}
```

### 10.3 "llm field required" 또는 validation error

**원인**: `conversation_config.agent.prompt`에 `llm` 필드 누락

**해결**: `llm` 필드 추가

```typescript
agent: {
  prompt: {
    llm: 'gpt-4o',  // ✅ 필수
    prompt: BASE_SYSTEM_PROMPT,
  },
}
```

---

## 11. 참고 자료

- [ElevenLabs Create Agent API](https://elevenlabs.io/docs/api-reference/agents/create)
- [ElevenLabs TypeScript SDK](https://elevenlabs.io/docs/agents-platform/libraries/java-script)
- [Agent Workflows 문서](https://elevenlabs.io/docs/agents-platform/customization/agent-workflows)
- [Dynamic Variables 문서](https://elevenlabs.io/docs/agents-platform/customization/personalization/dynamic-variables)
- [설계 문서](docs/references/elevenlabs-conversation-agent-plan.md)
