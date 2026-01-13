import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MAX_SESSION_HISTORY } from '@/lib/constants'
import type { ScenarioType, TrainingSession } from '@/types/database'

type TrainingStatus = 'idle' | 'preparing' | 'in_call' | 'debriefing' | 'completed'

interface TranscriptMessage {
  speaker: 'ai' | 'user'
  text: string
  timestamp: number
}

interface TrainingHistory {
  id: string
  date: string
  scenarioType: ScenarioType
  reachedStage: number
  durationSeconds: number
}

interface TrainingState {
  status: TrainingStatus
  currentSession: TrainingSession | null
  transcripts: TranscriptMessage[]
  vapiCallId: string | null
  callDuration: number
  isAiSpeaking: boolean
  selectedScenario: ScenarioType | 'random'
  selectedPresetId: string | null
  sessions: TrainingHistory[]
}

interface TrainingActions {
  setSelectedScenario: (scenario: ScenarioType | 'random') => void
  setSelectedPresetId: (presetId: string | null) => void
  startTraining: (scenarioType: ScenarioType) => void
  setSession: (session: TrainingSession) => void
  setVapiCallId: (callId: string) => void
  addTranscript: (message: TranscriptMessage) => void
  setAiSpeaking: (speaking: boolean) => void
  updateCallDuration: (seconds: number) => void
  endTraining: (reason: string) => void
  goToDebriefing: () => void
  saveSession: () => void
  reset: () => void
}

type TrainingStore = TrainingState & TrainingActions

const initialState: TrainingState = {
  status: 'idle',
  currentSession: null,
  transcripts: [],
  vapiCallId: null,
  callDuration: 0,
  isAiSpeaking: false,
  selectedScenario: 'random',
  selectedPresetId: null,
  sessions: [],
}

const useTrainingStore = create<TrainingStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedScenario: (scenario) =>
        set({ selectedScenario: scenario }),

      setSelectedPresetId: (presetId) =>
        set({ selectedPresetId: presetId }),

      startTraining: (scenarioType) =>
        set({
          status: 'preparing',
          currentSession: {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            started_at: null,
            ended_at: null,
            scenario_type: scenarioType,
            reached_stage: 0,
            termination_reason: null,
            duration_seconds: null,
            vapi_call_id: null,
            user_context: {},
          },
          transcripts: [],
          callDuration: 0,
        }),

      setSession: (session) =>
        set({
          currentSession: session,
          status: 'in_call',
        }),

      setVapiCallId: (callId) =>
        set((state) => ({
          vapiCallId: callId,
          currentSession: state.currentSession
            ? { ...state.currentSession, vapi_call_id: callId }
            : null,
        })),

      addTranscript: (message) =>
        set((state) => ({
          transcripts: [...state.transcripts, message],
        })),

      setAiSpeaking: (speaking) =>
        set({ isAiSpeaking: speaking }),

      updateCallDuration: (seconds) =>
        set({ callDuration: seconds }),

      endTraining: (reason) =>
        set((state) => ({
          status: 'debriefing',
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                ended_at: new Date().toISOString(),
                termination_reason: reason,
                duration_seconds: state.callDuration,
              }
            : null,
        })),

      goToDebriefing: () =>
        set({ status: 'debriefing' }),

      saveSession: () =>
        set((state) => {
          if (!state.currentSession) return state
          const history: TrainingHistory = {
            id: state.currentSession.id,
            date: state.currentSession.created_at,
            scenarioType: state.currentSession.scenario_type,
            reachedStage: state.currentSession.reached_stage,
            durationSeconds: state.callDuration,
          }
          return {
            sessions: [history, ...state.sessions].slice(0, MAX_SESSION_HISTORY),
          }
        }),

      reset: () =>
        set((state) => ({
          ...initialState,
          sessions: state.sessions,
          selectedScenario: state.selectedScenario,
          selectedPresetId: state.selectedPresetId,
        })),
    }),
    {
      name: 'sokjimarang-training',
      partialize: (state) => ({
        sessions: state.sessions,
        selectedScenario: state.selectedScenario,
        selectedPresetId: state.selectedPresetId,
      }),
    }
  )
)

export { useTrainingStore }
export type { TrainingState, TrainingActions, TrainingStatus, TranscriptMessage, TrainingHistory }
