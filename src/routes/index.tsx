import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useUserStore, useTrainingStore } from '@/stores'
import { PresetCarousel } from '@/components/home/PresetCarousel'
import { ScenarioCarousel } from '@/components/home/ScenarioCarousel'
import { FixedCTA } from '@/components/home/FixedCTA'
import { getPresetById } from '@/lib/presets'

function HomePage() {
  const navigate = useNavigate()
  const { hasCompletedOnboarding, updateContext } = useUserStore()
  const {
    selectedScenario,
    selectedPresetId,
    setSelectedScenario,
    setSelectedPresetId,
  } = useTrainingStore()

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      navigate('/onboarding')
    }
  }, [hasCompletedOnboarding, navigate])

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId)
    const preset = getPresetById(presetId)
    if (preset) {
      updateContext(preset.context)
    }
  }

  if (!hasCompletedOnboarding) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* 헤더 */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">속지마랑</h1>
          <p className="text-sm text-gray-500">보이스피싱 예방 훈련</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 text-gray-500 hover:text-gray-700"
          aria-label="설정"
        >
          ⚙️
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-hidden">
        <PresetCarousel
          selectedPresetId={selectedPresetId}
          onSelectPreset={handlePresetSelect}
        />

        <ScenarioCarousel
          selectedScenario={selectedScenario}
          onSelectScenario={setSelectedScenario}
        />
      </main>

      {/* 하단 CTA */}
      <FixedCTA
        selectedPresetId={selectedPresetId}
        selectedScenario={selectedScenario}
      />
    </div>
  )
}

export { HomePage }
