import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores'
import { useOverlay, ConfirmModal } from '@/components/ui/overlay'

const ONBOARDING_STEPS = [
  {
    title: '속지마랑',
    description: 'AI 기반 보이스피싱 예방 훈련 서비스입니다.\n실제와 유사한 상황을 체험하며 대응력을 키워보세요.',
    icon: '🛡️',
  },
  {
    title: '안전한 훈련',
    description: '실제 개인정보나 금전을 요구하지 않습니다.\n언제든지 훈련을 중단할 수 있습니다.',
    icon: '✅',
  },
  {
    title: '4가지 시나리오',
    description: '검찰 사칭, 금융기관 사칭, 가족 사칭,\n택배/지원금 사칭 시나리오를 체험합니다.',
    icon: '📋',
  },
]

function OnboardingPage() {
  const navigate = useNavigate()
  const { open } = useOverlay()
  const { completeOnboarding, agreeToTerms } = useUserStore()
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      const agreed = await open<boolean>(({ close }) => (
        <ConfirmModal
          close={close}
          title="이용 동의"
          message="본 서비스는 보이스피싱 예방 교육 목적으로 제공됩니다. 실제 사기 상황이 아님을 이해하고 동의하십니까?"
          confirmText="동의합니다"
          cancelText="취소"
        />
      ))

      if (agreed) {
        agreeToTerms()
        completeOnboarding()
        navigate('/')
      }
    }
  }

  const handleSkip = () => {
    setCurrentStep(ONBOARDING_STEPS.length - 1)
  }

  const step = ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <header className="p-4 flex justify-end">
        {!isLastStep && (
          <button
            onClick={handleSkip}
            className="text-gray-500 text-sm hover:text-gray-700"
          >
            건너뛰기
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-7xl mb-8">{step.icon}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          {step.title}
        </h1>
        <p className="text-gray-600 text-center whitespace-pre-line leading-relaxed">
          {step.description}
        </p>
      </main>

      <footer className="p-6 space-y-4">
        <div className="flex justify-center gap-2">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          {isLastStep ? '시작하기' : '다음'}
        </button>
      </footer>
    </div>
  )
}

export { OnboardingPage }
