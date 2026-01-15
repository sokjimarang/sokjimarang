export type ScenarioType = 'prosecutor' | 'bank' | 'family_emergency' | 'delivery_subsidy'

export type Speaker = 'ai' | 'user'

export type AgeGroup = 'under50' | '50s' | '60s' | '70plus'
export type Region = 'seoul' | 'gyeonggi' | 'other'

export interface UserContext {
  user_name?: string
  age_group?: AgeGroup
  region?: Region
  has_children?: boolean
  children?: number | null
  has_grandchildren?: boolean
  grandchildren?: number | null
}

export interface TrainingSession {
  id: string
  created_at: string
  started_at: string | null
  ended_at: string | null
  scenario_type: ScenarioType
  reached_stage: number
  termination_reason: string | null
  duration_seconds: number | null
  conversation_id: string | null
  user_context: UserContext
}

export interface Transcript {
  id: string
  session_id: string
  created_at: string
  speaker: Speaker
  text: string
  sequence_number: number
}

export interface Database {
  public: {
    Tables: {
      training_sessions: {
        Row: TrainingSession
        Insert: Omit<TrainingSession, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<TrainingSession, 'id'>>
      }
      transcripts: {
        Row: Transcript
        Insert: Omit<Transcript, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Transcript, 'id'>>
      }
    }
  }
}
