export interface Position {
  x: number
  y: number
}

export interface StartNode {
  type: 'start'
  position: Position
  edge_order: string[]
}

export interface OverrideAgentNode {
  type: 'override_agent'
  label?: string
  position: Position
  edge_order: string[]
  additional_prompt?: string
}

export interface EndNode {
  type: 'end'
  position: Position
}

export type WorkflowNode = StartNode | OverrideAgentNode | EndNode

export interface UnconditionalCondition {
  type: 'unconditional'
}

export interface LLMCondition {
  type: 'llm'
  condition: string
}

export type ForwardCondition = UnconditionalCondition | LLMCondition

export interface WorkflowEdge {
  source: string
  target: string
  forward_condition: ForwardCondition
}

export interface VoiceSettings {
  speed?: number
  stability?: number
  similarity_boost?: number
}

export interface TtsConfig {
  voice_id: string
  model_id?: string
  optimize_streaming_latency?: number
  voice_settings?: VoiceSettings
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
    llm: string
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
