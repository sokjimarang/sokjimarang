import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTrainingStore } from '@/stores'
import { useElevenLabsCall } from '@/hooks/useElevenLabsCall'
import { getScenarioMetadata } from '@/lib/scenarios'
import { formatTime } from '@/lib/time'
import { useOverlay, ConfirmModal } from '@/components/ui/overlay'
import { TranscriptBubbles } from '@/components/training/TranscriptBubbles'

function CallPage() {
  const navigate = useNavigate()
  const { open } = useOverlay()
  const hasStartedRef = useRef(false)

  const { currentSession, callDuration, isAiSpeaking, status, transcripts } = useTrainingStore()

  const scenarioType = currentSession?.scenario_type
  const scenario = scenarioType ? getScenarioMetadata(scenarioType) : null

  const { isConnecting, isConnected, error, startCall, endCall } = useElevenLabsCall({
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
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* 상단: 연결 상태 + 시간 + 음성 파형 */}
      <header className="flex-shrink-0 pt-8 pb-4 px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <p className="text-xl font-medium mb-1">
              {isConnecting ? '연결 중...' : isConnected ? '통화 중' : '준비 중'}
            </p>
            <p className="text-3xl font-mono">{formatTime(callDuration)}</p>
          </div>

          <div className="flex items-center justify-center gap-1 h-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all ${
                  isAiSpeaking
                    ? 'bg-green-500 animate-pulse'
                    : isConnected
                      ? 'bg-blue-500'
                      : 'bg-gray-600'
                }`}
                style={{
                  height: isAiSpeaking ? '20px' : isConnected ? '12px' : '6px',
                  animationDelay: isAiSpeaking ? `${i * 50}ms` : undefined,
                }}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </div>
      </header>

      {/* 중앙: 실시간 Transcript */}
      <TranscriptBubbles transcripts={transcripts} />

      {/* 하단: 종료 버튼 */}
      <footer className="flex-shrink-0 p-6">
        <button
          onClick={handleEndCall}
          disabled={!isConnected && !isConnecting}
          className={`w-full py-4 rounded-xl font-medium transition-colors ${
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
