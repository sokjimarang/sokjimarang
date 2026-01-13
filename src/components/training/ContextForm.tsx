import { useState } from 'react'
import type { UserContext, AgeGroup, Region } from '@/types/database'
import { AGE_GROUP_LABELS, REGION_LABELS } from '@/lib/scenarios'

interface ContextFormProps {
  initialContext: UserContext
  onSubmit: (context: UserContext) => void
  onCancel: () => void
}

function ContextForm({ initialContext, onSubmit, onCancel }: ContextFormProps) {
  const [context, setContext] = useState<UserContext>(initialContext)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(context)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          연령대
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(AGE_GROUP_LABELS) as AgeGroup[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setContext({ ...context, age_group: key })}
              className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                context.age_group === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {AGE_GROUP_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          거주 지역
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(REGION_LABELS) as Region[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setContext({ ...context, region: key })}
              className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                context.region === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {REGION_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          가족 구성
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300">
            <input
              type="checkbox"
              checked={(context.children ?? 0) > 0}
              onChange={(e) =>
                setContext({ ...context, children: e.target.checked ? 1 : null })
              }
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-700">자녀가 있습니다</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300">
            <input
              type="checkbox"
              checked={(context.grandchildren ?? 0) > 0}
              onChange={(e) =>
                setContext({ ...context, grandchildren: e.target.checked ? 1 : null })
              }
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-700">손자녀가 있습니다</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          훈련 시작
        </button>
      </div>
    </form>
  )
}

export { ContextForm }
