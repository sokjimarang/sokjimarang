import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores'

const ONBOARDING_PAGES = [
  {
    title: '보이스피싱, 겪어봐야 압니다',
    description:
      '매년 3,000억원 이상의 피해가 발생합니다.\n50대 이상이 절반 이상을 차지합니다.',
    icon: '📊',
  },
  {
    title: 'AI가 사기범 역할을 합니다',
    description:
      '실제 보이스피싱과 유사한 전화가 옵니다.\n안전하게 체험해보세요.',
    icon: '🤖',
  },
  {
    title: '속아도 괜찮습니다',
    description:
      '훈련입니다. 끝나면 무엇이 수상했는지 알려드립니다.',
    icon: '✅',
  },
]

const CONSENT_ITEMS = [
  { id: 'terms', label: '(필수) 서비스 이용약관' },
  { id: 'privacy', label: '(필수) 개인정보처리방침' },
  { id: 'recording', label: '(필수) 통화 녹음 및 분석 동의' },
]

function OnboardingPage() {
  const navigate = useNavigate()
  const { completeOnboarding, agreeToTerms } = useUserStore()
  const [currentPage, setCurrentPage] = useState(0)
  const [consents, setConsents] = useState<Record<string, boolean>>({
    terms: false,
    privacy: false,
    recording: false,
  })

  const isConsentPage = currentPage === ONBOARDING_PAGES.length
  const totalPages = ONBOARDING_PAGES.length + 1
  const allConsentsAgreed = Object.values(consents).every(Boolean)

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleConsentChange = (id: string) => {
    setConsents((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleStart = () => {
    agreeToTerms()
    completeOnboarding()
    navigate('/')
  }

  const handleSkip = () => {
    setCurrentPage(ONBOARDING_PAGES.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <header className="p-4 flex justify-between items-center">
        {currentPage > 0 ? (
          <button
            onClick={handlePrev}
            className="text-gray-500 text-sm hover:text-gray-700"
          >
            이전
          </button>
        ) : (
          <div />
        )}
        {!isConsentPage && (
          <button
            onClick={handleSkip}
            className="text-gray-500 text-sm hover:text-gray-700"
          >
            건너뛰기
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {!isConsentPage ? (
          <>
            <div className="text-7xl mb-8">
              {ONBOARDING_PAGES[currentPage].icon}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              {ONBOARDING_PAGES[currentPage].title}
            </h1>
            <p className="text-gray-600 text-center whitespace-pre-line leading-relaxed">
              {ONBOARDING_PAGES[currentPage].description}
            </p>
          </>
        ) : (
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              서비스 이용을 위해
            </h1>
            <p className="text-gray-600 text-center mb-8">
              다음에 동의해주세요
            </p>

            <div className="space-y-4">
              {CONSENT_ITEMS.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={consents[item.id]}
                    onChange={() => handleConsentChange(item.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 space-y-4">
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentPage ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {!isConsentPage ? (
          <button
            onClick={handleNext}
            className="w-full py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            다음
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={!allConsentsAgreed}
            className={`w-full py-4 rounded-xl font-medium transition-colors ${
              allConsentsAgreed
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            동의하고 시작
          </button>
        )}
      </footer>
    </div>
  )
}

export { OnboardingPage }
