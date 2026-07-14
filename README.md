# 속지마랑 (Sokjimarang)

> RISE 아이디어톤 수상 프로젝트 · AI 음성 에이전트 기반 보이스피싱 예방 훈련 서비스

속지마랑은 RISE 아이디어톤 수상 프로젝트로, 실제 보이스피싱 시나리오를 AI 음성 에이전트로 안전하게 시뮬레이션하고 통화 직후 디브리핑을 제공해 사용자의 대응력을 높이는 예방 교육 서비스입니다.

기존 보이스피싱 교육은 강의, 영상, 안내문처럼 수동적인 방식에 머무르는 경우가 많습니다. 속지마랑은 사용자가 실제와 유사한 상황을 직접 겪어보고, 실패해도 피해가 없는 환경에서 위험 신호를 학습하도록 설계했습니다.

## Screenshots

| 온보딩 | 훈련 설정 |
|---|---|
| <img src="./docs/assets/screenshot-onboarding.png" alt="속지마랑 온보딩 화면" width="260" /> | <img src="./docs/assets/screenshot-home.png" alt="속지마랑 훈련 설정 화면" width="260" /> |

## 핵심 기능

- **체험 기반 학습**: 실제와 유사한 보이스피싱 통화 상황을 안전하게 체험합니다.
- **AI 음성 에이전트**: ElevenLabs Conversational AI가 사기범 역할을 수행합니다.
- **시나리오 기반 훈련**: 검찰/경찰 사칭, 금융기관 사칭, 가족 사고 사칭, 택배/정부지원금 사칭 등 대표 유형을 다룹니다.
- **개인화 컨텍스트**: 연령대, 지역, 가족 구성 등 사용자 정보를 바탕으로 훈련 맥락을 조정합니다.
- **즉각적 디브리핑**: 통화 종료 후 어떤 지점이 위험 신호였는지와 올바른 대응 방식을 제공합니다.
- **안전한 실패 경험**: 실제 피해 없이 “속아보는 경험”을 통해 과신을 줄이고 경각심을 형성합니다.

## 문제의식

보이스피싱은 단순한 정보 부족이 아니라 공포, 시간 압박, 권위, 고립 유도 같은 심리적 취약성을 공격합니다. 특히 실제 상황에서는 “나는 안 속아”라고 생각하던 사람도 압박감 속에서 평소와 다르게 반응할 수 있습니다.

속지마랑은 다음 가설에서 출발했습니다.

> 안전한 환경에서 한 번 속아보는 경험은 실제 상황에서 위험 신호를 더 빠르게 인지하게 만든다.

## 사용자 흐름

```text
온보딩
  → 사용자 컨텍스트 선택
  → 보이스피싱 시나리오 선택
  → AI 음성 통화 훈련
  → 통화 종료
  → 디브리핑 및 대응 가이드 확인
```

## 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Routing | React Router |
| 상태 관리 | TanStack Query, Zustand |
| Backend | Supabase, Supabase Edge Functions |
| Voice AI | ElevenLabs Conversational AI |
| AI | Gemini, ElevenLabs Agent |
| Test | Vitest, Playwright |
| 배포 | Cloudflare Pages |

상세한 기술 스택은 [docs/tech-stack.md](./docs/tech-stack.md)를 참고하세요.

## 시작하기

### 사전 요구사항

- Node.js 20+
- pnpm 9+
- Supabase 프로젝트
- ElevenLabs 계정 및 Conversational AI Agent

### 설치

```bash
pnpm install
```

### 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에 필요한 값을 입력합니다.

```bash
ELEVENLABS_API_KEY=
VITE_ELEVENLABS_AGENT_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_BASE_URL=http://localhost:5173
```

> ElevenLabs 토큰 또는 Agent ID가 없거나 만료된 경우에도 온보딩, 홈, 시나리오 선택 같은 기본 화면은 확인할 수 있습니다. 실제 음성 통화 훈련은 유효한 ElevenLabs 설정이 필요합니다.

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173)을 엽니다.

### 빌드

```bash
pnpm build
```

## 주요 스크립트

| 명령어 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | TypeScript 빌드 및 Vite 프로덕션 빌드 |
| `pnpm preview` | 프로덕션 빌드 미리보기 |
| `pnpm lint` | ESLint 검사 |
| `pnpm test` | Vitest 실행 |
| `pnpm test:run` | Vitest 단발 실행 |
| `pnpm test:e2e` | Playwright E2E 테스트 실행 |
| `pnpm agent:update` | ElevenLabs 에이전트 설정 업데이트 |

## 프로젝트 구조

```text
sokjimarang/
├── src/
│   ├── routes/          # 페이지 컴포넌트
│   ├── components/      # 재사용 UI 컴포넌트
│   ├── hooks/           # ElevenLabs 통화 등 커스텀 훅
│   ├── lib/             # 외부 서비스 클라이언트와 도메인 로직
│   ├── stores/          # Zustand 상태 관리
│   └── types/           # TypeScript 타입
├── supabase/
│   ├── functions/       # Supabase Edge Functions
│   └── migrations/      # DB 마이그레이션
├── docs/                # 기술 문서와 참고 자료
└── public/              # 정적 파일
```

## 문서

- [기술 스택 상세](./docs/tech-stack.md)
- [ElevenLabs 에이전트 스펙](./docs/elevenlabs-agent-spec.md)
- [테스트 가이드](./docs/testing.md)
- [트러블슈팅](./docs/troubleshooting.md)

## 라이선스

Private - All rights reserved
