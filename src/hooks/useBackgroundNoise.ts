import { useEffect, useRef } from 'react'

function createNoiseBuffer(context: AudioContext): AudioBuffer {
  const length = context.sampleRate * 2
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1
  }

  return buffer
}

function useBackgroundNoise(active: boolean) {
  const contextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  useEffect(() => {
    if (!active) {
      if (sourceRef.current) {
        try {
          sourceRef.current.stop()
        } catch (err) {
          void err
        }
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
      return
    }

    const context = contextRef.current ?? new AudioContext()
    contextRef.current = context

    const startNoise = async () => {
      if (context.state === 'suspended') {
        try {
          await context.resume()
        } catch (err) {
          void err
          return
        }
      }

      if (context.state !== 'running' || sourceRef.current) return

      const source = context.createBufferSource()
      const gain = context.createGain()
      const bandpass = context.createBiquadFilter()
      const lowpass = context.createBiquadFilter()

      source.buffer = createNoiseBuffer(context)
      source.loop = true

      bandpass.type = 'bandpass'
      bandpass.frequency.value = 1200
      bandpass.Q.value = 0.7

      lowpass.type = 'lowpass'
      lowpass.frequency.value = 2800

      gain.gain.value = 0.02

      source.connect(bandpass)
      bandpass.connect(lowpass)
      lowpass.connect(gain)
      gain.connect(context.destination)

      source.start()
      sourceRef.current = source
    }

    void startNoise()

    const handleUserGesture = () => {
      void startNoise()
    }

    window.addEventListener('pointerdown', handleUserGesture)
    window.addEventListener('keydown', handleUserGesture)

    return () => {
      window.removeEventListener('pointerdown', handleUserGesture)
      window.removeEventListener('keydown', handleUserGesture)
    }
  }, [active])

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        try {
          sourceRef.current.stop()
        } catch (err) {
          void err
        }
        sourceRef.current.disconnect()
        sourceRef.current = null
      }
      if (contextRef.current) {
        contextRef.current.close().catch(() => undefined)
        contextRef.current = null
      }
    }
  }, [])
}

export { useBackgroundNoise }
