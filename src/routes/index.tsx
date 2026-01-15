import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

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
    <div className="h-screen flex flex-col bg-neutral-50 overflow-hidden">
      {/* 헤더 */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-neutral-100 px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-0.5">속지마랑</h1>
          <p className="text-sm text-neutral-500 font-medium">보이스피싱 예방 훈련</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label="설정"
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto">
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
