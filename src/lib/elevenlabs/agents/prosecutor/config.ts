/**
 * Prosecutor Agent Configuration
 * ElevenLabs Conversational AI 에이전트 설정
 */

import type { ConversationConfig } from '../../types'
import { BASE_SYSTEM_PROMPT, FIRST_MESSAGE } from './prompts/base'

/**
 * 한국어 남성 음성 ID (ElevenLabs)
 * ELEVENLABS_VOICE_ID 환경변수로 한국어 전용 음성으로 교체 가능
 * 후보군
 * 1. 0mlAtfsvMzFpppUuNWkV
 * 2. r2b2z8wPmZeh7CQksHSs
 * 3. 5BPXIholvVqIEs2WxN5F
 */
const DEFAULT_KOREAN_MALE_VOICE_ID = '5BPXIholvVqIEs2WxN5F'
export const KOREAN_MALE_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || DEFAULT_KOREAN_MALE_VOICE_ID

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
      llm: 'gemini-2.5-flash-lite-preview-09-2025',
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
