import { TERMINATION_KEYWORDS, type TerminationReason } from './types'

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
  return text.includes('[END_SCENARIO]')
}

function removeEndScenarioTag(text: string): string {
  return text.replace(/\[END_SCENARIO\]/g, '').trim()
}

export { detectTermination, hasEndScenarioTag, removeEndScenarioTag }
export type { TerminationResult }
