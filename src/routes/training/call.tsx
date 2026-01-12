import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTrainingStore } from '@/stores'
import { useVapiCall } from '@/hooks/useVapiCall'
import { getScenarioMetadata } from '@/lib/scenarios'
import type { ScenarioType } from '@/types/database'
import { useOverlay, ConfirmModal } from '@/components/ui/overlay'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function CallPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { open } = useOverlay()
  const hasStartedRef = useRef(false)

  const scenarioType = searchParams.get('scenario') as ScenarioType
  const announceTraining = searchParams.get('announce') === '1'
  const scenario = scenarioType ? getScenarioMetadata(scenarioType) : null

  const { callDuration, isAiSpeaking, status } = useTrainingStore()

  const { isConnecting, isConnected, error, startCall, endCall } = useVapiCall({
    scenarioType,
    announceTraining,
    onCallEnd: () => {
      navigate(`/training/debrief?scenario=${scenarioType}`)
    },
  })

  useEffect(() => {
    if (!scenarioType || !scenario) {
      navigate('/')
    }
  }, [scenarioType, scenario, navigate])

  // Auto-start call on mount
  useEffect(() => {
    if (scenarioType && scenario && !hasStartedRef.current) {
      hasStartedRef.current = true
      startCall()
    }
  }, [scenarioType, scenario, startCall])

  useEffect(() => {
    if (status === 'debriefing') {
      navigate(`/training/debrief?scenario=${scenarioType}`)
    }
  }, [status, scenarioType, navigate])

  const handleEndCall = async () => {
    const confirmed = await open<boolean>(({ close }) => (
      <ConfirmModal
        close={close}
        title="통화 종료"
        message="훈련을 종료하시겠습니까?"
        confirmText="종료"
        cancelText="계속하기"
        confirmDestructive
      />
    ))

    if (confirmed) {
      endCall()
    }
  }

  if (!scenario) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <main className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Phone Icon */}
        <div className="text-7xl">📞</div>

        {/* Status and Timer */}
        <div className="text-center">
          <p className="text-2xl font-medium mb-2">
            {isConnecting ? '연결 중...' : isConnected ? '통화 중' : '준비 중'}
          </p>
          <p className="text-4xl font-mono">{formatTime(callDuration)}</p>
        </div>

        {/* Audio Level Visualization */}
        <div className="flex items-center justify-center gap-1 h-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 rounded-full transition-all ${
                isAiSpeaking
                  ? 'bg-green-500 animate-pulse'
                  : isConnected
                    ? 'bg-blue-500'
                    : 'bg-gray-600'
              }`}
              style={{
                height: isAiSpeaking ? '24px' : isConnected ? '16px' : '8px',
                animationDelay: isAiSpeaking ? `${i * 50}ms` : undefined,
              }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </main>

      {/* End Button */}
      <footer className="p-8">
        <button
          onClick={handleEndCall}
          disabled={!isConnected && !isConnecting}
          className={`px-12 py-4 rounded-xl font-medium transition-colors ${
            isConnected || isConnecting
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          훈련 종료
        </button>
      </footer>
    </div>
  )
}

export { CallPage }
