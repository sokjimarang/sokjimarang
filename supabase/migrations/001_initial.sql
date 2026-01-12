-- 훈련 세션 테이블
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  scenario_type TEXT CHECK (scenario_type IN ('prosecutor', 'bank', 'family_emergency', 'delivery_subsidy')),
  reached_stage INTEGER DEFAULT 0,
  termination_reason TEXT,
  duration_seconds INTEGER,
  vapi_call_id TEXT,
  user_context JSONB DEFAULT '{}'
);

-- 대화 기록 테이블
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES training_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  speaker TEXT CHECK (speaker IN ('ai', 'user')),
  text TEXT NOT NULL,
  sequence_number INTEGER NOT NULL
);

-- 세션별 transcript 조회 성능 최적화
CREATE INDEX idx_transcripts_session ON transcripts(session_id);
CREATE INDEX idx_transcripts_session_sequence ON transcripts(session_id, sequence_number);

-- 시나리오별 세션 조회
CREATE INDEX idx_sessions_scenario ON training_sessions(scenario_type);

-- RLS (Row Level Security) 정책
-- 현재는 인증 없이 사용하므로 anon 사용자에게 모든 권한 부여
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 세션 생성/조회/수정 가능 (추후 인증 추가 시 수정)
CREATE POLICY "Allow all operations on training_sessions" ON training_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on transcripts" ON transcripts
  FOR ALL
  USING (true)
  WITH CHECK (true);
