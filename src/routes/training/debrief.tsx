import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTrainingStore } from '@/stores'
import { getScenarioMetadata, removeEndScenarioTag } from '@/lib/scenarios'
import type { ScenarioType } from '@/types/database'

type DebriefPhase = 'voice' | 'screen'

function DebriefPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [phase, setPhase] = useState<DebriefPhase>('voice')
  const [progress, setProgress] = useState(0)

  const scenarioType = searchParams.get('scenario') as ScenarioType
  const scenario = scenarioType ? getScenarioMetadata(scenarioType) : null

  const { transcripts, callDuration, currentSession, reset, saveSession } = useTrainingStore()

  const handleGoHome = useCallback(() => {
    saveSession()
    reset()
    navigate('/')
  }, [saveSession, reset, navigate])

  const handleRetry = useCallback(() => {
    saveSession()
    reset()
    navigate('/training/prepare')
  }, [saveSession, reset, navigate])

  const handleSkipVoice = useCallback(() => {
    setPhase('screen')
  }, [])

  // Voice debriefing with Web Speech API
  useEffect(() => {
    if (phase !== 'voice' || !scenario) return

    const reachedStage = currentSession?.reached_stage ?? 0

    const script = `훈련이 종료되었습니다.
      오늘은 ${scenario.name} 시나리오를 경험하셨습니다.
      ${reachedStage}단계까지 진행하셨습니다.
      ${scenario.detectionPoints[0]?.explanation || ''}
      실제 ${scenario.impersonation}은 절대로 전화로 ${scenario.targetAction}을 요구하지 않습니다.
      의심되면 끊고 112에 확인하세요.`

    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      // Skip to screen phase if not available
      setTimeout(() => setPhase('screen'), 2000)
      return
    }

    const utterance = new SpeechSynthesisUtterance(script)
    utterance.lang = 'ko-KR'
    utterance.rate = 0.9

    // Progress simulation
    const duration = script.length * 80 // Approximate duration in ms
    const intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalId)
          return 100
        }
        return prev + 100 / (duration / 100)
      })
    }, 100)

    utterance.onend = () => {
      clearInterval(intervalId)
      setProgress(100)
      setTimeout(() => setPhase('screen'), 500)
    }

    utterance.onerror = () => {
      clearInterval(intervalId)
      setPhase('screen')
    }

    speechSynthesis.speak(utterance)

    return () => {
      clearInterval(intervalId)
      speechSynthesis.cancel()
    }
  }, [phase, scenario, currentSession])

  if (!scenario) {
    navigate('/')
    return null
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const reachedStage = currentSession?.reached_stage ?? 0
  const totalStages = 5

  // Phase 1: Voice Debriefing
  if (phase === 'voice') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
          <div className="text-7xl">🎯</div>
          <p className="text-2xl font-medium text-center">훈련 결과를 분석 중...</p>

          {/* Progress Bar */}
          <div className="w-full max-w-xs">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </main>

        <footer className="p-8">
          <button
            onClick={handleSkipVoice}
            className="text-gray-400 text-sm hover:text-white transition-colors"
          >
            건너뛰기
          </button>
        </footer>
      </div>
    )
  }

  // Phase 2: Screen Debriefing
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <button
          onClick={handleGoHome}
          className="text-gray-500 hover:text-gray-700 mr-4"
        >
          ← 홈
        </button>
      </header>

      <main className="p-4 space-y-6">
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📊</span> 훈련 결과
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="text-gray-500">시나리오:</span> {scenario.name}
            </p>
            <p>
              <span className="text-gray-500">진행 단계:</span> {reachedStage} / {totalStages} 단계
            </p>
            <p>
              <span className="text-gray-500">소요 시간:</span> {formatTime(callDuration)}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>⚠️</span> 이런 점이 수상했습니다
          </h2>
          <div className="space-y-3">
            {scenario.detectionPoints.map((point, index) => (
              <div key={index} className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                <p className="font-medium text-amber-900">• &quot;{point.pattern}&quot;</p>
                <p className="text-sm text-amber-700 mt-1 ml-3">→ {point.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>✅</span> 이렇게 대응하세요
          </h2>
          <div className="space-y-2">
            {scenario.correctResponses.map((response, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="text-green-600">•</span>
                <div>
                  <p className="font-medium text-green-900">{response.action}</p>
                  {response.description && (
                    <p className="text-sm text-green-700">{response.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {transcripts.length > 0 && (
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>💬</span> 대화 기록
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transcripts.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.speaker === 'ai'
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'bg-gray-50 border-l-4 border-gray-400'
                  }`}
                >
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {msg.speaker === 'ai' ? '🎭 사기범 (AI)' : '👤 나'}
                  </p>
                  <p className="text-gray-800">{removeEndScenarioTag(msg.text)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <button
          onClick={handleRetry}
          className="w-full py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          다시 훈련하기
        </button>
      </main>
    </div>
  )
}

export { DebriefPage }
