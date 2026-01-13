export type NodeType = 'start' | 'override_agent' | 'end'

export interface Position {
  x: number
  y: number
}

export interface WorkflowNode {
  type: NodeType
  label?: string
  position: Position
  additional_prompt?: string
  edge_order: string[]
}

export interface LLMCondition {
  type: 'llm'
  condition: string
}

export interface WorkflowEdge {
  source: string
  target: string
  forward_condition: LLMCondition
}

export interface TtsConfig {
  voice_id: string
  model_id?: string
  optimize_streaming_latency?: number
}

export interface AsrConfig {
  provider: string
  model?: string
  language?: string
}

export interface LlmConfig {
  model: string
  temperature?: number
  max_tokens?: number
}

export interface AgentConfig {
  prompt: {
    prompt: string
  }
  first_message?: string
  language?: string
}

export interface ConversationConfig {
  tts: TtsConfig
  asr: AsrConfig
  llm?: LlmConfig
  agent: AgentConfig
}

export interface WorkflowDefinition {
  nodes: Record<string, WorkflowNode>
  edges: Record<string, WorkflowEdge>
}

export interface CreateAgentRequest {
  name: string
  conversation_config: ConversationConfig
  workflow?: WorkflowDefinition
}

export interface CreateAgentResponse {
  agent_id: string
}

export interface SignedUrlResponse {
  signed_url: string
}

export type ScenarioEndType = 'rejected' | 'suspected' | 'fooled'
