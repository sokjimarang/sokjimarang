# 속지마랑 (Sokjimarang)

실제 보이스피싱 시나리오를 AI 음성 에이전트로 시뮬레이션하여 예방 교육 효과를 제공하는 서비스입니다.

## 핵심 기능

- **체험 기반 학습**: 실제와 유사한 보이스피싱 상황 체험
- **실시간 상호작용**: AI가 사용자 반응에 따라 동적으로 대응
- **안전한 실패 경험**: 실제 피해 없이 "속아보는" 경험
- **즉각적 피드백**: 통화 직후 대응 방법 교육 (디브리핑)

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | React 19, Vite, TypeScript, TailwindCSS |
| **상태 관리** | TanStack Query, Zustand |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **Voice AI** | ElevenLabs Conversational AI |
| **배포** | Cloudflare Pages |

> 상세한 기술 스택 문서는 [docs/tech-stack.md](./docs/tech-stack.md)를 참고하세요.

## 시작하기

### 사전 요구사항

- Node.js 20+
- pnpm 9+
- Supabase 계정
- ElevenLabs 계정

### 설치

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 키 입력
```

### 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:5173](http://localhost:5173)에서 확인할 수 있습니다.

### 빌드

```bash
pnpm build
```

### 주요 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm test` | 테스트 실행 |
| `pnpm agent:update` | ElevenLabs 에이전트 설정 업데이트 |

## 프로젝트 구조

```
sokjimarang/
├── src/
│   ├── routes/          # 페이지 컴포넌트
│   ├── components/      # 재사용 컴포넌트
│   ├── lib/             # 외부 서비스 클라이언트
│   ├── hooks/           # 커스텀 훅
│   ├── stores/          # 상태 관리
│   └── types/           # TypeScript 타입
├── supabase/
│   ├── functions/       # Edge Functions
│   └── migrations/      # DB 마이그레이션
└── docs/                # 문서
```

## 문서

- [기술 스택 상세](./docs/tech-stack.md)
- [ElevenLabs 에이전트 스펙](./docs/elevenlabs-agent-spec.md)
- [테스트 가이드](./docs/testing.md)
- [트러블슈팅](./docs/troubleshooting.md)

## 라이선스

Private - All rights reserved
