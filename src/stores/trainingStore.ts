import { create } from 'zustand'
import type { ScenarioType, TrainingSession } from '@/types/database'

type TrainingStatus = 'idle' | 'preparing' | 'in_call' | 'debriefing' | 'completed'

interface TranscriptMessage {
  speaker: 'ai' | 'user'
  text: string
  timestamp: number
}

interface TrainingState {
  status: TrainingStatus
  currentSession: TrainingSession | null
  transcripts: TranscriptMessage[]
  vapiCallId: string | null
  callDuration: number
  isAiSpeaking: boolean
}

interface TrainingActions {
  startTraining: (scenarioType: ScenarioType) => void
  setSession: (session: TrainingSession) => void
  setVapiCallId: (callId: string) => void
  addTranscript: (message: TranscriptMessage) => void
  setAiSpeaking: (speaking: boolean) => void
  updateCallDuration: (seconds: number) => void
  endTraining: (reason: string) => void
  goToDebriefing: () => void
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
}

const useTrainingStore = create<TrainingStore>((set) => ({
  ...initialState,

  startTraining: (scenarioType) =>
    set({
      status: 'preparing',
      currentSession: {
        id: '',
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

  reset: () => set(initialState),
}))

export { useTrainingStore }
export type { TrainingState, TrainingActions, TrainingStatus, TranscriptMessage }
