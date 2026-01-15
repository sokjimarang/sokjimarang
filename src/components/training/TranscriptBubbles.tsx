import { useRef, useEffect } from 'react'
import type { TranscriptMessage } from '@/stores/trainingStore'

interface TranscriptBubblesProps {
  transcripts: TranscriptMessage[]
}

function TranscriptBubbles({ transcripts }: TranscriptBubblesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcripts])

  if (transcripts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-neutral-400 text-sm">대화가 시작되면 여기에 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
      {transcripts.map((message, index) => (
        <div
          key={`${message.timestamp}-${index}`}
          className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
              message.speaker === 'user'
                ? 'bg-primary-500 text-white rounded-br-sm'
                : 'bg-dark-surface text-neutral-100 rounded-bl-sm'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          </div>
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
  )
}

export { TranscriptBubbles }
