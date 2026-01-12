---
title: "속지마랑 - PRD (Product Requirements Document)"
version: v1.0
last-updated: 2026-01-12
target-reader: AI 활용 개발자
---

## 0. 이 문서의 목적

이 문서는 **AI를 활용하여 개발하는 개발자**가 읽고 그대로 구현할 수 있도록 작성되었다.

모든 기능은 다음 원칙에 따라 분해되었다:

1. **추상적 개념 금지**: "자연스럽게", "적절히" 같은 표현 대신 구체적 조건 명시
2. **전제 명시화**: 숨겨진 가정을 모두 드러냄
3. **분기 조건 완전 정의**: 모든 if-else 케이스 정의
4. **데이터 구조 명시**: 타입, 필드, 제약조건 정의

---

## 1. 시스템 개요

### 1.1 시스템이 하는 것

사용자가 앱에서 버튼을 누르면, AI가 보이스피싱 사기범 역할을 수행하는 음성 통화가 시작된다. 통화가 끝나면 피드백을 제공한다.

### 1.2 시스템 구성요소

```
┌─────────────────────────────────────────────────────────────┐
│                        System Components                     │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────────────────┐ │
│  │  React Web App   │◄────►│   ElevenLabs Conversational  │ │
│  │  (RN WebView)    │      │           AI Agent           │ │
│  │                  │      │                              │ │
│  │  - UI Rendering  │      │  - ASR (음성→텍스트)         │ │
│  │  - State Mgmt    │      │  - LLM (응답 생성)           │ │
│  │  - Audio Stream  │      │  - TTS (텍스트→음성)         │ │
│  │  - Local Storage │      │  - Turn-taking              │ │
│  └──────────────────┘      └──────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘

```

### 1.3 기술 스택 상세

| 구분 | 기술 | 버전 | 용도 |
| --- | --- | --- | --- |
| 웹 프레임워크 | React + Vite | React 19+, Vite 6+ | 웹 앱 개발 |
| 앱 래핑 | React Native WebView | - | 웹앱을 네이티브 앱으로 래핑 |
| 언어 | TypeScript | 5.0+ | 타입 안정성 |
| 상태관리 | Zustand | - | 앱 상태 관리 |
| Voice AI | ElevenLabs Conversational AI | - | 음성 대화 |
| 음성 스트리밍 | WebSocket | - | 실시간 양방향 오디오 |
| 로컬 저장소 | localStorage | - | 설정, 훈련 기록 |

---

## 2. 데이터 구조

### 2.1 사용자 컨텍스트

```tsx
interface UserContext {
  ageGroup: 'under50' | '50s' | '60s' | '70plus';
  region: 'seoul' | 'gyeonggi' | 'other';
  hasChildren: boolean;
  hasGrandchildren: boolean;
}

```

**제약조건**:

- 모든 필드는 선택 입력 (입력하지 않으면 기본값 사용)
- 기본값: `{ ageGroup: '60s', region: 'seoul', hasChildren: true, hasGrandchildren: false }`

### 2.2 시나리오

```tsx
type ScenarioType =
  | 'prosecutor'      // 검찰/경찰 사칭
  | 'bank'            // 금융기관 사칭
  | 'family_emergency' // 가족 납치/사고
  | 'delivery_subsidy'; // 택배/정부지원금

interface Scenario {
  type: ScenarioType;
  systemPrompt: string;
  maxDurationSeconds: number;
  stages: Stage[];
}

interface Stage {
  id: number;
  name: string;
  description: string;
  triggerCondition: string; // AI가 판단할 조건
}

```

### 2.3 훈련 세션

```tsx
interface TrainingSession {
  id: string;                    // UUID
  startedAt: Date;
  endedAt: Date | null;
  scenarioType: ScenarioType;
  userContext: UserContext;
  reachedStage: number;          // 도달한 단계 (1~5)
  terminationReason: TerminationReason;
  transcript: TranscriptEntry[]; // 대화 기록
}

type TerminationReason =
  | 'user_rejected'       // 사용자가 거부하여 종료
  | 'user_suspected'      // 사용자가 의심하여 종료
  | 'user_manual_end'     // 사용자가 종료 버튼 클릭
  | 'max_duration'        // 최대 시간 초과
  | 'scenario_complete';  // 시나리오 완료 (끝까지 진행)

interface TranscriptEntry {
  timestamp: Date;
  speaker: 'ai' | 'user';
  text: string;
}

```

