import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChartBarIcon,
  CpuChipIcon,
  CheckCircleIcon,
  CheckIcon,
} from '@heroicons/react/24/solid'
import { useUserStore } from '@/stores'
import { Button } from '@/components/ui/Button'

const ONBOARDING_PAGES = [
  {
    title: '보이스피싱, 겪어봐야 압니다',
    description:
      '매년 3,000억원 이상의 피해가 발생합니다.\n50대 이상이 절반 이상을 차지합니다.',
    icon: <ChartBarIcon className="w-12 h-12 text-white" />,
  },
  {
    title: 'AI가 사기범 역할을 합니다',
    description:
      '실제 보이스피싱과 유사한 전화가 옵니다.\n안전하게 체험해보세요.',
    icon: <CpuChipIcon className="w-12 h-12 text-white" />,
  },
  {
    title: '속아도 괜찮습니다',
    description:
      '훈련입니다. 끝나면 무엇이 수상했는지 알려드립니다.',
    icon: <CheckCircleIcon className="w-12 h-12 text-white" />,
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

  const handleAgreeAll = () => {
    const newValue = !allConsentsAgreed
    setConsents({
      terms: newValue,
      privacy: newValue,
      recording: newValue,
    })
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50/30 flex flex-col">
      <header className="p-4 flex justify-between items-center">
        {currentPage > 0 ? (
          <button
            onClick={handlePrev}
            className="text-neutral-500 text-sm hover:text-neutral-700 font-medium"
          >
            이전
          </button>
        ) : (
          <div />
        )}
        {!isConsentPage && (
          <button
            onClick={handleSkip}
            className="text-neutral-500 text-sm hover:text-neutral-700 font-medium"
          >
            건너뛰기
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {!isConsentPage ? (
          <>
            {/* 아이콘 영역 */}
            <div className="w-24 h-24 mb-8 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
              {ONBOARDING_PAGES[currentPage].icon}
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-4 text-center">
              {ONBOARDING_PAGES[currentPage].title}
            </h1>
            <p className="text-neutral-600 text-center whitespace-pre-line leading-relaxed">
              {ONBOARDING_PAGES[currentPage].description}
            </p>
          </>
        ) : (
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2 text-center">
              서비스 이용을 위해
            </h1>
            <p className="text-neutral-600 text-center mb-8">
              다음에 동의해주세요
            </p>

            {/* 모두 동의 */}
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all mb-4 ${
                allConsentsAgreed
                  ? 'bg-primary-50 border-primary-500'
                  : 'bg-white border-neutral-200 hover:border-primary-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  allConsentsAgreed
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-white border-neutral-300'
                }`}
              >
                {allConsentsAgreed && <CheckIcon className="w-4 h-4 text-white" />}
              </div>
              <input
                type="checkbox"
                checked={allConsentsAgreed}
                onChange={handleAgreeAll}
                className="sr-only"
              />
              <span className="text-neutral-900 font-semibold">모두 동의</span>
            </label>

            <div className="space-y-3">
              {CONSENT_ITEMS.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    consents[item.id]
                      ? 'bg-primary-50 border-primary-200'
                      : 'bg-white border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      consents[item.id]
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-neutral-300'
                    }`}
                  >
                    {consents[item.id] && <CheckIcon className="w-4 h-4 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={consents[item.id]}
                    onChange={() => handleConsentChange(item.id)}
                    className="sr-only"
                  />
                  <span className="text-neutral-700 font-medium">{item.label}</span>
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
                index === currentPage ? 'bg-primary-500' : 'bg-neutral-300'
              }`}
            />
          ))}
        </div>

        {!isConsentPage ? (
          <Button variant="primary" size="lg" onClick={handleNext} className="w-full">
            다음
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handleStart}
            disabled={!allConsentsAgreed}
            className="w-full"
          >
            동의하고 시작
          </Button>
        )}
      </footer>
    </div>
  )
}

export { OnboardingPage }
