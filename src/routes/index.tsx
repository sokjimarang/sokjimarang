import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore, useTrainingStore } from '@/stores'
import { getAllScenarios } from '@/lib/scenarios'
import type { ScenarioType } from '@/types/database'

const SCENARIO_OPTIONS = [
  { id: 'random' as const, name: '랜덤', icon: '🎲' },
  { id: 'prosecutor' as const, name: '검찰/경찰 사칭', icon: '👮' },
  { id: 'bank' as const, name: '금융기관 사칭', icon: '🏦' },
  { id: 'family_emergency' as const, name: '가족 납치/사고', icon: '👨‍👩‍👧' },
  { id: 'delivery_subsidy' as const, name: '택배/정부지원금', icon: '📦' },
]

const AGE_OPTIONS = [
  { value: 'under50', label: '50세 미만' },
  { value: '50s', label: '50대' },
  { value: '60s', label: '60대' },
  { value: '70plus', label: '70대 이상' },
]

const REGION_OPTIONS = [
  { value: 'seoul', label: '서울' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'other', label: '기타' },
]

const CHILDREN_OPTIONS = [
  { value: 'true', label: '있음' },
  { value: 'false', label: '없음' },
]

function HomePage() {
  const navigate = useNavigate()
  const {
    hasCompletedOnboarding,
    context,
    setAgeGroup,
    setRegion,
    setChildren,
  } = useUserStore()
  const {
    selectedScenario,
    setSelectedScenario,
    sessions,
    startTraining,
  } = useTrainingStore()

  const allScenarios = getAllScenarios()

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      navigate('/onboarding')
    }
  }, [hasCompletedOnboarding, navigate])

  const handleStart = () => {
    let scenarioToUse: ScenarioType = selectedScenario as ScenarioType

    if (selectedScenario === 'random') {
      const randomIndex = Math.floor(Math.random() * allScenarios.length)
      scenarioToUse = allScenarios[randomIndex].metadata.id as ScenarioType
    }

    startTraining(scenarioToUse)
    navigate('/training/prepare')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  if (!hasCompletedOnboarding) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">속지마랑</h1>
          <p className="text-sm text-gray-500">보이스피싱 예방 훈련</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 text-gray-500 hover:text-gray-700"
          aria-label="설정"
        >
          ⚙️
        </button>
      </header>

      <main className="p-4 space-y-6">
        {/* 훈련 시작 카드 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎯</span>
            <h2 className="text-xl font-bold text-gray-900">훈련 시작</h2>
          </div>
          <button
            onClick={handleStart}
            className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            시작하기
          </button>
        </section>

        {/* 시나리오 선택 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            시나리오 선택 (선택사항)
          </h3>
          <div className="space-y-2">
            {SCENARIO_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  selectedScenario === option.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name="scenario"
                  value={option.id}
                  checked={selectedScenario === option.id}
                  onChange={() => setSelectedScenario(option.id)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="text-xl">{option.icon}</span>
                <span className="text-gray-700">{option.name}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 내 정보 설정 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            내 정보 설정
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-600">연령대</label>
              <select
                value={context.age_group || '60s'}
                onChange={(e) => setAgeGroup(e.target.value as 'under50' | '50s' | '60s' | '70plus')}
                className="flex-1 p-2 border border-gray-200 rounded-lg bg-white"
              >
                {AGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-600">거주지역</label>
              <select
                value={context.region || 'seoul'}
                onChange={(e) => setRegion(e.target.value as 'seoul' | 'gyeonggi' | 'other')}
                className="flex-1 p-2 border border-gray-200 rounded-lg bg-white"
              >
                {REGION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-20 text-sm text-gray-600">자녀 유무</label>
              <select
                value={(context.children ?? 0) > 0 ? 'true' : 'false'}
                onChange={(e) => setChildren(e.target.value === 'true' ? 1 : null)}
                className="flex-1 p-2 border border-gray-200 rounded-lg bg-white"
              >
                {CHILDREN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 훈련 기록 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            📊 훈련 기록 ({sessions.length}회)
          </h3>
          {sessions.length > 0 ? (
            <p className="text-sm text-gray-600">
              가장 최근: {formatDate(sessions[0].date)}
            </p>
          ) : (
            <p className="text-sm text-gray-400">
              아직 훈련 기록이 없습니다
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export { HomePage }