### 2.4 디브리핑 결과

```tsx
interface DebriefingResult {
  sessionId: string;
  scenarioType: ScenarioType;
  reachedStage: number;
  maxStage: number;
  detectionPoints: DetectionPoint[];
  correctResponses: string[];
}

interface DetectionPoint {
  description: string;  // 무엇이 수상했는지
  explanation: string;  // 왜 수상한지
  occurred: boolean;    // 이번 세션에서 발생했는지
}

```

---

## 3. 화면 명세

### 3.1 온보딩 화면

**진입 조건**: 앱 최초 실행 시 (로컬 스토리지에 `onboarding_completed` 없음)

**화면 구성**:

```
┌─────────────────────────────────────┐
│                                     │
│     [이미지 또는 일러스트]          │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [제목 텍스트]                      │
│                                     │
│  [설명 텍스트]                      │
│                                     │
│         ● ○ ○  (페이지 인디케이터)  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │           다음              │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘

```

**페이지별 콘텐츠**:

| 페이지 | 제목 | 설명 |
| --- | --- | --- |
| 1 | 보이스피싱, 겪어봐야 압니다 | 매년 3,000억원 이상의 피해가 발생합니다. 50대 이상이 절반 이상을 차지합니다. |
| 2 | AI가 사기범 역할을 합니다 | 실제 보이스피싱과 유사한 전화가 옵니다. 안전하게 체험해보세요. |
| 3 | 속아도 괜찮습니다 | 훈련입니다. 끝나면 무엇이 수상했는지 알려드립니다. |

**페이지 4: 동의 화면**:

```
┌─────────────────────────────────────┐
│                                     │
│  서비스 이용을 위해                 │
│  다음에 동의해주세요                │
│                                     │
│  ☐ (필수) 서비스 이용약관          │
│  ☐ (필수) 개인정보처리방침         │
│  ☐ (필수) 통화 녹음 및 분석 동의   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        동의하고 시작         │   │  ← 모두 체크 시 활성화
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘

```

**동작 정의**:

- 스와이프 또는 "다음" 버튼으로 페이지 이동
- 페이지 4에서 모든 체크박스 선택 시 "동의하고 시작" 버튼 활성화
- "동의하고 시작" 클릭 시:
    - `AsyncStorage.setItem('onboarding_completed', 'true')`
    - 메인 화면으로 이동

### 3.2 메인 화면

**진입 조건**: 온보딩 완료 후

**화면 구성**:

```
┌─────────────────────────────────────┐
│  속지마랑                    ⚙️    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │       🎯 훈련 시작          │   │
│  │                             │   │
│  │  [시작하기]                 │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  시나리오 선택 (선택사항)           │
│  ┌─────────────────────────────┐   │
│  │ ○ 랜덤                      │   │
│  │ ○ 검찰/경찰 사칭            │   │
│  │ ○ 금융기관 사칭             │   │
│  │ ○ 가족 납치/사고            │   │
│  │ ○ 택배/정부지원금           │   │
│  └─────────────────────────────┘   │
│                                     │
│  내 정보 설정                       │
│  ┌─────────────────────────────┐   │
│  │ 연령대: 60대 ▼              │   │
│  │ 거주지역: 서울 ▼            │   │
│  │ 자녀 유무: 있음 ▼           │   │
│  └─────────────────────────────┘   │
│                                     │
│  📊 훈련 기록 (3회)                │
│  └─ 가장 최근: 2026.01.10          │
│                                     │
└─────────────────────────────────────┘

```

**동작 정의**:

| 요소 | 동작 |
| --- | --- |
| "시작하기" 버튼 | 훈련 준비 화면으로 이동 |
| 시나리오 라디오 버튼 | 선택된 시나리오 저장 (기본값: 랜덤) |
| 연령대/거주지역/자녀 드롭다운 | 선택값 로컬 저장, 다음 훈련에 적용 |
| 훈련 기록 | 탭 시 훈련 기록 목록 화면으로 이동 |
| 설정 아이콘 (⚙️) | 설정 화면으로 이동 |

### 3.3 훈련 준비 화면

**진입 조건**: 메인 화면에서 "시작하기" 클릭

