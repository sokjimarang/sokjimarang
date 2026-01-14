import {
  TERMINATION_KEYWORDS,
  type TerminationReason,
  type EndScenarioData,
  type ScenarioTerminationReason,
} from './types'

const VALID_TERMINATION_REASONS: ScenarioTerminationReason[] = [
  'user_rejected',
  'user_suspected',
  'user_fooled',
]

interface TerminationResult {
  shouldTerminate: boolean
  reason: TerminationReason | null
  matchedKeyword: string | null
}

function detectTermination(text: string): TerminationResult {
  const lowerText = text.toLowerCase()

  for (const keyword of TERMINATION_KEYWORDS.scenarioEnd) {
    if (text.includes(keyword)) {
      return {
        shouldTerminate: true,
        reason: 'scenario_end',
        matchedKeyword: keyword,
      }
    }
  }

  for (const keyword of TERMINATION_KEYWORDS.rejection) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        shouldTerminate: true,
        reason: 'user_rejection',
        matchedKeyword: keyword,
      }
    }
  }

  for (const keyword of TERMINATION_KEYWORDS.suspicion) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        shouldTerminate: true,
        reason: 'user_suspicion',
        matchedKeyword: keyword,
      }
    }
  }

  return {
    shouldTerminate: false,
    reason: null,
    matchedKeyword: null,
  }
}

function hasEndScenarioTag(text: string): boolean {
  return /\[END_SCENARIO(:\{.*?\})?\]/.test(text)
}

function parseEndScenarioTag(text: string): EndScenarioData | null {
  const extendedPattern = /\[END_SCENARIO:(\{[^}]+\})\]/
  const extendedMatch = text.match(extendedPattern)

  if (extendedMatch) {
    try {
      const data = JSON.parse(extendedMatch[1]) as Record<string, unknown>
      if (
        typeof data.reached_stage === 'number' &&
        typeof data.termination_reason === 'string' &&
        VALID_TERMINATION_REASONS.includes(data.termination_reason as ScenarioTerminationReason)
      ) {
        return {
          reached_stage: data.reached_stage,
          termination_reason: data.termination_reason as ScenarioTerminationReason,
        }
      }
    } catch {
      // JSON 파싱 실패 시 폴백
    }
  }

  if (text.includes('[END_SCENARIO]')) {
    return {
      reached_stage: 0,
      termination_reason: 'user_fooled',
    }
  }

  return null
}

function removeEndScenarioTag(text: string): string {
  return text.replace(/\[END_SCENARIO(:\{[^}]*\})?\]/g, '').trim()
}

export { detectTermination, hasEndScenarioTag, parseEndScenarioTag, removeEndScenarioTag }
export type { TerminationResult }
