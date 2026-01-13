import { Conversation } from '@elevenlabs/elevenlabs-js/browser'

export type ConversationInstance = Awaited<ReturnType<typeof Conversation.startSession>>

export interface StartConversationOptions {
  signedUrl: string
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: { source: string; message: string }) => void
  onError?: (error: Error) => void
  onModeChange?: (mode: { mode: string }) => void
}

export async function startConversation(
  options: StartConversationOptions
): Promise<ConversationInstance> {
  const conversation = await Conversation.startSession({
    signedUrl: options.signedUrl,
    onConnect: options.onConnect,
    onDisconnect: options.onDisconnect,
    onMessage: options.onMessage,
    onError: options.onError,
    onModeChange: options.onModeChange,
  })

  return conversation
}

export async function endConversation(conversation: ConversationInstance): Promise<void> {
  await conversation.endSession()
}