**화면 구성**:

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         📞 훈련 준비 중             │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  지금부터 보이스피싱 훈련을         │
│  시작합니다.                        │
│                                     │
│  • AI가 사기범 역할을 합니다        │
│  • 실제 상황처럼 대응해보세요       │
│  • 언제든 종료할 수 있습니다        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ☐ 이것이 훈련임을 통화 시작 시     │
│    안내받기                          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │          훈련 시작           │   │
│  └─────────────────────────────┘   │
│                                     │
│           취소                      │
│                                     │
└─────────────────────────────────────┘

```

**동작 정의**:

| 요소 | 동작 |
| --- | --- |
| "이것이 훈련임을..." 체크박스 | 체크 시 통화 시작 전 "이것은 훈련입니다" TTS 재생 |
| "훈련 시작" 버튼 | 통화 화면으로 전환, ElevenLabs Agent 세션 시작 |
| "취소" | 메인 화면으로 복귀 |

**"훈련 시작" 클릭 시 처리 순서**:

1. `TrainingSession` 객체 생성
2. 선택된 시나리오 타입에 해당하는 System Prompt 로드
3. UserContext를 System Prompt에 주입
4. ElevenLabs Agent 세션 시작 (WebSocket 연결)
5. 통화 화면으로 전환
6. (체크박스 선택 시) "이것은 훈련입니다" TTS 재생
7. AI의 첫 발화 시작

### 3.4 통화 화면

**진입 조건**: 훈련 시작

**화면 구성**:

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              📞                     │
│                                     │
│        통화 중 02:34                │
│                                     │
│     ════════════════════            │  ← 오디오 레벨 시각화
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│         ┌───────────┐               │
│         │  훈련 종료 │               │
│         └───────────┘               │
│                                     │
└─────────────────────────────────────┘

```

**동작 정의**:

| 상태 | 동작 |
| --- | --- |
| 통화 중 | 오디오 레벨에 따라 시각화 바 애니메이션 |
| 타이머 | 1초마다 갱신, MM:SS 형식 |
| "훈련 종료" 버튼 | 탭 시 확인 다이얼로그 표시 |

**"훈련 종료" 클릭 시 확인 다이얼로그**:

```
┌─────────────────────────────────────┐
│                                     │
│    훈련을 종료하시겠습니까?         │
│                                     │
│    ┌─────────┐    ┌─────────┐      │
│    │  취소   │    │  종료   │      │
│    └─────────┘    └─────────┘      │
│                                     │
└─────────────────────────────────────┘

```

**종료 처리 순서**:

1. ElevenLabs Agent 세션 종료
2. `terminationReason: 'user_manual_end'` 설정
3. 디브리핑 결과 생성
4. 디브리핑 화면으로 전환

**자동 종료 조건**:

- AI가 시나리오 완료 신호 전송 시
- 최대 시간 (5분) 초과 시

### 3.5 디브리핑 화면

**진입 조건**: 통화 종료 후

**구성: 2단계**

**1단계: 음성 디브리핑**

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│              🎯                     │
│                                     │
│       훈련 결과를 분석 중...        │
│                                     │
│       ─────●───────────────         │  ← 재생 진행 바
│                                     │
│                                     │
└─────────────────────────────────────┘

```

**음성 디브리핑 스크립트 템플릿**:

```
훈련이 종료되었습니다.

오늘은 {시나리오_이름} 시나리오를 경험하셨습니다.
{사용자_이름 또는 "어머니/아버지"}께서는
{도달_단계}단계까지 진행하셨습니다.

{핵심_탐지_포인트_1}
{핵심_탐지_포인트_2}

실제 {사칭_대상}은 절대로 전화로 {금지_행위}를 요구하지 않습니다.
의심되면 끊고 112에 확인하세요.

```

**2단계: 화면 디브리핑** (음성 종료 후 자동 전환)

```
┌─────────────────────────────────────┐
│  ← 홈                               │
│                                     │
│  📊 훈련 결과                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 시나리오: 검찰 사칭          │   │
│  │ 진행 단계: 3 / 5 단계        │   │
│  │ 소요 시간: 02:34             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⚠️ 이런 점이 수상했습니다          │
│  ┌─────────────────────────────┐   │
│  │ • "계좌가 범죄에 연루"       │   │
│  │   → 검찰은 전화로 수사 내용  │   │
│  │     을 알려주지 않습니다     │   │
│  │                             │   │
│  │ • "비밀 유지 필요"           │   │
│  │   → 가족에게 알리지 말라는   │   │
│  │     것은 고립 유도입니다     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ✅ 이렇게 대응하세요               │
│  ┌─────────────────────────────┐   │
│  │ • 일단 끊고 112에 확인       │   │
│  │ • 가족에게 바로 알리기       │   │
│  │ • 금융감독원 1332 신고       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │        다시 훈련하기         │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘

