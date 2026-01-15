import { useNavigate } from 'react-router-dom'
import { PhoneIcon } from '@heroicons/react/24/solid'

import { useTrainingStore } from '@/stores/trainingStore'
import { getPresetById } from '@/lib/presets'
import { Button } from '@/components/ui/Button'
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
    <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-neutral-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={handleClick}
        disabled={!isEnabled}
        className="w-full"
        icon={<PhoneIcon className="w-6 h-6" />}
      >
        훈련 시작하기
      </Button>
    </div>
  )
}

export { FixedCTA }
