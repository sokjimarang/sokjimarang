import type { ScenarioType } from '@/types/database'
import type { Scenario } from './types'
import { prosecutorScenario } from './prosecutor'
import { bankScenario } from './bank'
import { familyEmergencyScenario } from './familyEmergency'
import { deliverySubsidyScenario } from './deliverySubsidy'

const SCENARIOS: Record<ScenarioType, Scenario> = {
  prosecutor: prosecutorScenario,
  bank: bankScenario,
  family_emergency: familyEmergencyScenario,
  delivery_subsidy: deliverySubsidyScenario,
}

function getScenario(type: ScenarioType): Scenario {
  return SCENARIOS[type]
}

function getAllScenarios(): Scenario[] {
  return Object.values(SCENARIOS)
}

function getScenarioMetadata(type: ScenarioType) {
  return SCENARIOS[type].metadata
}

export { SCENARIOS, getScenario, getAllScenarios, getScenarioMetadata }

export type {
  Scenario,
  ScenarioMetadata,
  ScenarioPromptConfig,
  DetectionPoint,
  CorrectResponse,
  TerminationReason,
} from './types'
export { TERMINATION_KEYWORDS } from './types'

export { injectContext, getHonorific, AGE_GROUP_LABELS, REGION_LABELS } from './contextInjector'

export {
  detectTermination,
  hasEndScenarioTag,
  removeEndScenarioTag,
} from './terminationDetector'
export type { TerminationResult } from './terminationDetector'
