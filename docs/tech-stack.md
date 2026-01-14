# 속지마랑 기술 스택

## 개요

속지마랑은 React + Vite 기반의 SPA(Single Page Application)로, Supabase를 백엔드로 사용하고 Cloudflare Pages에 배포됩니다.

React + Vite는 빠른 HMR과 최적화된 번들링으로 개발 생산성이 높고, 풍부한 생태계를 활용할 수 있어 선택했습니다. 백엔드는 Supabase를 사용해 Auth, Database, Storage, Edge Functions를 하나의 플랫폼에서 통합 관리합니다. 음성 AI는 ElevenLabs Conversational AI를 사용해 저지연 실시간 음성 대화를 구현합니다. ElevenLabs는 WebSocket/WebRTC 연결을 지원하며, STT, LLM, TTS를 통합 제공하여 별도의 파이프라인 구성 없이 즉시 사용할 수 있습니다. 서버리스 함수는 Supabase Edge Functions를 사용하며, ElevenLabs API 키 보호 및 Signed URL 발급을 담당합니다. 정적 호스팅은 Cloudflare Pages를 사용하는데, 무료 무제한 대역폭과 글로벌 CDN을 제공하고 Git 연동으로 자동 배포가 간편하기 때문입니다.

---

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              사용자                                      │
│                                │                                        │
│                                ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Cloudflare Pages                              │  │
│  │                    (정적 호스팅 + CDN)                            │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │              React + Vite (SPA)                            │  │  │
│  │  │              - TailwindCSS                                 │  │  │
│  │  │              - React Router                                │  │  │
│  │  │              - TanStack Query                              │  │  │
│  │  │              - @elevenlabs/client                          │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                        │
│                                ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        Supabase                                  │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐  │  │
│  │  │ PostgreSQL  │ │    Auth     │ │   Storage   │ │   Edge     │  │  │
│  │  │ (Database)  │ │ (인증/인가)  │ │ (파일저장)  │ │ Functions  │  │  │
│  │  │ + RLS       │ │             │ │             │ │ (API 보호) │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                        │
│                                ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              ElevenLabs Conversational AI                        │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │  WebSocket/WebRTC  │  Built-in LLM  │  ElevenLabs TTS      │  │  │
│  │  │  (실시간 연결)      │  (대화 처리)    │  (음성 합성)         │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 스택 상세

### Frontend

| 기술 | 버전 | 역할 | 선택 이유 |
|------|------|------|----------|
| **React** | 19.x | UI 라이브러리 | 컴포넌트 기반 개발, 대규모 생태계 |
| **Vite** | 6.x | 빌드 도구 | 빠른 HMR, 최적화된 번들링 |
| **TypeScript** | 5.x | 타입 시스템 | 타입 안정성, 개발 생산성 |
| **TailwindCSS** | 4.x | 스타일링 | 유틸리티 기반, 빠른 개발 |
| **React Router** | 7.x | 라우팅 | SPA 라우팅 표준 |
| **TanStack Query** | 5.x | 서버 상태 관리 | 캐싱, 동기화, 로딩 상태 관리 |
| **Zustand** | 5.x | 클라이언트 상태 관리 | 간단한 API, 작은 번들 사이즈 |
| **Zod** | 3.x | 스키마 검증 | 런타임 타입 검증 |

#### Zod란?

TypeScript는 **컴파일 타임**에만 타입을 검사합니다. 하지만 외부에서 들어오는 데이터(API 응답, 환경변수, 사용자 입력)는 **런타임**에 검증해야 합니다. Zod가 이 역할을 담당합니다.

```typescript
// 예시: 환경변수 검증
import { z } from 'zod';

// 1. 스키마 정의 = 데이터 형태 규칙
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_ELEVENLABS_AGENT_ID: z.string().min(1),
});

// 2. 검증 실행
const result = envSchema.safeParse(import.meta.env);

if (!result.success) {
  // ❌ 앱 시작 전에 환경변수 오류 감지
  console.error(result.error.flatten());
}

// ✅ 검증 통과 - 타입도 자동 추론됨
const env = result.data; // { VITE_SUPABASE_URL: string, ... }
```

**주요 활용처:**
- 환경변수 검증 (`src/config/env.ts`)
- API 응답 검증
- 폼 입력 검증

### Backend (Supabase)

| 서비스 | 역할 | 담당 기능 |
|--------|------|----------|
| **PostgreSQL** | 데이터베이스 | 사용자, 통화 기록, 시나리오 저장 |
| **Row Level Security** | 데이터 보안 | 사용자별 데이터 접근 제어 |
| **Auth** | 인증/인가 | 소셜 로그인, 세션 관리 |
| **Storage** | 파일 저장 | 통화 녹음, 프로필 이미지 |
| **Edge Functions** | 서버리스 | API Key 보호, 민감한 로직 처리 |

