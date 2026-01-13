import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTrainingStore } from '@/stores'
import { useVapiCall } from '@/hooks/useVapiCall'
import { getScenarioMetadata } from '@/lib/scenarios'
import { formatTime } from '@/lib/time'
import { useOverlay, ConfirmModal } from '@/components/ui/overlay'

function CallPage() {
  const navigate = useNavigate()
  const { open } = useOverlay()
  const hasStartedRef = useRef(false)

  const { currentSession, callDuration, isAiSpeaking, status } = useTrainingStore()

  const scenarioType = currentSession?.scenario_type
  const scenario = scenarioType ? getScenarioMetadata(scenarioType) : null

  const { isConnecting, isConnected, error, startCall, endCall } = useVapiCall({
    scenarioType: scenarioType!,
    onCallEnd: () => {
      navigate('/training/debrief')
    },
  })

  useEffect(() => {
    if (!scenarioType || !scenario) {
      navigate('/')
    }
  }, [scenarioType, scenario, navigate])

  useEffect(() => {
    if (scenarioType && scenario && !hasStartedRef.current) {
      hasStartedRef.current = true
      startCall()
    }
  }, [scenarioType, scenario, startCall])

  useEffect(() => {
    if (status === 'debriefing') {
      navigate('/training/debrief')
    }
  }, [status, navigate])

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
        <div className="text-7xl">📞</div>

        <div className="text-center">
          <p className="text-2xl font-medium mb-2">
            {isConnecting ? '연결 중...' : isConnected ? '통화 중' : '준비 중'}
          </p>
          <p className="text-4xl font-mono">{formatTime(callDuration)}</p>
        </div>

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

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </main>

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
