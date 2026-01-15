import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTrainingStore } from '@/stores'
import { useElevenLabsCall } from '@/hooks/useElevenLabsCall'
import { getScenarioMetadata } from '@/lib/scenarios'
import { formatTime } from '@/lib/time'
import { useOverlay, ConfirmModal } from '@/components/ui/overlay'
import { TranscriptBubbles } from '@/components/training/TranscriptBubbles'
import { Button } from '@/components/ui/Button'

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
    <div className="h-screen bg-dark-bg text-white flex flex-col">
      {/* 상단: 연결 상태 + 시간 + 음성 파형 */}
      <header className="flex-shrink-0 pt-safe-top pt-8 pb-6 px-4">
        <div className="flex flex-col items-center gap-4">
          {/* 상태 표시 */}
          <div className="px-4 py-2 rounded-full bg-dark-surface/50 backdrop-blur-sm border border-dark-border">
            <p className="text-sm font-medium text-neutral-300">
              {isConnecting ? '연결 중...' : isConnected ? '통화 중' : '준비 중'}
            </p>
          </div>

          {/* 타이머 */}
          <p className="text-4xl font-mono font-semibold tabular-nums">
            {formatTime(callDuration)}
          </p>

          {/* 음성 파형 */}
          <div className="flex items-end gap-1 h-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isAiSpeaking
                    ? 'bg-gradient-to-t from-dark-accent to-primary-300'
                    : isConnected
                      ? 'bg-dark-accent'
                      : 'bg-dark-border'
                }`}
                style={{
                  height: isAiSpeaking
                    ? `${20 + Math.sin((Date.now() / 100 + i) * 0.5) * 10}px`
                    : isConnected
                      ? '12px'
                      : '8px',
                  animationDelay: isAiSpeaking ? `${i * 50}ms` : undefined,
                }}
              />
            ))}
          </div>

          {error && <p className="text-danger-400 text-sm text-center">{error}</p>}
        </div>
      </header>

      {/* 중앙: 실시간 Transcript */}
      <TranscriptBubbles transcripts={transcripts} />

      {/* 하단: 종료 버튼 */}
      <footer className="flex-shrink-0 p-4 pb-safe-bottom">
        <Button
          variant="danger"
          size="lg"
          onClick={handleEndCall}
          disabled={!isConnected && !isConnecting}
          className="w-full shadow-lg shadow-danger-500/20"
        >
          훈련 종료
        </Button>
      </footer>
    </div>
  )
}

export { CallPage }
