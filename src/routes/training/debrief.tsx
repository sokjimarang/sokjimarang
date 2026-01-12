import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTrainingStore } from '@/stores'
import { getScenarioMetadata, removeEndScenarioTag } from '@/lib/scenarios'
import type { ScenarioType } from '@/types/database'

function DebriefPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const scenarioType = searchParams.get('scenario') as ScenarioType
  const scenario = scenarioType ? getScenarioMetadata(scenarioType) : null

  const { transcripts, callDuration, reset } = useTrainingStore()

  const handleGoHome = () => {
    reset()
    navigate('/')
  }

  const handleRetry = () => {
    reset()
    navigate(`/training/call?scenario=${scenarioType}`)
  }

  if (!scenario) {
    navigate('/')
    return null
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}분 ${secs}초`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900">훈련 결과</h1>
        <p className="text-gray-600 mt-1">{scenario.name} 시나리오</p>
      </header>

      <main className="p-4 space-y-6">
        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">📊 훈련 요약</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{formatTime(callDuration)}</p>
              <p className="text-sm text-gray-500">통화 시간</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{transcripts.length}</p>
              <p className="text-sm text-gray-500">대화 턴</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">⚠️ 탐지 포인트</h2>
          <div className="space-y-3">
            {scenario.detectionPoints.map((point, index) => (
              <div key={index} className="flex gap-3 p-3 bg-amber-50 rounded-lg">
                <span className="text-amber-600 text-lg">🔍</span>
                <div>
                  <p className="font-medium text-amber-900">&quot;{point.pattern}&quot;</p>
                  <p className="text-sm text-amber-700">{point.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-3">✅ 올바른 대응법</h2>
          <div className="space-y-2">
            {scenario.correctResponses.map((response, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-green-900">{response.action}</p>
                  <p className="text-sm text-green-700">{response.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {transcripts.length > 0 && (
          <section className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">💬 대화 기록</h2>
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

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleRetry}
            className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            다시 훈련하기
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            홈으로
          </button>
        </div>
      </main>
    </div>
  )
}

export { DebriefPage }
