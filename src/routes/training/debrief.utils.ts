interface DebriefMessage {
  icon: string
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
        title: '잘하셨습니다!',
        description: '보이스피싱을 정확히 알아채고 거부하셨습니다. 실제 상황에서도 이렇게 대응하세요.',
        bgClass: 'bg-green-50',
        borderClass: 'border-green-500',
        textClass: 'text-green-900',
      }
    case 'user_suspected':
      return {
        icon: '👍',
        title: '좋습니다!',
        description: '끝까지 의심을 유지하셨습니다. 의심스러운 전화는 일단 끊고 확인하는 것이 중요합니다.',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-500',
        textClass: 'text-blue-900',
      }
    case 'user_fooled':
      return {
        icon: '⚠️',
        title: '주의가 필요합니다',
        description: '보이스피싱에 당할 위험이 높습니다. 아래 수법들을 꼭 기억해두세요.',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-500',
        textClass: 'text-red-900',
      }
    default:
      return {
        icon: '📊',
        title: '훈련 완료',
        description: '훈련 결과를 확인하세요.',
        bgClass: 'bg-gray-50',
        borderClass: 'border-gray-500',
        textClass: 'text-gray-900',
      }
  }
}

export { getDebriefMessage }
export type { DebriefMessage }
