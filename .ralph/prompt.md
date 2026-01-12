# FEATURE: 속지마랑 - PRD 스펙 완전 구현 및 테스트 자동화

## Context

**프로젝트 정보:**
- React 19 + Vite 6 웹앱 (React Native WebView 래핑 예정)
- 상태관리: Zustand
- 스타일링: Tailwind CSS
- Voice AI: Vapi (ElevenLabs 기반)
- DB: Supabase
- 패키지 매니저: pnpm

**핵심 문서:**
- `docs/references/prd.md`: 상세 제품 요구사항
- `docs/references/call-scenario.md`: 4개 시나리오 상세
- `docs/references/project-proposal.md`: 프로젝트 개요

**현재 구현 상태:**
- 기본 라우팅: `/`, `/onboarding`, `/training/call`, `/training/debrief`
- 4개 시나리오 모듈: prosecutor, bank, familyEmergency, deliverySubsidy
- Vapi 통합: useVapiCall 훅 존재
- 오버레이 시스템: Sheet, Modal, ActionSheet 구현됨

---

## Requirements

### 1. 테스트 자동화 시스템 구축

**Vitest 단위 테스트:**
- 환경 설정: `vitest.config.mts`, `vitest.setup.mts`
- 테스트 스크립트: `pnpm test`, `pnpm test:run`, `pnpm test:coverage`
- MSW로 API 모킹 (Vapi WebSocket은 모킹 제외)

**Playwright E2E 테스트:**
- 온보딩 플로우 완료 테스트
- 시나리오 선택 → 통화 → 디브리핑 플로우 테스트
- 각 화면의 UI 요소 존재 확인

### 2. PRD 스펙 완전 구현

**온보딩 화면 (`/onboarding`):**
- 스와이프 가능한 3페이지 + 동의 페이지 (페이지 4)
- 페이지 인디케이터 (● ○ ○)
- 동의 체크박스 3개: 서비스 이용약관, 개인정보처리방침, 통화 녹음 동의
- 모두 체크 시 "동의하고 시작" 버튼 활성화
- 완료 시 localStorage에 `onboarding_completed: true` 저장

**메인 화면 (`/`):**
- 헤더: "속지마랑" 제목 + 설정 아이콘 (⚙️)
- 시나리오 선택: 랜덤 + 4개 시나리오 라디오 버튼
- 내 정보 설정: 연령대, 거주지역, 자녀 유무 드롭다운
- 훈련 기록: 총 훈련 횟수 + 최근 훈련 날짜 표시
- "시작하기" 버튼 → 훈련 준비 화면으로 이동

**훈련 준비 화면 (새로 추가 `/training/prepare`):**
- 안내 문구: "지금부터 보이스피싱 훈련을 시작합니다..."
- 체크박스: "이것이 훈련임을 통화 시작 시 안내받기"
- "훈련 시작" 버튼 → 통화 화면으로 이동
- "취소" 링크 → 메인 화면으로 복귀

**통화 화면 (`/training/call`):**
- 통화 UI: 📞 아이콘, "통화 중 MM:SS" 타이머
- 오디오 레벨 시각화 바 (음성 크기에 따라 애니메이션)
- "훈련 종료" 버튼 → 확인 다이얼로그 표시
- 자동 종료: AI가 [END_SCENARIO] 전송 시 또는 5분 초과 시

**디브리핑 화면 (`/training/debrief`):**
- 1단계: 음성 디브리핑 (AI가 분석 결과 음성으로 전달)
- 2단계: 화면 디브리핑 (음성 종료 후 자동 전환)
  - 시나리오 유형, 진행 단계, 소요 시간
  - 탐지 포인트 목록 (⚠️ 이런 점이 수상했습니다)
  - 올바른 대응 목록 (✅ 이렇게 대응하세요)
- "← 홈" 버튼, "다시 훈련하기" 버튼

### 3. 데이터 구조 완전 구현

**UserContext:**
```typescript
interface UserContext {
  ageGroup: 'under50' | '50s' | '60s' | '70plus';
  region: 'seoul' | 'gyeonggi' | 'other';
  hasChildren: boolean;
  hasGrandchildren: boolean;
}
```

**TrainingSession:**
```typescript
interface TrainingSession {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  scenarioType: ScenarioType;
  userContext: UserContext;
  reachedStage: number;
  terminationReason: TerminationReason;
  transcript: TranscriptEntry[];
}
```

**DebriefingResult:**
```typescript
interface DebriefingResult {
  sessionId: string;
  scenarioType: ScenarioType;
  reachedStage: number;
  maxStage: number;
  detectionPoints: DetectionPoint[];
  correctResponses: string[];
}
```

