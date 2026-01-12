import { useState, useEffect, useCallback, useRef } from 'react'
import Vapi from '@vapi-ai/web'
import { useTrainingStore, useUserStore } from '@/stores'
import { getScenario, hasEndScenarioTag } from '@/lib/scenarios'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { ScenarioType, TrainingSession } from '@/types/database'

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

interface UseVapiCallOptions {
  scenarioType: ScenarioType
  onCallEnd?: () => void
}

function useVapiCall({ scenarioType, onCallEnd }: UseVapiCallOptions) {
  const vapiRef = useRef<Vapi | null>(null)
  const timerRef = useRef<number | null>(null)
  const durationRef = useRef(0)

  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { context } = useUserStore()
  const {
    setSession,
    setVapiCallId,
    addTranscript,
    setAiSpeaking,
    updateCallDuration,
    endTraining,
  } = useTrainingStore()

  const scenario = getScenario(scenarioType)

  const createSession = useCallback(async (): Promise<TrainingSession | null> => {
    if (!isSupabaseConfigured()) return null

    const { data, error: insertError } = await supabase
      .from('training_sessions')
      .insert({
        scenario_type: scenarioType,
        user_context: context,
        started_at: new Date().toISOString(),
      } as never)
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create session:', insertError)
      return null
    }

    return data as unknown as TrainingSession
  }, [scenarioType, context])

  const startCall = useCallback(async () => {
    if (!VAPI_PUBLIC_KEY) {
      setError('Vapi 설정이 없습니다')
      return
    }

    setIsConnecting(true)
    setError(null)
    durationRef.current = 0

    try {
      const session = await createSession()
      if (session) {
        setSession(session)
      }

      const vapi = new Vapi(VAPI_PUBLIC_KEY)
      vapiRef.current = vapi

      vapi.on('call-start', () => {
        setIsConnecting(false)
        setIsConnected(true)

        timerRef.current = window.setInterval(() => {
          durationRef.current += 1
          updateCallDuration(durationRef.current)
        }, 1000)
      })

      vapi.on('call-end', () => {
        setIsConnected(false)
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        endTraining('call_ended')
        onCallEnd?.()
      })

      vapi.on('speech-start', () => {
        setAiSpeaking(true)
      })

      vapi.on('speech-end', () => {
        setAiSpeaking(false)
      })

      vapi.on('message', (message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          const speaker = message.role === 'assistant' ? 'ai' : 'user'
          addTranscript({
            speaker,
            text: message.transcript,
            timestamp: Date.now(),
          })

          if (speaker === 'ai' && hasEndScenarioTag(message.transcript)) {
            setTimeout(() => {
              vapi.stop()
            }, 2000)
          }
        }
      })

      vapi.on('error', (err) => {
        console.error('Vapi error:', err)
        setError('통화 중 오류가 발생했습니다')
        setIsConnecting(false)
        setIsConnected(false)
      })

      const call = await vapi.start({
        model: {
          provider: 'custom-llm',
          url: `${SUPABASE_URL}/functions/v1/custom-llm`,
          model: 'gemini-2.0-flash',
        },
        voice: {
          provider: 'playht',
          voiceId: 'ko-KR-Standard-A',
        },
        firstMessage: scenario.promptConfig.firstMessage,
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'ko',
        },
        server: {
          url: `${SUPABASE_URL}/functions/v1/vapi-webhook`,
        },
      })

      if (call?.id) {
        setVapiCallId(call.id)
      }
    } catch (err) {
      console.error('Failed to start call:', err)
      setError('통화 연결에 실패했습니다')
      setIsConnecting(false)
    }
  }, [
    scenario,
    createSession,
    setSession,
    setVapiCallId,
    addTranscript,
    setAiSpeaking,
    updateCallDuration,
    endTraining,
    onCallEnd,
  ])

  const endCall = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return {
    isConnecting,
    isConnected,
    error,
    startCall,
    endCall,
  }
}

export { useVapiCall }
