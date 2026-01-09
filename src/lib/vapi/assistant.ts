import {
  SCAM_SCENARIO_SYSTEM_PROMPT,
  FIRST_MESSAGE,
  END_CALL_PHRASES,
} from "@/lib/gemini/prompts";

/**
 * Vapi Transient Assistant 설정
 *
 * Vapi에서 사용할 어시스턴트 설정을 정의합니다.
 * Custom LLM + ElevenLabs TTS + Whisper STT를 통합합니다.
 *
 * @see https://docs.vapi.ai/assistants
 */
export function createScamScenarioAssistant(serverUrl: string) {
  return {
    name: "속지마랑 - 보이스피싱 시뮬레이터",

    model: {
      provider: "custom-llm",
      url: `${serverUrl}/api/custom-llm`,
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: SCAM_SCENARIO_SYSTEM_PROMPT,
        },
      ],
    },

    voice: {
      provider: "11labs",
      voiceId: "nPczCjzI2devNBz1zQrb", // Brian (남성, 권위있는 톤)
      model: "eleven_flash_v2_5",
      stability: 0.5,
      similarityBoost: 0.75,
      optimizeStreamingLatency: 4,
      speed: 1.2,
    },

    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "ko",
    },

    firstMessage: FIRST_MESSAGE,

    serverUrl: `${serverUrl}/api/vapi/webhook`,

    endCallPhrases: END_CALL_PHRASES,

    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 300,
    backgroundSound: "off",

    metadata: {
      scenarioType: "financial-scam",
      version: "1.0.0",
    },
  };
}

/**
 * 어시스턴트 설정 타입
 */
export type AssistantConfig = ReturnType<typeof createScamScenarioAssistant>;
