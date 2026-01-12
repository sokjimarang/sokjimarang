import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserContext } from '@/types/database'

type AgeGroup = 'under50' | '50s' | '60s' | '70plus'
type Region = 'seoul' | 'gyeonggi' | 'other'

interface UserState {
  hasCompletedOnboarding: boolean
  agreedToTerms: boolean
  context: UserContext
}

interface UserActions {
  completeOnboarding: () => void
  agreeToTerms: () => void
  setAgeGroup: (ageGroup: AgeGroup) => void
  setRegion: (region: Region) => void
  setHasChildren: (hasChildren: boolean) => void
  setHasGrandchildren: (hasGrandchildren: boolean) => void
  updateContext: (context: Partial<UserContext>) => void
  reset: () => void
}

type UserStore = UserState & UserActions

const initialState: UserState = {
  hasCompletedOnboarding: false,
  agreedToTerms: false,
  context: {},
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,

      completeOnboarding: () =>
        set({ hasCompletedOnboarding: true }),

      agreeToTerms: () =>
        set({ agreedToTerms: true }),

      setAgeGroup: (ageGroup) =>
        set((state) => ({
          context: { ...state.context, age_group: ageGroup },
        })),

      setRegion: (region) =>
        set((state) => ({
          context: { ...state.context, region },
        })),

      setHasChildren: (hasChildren) =>
        set((state) => ({
          context: { ...state.context, has_children: hasChildren },
        })),

      setHasGrandchildren: (hasGrandchildren) =>
        set((state) => ({
          context: { ...state.context, has_grandchildren: hasGrandchildren },
        })),

      updateContext: (context) =>
        set((state) => ({
          context: { ...state.context, ...context },
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'sokjimarang-user',
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        agreedToTerms: state.agreedToTerms,
        context: state.context,
      }),
    }
  )
)

export { useUserStore }
export type { UserState, UserActions, AgeGroup, Region }
