import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VapiMessage {
  type: string
  role?: 'assistant' | 'user'
  transcriptType?: 'final' | 'partial'
  transcript?: string
  timestamp?: number
}

interface VapiWebhookPayload {
  message: VapiMessage
  call?: {
    id: string
    status: string
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: VapiWebhookPayload = await req.json()
    const { message, call } = payload

    console.log('Vapi webhook received:', JSON.stringify({ type: message.type, callId: call?.id }))

    switch (message.type) {
      case 'status-update': {
        if (call?.status === 'ended') {
          const { error } = await supabase
            .from('training_sessions')
            .update({
              ended_at: new Date().toISOString(),
            })
            .eq('vapi_call_id', call.id)

          if (error) {
            console.error('Error updating session:', error)
          }
        }
        break
      }

      case 'transcript': {
        if (message.transcriptType === 'final' && message.transcript && call?.id) {
          const { data: session } = await supabase
            .from('training_sessions')
            .select('id')
            .eq('vapi_call_id', call.id)
            .single()

          if (session) {
            const { data: lastTranscript } = await supabase
              .from('transcripts')
              .select('sequence_number')
              .eq('session_id', session.id)
              .order('sequence_number', { ascending: false })
              .limit(1)
              .single()

            const nextSequence = (lastTranscript?.sequence_number ?? 0) + 1

            const { error } = await supabase.from('transcripts').insert({
              session_id: session.id,
              speaker: message.role === 'assistant' ? 'ai' : 'user',
              text: message.transcript,
              sequence_number: nextSequence,
            })

            if (error) {
              console.error('Error inserting transcript:', error)
            }

            if (message.transcript.includes('[END_SCENARIO]')) {
              await supabase
                .from('training_sessions')
                .update({
                  termination_reason: 'user_terminated',
                  ended_at: new Date().toISOString(),
                })
                .eq('id', session.id)
            }
          }
        }
        break
      }

      case 'hang': {
        if (call?.id) {
          const { error } = await supabase
            .from('training_sessions')
            .update({
              termination_reason: 'call_ended',
              ended_at: new Date().toISOString(),
            })
            .eq('vapi_call_id', call.id)

          if (error) {
            console.error('Error updating session on hang:', error)
          }
        }
        break
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
