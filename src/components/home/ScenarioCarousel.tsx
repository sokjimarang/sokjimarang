import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

import { SelectableCard } from './SelectableCard'
import { getScenarioMetadata } from '@/lib/scenarios'
import type { ScenarioType } from '@/types/database'

// MVP에서는 prosecutor 시나리오만 사용
const MVP_SCENARIOS: ScenarioType[] = ['prosecutor']

interface ScenarioCarouselProps {
  selectedScenario: ScenarioType | 'random'
  onSelectScenario: (scenario: ScenarioType) => void
}

function ScenarioCarousel({ selectedScenario, onSelectScenario }: ScenarioCarouselProps) {
  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-gray-900 px-4 mb-3">
        시나리오 선택
      </h2>
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
                icon={metadata.icon}
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
