import "jsr:@supabase/functions-js/edge-runtime.d.ts"

/**
 * ElevenLabs Create Agent Edge Function
 * 에이전트 생성용 (관리자 전용, 1회성)
 *
 * 환경변수 필요:
 * - ELEVENLABS_API_KEY: ElevenLabs API 키
 */

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/convai/agents/create'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateAgentRequest {
  name: string
  conversation_config: Record<string, unknown>
  workflow?: Record<string, unknown>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
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

  try {
    const body: CreateAgentRequest = await req.json()

    if (!body.name || !body.conversation_config) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, conversation_config' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(ELEVENLABS_API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        conversation_config: body.conversation_config,
        ...(body.workflow && { workflow: body.workflow }),
      }),
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
