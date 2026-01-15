import { ReactNode } from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'

interface SelectableCardProps {
  icon: ReactNode
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}

function SelectableCard({
  icon,
  title,
  description,
  selected,
  onSelect,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        relative w-full min-h-[140px] p-5 rounded-2xl border-2 text-left
        transition-all duration-200
        ${
          selected
            ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
            : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md'
        }
      `}
    >
      {/* 아이콘 영역 */}
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`
          w-12 h-12 rounded-xl
          flex items-center justify-center
          transition-colors
          ${selected ? 'bg-primary-100' : 'bg-neutral-100'}
        `}
        >
          {icon}
        </div>

        {/* 선택 인디케이터 */}
        <div
          className={`
          w-6 h-6 rounded-full border-2
          flex items-center justify-center
          transition-all
          ${selected ? 'border-primary-500 bg-primary-500' : 'border-neutral-300 bg-white'}
        `}
        >
          {selected && <CheckIcon className="w-4 h-4 text-white" />}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-semibold text-neutral-800">{title}</h3>
        <p className="text-sm text-neutral-500 line-clamp-2">{description}</p>
      </div>
    </button>
  )
}

export { SelectableCard }
export type { SelectableCardProps }
