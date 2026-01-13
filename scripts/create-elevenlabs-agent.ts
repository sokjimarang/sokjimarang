#!/usr/bin/env npx tsx
/**
 * ElevenLabs Agent 생성 스크립트
 *
 * 사용법:
 *   pnpm tsx scripts/create-elevenlabs-agent.ts
 *
 * 환경변수 필요:
 *   - ELEVENLABS_API_KEY: ElevenLabs API 키
 *
 * 또는 Supabase Edge Function을 통해 호출:
 *   - SUPABASE_URL
 *   - SUPABASE_ANON_KEY
 */

import { createProsecutorAgentRequest } from '../src/lib/elevenlabs/agents/prosecutor'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

async function createAgentDirect() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY 환경변수가 필요합니다')
  }

  const agentRequest = createProsecutorAgentRequest()

  console.log('📤 ElevenLabs API로 에이전트 생성 요청...')
  console.log('   Name:', agentRequest.name)

  const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agentRequest),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API 오류 (${response.status}): ${errorText}`)
  }

  return response.json()
}

async function createAgentViaEdgeFunction() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL과 SUPABASE_ANON_KEY 환경변수가 필요합니다')
  }

  const agentRequest = createProsecutorAgentRequest()

  console.log('📤 Supabase Edge Function으로 에이전트 생성 요청...')
  console.log('   Name:', agentRequest.name)

  const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-create-agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(agentRequest),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Edge Function 오류 (${response.status}): ${errorText}`)
  }

  return response.json()
}

async function main() {
  console.log('🚀 ElevenLabs Agent 생성 시작\n')

  try {
    let result

    if (ELEVENLABS_API_KEY) {
      // 직접 API 호출 (권장 - 빠름)
      result = await createAgentDirect()
    } else if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      // Edge Function 통해 호출
      result = await createAgentViaEdgeFunction()
    } else {
      console.error('❌ 환경변수가 설정되지 않았습니다.')
      console.log('\n다음 중 하나를 설정하세요:')
      console.log('  1. ELEVENLABS_API_KEY (직접 API 호출)')
      console.log('  2. SUPABASE_URL + SUPABASE_ANON_KEY (Edge Function 통해)')
      process.exit(1)
    }

    console.log('\n✅ 에이전트 생성 완료!')
    console.log('━'.repeat(50))
    console.log('Agent ID:', result.agent_id)
    console.log('━'.repeat(50))
    console.log('\n📝 다음 단계:')
    console.log('   1. .env.local에 추가:')
    console.log(`      VITE_ELEVENLABS_AGENT_ID=${result.agent_id}`)
    console.log('   2. ElevenLabs 대시보드에서 확인:')
    console.log('      https://elevenlabs.io/app/agents')
  } catch (error) {
    console.error('\n❌ 에이전트 생성 실패:', error)
    process.exit(1)
  }
}

main()
