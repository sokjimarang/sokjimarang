# 속지마랑 기술 스택

## 개요

속지마랑은 React + Vite 기반의 SPA(Single Page Application)로, Supabase를 백엔드로 사용하고 Cloudflare Pages에 배포됩니다.

React + Vite는 빠른 HMR과 최적화된 번들링으로 개발 생산성이 높고, 풍부한 생태계를 활용할 수 있어 선택했습니다. 백엔드는 Supabase를 사용해 Auth, Database, Storage, Edge Functions를 하나의 플랫폼에서 통합 관리합니다. 서버리스 함수는 Cloudflare Workers 대신 Supabase Edge Functions를 선택했는데, Vapi API를 통한 음성 통화 시작은 응답 속도보다 안정성이 중요하고, Edge Functions의 최대 150초 타임아웃이 30초 제한인 Workers보다 여유롭기 때문입니다. 200ms 수준의 Cold Start도 통화 연결 UX에 큰 영향을 주지 않으며, MVP 단계에서 플랫폼을 통합해 관리 복잡도를 낮추는 것이 유리하다고 판단했습니다. 정적 호스팅은 Cloudflare Pages를 사용하는데, 무료 무제한 대역폭과 글로벌 CDN을 제공하고 Git 연동으로 자동 배포가 간편하기 때문입니다.

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
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  │                             │                                     │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │           Cloudflare Functions (선택적)                    │  │  │
│  │  │           - A/B 테스트, 엣지 로직                          │  │  │
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
│  │                     Voice AI Services                            │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐  │  │
│  │  │   Vapi.ai   │ │   OpenAI    │ │   Google    │ │ ElevenLabs │  │  │
│  │  │(Orchestrator│ │  Whisper    │ │   Gemini    │ │   (TTS)    │  │  │
│  │  │             │ │   (STT)     │ │   (LLM)     │ │            │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘  │  │
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
  VITE_VAPI_PUBLIC_KEY: z.string().min(1),
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
| **Vapi.ai** | Orchestrator | 음성 파이프라인 통합 관리 |
| **OpenAI Whisper** | STT | 한국어 음성 → 텍스트 변환 |
| **Google Gemini Flash** | LLM | 대화 응답 생성, 시나리오 흐름 제어 |
| **ElevenLabs** | TTS | 텍스트 → 음성 변환, Voice Cloning |

### 배포 & 인프라

| 서비스 | 역할 | 선택 이유 |
|--------|------|----------|
| **Cloudflare Pages** | 정적 호스팅 | 무제한 대역폭, 글로벌 CDN, 무료 |
| **Cloudflare Functions** | 엣지 함수 | A/B 테스트, 엣지 로직 (선택적) |

---

## 데이터 흐름

### 1. 통화 시작 플로우

```
사용자 → React App → Supabase Edge Function → Vapi API → 통화 시작
                           │
                           └── API Key 보호 (서버에서만 사용)
```

### 2. 인증 플로우

```
사용자 → React App → Supabase Auth → JWT 발급 → 인증된 요청
```

### 3. 데이터 조회 플로우

```
React App → Supabase Client → PostgreSQL (RLS 적용) → 본인 데이터만 반환
```

---

## 보안 설계

### API Key 보호

| Key | 저장 위치 | 노출 여부 |
|-----|----------|----------|
| `SUPABASE_URL` | 환경변수 (클라이언트) | O (공개 가능) |
| `SUPABASE_ANON_KEY` | 환경변수 (클라이언트) | O (RLS가 보호) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function 환경변수 | X (절대 노출 금지) |
| `VAPI_API_KEY` | Edge Function 환경변수 | X |
| `OPENAI_API_KEY` | Vapi 대시보드 | X |
| `GEMINI_API_KEY` | Vapi 대시보드 | X |
| `ELEVENLABS_API_KEY` | Vapi/Edge Function | X |

### 클라이언트에서 직접 호출 가능한 것

```typescript
// OK - Supabase RLS가 보호
const { data } = await supabase.from('calls').select('*');
// → RLS: auth.uid() = user_id 조건으로 본인 데이터만 조회
```

### 반드시 Edge Function 경유해야 하는 것

```typescript
// 통화 시작 - Vapi API Key 필요
await supabase.functions.invoke('start-call', { body: { scenarioId } });

// Voice Cloning - ElevenLabs API Key 필요
await supabase.functions.invoke('clone-voice', { body: { audioUrl } });
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
│   │   └── vapi.ts              # Vapi 웹 클라이언트
│   ├── hooks/                   # 커스텀 훅
│   ├── stores/                  # Zustand 스토어
│   └── types/                   # TypeScript 타입
│
├── supabase/
│   ├── functions/               # Edge Functions
│   │   ├── start-call/          # 통화 시작
│   │   └── webhook-vapi/        # Vapi 웹훅
│   └── migrations/              # DB 마이그레이션
│
├── docs/                        # 문서
├── public/                      # 정적 파일
└── [설정 파일들]
```

---

## 환경변수

### 클라이언트 (.env)

```bash
# Supabase (공개 가능)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Vapi Public Token (공개 가능 - 웹 SDK용)
VITE_VAPI_PUBLIC_KEY=xxx
```

### Supabase Edge Functions (비공개)

```bash
# Supabase Secrets에 저장
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
VAPI_API_KEY=xxx
ELEVENLABS_API_KEY=xxx
```

---

## 참고 문서

- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Cloudflare Pages 공식 문서](https://developers.cloudflare.com/pages)
- [Vapi.ai 공식 문서](https://docs.vapi.ai)
- [TanStack Query 공식 문서](https://tanstack.com/query)
