import { Swiper, SwiperSlide } from 'swiper/react'
import { ScaleIcon } from '@heroicons/react/24/outline'
import 'swiper/css'

import { SelectableCard } from './SelectableCard'
import { getScenarioMetadata } from '@/lib/scenarios'
import type { ScenarioType } from '@/types/database'

// MVP에서는 prosecutor 시나리오만 사용
const MVP_SCENARIOS: ScenarioType[] = ['prosecutor']

// 시나리오별 아이콘 매핑
const SCENARIO_ICONS: Record<ScenarioType, React.ReactNode> = {
  prosecutor: <ScaleIcon className="w-6 h-6 text-primary-600" />,
  bank: <ScaleIcon className="w-6 h-6 text-primary-600" />, // 임시: 추후 BankIcon으로 변경
  family_emergency: <ScaleIcon className="w-6 h-6 text-primary-600" />, // 임시
  delivery_subsidy: <ScaleIcon className="w-6 h-6 text-primary-600" />, // 임시
}

interface ScenarioCarouselProps {
  selectedScenario: ScenarioType | 'random'
  onSelectScenario: (scenario: ScenarioType) => void
}

function ScenarioCarousel({ selectedScenario, onSelectScenario }: ScenarioCarouselProps) {
  return (
    <section className="py-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800">시나리오 선택</h2>
        <span className="text-xs text-neutral-400 font-medium">2/2 단계</span>
      </div>
      <Swiper
        slidesPerView={1.3}
        spaceBetween={12}
        slidesOffsetBefore={16}
        slidesOffsetAfter={16}
        className="!overflow-visible"
      >
        {MVP_SCENARIOS.map((scenarioId) => {
          const metadata = getScenarioMetadata(scenarioId)
          if (!metadata) return null

          return (
            <SwiperSlide key={scenarioId}>
              <SelectableCard
                icon={SCENARIO_ICONS[scenarioId]}
                title={metadata.name}
                description={metadata.description}
                selected={selectedScenario === scenarioId}
                onSelect={() => onSelectScenario(scenarioId)}
              />
            </SwiperSlide>
          )
        })}
      </Swiper>
    </section>
  )
}

export { ScenarioCarousel }
