interface DebriefData {
  badge: string
  badgeClass: string
  title: string
  titleClass: string
  description: string
}

function getDebriefData(terminationReason: string | null): DebriefData {
  switch (terminationReason) {
    case 'user_rejected':
      return {
        badge: '훈련 성공',
        badgeClass: 'bg-success-500/20 text-success-500',
        title: '보이스피싱을 간파했습니다',
        titleClass: 'text-success-500',
        description:
          '수고하셨습니다. 사기 전화의 특징을 정확히 파악하고 거부하셨습니다. 실제 상황에서도 동일하게 대응해 주세요.',
      }
    case 'user_suspected':
      return {
        badge: '의심 유지',
        badgeClass: 'bg-primary-500/20 text-primary-400',
        title: '끝까지 경계를 유지했습니다',
        titleClass: 'text-primary-400',
        description:
          '의심스러운 전화는 일단 끊고 공식 기관에 직접 확인하는 것이 안전합니다. 이 습관을 유지해 주세요.',
      }
    case 'user_fooled':
      return {
        badge: '주의 필요',
        badgeClass: 'bg-danger-500/20 text-danger-500',
        title: '사기에 속을 위험이 있습니다',
        titleClass: 'text-danger-500',
        description:
          '보이스피싱 수법에 넘어갈 가능성이 높습니다. 아래 포착된 수법들을 반드시 숙지하세요.',
      }
    default:
      return {
        badge: '훈련 종료',
        badgeClass: 'bg-neutral-700 text-neutral-400',
        title: '훈련이 완료되었습니다',
        titleClass: 'text-neutral-200',
        description: '아래에서 훈련 결과를 확인할 수 있습니다.',
      }
  }
}

export { getDebriefData }
export type { DebriefData }