### Voice AI

| 서비스 | 역할 | 담당 기능 |
|--------|------|----------|
| **ElevenLabs Conversational AI** | 음성 AI 플랫폼 | 실시간 음성 대화 (STT + LLM + TTS 통합) |
| **@elevenlabs/client** | 클라이언트 SDK | WebSocket/WebRTC 연결, 세션 관리 |

### 배포 & 인프라

| 서비스 | 역할 | 선택 이유 |
|--------|------|----------|
| **Cloudflare Pages** | 정적 호스팅 | 무제한 대역폭, 글로벌 CDN, 무료 |
| **Cloudflare Functions** | 엣지 함수 | A/B 테스트, 엣지 로직 (선택적) |

---

## 데이터 흐름

### 1. 통화 시작 플로우

```
사용자 → React App → Supabase Edge Function → Signed URL 발급
                              ↓
              ElevenLabs Conversational AI 세션 시작
              (WebSocket 또는 WebRTC 연결)
```

### 2. 실시간 통화 플로우

```
사용자 음성 → 브라우저 마이크 → ElevenLabs (STT → LLM → TTS) → 스피커 출력
```

### 4. 인증 플로우

```
사용자 → React App → Supabase Auth → JWT 발급 → 인증된 요청
```

### 5. 데이터 조회 플로우

```
React App → Supabase Client → PostgreSQL (RLS 적용) → 본인 데이터만 반환
```

---

## 보안 설계

### API Key 보호

| Key | 저장 위치 | 노출 여부 |
|-----|----------|----------|
| `VITE_SUPABASE_URL` | 환경변수 (클라이언트) | O (공개 가능) |
| `VITE_SUPABASE_ANON_KEY` | 환경변수 (클라이언트) | O (RLS가 보호) |
| `VITE_ELEVENLABS_AGENT_ID` | 환경변수 (클라이언트) | O (Signed URL로 보호) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function 환경변수 | X (절대 노출 금지) |
| `ELEVENLABS_API_KEY` | Edge Function 환경변수 | X (절대 노출 금지) |

### 클라이언트에서 직접 호출 가능한 것

```typescript
// OK - Supabase RLS가 보호
const { data } = await supabase.from('calls').select('*');
// → RLS: auth.uid() = user_id 조건으로 본인 데이터만 조회
```

### 반드시 Edge Function 경유해야 하는 것

```typescript
// Signed URL 발급 - ElevenLabs API Key 필요
await supabase.functions.invoke('elevenlabs-get-signed-url', {
  body: { agentId }
});

// 에이전트 생성/업데이트 - ElevenLabs API Key 필요
await supabase.functions.invoke('elevenlabs-create-agent', {
  body: { config }
});
```

---

## 폴더 구조

```
sokjimarang/
├── src/
│   ├── main.tsx                 # 앱 진입점
│   ├── App.tsx                  # 루트 컴포넌트
│   ├── routes/                  # 페이지 컴포넌트
│   │   ├── index.tsx            # 홈페이지
│   │   ├── training/            # 훈련 관련 페이지
│   │   ├── history/             # 통화 기록
│   │   └── auth/                # 인증 페이지
│   ├── components/              # 재사용 컴포넌트
│   │   ├── ui/                  # 공통 UI 컴포넌트
│   │   └── training/            # 훈련 관련 컴포넌트
│   ├── lib/                     # 외부 서비스 클라이언트
│   │   ├── supabase.ts          # Supabase 클라이언트
│   │   └── elevenlabs/          # ElevenLabs 클라이언트
│   │       ├── conversation.ts  # 대화 세션 관리
│   │       ├── hooks/           # React 훅 (useSignedUrl 등)
│   │       └── agents/          # 에이전트 설정
│   │           └── prosecutor/  # 검사 사칭 시나리오
│   ├── hooks/                   # 커스텀 훅
│   ├── stores/                  # Zustand 스토어
│   └── types/                   # TypeScript 타입
│
├── supabase/
│   ├── functions/               # Edge Functions
│   │   ├── elevenlabs-get-signed-url/  # Signed URL 발급
│   │   └── elevenlabs-create-agent/    # 에이전트 생성
│   └── migrations/              # DB 마이그레이션
│
├── docs/                        # 문서
├── public/                      # 정적 파일
└── [설정 파일들]
```

---

## 환경변수

### 클라이언트 (.env.local)

```bash
# Supabase (공개 가능)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# ElevenLabs Agent ID (공개 가능 - Signed URL로 보호)
VITE_ELEVENLABS_AGENT_ID=xxx
```

### Supabase Edge Functions (비공개)

```bash
# Supabase Secrets에 저장
ELEVENLABS_API_KEY=xxx
```

---

## 추가 기술 스택 분석

### 웹앱 + React Native WebView 방식 검토

