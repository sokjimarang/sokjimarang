import { describe, it, expect, beforeEach } from 'vitest'
import { useUserStore } from '@/stores/userStore'

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.getState().reset()
  })

  it('초기 상태에서 온보딩이 완료되지 않아야 함', () => {
    const { hasCompletedOnboarding } = useUserStore.getState()
    expect(hasCompletedOnboarding).toBe(false)
  })

  it('온보딩 완료 시 상태가 변경되어야 함', () => {
    const { completeOnboarding } = useUserStore.getState()
    completeOnboarding()

    const { hasCompletedOnboarding } = useUserStore.getState()
    expect(hasCompletedOnboarding).toBe(true)
  })

  it('사용자 컨텍스트 업데이트가 동작해야 함', () => {
    const { updateContext } = useUserStore.getState()
    updateContext({ age_group: '70plus', region: 'gyeonggi' })

    const { context } = useUserStore.getState()
    expect(context.age_group).toBe('70plus')
    expect(context.region).toBe('gyeonggi')
  })

  it('setAgeGroup으로 연령대 설정이 동작해야 함', () => {
    const { setAgeGroup } = useUserStore.getState()
    setAgeGroup('50s')

    const { context } = useUserStore.getState()
    expect(context.age_group).toBe('50s')
  })

  it('setRegion으로 지역 설정이 동작해야 함', () => {
    const { setRegion } = useUserStore.getState()
    setRegion('gyeonggi')

    const { context } = useUserStore.getState()
    expect(context.region).toBe('gyeonggi')
  })

  it('setHasChildren으로 자녀 유무 설정이 동작해야 함', () => {
    const { setHasChildren } = useUserStore.getState()
    setHasChildren(true)

    const { context } = useUserStore.getState()
    expect(context.has_children).toBe(true)
  })
})
