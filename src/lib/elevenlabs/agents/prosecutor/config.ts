/**
 * Prosecutor Agent Configuration
 * ElevenLabs Conversational AI 에이전트 설정
 */

import type { ConversationConfig } from '../../types'
import { BASE_SYSTEM_PROMPT, FIRST_MESSAGE } from './prompts/base'

/**
 * 한국어 남성 음성 ID (ElevenLabs)
 * Brian 음성 - 권위적이고 중저음 (영어지만 한국어 지원)
 * 실제 배포 시 한국어 전용 음성으로 교체 필요
 */
export const KOREAN_MALE_VOICE_ID = 'nPczCjzI2devNBz1zQrb'

/**
 * conversation_config 설정
 * TTS, ASR, Agent 설정 통합
 */
export const prosecutorConversationConfig: ConversationConfig = {
  tts: {
    voice_id: KOREAN_MALE_VOICE_ID,
    model_id: 'eleven_turbo_v2_5',
    optimize_streaming_latency: 3,
    voice_settings: {
      speed: 1.2,
    },
  },

  asr: {
    provider: 'elevenlabs',
    language: 'ko',
  },

  agent: {
    prompt: {
      llm: 'gpt-4o-mini',
      prompt: BASE_SYSTEM_PROMPT,
    },
    first_message: FIRST_MESSAGE,
    language: 'ko',
  },
}

/**
 * 에이전트 메타데이터
 */
export const prosecutorAgentMetadata = {
  name: '검찰 사칭 보이스피싱 시뮬레이션',
  description: '보이스피싱 예방 교육을 위한 검찰 사칭 시나리오 시뮬레이션',
  scenario_type: 'prosecutor' as const,
  version: '1.0.0',
}
