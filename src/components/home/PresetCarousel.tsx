import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

import { SelectableCard } from './SelectableCard'
import { PRESETS, getUserContextDescription } from '@/lib/presets'

interface PresetCarouselProps {
  selectedPresetId: string | null
  onSelectPreset: (presetId: string) => void
}

function PresetCarousel({ selectedPresetId, onSelectPreset }: PresetCarouselProps) {
  return (
    <section className="py-4">
      <h2 className="text-lg font-semibold text-gray-900 px-4 mb-3">
        내 정보 선택
      </h2>
      <Swiper
        slidesPerView={1.3}
        spaceBetween={12}
        slidesOffsetBefore={16}
        slidesOffsetAfter={16}
        className="!overflow-visible"
      >
        {PRESETS.map((preset) => (
          <SwiperSlide key={preset.id}>
            <SelectableCard
              icon="👤"
              title={preset.name}
              description={getUserContextDescription(preset.context)}
              selected={selectedPresetId === preset.id}
              onSelect={() => onSelectPreset(preset.id)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

export { PresetCarousel }
