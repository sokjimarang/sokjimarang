import { useState, useEffect, useCallback, useRef } from 'react'
import { useTrainingStore, useUserStore } from '@/stores'
import { useSignedUrl } from '@/lib/elevenlabs/hooks/useSignedUrl'
import {
  startConversationWithContext,
  endConversation,
  type ConversationInstance,
} from '@/lib/elevenlabs/conversation'
import { hasEndScenarioTag } from '@/lib/scenarios'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  MAX_CALL_DURATION_SECONDS,
  TIMER_INTERVAL_MS,
  END_SCENARIO_DELAY_MS,
} from '@/lib/constants'
import type { ScenarioType, TrainingSession } from '@/types/database'

const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID

interface UseElevenLabsCallOptions {
  scenarioType: ScenarioType
  onCallEnd?: () => void
}

function useElevenLabsCall({ scenarioType, onCallEnd }: UseElevenLabsCallOptions) {
  const conversationRef = useRef<ConversationInstance | null>(null)
  const timerRef = useRef<number | null>(null)
  const durationRef = useRef(0)
  const maxDurationReachedRef = useRef(false)
  const isEndingRef = useRef(false)

  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { context } = useUserStore()
  const {
    setSession,
    setConversationId,
    addTranscript,
    setAiSpeaking,
    updateCallDuration,
    endTraining,
  } = useTrainingStore()

  const { fetchSignedUrl, clearCache } = useSignedUrl(ELEVENLABS_AGENT_ID || '')

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

  const handleEndConversation = useCallback(async (reason: string) => {
    if (isEndingRef.current) return
    isEndingRef.current = true

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (conversationRef.current) {
      try {
        await endConversation(conversationRef.current)
      } catch (err) {
        console.error('Error ending conversation:', err)
      }
      conversationRef.current = null
    }

    setIsConnected(false)
    endTraining(reason)
    onCallEnd?.()
  }, [endTraining, onCallEnd])

  const startCall = useCallback(async () => {
    if (!ELEVENLABS_AGENT_ID) {
      setError('ElevenLabs Agent ID 설정이 없습니다')
      return
    }

    setIsConnecting(true)
    setError(null)
    durationRef.current = 0
    maxDurationReachedRef.current = false
    isEndingRef.current = false

    clearCache()

    try {
      const session = await createSession()
      if (session) {
        setSession(session)
      }

      const signedUrl = await fetchSignedUrl()
      if (!signedUrl) {
        throw new Error('Signed URL을 받지 못했습니다')
      }

      const conversation = await startConversationWithContext({
        signedUrl,
        userContext: context,
        onConnect: () => {
          setIsConnecting(false)
          setIsConnected(true)

          timerRef.current = window.setInterval(() => {
            durationRef.current += 1
            updateCallDuration(durationRef.current)

            if (durationRef.current >= MAX_CALL_DURATION_SECONDS && !maxDurationReachedRef.current) {
              maxDurationReachedRef.current = true
              handleEndConversation('max_duration_reached')
            }
          }, TIMER_INTERVAL_MS)
        },
        onDisconnect: () => {
          if (!isEndingRef.current) {
            const reason = maxDurationReachedRef.current ? 'max_duration_reached' : 'call_ended'
            handleEndConversation(reason)
          }
        },
        onMessage: (message) => {
          const speaker = message.source === 'ai' ? 'ai' : 'user'
          addTranscript({
            speaker,
            text: message.message,
            timestamp: Date.now(),
          })

          if (speaker === 'ai' && hasEndScenarioTag(message.message)) {
            setTimeout(() => {
              handleEndConversation('scenario_completed')
            }, END_SCENARIO_DELAY_MS)
          }
        },
        onModeChange: (modeInfo) => {
          setAiSpeaking(modeInfo.mode === 'speaking')
        },
        onError: (message, context) => {
          console.error('ElevenLabs error:', message, context)
          setError('통화 중 오류가 발생했습니다')
          setIsConnecting(false)
          setIsConnected(false)
        },
      })

      conversationRef.current = conversation

      if (session?.id) {
        setConversationId(session.id)
      }
    } catch (err) {
      console.error('Failed to start call:', err)
      setError('통화 연결에 실패했습니다')
      setIsConnecting(false)
    }
  }, [
    context,
    createSession,
    setSession,
    setConversationId,
    addTranscript,
    setAiSpeaking,
    updateCallDuration,
    fetchSignedUrl,
    clearCache,
    handleEndConversation,
  ])

  const endCall = useCallback(() => {
    handleEndConversation('user_ended')
  }, [handleEndConversation])

  useEffect(() => {
    return () => {
      if (conversationRef.current) {
        endConversation(conversationRef.current).catch(console.error)
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

export { useElevenLabsCall }
