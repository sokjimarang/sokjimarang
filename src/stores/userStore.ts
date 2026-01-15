import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserContext, AgeGroup, Region } from '@/types/database'

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
  setChildren: (children: number | null) => void
  setGrandchildren: (grandchildren: number | null) => void
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

      setChildren: (children) =>
        set((state) => ({
          context: {
            ...state.context,
            children,
            has_children: children !== null && children !== undefined && children > 0,
          },
        })),

      setGrandchildren: (grandchildren) =>
        set((state) => ({
          context: {
            ...state.context,
            grandchildren,
            has_grandchildren:
              grandchildren !== null && grandchildren !== undefined && grandchildren > 0,
          },
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
export type { UserState, UserActions }
