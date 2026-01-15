import {
  CheckCircleIcon,
  HandThumbUpIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/solid'

interface DebriefMessage {
  icon: string // 레거시 지원을 위해 유지
  iconComponent: React.ReactNode // 새로운 아이콘 컴포넌트
  title: string
  description: string
  bgClass: string
  borderClass: string
  textClass: string
}

function getDebriefMessage(terminationReason: string | null): DebriefMessage {
  switch (terminationReason) {
    case 'user_rejected':
      return {
        icon: '🎉',
        iconComponent: <CheckCircleIcon className="w-8 h-8 text-success-600" />,
        title: '잘하셨습니다!',
        description:
          '보이스피싱을 정확히 알아채고 거부하셨습니다. 실제 상황에서도 이렇게 대응하세요.',
        bgClass: 'bg-success-50',
        borderClass: 'border-success-500',
        textClass: 'text-success-900',
      }
    case 'user_suspected':
      return {
        icon: '👍',
        iconComponent: <HandThumbUpIcon className="w-8 h-8 text-primary-600" />,
        title: '좋습니다!',
        description:
          '끝까지 의심을 유지하셨습니다. 의심스러운 전화는 일단 끊고 확인하는 것이 중요합니다.',
        bgClass: 'bg-primary-50',
        borderClass: 'border-primary-500',
        textClass: 'text-primary-900',
      }
    case 'user_fooled':
      return {
        icon: '⚠️',
        iconComponent: <ExclamationTriangleIcon className="w-8 h-8 text-danger-600" />,
        title: '주의가 필요합니다',
        description: '보이스피싱에 당할 위험이 높습니다. 아래 수법들을 꼭 기억해두세요.',
        bgClass: 'bg-danger-50',
        borderClass: 'border-danger-500',
        textClass: 'text-danger-900',
      }
    default:
      return {
        icon: '📊',
        iconComponent: <ChartBarIcon className="w-8 h-8 text-neutral-600" />,
        title: '훈련 완료',
        description: '훈련 결과를 확인하세요.',
        bgClass: 'bg-neutral-50',
        borderClass: 'border-neutral-500',
        textClass: 'text-neutral-900',
      }
  }
}

export { getDebriefMessage }
export type { DebriefMessage }