```

**동작 정의**:

| 요소 | 동작 |
| --- | --- |
| "← 홈" | 메인 화면으로 이동 |
| "다시 훈련하기" | 훈련 준비 화면으로 이동 |

---

## 4. ElevenLabs Agent 연동 명세

### 4.1 Agent 설정

ElevenLabs Conversational AI Agent를 생성할 때 설정해야 할 파라미터:

```jsx
const agentConfig = {
  // 음성 설정
  voice: {
    voice_id: "한국어_남성_중년", // 사전 선택된 한국어 음성
    model_id: "eleven_turbo_v2_5",
    stability: 0.5,
    similarity_boost: 0.75
  },

  // LLM 설정
  llm: {
    provider: "google",
    model: "gemini-2.5-flash",
    temperature: 0.7,
    max_tokens: 150  // 짧은 응답 유도
  },

  // 대화 설정
  conversation: {
    max_duration_seconds: 300,  // 5분
    turn_eagerness: "normal",   // 끼어들기 정도
    interruption_sensitivity: 0.5
  },

  // System Prompt (시나리오별로 다름)
  system_prompt: "..." // 아래 상세 정의
};

```

### 4.2 System Prompt 구조

모든 시나리오의 System Prompt는 다음 구조를 따른다:

```
## 역할
당신은 보이스피싱 예방 교육을 위한 AI입니다.
{역할_상세} 역할을 수행합니다.

## 목표
사용자가 실제 보이스피싱 상황을 체험하게 하여 경각심을 높입니다.

## 컨텍스트
- 사용자 연령대: {age_group}
- 거주 지역: {region}
- 자녀 유무: {has_children}
- 손자녀 유무: {has_grandchildren}

## 시나리오 단계
1단계 - 신뢰 구축: {1단계_상세}
2단계 - 공포 유발: {2단계_상세}
3단계 - 행동 유도: {3단계_상세}
4단계 - 압박 강화: {4단계_상세}
5단계 - 최종 요구: {5단계_상세}

## 사용자 반응별 분기
- 의심 표현 시: {의심_대응}
- 거부 시: {거부_대응}
- 순응 시: 다음 단계로 진행

## 종료 조건
- 사용자가 명확히 거부 ("안 해요", "끊을게요" 등)
- 사용자가 의심을 표명하고 확인하겠다고 함
- 5단계 완료

## 종료 시 신호
종료 조건 충족 시, 마지막 발화 끝에 [END_SCENARIO]를 추가합니다.

## 금지사항
- 실제 계좌번호 언급 금지
- 실제 개인정보(주민번호 등) 요구 금지
- 물리적 만남 유도 금지
- 실존 기관의 실제 전화번호 언급 금지

## 말투
- 한국어 존댓말 사용
- 공무원/은행원 말투 (시나리오에 따라)
- 급박하고 권위적인 톤
- 한 턴에 2~3문장 이내

```

### 4.3 WebSocket 통신 흐름

```
React Web App (RN WebView)          ElevenLabs Agent
       │                                   │
       │──── 세션 시작 요청 ────────────────►│
       │     (agent_id, config)            │
       │                                   │
       │◄─── 세션 ID 반환 ─────────────────│
       │                                   │
       │──── 오디오 스트림 시작 ────────────►│
       │     (WebSocket 연결)              │
       │                                   │
       │◄─── AI 첫 발화 (오디오) ──────────│
       │                                   │
       │──── 사용자 음성 (오디오 청크) ────►│
       │                                   │
       │◄─── AI 응답 (오디오 스트림) ──────│
       │                                   │
       │     ... (반복) ...                │
       │                                   │
       │◄─── [END_SCENARIO] 포함 응답 ────│
       │                                   │
       │──── 세션 종료 ─────────────────────►│
       │                                   │

```

### 4.4 이벤트 핸들링

```tsx
interface AgentEventHandlers {
  // 연결 관련
  onConnect: () => void;
  onDisconnect: (reason: string) => void;
  onError: (error: Error) => void;

