import type { ScenarioType } from '@/types/database'

interface DetectionPoint {
  pattern: string
  explanation: string
}

interface CorrectResponse {
  action: string
  description: string
}

interface ScenarioMetadata {
  id: ScenarioType
  name: string
  description: string
  impersonation: string
  targetAction: string
  icon: string
  detectionPoints: DetectionPoint[]
  correctResponses: CorrectResponse[]
}

interface ScenarioPromptConfig {
  systemPrompt: string
  firstMessage: string
}

interface Scenario {
  metadata: ScenarioMetadata
  promptConfig: ScenarioPromptConfig
}

type TerminationReason =
  | 'user_rejection'
  | 'user_suspicion'
  | 'scenario_end'
  | 'timeout'
  | 'call_ended'

type ScenarioTerminationReason = 'user_rejected' | 'user_suspected' | 'user_fooled'

interface EndScenarioData {
  reached_stage: number
  termination_reason: ScenarioTerminationReason
}

const TERMINATION_KEYWORDS = {
  rejection: ['안 해요', '안 할게요', '끊을게요', '끊겠습니다', '사기', '신고', '경찰', '112'],
  suspicion: ['이상해', '의심', '확인해볼게', '직접 전화', '가족한테', '은행에 확인'],
  scenarioEnd: ['[END_SCENARIO]'],
} as const

export type {
  Scenario,
  ScenarioMetadata,
  ScenarioPromptConfig,
  DetectionPoint,
  CorrectResponse,
  TerminationReason,
  ScenarioTerminationReason,
  EndScenarioData,
}
export { TERMINATION_KEYWORDS }
