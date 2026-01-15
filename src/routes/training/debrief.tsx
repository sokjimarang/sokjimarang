import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  UserIcon,
} from '@heroicons/react/24/solid'
import { ClockIcon } from '@heroicons/react/24/outline'

import { useTrainingStore } from '@/stores'
import { getScenarioMetadata, removeEndScenarioTag } from '@/lib/scenarios'
import { formatTime } from '@/lib/time'
import { TOTAL_STAGES } from '@/lib/constants'
import { getDebriefMessage } from './debrief.utils.tsx'
import { Button } from '@/components/ui/Button'

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
    <div className="min-h-screen bg-neutral-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-100 px-4 py-4 sticky top-0 z-10">
        <button
          onClick={handleComplete}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>홈</span>
        </button>
      </header>

      <main className="p-4 space-y-6 max-w-2xl mx-auto pb-8">
        {/* 결과 카드 - 큰 아이콘과 메시지 */}
        <section
          className={`rounded-2xl p-6 shadow-sm border-l-4 ${debriefMessage.bgClass} ${debriefMessage.borderClass}`}
        >
          <div className="flex items-start gap-4">
            {/* 아이콘 영역 */}
            <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-white/50 flex items-center justify-center">
              {debriefMessage.iconComponent}
            </div>

            <div className="flex-1">
              <h2 className={`font-bold text-xl mb-2 ${debriefMessage.textClass}`}>
                {debriefMessage.title}
              </h2>
              <p className={`text-base leading-relaxed ${debriefMessage.textClass} opacity-90`}>
                {debriefMessage.description}
              </p>
            </div>
          </div>
        </section>

        {/* 훈련 결과 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-neutral-800">훈련 결과</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <span className="text-sm text-neutral-500 font-medium">시나리오</span>
              <span className="text-base text-neutral-800 font-semibold">{scenario.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <span className="text-sm text-neutral-500 font-medium">진행 단계</span>
              <span className="text-base text-neutral-800 font-semibold">
                {reachedStage} / {TOTAL_STAGES} 단계
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-500 font-medium flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                소요 시간
              </span>
              <span className="text-base text-neutral-800 font-semibold font-mono">
                {formatTime(callDuration)}
              </span>
            </div>
          </div>
        </section>

        {/* 수상한 점 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-warning-500" />
            <h2 className="font-semibold text-neutral-800">이런 점이 수상했습니다</h2>
          </div>

          <div className="space-y-3">
            {scenario.detectionPoints.slice(0, reachedStage + 1).map((point, index) => (
              <div
                key={index}
                className="p-4 bg-warning-50 rounded-xl border-l-4 border-warning-500"
              >
                <p className="font-medium text-warning-900 mb-1">&quot;{point.pattern}&quot;</p>
                <p className="text-sm text-warning-700 pl-3">→ {point.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 올바른 대응 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className="w-5 h-5 text-success-500" />
            <h2 className="font-semibold text-neutral-800">이렇게 대응하세요</h2>
          </div>

          <div className="space-y-3">
            {scenario.correctResponses.map((response, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-success-50 rounded-xl">
                <div className="w-5 h-5 flex-shrink-0 rounded-full bg-success-500 flex items-center justify-center mt-0.5">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-success-900">{response.action}</p>
                  {response.description && (
                    <p className="text-sm text-success-700 mt-1">{response.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 대화 기록 */}
        {transcripts.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-neutral-800">대화 기록</h2>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {transcripts.map((msg, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-l-4 ${
                    msg.speaker === 'ai'
                      ? 'bg-primary-50 border-primary-500'
                      : 'bg-neutral-50 border-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        msg.speaker === 'ai' ? 'bg-primary-100' : 'bg-neutral-200'
                      }`}
                    >
                      {msg.speaker === 'ai' ? (
                        <span className="text-xs">AI</span>
                      ) : (
                        <UserIcon className="w-4 h-4 text-neutral-600" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      {msg.speaker === 'ai' ? '사기범 (AI)' : '나'}
                    </p>
                  </div>
                  <p className="text-neutral-800 leading-relaxed">
                    {removeEndScenarioTag(msg.text)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 완료 버튼 */}
        <Button variant="primary" size="lg" onClick={handleComplete} className="w-full">
          완료
        </Button>
      </main>
    </div>
  )
}

export { DebriefPage }
