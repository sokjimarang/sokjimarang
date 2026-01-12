import { useEffect } from 'react'
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

  const scenarioType = searchParams.get('scenario') as ScenarioType
  const scenario = scenarioType ? getScenarioMetadata(scenarioType) : null

  const { transcripts, callDuration, isAiSpeaking, status } = useTrainingStore()

  const { isConnecting, isConnected, error, startCall, endCall } = useVapiCall({
    scenarioType,
    onCallEnd: () => {
      navigate(`/training/debrief?scenario=${scenarioType}`)
    },
  })

  useEffect(() => {
    if (!scenarioType || !scenario) {
      navigate('/')
    }
  }, [scenarioType, scenario, navigate])

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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-4 flex items-center justify-between border-b border-gray-800">
        <div>
          <p className="text-sm text-gray-400">{scenario.name}</p>
          <p className="text-xs text-gray-500">{scenario.impersonation}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono">{formatTime(callDuration)}</p>
          <p className="text-xs text-gray-400">
            {isConnecting ? '연결 중...' : isConnected ? '통화 중' : '대기 중'}
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {transcripts.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.speaker === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isAiSpeaking
                ? 'bg-green-500 animate-pulse'
                : isConnected
                  ? 'bg-blue-500'
                  : 'bg-gray-700'
            }`}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            </svg>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {!isConnected && !isConnecting && (
            <button
              onClick={startCall}
              className="px-8 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors"
            >
              통화 시작
            </button>
          )}

          {(isConnected || isConnecting) && (
            <button
              onClick={handleEndCall}
              className="px-8 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
            >
              통화 종료
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

export { CallPage }
