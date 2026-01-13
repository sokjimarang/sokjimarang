interface SelectableCardProps {
  icon: string
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
        relative w-full min-h-[140px] p-4 rounded-2xl border-2 text-left
        transition-all duration-200 ease-in-out
        ${
          selected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div
        className={`
          absolute top-3 right-3 w-6 h-6 rounded-full border-2
          flex items-center justify-center transition-colors
          ${
            selected
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-300 bg-white'
          }
        `}
      >
        {selected && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      <div className="flex flex-col gap-2 pr-8">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </button>
  )
}

export { SelectableCard }
export type { SelectableCardProps }