  // 대화 관련
  onAgentSpeechStart: () => void;
  onAgentSpeechEnd: () => void;
  onUserSpeechStart: () => void;
  onUserSpeechEnd: () => void;

  // 전사 관련
  onTranscript: (entry: TranscriptEntry) => void;

  // 종료 관련
  onScenarioEnd: (reason: TerminationReason) => void;
}

```

**[END_SCENARIO] 감지 로직**:

```tsx
function onTranscript(entry: TranscriptEntry) {
  transcripts.push(entry);

  if (entry.speaker === 'ai' && entry.text.includes('[END_SCENARIO]')) {
    // 텍스트에서 마커 제거
    entry.text = entry.text.replace('[END_SCENARIO]', '').trim();

    // 종료 사유 판단
    const reason = determineTerminationReason(transcripts);
    onScenarioEnd(reason);
  }
}

function determineTerminationReason(transcripts: TranscriptEntry[]): TerminationReason {
  const lastUserMessages = transcripts
    .filter(t => t.speaker === 'user')
    .slice(-3)
    .map(t => t.text.toLowerCase());

  const rejectionKeywords = ['안 해요', '끊을게요', '사기', '신고'];
  const suspicionKeywords = ['확인해볼게요', '이상하네', '다시 전화'];

  if (rejectionKeywords.some(k => lastUserMessages.some(m => m.includes(k)))) {
    return 'user_rejected';
  }
  if (suspicionKeywords.some(k => lastUserMessages.some(m => m.includes(k)))) {
    return 'user_suspected';
  }
  return 'scenario_complete';
}

```

---

## 5. 디브리핑 생성 로직

### 5.1 도달 단계 판단

AI의 System Prompt에서 각 단계의 트리거 조건을 정의하고, 대화 내용을 분석하여 도달 단계를 판단한다.

```tsx
interface StageIndicator {
  stage: number;
  keywords: string[];  // AI가 이 단어들을 말했으면 해당 단계 진입
}

const prosecutorScenarioIndicators: StageIndicator[] = [
  { stage: 1, keywords: ['검찰', '수사관', '범죄', '연루'] },
  { stage: 2, keywords: ['체포', '구속', '처벌', '증거인멸'] },
  { stage: 3, keywords: ['계좌', '안전조치', '이체'] },
  { stage: 4, keywords: ['당장', '지금', '즉시'] },
  { stage: 5, keywords: ['금액', '현금', '송금'] }
];

function calculateReachedStage(
  transcripts: TranscriptEntry[],
  indicators: StageIndicator[]
): number {
  const aiMessages = transcripts
    .filter(t => t.speaker === 'ai')
    .map(t => t.text.toLowerCase());

  let maxStage = 0;
  for (const indicator of indicators) {
    if (indicator.keywords.some(k => aiMessages.some(m => m.includes(k)))) {
      maxStage = Math.max(maxStage, indicator.stage);
    }
  }
  return maxStage;
}

```

### 5.2 탐지 포인트 생성

각 시나리오별로 사전 정의된 탐지 포인트 목록에서, 실제 대화에서 발생한 것들을 필터링한다.

```tsx
const prosecutorDetectionPoints: DetectionPoint[] = [
  {
    description: '"계좌가 범죄에 연루되었다"',
    explanation: '검찰은 전화로 수사 내용을 알려주지 않습니다',
    triggerKeywords: ['연루', '범죄', '계좌']
  },
  {
    description: '"비밀 유지가 필요하다"',
    explanation: '가족에게 알리지 말라는 것은 고립 유도입니다',
    triggerKeywords: ['비밀', '누구에게도', '알리지']
  },
  {
    description: '"안전계좌로 이체하라"',
    explanation: '검찰은 돈을 요구하지 않습니다',
    triggerKeywords: ['안전계좌', '이체', '송금']
  },
  {
    description: '"지금 당장 해야 한다"',
    explanation: '시간 압박은 판단력을 흐리게 하려는 수법입니다',
    triggerKeywords: ['당장', '즉시', '지금']
  }
];

