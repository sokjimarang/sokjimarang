import type { ScenarioMetadata } from '@/lib/scenarios'

interface ScenarioCardProps {
  scenario: ScenarioMetadata
  onSelect: () => void
}

function ScenarioCard({ scenario, onSelect }: ScenarioCardProps) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">{scenario.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{scenario.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{scenario.description}</p>
        </div>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  )
}

export { ScenarioCard }
