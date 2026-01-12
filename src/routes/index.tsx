import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore, useTrainingStore } from '@/stores'
import { getAllScenarios, type ScenarioMetadata } from '@/lib/scenarios'
import type { ScenarioType, UserContext } from '@/types/database'
import { ScenarioCard } from '@/components/training/ScenarioCard'
import { ContextForm } from '@/components/training/ContextForm'
import { useOverlay, Sheet } from '@/components/ui/overlay'

function HomePage() {
  const navigate = useNavigate()
  const { open } = useOverlay()
  const { hasCompletedOnboarding, context, updateContext } = useUserStore()
  const { startTraining } = useTrainingStore()

  const scenarios = getAllScenarios()

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      navigate('/onboarding')
    }
  }, [hasCompletedOnboarding, navigate])

  const handleSelectScenario = async (scenario: ScenarioMetadata) => {
    const result = await open<UserContext | null>(({ close }) => (
      <Sheet close={close} title={`${scenario.name} 훈련 설정`}>
        <ContextForm
          initialContext={context}
          onSubmit={(ctx) => close(ctx)}
          onCancel={() => close(null)}
        />
      </Sheet>
    ))

    if (result) {
      updateContext(result)
      startTraining(scenario.id as ScenarioType)
      navigate(`/training/call?scenario=${scenario.id}`)
    }
  }

  if (!hasCompletedOnboarding) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">속지마랑</h1>
        <p className="text-gray-600 mt-1">보이스피싱 예방 훈련</p>
      </header>

      <main className="p-4 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            시나리오 선택
          </h2>
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.metadata.id}
                scenario={scenario.metadata}
                onSelect={() => handleSelectScenario(scenario.metadata)}
              />
            ))}
          </div>
        </section>

        <section className="bg-blue-50 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 훈련 팁</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 실제 상황처럼 자연스럽게 대화해보세요</li>
            <li>• 의심이 들면 언제든 &quot;끊을게요&quot;라고 말하세요</li>
            <li>• 훈련 후 디브리핑에서 대응법을 확인하세요</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export { HomePage }
