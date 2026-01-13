/**
 * ElevenLabs Conversational AI Module
 * 보이스피싱 시뮬레이션을 위한 ElevenLabs 연동 모듈
 */

export {
  startConversation,
  startConversationWithContext,
  endConversation,
  createDynamicVariables,
} from './conversation'
export type {
  ConversationInstance,
  DynamicVariables,
  ConversationEventHandlers,
  StartConversationOptions,
  StartConversationWithContextOptions,
} from './conversation'

export { useSignedUrl } from './hooks'
export type { UseSignedUrlReturn } from './hooks'
