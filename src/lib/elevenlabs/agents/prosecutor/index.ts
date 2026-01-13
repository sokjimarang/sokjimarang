/**
 * Prosecutor Agent
 * 검찰 사칭형 보이스피싱 시뮬레이션 에이전트 생성 함수
 */

import type { CreateAgentRequest, WorkflowDefinition } from '../../types'
import { prosecutorConversationConfig, prosecutorAgentMetadata } from './config'
import { prosecutorWorkflow } from './workflow'

export { prosecutorConversationConfig, prosecutorAgentMetadata }
export { prosecutorWorkflow }

/**
 * ElevenLabs API에 전달할 에이전트 생성 요청 객체 생성
 */
export function createProsecutorAgentRequest(): CreateAgentRequest {
  return {
    name: prosecutorAgentMetadata.name,
    conversation_config: prosecutorConversationConfig,
    workflow: prosecutorWorkflow as WorkflowDefinition,
  }
}

/**
 * 에이전트 설정을 JSON으로 직렬화 (디버깅/로깅용)
 */
export function serializeProsecutorAgent(): string {
  const request = createProsecutorAgentRequest()
  return JSON.stringify(request, null, 2)
}
