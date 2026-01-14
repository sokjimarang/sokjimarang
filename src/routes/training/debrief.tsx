import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { useTrainingStore } from '@/stores'
import { getScenarioMetadata, removeEndScenarioTag } from '@/lib/scenarios'
import { formatTime } from '@/lib/time'
import { TOTAL_STAGES } from '@/lib/constants'
import { getDebriefMessage } from './debrief.utils'

function DebriefPage() {
  const navigate = useNavigate()

  const { transcripts, callDuration, currentSession, reset, saveSession } = useTrainingStore()

  const scenarioType = currentSession?.scenario_type
  const scenario = scenarioType ? getScenarioMetadata(scenarioType) : null

  const handleComplete = useCallback(() => {
    saveSession()
    reset()
    navigate('/')
  }, [saveSession, reset, navigate])

  if (!scenario) {
    navigate('/')
    return null
  }

  const reachedStage = currentSession?.reached_stage ?? 0
  const debriefMessage = getDebriefMessage(currentSession?.termination_reason ?? null)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <button
          onClick={handleComplete}
          className="text-gray-500 hover:text-gray-700 mr-4"
        >
          ← 홈
        </button>
      </header>

      <main className="p-4 space-y-6">
        <section className={`rounded-xl p-4 shadow-sm border-l-4 ${debriefMessage.bgClass} ${debriefMessage.borderClass}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{debriefMessage.icon}</span>
            <div>
              <h2 className={`font-bold text-lg ${debriefMessage.textClass}`}>{debriefMessage.title}</h2>
              <p className={`text-sm mt-1 ${debriefMessage.textClass} opacity-90`}>{debriefMessage.description}</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>📊</span> 훈련 결과
          </h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="text-gray-500">시나리오:</span> {scenario.name}
            </p>
            <p>
              <span className="text-gray-500">진행 단계:</span> {reachedStage} / {TOTAL_STAGES} 단계
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
            {scenario.detectionPoints.slice(0, reachedStage + 1).map((point, index) => (
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
          onClick={handleComplete}
          className="w-full py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          완료
        </button>
      </main>
    </div>
  )
}

export { DebriefPage }
