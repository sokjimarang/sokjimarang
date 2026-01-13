import { useNavigate } from 'react-router-dom'

import { useTrainingStore } from '@/stores/trainingStore'
import { getPresetById } from '@/lib/presets'
import type { ScenarioType } from '@/types/database'

interface FixedCTAProps {
  selectedPresetId: string | null
  selectedScenario: ScenarioType | 'random'
}

function FixedCTA({ selectedPresetId, selectedScenario }: FixedCTAProps) {
  const navigate = useNavigate()
  const { startTraining } = useTrainingStore()

  const isEnabled = selectedPresetId !== null && selectedScenario !== 'random'

  const handleClick = () => {
    if (!isEnabled) return

    const preset = getPresetById(selectedPresetId!)
    if (!preset) return

    startTraining(selectedScenario as ScenarioType)
    navigate('/training/call')
  }

  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={handleClick}
        disabled={!isEnabled}
        className={`
          w-full py-4 rounded-xl font-semibold text-lg
          flex items-center justify-center gap-2
          transition-all duration-200
          ${
            isEnabled
              ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <span className="text-xl">📞</span>
        전화하기
      </button>
    </div>
  )
}

export { FixedCTA }