PRD에서는 React Native 앱을 명시했지만, 웹앱으로 구현 후 RN WebView로 감싸는 방식도 검토했습니다.

#### ElevenLabs SDK 지원 현황

| 패키지 | 용도 | 비고 |
|--------|------|------|
| `@elevenlabs/client` | Vanilla JS / 범용 | 브라우저 완전 지원 |
| `@11labs/react` | React 전용 훅 | 웹앱 구현에 최적 |

**결론**: ElevenLabs는 **웹 우선 설계**입니다. 공식 SDK가 JavaScript/React 기반으로, 오히려 웹앱 구현이 더 자연스러울 수 있습니다.

#### iOS 버전 호환성

| iOS 버전 | 한국 점유율 | WebView 마이크 지원 |
|----------|-------------|---------------------|
| iOS 18.x+ | ~79% | ✅ 완전 지원 |
| iOS 14.3~17.x | ~13% | ✅ 지원 |
| iOS 14.3 미만 | ~8% | ❌ 미지원 |

**iOS 14.3 미만 대응 전략**: 앱 스토어 최소 버전을 iOS 14.3으로 설정하거나, 해당 버전에서는 "이 기기에서는 지원되지 않습니다" 메시지를 표시할 수 있습니다.

#### 실시간 음성 지연시간 기준

| 지연시간 | 품질 등급 | 비고 |
|----------|-----------|------|
| < 20ms | 최적 | 지연 감지 불가 |
| 20~150ms | 양호 | 원활한 대화 |
| 150~300ms | 허용 | 약간의 지연 감지 |
| > 300ms | 불량 | 대화 끊김 발생 |

WebView 방식 예상 총 지연: **70~150ms** → 양호(Good) 범위 내

---

### WebSocket vs WebRTC 비교

ElevenLabs Conversational AI는 두 가지 연결 방식을 지원합니다.

#### 기본 비교

| 구분 | WebSocket | WebRTC |
|------|-----------|--------|
| **프로토콜** | TCP | UDP |
| **연결 방식** | Client ↔ Server | Peer-to-Peer |
| **지연시간** | ~100-150ms | ~75-100ms |
| **패킷 손실 처리** | 재전송 (지연 발생) | 손실 허용 (흐름 유지) |

#### ElevenLabs에서의 차이

| 기능 | WebSocket | WebRTC |
|------|-----------|--------|
| 기본 설정 | ✅ 기본값 | 선택 옵션 |
| 에코 제거 | 기본 | **고급 (내장)** |
| 배경 소음 제거 | 기본 | **고급 (내장)** |
| 오디오 포맷 | 설정 가능 | `pcm_48000` 고정 |
| 인증 방식 | Signed URL | Conversation Token |
| RN SDK 지원 | ✅ 지원 | ⏳ 예정 |

#### 사용 방식

```typescript
// WebSocket (기본)
const conversation = await Conversation.startSession({
  agentId: "<your-agent-id>",
  connectionType: "websocket",
});

// WebRTC (권장 - 더 낮은 지연시간)
const conversation = await Conversation.startSession({
  agentId: "<your-agent-id>",
  connectionType: "webrtc",
});
```

#### 비용

WebSocket과 WebRTC 간 **비용 차이 없음**. ElevenLabs Conversational AI 가격:

| 플랜 | 분당 비용 | 포함 시간 |
|------|-----------|-----------|
| Free | - | 15분 |
| Creator | $0.10/분 | 250분 |
| Pro | $0.10/분 | 1,100분 |
| Business (연간) | $0.08/분 | 13,750분 |

#### 권장사항

**"WebSocket으로 시작 → 추후 WebRTC 전환"** 전략 권장:

1. WebSocket이 기본값이라 초기 구현이 간단
2. WebRTC는 React Native SDK 지원 예정 (아직 미출시)
3. 비용 차이 없음 → 나중에 전환해도 손해 없음
4. **지연시간 최적화 팁**: WebSocket 대신 WebRTC를 사용하면 추가로 10~20ms 지연을 줄일 수 있습니다.

> 참고: ElevenLabs는 자사 서비스(11.ai)를 이미 전부 WebRTC로 전환했습니다.

---

## 참고 문서

- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Cloudflare Pages 공식 문서](https://developers.cloudflare.com/pages)
- [TanStack Query 공식 문서](https://tanstack.com/query)
- [ElevenLabs Conversational AI SDK (JS)](https://elevenlabs.io/docs/agents-platform/libraries/java-script)
- [ElevenLabs React SDK](https://elevenlabs.io/docs/conversational-ai-sdks/javascript/react-sdk)
- [ElevenLabs WebRTC 발표](https://elevenlabs.io/blog/conversational-ai-webrtc)
- [ElevenLabs 지연시간 최적화](https://elevenlabs.io/docs/best-practices/latency-optimization)
