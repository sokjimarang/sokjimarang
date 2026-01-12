import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrainingStore } from '@/stores'
import { getScenario } from '@/lib/scenarios'

function TrainingPreparePage() {
  const navigate = useNavigate()
  const { currentSession, status } = useTrainingStore()
  const [announceTraining, setAnnounceTraining] = useState(false)

  const scenario = currentSession
    ? getScenario(currentSession.scenario_type)
    : null

  useEffect(() => {
    if (status !== 'preparing' || !currentSession) {
      navigate('/')
    }
  }, [status, currentSession, navigate])

  const handleStart = () => {
    const params = new URLSearchParams({
      scenario: currentSession?.scenario_type || '',
      announce: announceTraining ? '1' : '0',
    })
    navigate(`/training/call?${params.toString()}`)
  }

  const handleCancel = () => {
    navigate('/')
  }

  if (!currentSession || !scenario) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-6">📞</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">훈련 준비 중</h1>

        <div className="w-full max-w-sm my-8">
          <div className="border-t border-gray-200 my-4" />

          <p className="text-gray-700 text-center mb-6">
            지금부터 보이스피싱 훈련을
            <br />
            시작합니다.
          </p>

          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>AI가 사기범 역할을 합니다</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>실제 상황처럼 대응해보세요</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>언제든 종료할 수 있습니다</span>
            </li>
          </ul>

          <div className="border-t border-gray-200 my-6" />

          <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
            <input
              type="checkbox"
              checked={announceTraining}
              onChange={(e) => setAnnounceTraining(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-700 text-sm">
              이것이 훈련임을 통화 시작 시 안내받기
            </span>
          </label>
        </div>
      </main>

      <footer className="p-6 space-y-3">
        <button
          onClick={handleStart}
          className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
        >
          훈련 시작
        </button>
        <button
          onClick={handleCancel}
          className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          취소
        </button>
      </footer>
    </div>
  )
}

export { TrainingPreparePage }