function filterOccurredPoints(
  transcripts: TranscriptEntry[],
  allPoints: DetectionPoint[]
): DetectionPoint[] {
  const aiText = transcripts
    .filter(t => t.speaker === 'ai')
    .map(t => t.text.toLowerCase())
    .join(' ');

  return allPoints.filter(point =>
    point.triggerKeywords.some(k => aiText.includes(k))
  ).map(point => ({
    ...point,
    occurred: true
  }));
}

```

### 5.3 올바른 대응 생성

시나리오 유형에 따라 사전 정의된 대응 목록 반환:

```tsx
const correctResponses: Record<ScenarioType, string[]> = {
  prosecutor: [
    '일단 끊고 112에 직접 확인하세요',
    '가족에게 바로 알리세요',
    '금융감독원 1332에 신고하세요'
  ],
  bank: [
    '끊고 해당 은행 공식 번호로 확인하세요',
    '앱에서 직접 거래내역을 확인하세요',
    '의심되면 가까운 은행 지점 방문하세요'
  ],
  family_emergency: [
    '해당 가족에게 직접 전화하세요',
    '다른 가족에게 확인하세요',
    '112에 신고하세요'
  ],
  delivery_subsidy: [
    '공식 정부 사이트에서 직접 확인하세요',
    '링크를 클릭하지 마세요',
    '개인정보를 절대 알려주지 마세요'
  ]
};

```

---

## 6. 로컬 저장소 스키마

```tsx
// AsyncStorage Keys
const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',  // 'true' | undefined
  USER_CONTEXT: 'user_context',                   // JSON(UserContext)
  TRAINING_SESSIONS: 'training_sessions',         // JSON(TrainingSession[])
  SETTINGS: 'settings',                           // JSON(Settings)
};

interface Settings {
  notifyTrainingStart: boolean;  // 훈련 시작 시 안내 여부
  selectedScenario: ScenarioType | 'random';
}

```

---

## 7. 에러 처리

### 7.1 에러 유형 및 대응

| 에러 유형 | 감지 조건 | 사용자 메시지 | 처리 |
| --- | --- | --- | --- |
| 네트워크 오류 | WebSocket 연결 실패 | "인터넷 연결을 확인해주세요" | 재시도 버튼 표시 |
| 마이크 권한 거부 | 권한 요청 거부 | "마이크 권한이 필요합니다" | 설정으로 이동 버튼 |
| 세션 타임아웃 | 5분 초과 | "훈련 시간이 종료되었습니다" | 디브리핑으로 이동 |
| AI 응답 없음 | 10초간 응답 없음 | "연결이 불안정합니다" | 재연결 시도 |
| 예상치 못한 오류 | catch-all | "오류가 발생했습니다" | 홈으로 이동 |

### 7.2 에러 다이얼로그 컴포넌트

```tsx
interface ErrorDialogProps {
  visible: boolean;
  title: string;
  message: string;
  primaryAction: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
}

```

---

## 8. 체크리스트

### 8.1 개발 전 준비사항

- [ ]  ElevenLabs 계정 생성 및 API 키 발급
- [ ]  ElevenLabs Agent 생성 (4개 시나리오)
- [ ]  한국어 음성 선택 및 테스트
- [ ]  React + Vite 프로젝트 초기화
- [ ]  필수 라이브러리 설치 (WebSocket, Zustand 등)
- [ ]  React Native WebView 래퍼 프로젝트 설정

### 8.2 화면별 개발 체크리스트

**온보딩**

- [ ]  스와이프 페이지네이션
- [ ]  체크박스 상태 관리
- [ ]  localStorage 저장

**메인**

- [ ]  시나리오 선택 라디오 버튼
- [ ]  컨텍스트 입력 드롭다운
- [ ]  훈련 기록 표시

**통화**

- [ ]  ElevenLabs SDK 연동
- [ ]  오디오 스트리밍
- [ ]  타이머 표시
- [ ]  종료 다이얼로그

**디브리핑**

- [ ]  음성 디브리핑 TTS 재생
- [ ]  결과 카드 UI
- [ ]  탐지 포인트 목록
- [ ]  올바른 대응 목록

### 8.3 테스트 체크리스트

- [ ]  온보딩 플로우 완료
- [ ]  각 시나리오 정상 진행
- [ ]  사용자 거부 시 정상 종료
- [ ]  5분 타임아웃 정상 작동
- [ ]  디브리핑 정상 표시
- [ ]  오프라인 에러 처리
- [ ]  마이크 권한 거부 처리

---

**문서 끝**