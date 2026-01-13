/**
 * ElevenLabs Conversation Module
 * 대화 시작/종료 로직 + Dynamic Variables 컨텍스트 주입
 *
 * Dynamic Variables:
 * - 프롬프트에 {{var_name}} 형태로 정의된 변수에 런타임 값 주입
 * - ElevenLabs 권장 방식 (프롬프트 템플릿 + 값 분리)
 * - 지원 타입: string, number, boolean (모두 string으로 변환)
 */

import { Conversation } from '@elevenlabs/client'
import type { UserContext, AgeGroup, Region } from '@/types/database'

export type ConversationInstance = Awaited<ReturnType<typeof Conversation.startSession>>

const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  under50: '50대 미만',
  '50s': '50대',
  '60s': '60대',
  '70plus': '70대 이상',
}

const REGION_LABELS: Record<Region, string> = {
  seoul: '서울',
  gyeonggi: '경기',
  other: '기타 지역',
}

export type DynamicVariables = Record<string, string | number | boolean>

export interface ConversationEventHandlers {
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: { source: string; message: string }) => void
  onError?: (message: string, context?: unknown) => void
  onModeChange?: (mode: { mode: string }) => void
}

export interface StartConversationOptions extends ConversationEventHandlers {
  signedUrl: string
  dynamicVariables?: DynamicVariables
}

export interface StartConversationWithContextOptions extends ConversationEventHandlers {
  signedUrl: string
  userContext: UserContext
}

/**
 * UserContext를 Dynamic Variables로 변환
 */
export function createDynamicVariables(userContext: UserContext): DynamicVariables {
  return {
    age_group: AGE_GROUP_LABELS[userContext.age_group ?? '50s'],
    region: REGION_LABELS[userContext.region ?? 'seoul'],
    children: String(userContext.children ?? 0),
    grandchildren: String(userContext.grandchildren ?? 0),
  }
}

/**
 * 대화 시작 (기본)
 */
export async function startConversation(
  options: StartConversationOptions
): Promise<ConversationInstance> {
  const conversation = await Conversation.startSession({
    signedUrl: options.signedUrl,
    dynamicVariables: options.dynamicVariables,
    onConnect: options.onConnect,
    onDisconnect: options.onDisconnect,
    onMessage: options.onMessage
      ? (payload) => options.onMessage!({ source: payload.source, message: payload.message })
      : undefined,
    onError: options.onError,
    onModeChange: options.onModeChange,
  })

  return conversation
}

/**
 * 대화 시작 (UserContext 자동 변환)
 * Preset UI에서 수집한 컨텍스트를 자동으로 Dynamic Variables로 변환하여 주입
 */
export async function startConversationWithContext(
  options: StartConversationWithContextOptions
): Promise<ConversationInstance> {
  const dynamicVariables = createDynamicVariables(options.userContext)

  return startConversation({
    signedUrl: options.signedUrl,
    dynamicVariables,
    onConnect: options.onConnect,
    onDisconnect: options.onDisconnect,
    onMessage: options.onMessage,
    onError: options.onError,
    onModeChange: options.onModeChange,
  })
}

/**
 * 대화 종료
 */
export async function endConversation(conversation: ConversationInstance): Promise<void> {
  await conversation.endSession()
}