### 4. 코드 품질 (Martin Fowler 관점)

**리팩토링 원칙:**
- 함수는 한 가지 일만 수행
- 의미 있는 이름 사용
- 중복 제거 (DRY)
- 조건문 단순화
- 관심사 분리 (UI / 비즈니스 로직 / 데이터)

**적용 패턴:**
- Extract Function: 복잡한 로직을 명명된 함수로 분리
- Replace Conditional with Polymorphism: 시나리오별 분기를 다형성으로
- Introduce Parameter Object: 관련 파라미터를 객체로 그룹화

---

## Implementation Plan

### Phase 1: 테스트 인프라 구축
1. Vitest 설정 파일 생성 (`vitest.config.mts`, `vitest.setup.mts`)
2. package.json에 테스트 스크립트 추가
3. MSW 핸들러 설정 (`src/__tests__/setup/msw-handlers.ts`)
4. Playwright 설정 (`playwright.config.ts`)
5. 기본 테스트 구조 생성

### Phase 2: 온보딩 화면 완성
1. 스와이프 가능한 페이지 컴포넌트 구현
2. 동의 페이지 (페이지 4) 구현
3. 온보딩 완료 로직 및 localStorage 저장
4. 온보딩 테스트 작성

### Phase 3: 메인 화면 완성
1. 설정 아이콘 및 설정 화면 추가
2. 시나리오 라디오 버튼 (랜덤 포함)
3. 훈련 기록 표시 컴포넌트
4. 메인 화면 테스트 작성

### Phase 4: 훈련 준비 화면 추가
1. `/training/prepare` 라우트 추가
2. 안내 UI 및 체크박스 구현
3. 훈련 시작/취소 로직
4. 훈련 준비 테스트 작성

### Phase 5: 통화 화면 완성
1. 타이머 컴포넌트 구현
2. 오디오 레벨 시각화 구현
3. 종료 확인 다이얼로그
4. 자동 종료 로직 ([END_SCENARIO], 5분 타임아웃)
5. 통화 화면 테스트 작성

### Phase 6: 디브리핑 화면 완성
1. 음성 디브리핑 컴포넌트 (TTS 재생)
2. 화면 디브리핑 UI
3. 탐지 포인트 / 올바른 대응 표시
4. 디브리핑 테스트 작성

### Phase 7: 리팩토링 및 코드 품질
1. 중복 코드 제거
2. 컴포넌트 분리 (UI / 컨테이너)
3. 커스텀 훅 추출
4. 타입 정의 정리

### Phase 8: 문서화
1. skills의 리팩토링 스킬 업데이트
2. docs/troubleshooting/2026-01-12.md 작성
3. 코드 구조 문서 업데이트
4. docs/yolo/2026-01-12.md 작업 요약 작성

---

## Success Criteria (자동 검증 가능)

- [ ] `pnpm test:run` 실행 시 모든 테스트 통과
- [ ] `pnpm lint` 실행 시 에러 0개
- [ ] `pnpm build` 실행 시 빌드 성공
- [ ] 온보딩 플로우: 4페이지 모두 표시, 동의 체크박스 3개, 완료 시 localStorage 저장
- [ ] 메인 화면: 시나리오 5개 (랜덤+4종) 표시, 훈련 기록 표시
- [ ] 훈련 준비 화면: `/training/prepare` 라우트 존재, 체크박스 및 버튼 동작
- [ ] 통화 화면: 타이머 표시, 종료 확인 다이얼로그 동작
- [ ] 디브리핑 화면: 탐지 포인트 및 올바른 대응 표시
- [ ] Playwright E2E 테스트 통과

---

## Completion

모든 Success Criteria 충족 시 출력:
<promise>FEATURE_DONE</promise>

---

## If Stuck (15회 반복 후에도 미완료 시)

1. 현재까지 완료된 작업 목록 문서화
2. 진행 차단 요소 상세 기록
3. 시도한 해결 방법 목록
4. 대안 접근법 제안
5. 남은 작업에 대한 상세 가이드 작성

---

## 작업 규칙

### 커밋 규칙
- 각 Phase 완료 시 커밋
- 커밋 메시지: `feat/fix/refactor/test/docs: 간단한 설명`
- 작은 단위로 자주 커밋

### 코드 작성 규칙
- Named export 사용
- ESLint 자동 수정 후 수동 에러 처리
- 불필요한 코멘트 작성 금지
- API 수정이 필요하면 API를 수정 (UI 우회 로직 금지)

### 테스트 작성 규칙
- AAA 패턴 (Arrange-Act-Assert)
- 하나의 테스트는 하나의 동작만 검증
- 테스트 이름은 한국어로 작성 가능
