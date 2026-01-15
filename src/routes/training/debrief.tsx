import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/solid'

import { useTrainingStore } from '@/stores'
import { getScenarioMetadata, removeEndScenarioTag } from '@/lib/scenarios'
import { formatTime } from '@/lib/time'
import { TOTAL_STAGES } from '@/lib/constants'
import { getDebriefData } from './debrief.utils.tsx'
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
  const debrief = getDebriefData(currentSession?.termination_reason ?? null)

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      {/* 헤더 */}
      <header className="border-b border-neutral-800 px-5 py-4">
        <button
          onClick={handleComplete}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-100 transition-colors text-sm tracking-wide"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>나가기</span>
        </button>
      </header>

      <main className="max-w-xl mx-auto px-5 py-8">
        {/* 결과 헤더 - 큰 타이포그래피 */}
        <section className="mb-10">
          <div className={`inline-block px-3 py-1.5 text-xs font-semibold tracking-widest uppercase mb-4 ${debrief.badgeClass}`}>
            {debrief.badge}
          </div>
          <h1 className={`text-3xl font-bold tracking-tight mb-3 ${debrief.titleClass}`}>
            {debrief.title}
          </h1>
          <p className="text-neutral-400 text-base leading-relaxed">
            {debrief.description}
          </p>
        </section>

        {/* 훈련 통계 - 그리드 레이아웃 */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-4">
            훈련 통계
          </h2>
          <div className="grid grid-cols-3 gap-px bg-neutral-800 border border-neutral-800">
            <div className="bg-neutral-900 p-4">
              <p className="text-xs text-neutral-500 mb-1">시나리오</p>
              <p className="text-sm font-medium text-neutral-200 truncate">{scenario.name}</p>
            </div>
            <div className="bg-neutral-900 p-4">
              <p className="text-xs text-neutral-500 mb-1">진행도</p>
              <p className="text-sm font-medium text-neutral-200">
                <span className="text-lg font-bold">{reachedStage}</span>
                <span className="text-neutral-500">/{TOTAL_STAGES}</span>
              </p>
            </div>
            <div className="bg-neutral-900 p-4">
              <p className="text-xs text-neutral-500 mb-1">소요 시간</p>
              <p className="text-sm font-mono font-medium text-neutral-200">{formatTime(callDuration)}</p>
            </div>
          </div>
        </section>

        {/* 수상한 점 - 번호 리스트 */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-4">
            포착된 수법
          </h2>
          <div className="space-y-0">
            {scenario.detectionPoints.slice(0, reachedStage + 1).map((point, index) => (
              <div
                key={index}
                className="group border-l-2 border-danger-500/60 pl-4 py-3 hover:border-danger-500 hover:bg-danger-500/5 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-danger-500/20 text-danger-500 rounded">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-100 text-sm leading-snug mb-1">
                      {point.pattern}
                    </p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {point.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 올바른 대응 - 체크 리스트 */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-4">
            올바른 대응법
          </h2>
          <div className="space-y-2">
            {scenario.correctResponses.map((response, index) => (
              <div
                key={index}
                className="group flex items-start gap-3 p-3 bg-neutral-800/50 hover:bg-neutral-800 transition-colors"
              >
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-200 text-sm">{response.action}</p>
                  {response.description && (
                    <p className="text-xs text-neutral-500 mt-0.5">{response.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 대화 기록 */}
        {transcripts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-4">
              대화 기록
            </h2>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {transcripts.map((msg, index) => (
                <div
                  key={index}
                  className={`py-3 px-3 ${
                    msg.speaker === 'ai'
                      ? 'bg-neutral-800/80 border-l-2 border-primary-500/60'
                      : 'bg-transparent border-l-2 border-neutral-700'
                  }`}
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                    msg.speaker === 'ai' ? 'text-primary-400' : 'text-neutral-500'
                  }`}>
                    {msg.speaker === 'ai' ? '사기범' : '나'}
                  </p>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {removeEndScenarioTag(msg.text)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 완료 버튼 */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleComplete}
          className="w-full bg-neutral-100 text-neutral-900 hover:bg-white font-semibold tracking-wide"
        >
          홈으로 돌아가기
        </Button>
      </main>
    </div>
  )
}

export { DebriefPage }
