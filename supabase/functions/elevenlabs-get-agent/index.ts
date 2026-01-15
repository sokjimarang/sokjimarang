/// <reference path="../deno.d.ts" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

/**
 * ElevenLabs Get Agent Edge Function
 * 에이전트 조회용 (관리자 전용)
 *
 * 환경변수 필요:
 * - ELEVENLABS_API_KEY: ElevenLabs API 키
 */

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1/convai/agents'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface GetAgentRequest {
  agent_id: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')

  if (!ELEVENLABS_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ELEVENLABS_API_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let agentId: string | null = null

  if (req.method === 'GET') {
    const url = new URL(req.url)
    agentId = url.searchParams.get('agent_id')
  } else {
    try {
      const body: GetAgentRequest = await req.json()
      agentId = body.agent_id
    } catch {
      agentId = null
    }
  }

  if (!agentId) {
    return new Response(
      JSON.stringify({ error: 'Missing required field: agent_id' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_BASE}/${encodeURIComponent(agentId)}`, {
      method: 'GET',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API error', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
