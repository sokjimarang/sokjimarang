import { createContext, useContext, type ReactNode } from 'react'

type OverlayContextType = {
  open: <T>(
    render: (props: { close: (result?: T) => void; isOpen: boolean }) => ReactNode
  ) => Promise<T | undefined>
  close: (id: string) => void
  closeAll: () => void
}

export const OverlayContext = createContext<OverlayContextType | null>(null)

function useOverlay() {
  const context = useContext(OverlayContext)
  if (!context) {
    throw new Error('useOverlay must be used within OverlayProvider')
  }
  return context
}

export { useOverlay }
export type { OverlayContextType }
