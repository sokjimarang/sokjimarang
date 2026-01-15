import { Swiper, SwiperSlide } from 'swiper/react'
import { UserIcon } from '@heroicons/react/24/outline'
import 'swiper/css'

import { SelectableCard } from './SelectableCard'
import { PRESETS, getUserContextDescription } from '@/lib/presets'

interface PresetCarouselProps {
  selectedPresetId: string | null
  onSelectPreset: (presetId: string) => void
}

function PresetCarousel({ selectedPresetId, onSelectPreset }: PresetCarouselProps) {
  return (
    <section className="py-6 animate-slide-up">
      <div className="px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-800">내 정보 선택</h2>
        <span className="text-xs text-neutral-400 font-medium">1/2 단계</span>
      </div>
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
              icon={<UserIcon className="w-6 h-6 text-primary-600" />}
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
