/**
 * useSignedUrl Hook
 * ElevenLabs Signed URL을 획득하고 캐싱하는 훅
 *
 * Signed URL 특징:
 * - 15분 유효
 * - 1회성 (한 번 사용하면 만료)
 * - 서버 인증 필요 (Supabase Auth JWT)
 *
 * 캐싱 전략:
 * - 10분 캐시 (15분 유효기간 고려하여 여유 확보)
 * - 대화 시작 직전에 호출하여 만료 위험 최소화
 */

import { useState, useCallback, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const CACHE_DURATION_MS = 10 * 60 * 1000

interface SignedUrlCache {
  url: string
  timestamp: number
}

interface UseSignedUrlReturn {
  signedUrl: string | null
  isLoading: boolean
  error: string | null
  fetchSignedUrl: () => Promise<string | null>
  clearCache: () => void
}

function useSignedUrl(agentId: string): UseSignedUrlReturn {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cacheRef = useRef<SignedUrlCache | null>(null)

  const isCacheValid = useCallback((): boolean => {
    if (!cacheRef.current) return false
    const elapsed = Date.now() - cacheRef.current.timestamp
    return elapsed < CACHE_DURATION_MS
  }, [])

  const fetchSignedUrl = useCallback(async (): Promise<string | null> => {
    if (isCacheValid() && cacheRef.current) {
      setSignedUrl(cacheRef.current.url)
      return cacheRef.current.url
    }

    if (!agentId) {
      setError('Agent ID가 필요합니다')
      return null
    }

    if (!isSupabaseConfigured()) {
      setError('Supabase 설정이 없습니다')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'elevenlabs-get-signed-url',
        {
          body: { agent_id: agentId },
        }
      )

      if (fnError) {
        throw new Error(fnError.message)
      }

      if (!data?.signed_url) {
        throw new Error('Signed URL을 받지 못했습니다')
      }

      const url = data.signed_url as string

      cacheRef.current = {
        url,
        timestamp: Date.now(),
      }

      setSignedUrl(url)
      return url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signed URL 획득 실패'
      setError(message)
      console.error('Failed to fetch signed URL:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [agentId, isCacheValid])

  const clearCache = useCallback(() => {
    cacheRef.current = null
    setSignedUrl(null)
  }, [])

  return {
    signedUrl,
    isLoading,
    error,
    fetchSignedUrl,
    clearCache,
  }
}

export { useSignedUrl }
export type { UseSignedUrlReturn }
