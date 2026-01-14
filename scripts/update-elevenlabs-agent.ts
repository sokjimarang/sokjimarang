#!/usr/bin/env npx tsx
/**
 * ElevenLabs Agent 업데이트 스크립트
 *
 * 사용법:
 *   pnpm tsx scripts/update-elevenlabs-agent.ts
 *
 * 환경변수 필요:
 *   - ELEVENLABS_API_KEY: ElevenLabs API 키
 *   - VITE_ELEVENLABS_AGENT_ID: 업데이트할 Agent ID
 */

import * as fs from 'fs'
import * as path from 'path'
import { createProsecutorAgentRequest } from '../src/lib/elevenlabs/agents/prosecutor'

// .env.local 파일에서 환경변수 로드
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=')
        if (key && value && !process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
}

loadEnvFile()

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const AGENT_ID = process.env.VITE_ELEVENLABS_AGENT_ID

async function updateAgent() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY 환경변수가 필요합니다')
  }

  if (!AGENT_ID) {
    throw new Error('VITE_ELEVENLABS_AGENT_ID 환경변수가 필요합니다')
  }

  const agentRequest = createProsecutorAgentRequest()

  console.log('📤 ElevenLabs API로 에이전트 업데이트 요청...')
  console.log('   Agent ID:', AGENT_ID)
  console.log('   Name:', agentRequest.name)

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/agents/${AGENT_ID}`,
    {
      method: 'PATCH',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: agentRequest.name,
        conversation_config: agentRequest.conversation_config,
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API 오류 (${response.status}): ${errorText}`)
  }

  return response.json()
}

async function main() {
  console.log('🚀 ElevenLabs Agent 업데이트 시작\n')

  try {
    const result = await updateAgent()

    console.log('\n✅ 에이전트 업데이트 완료!')
    console.log('━'.repeat(50))
    console.log('Agent ID:', result.agent_id)
    console.log('Name:', result.name)
    console.log('━'.repeat(50))
    console.log('\n📝 다음 단계:')
    console.log('   1. ElevenLabs 대시보드에서 Error 상태 해제 확인')
    console.log('   2. Preview 버튼으로 테스트 통화 시도')
    console.log('   3. 앱에서 통화 테스트')
  } catch (error) {
    console.error('\n❌ 에이전트 업데이트 실패:', error)
    process.exit(1)
  }
}

main()
