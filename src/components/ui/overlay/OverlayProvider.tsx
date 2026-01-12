import { useState, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { OverlayContext, type OverlayContextType } from './useOverlay'

type OverlayElement = {
  id: string
  element: ReactNode
}

interface OverlayProviderProps {
  children: ReactNode
}

function OverlayProvider({ children }: OverlayProviderProps) {
  const [overlays, setOverlays] = useState<OverlayElement[]>([])
  const [resolvers, setResolvers] = useState<Map<string, (value: unknown) => void>>(
    new Map()
  )

  const generateId = useCallback(() => {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }, [])

  const close = useCallback(
    (id: string, result?: unknown) => {
      const resolver = resolvers.get(id)
      if (resolver) {
        resolver(result)
        setResolvers((prev) => {
          const next = new Map(prev)
          next.delete(id)
          return next
        })
      }
      setOverlays((prev) => prev.filter((overlay) => overlay.id !== id))
    },
    [resolvers]
  )

  const closeAll = useCallback(() => {
    resolvers.forEach((resolver) => resolver(undefined))
    setResolvers(new Map())
    setOverlays([])
  }, [resolvers])

  const open = useCallback(
    <T,>(
      render: (props: { close: (result?: T) => void; isOpen: boolean }) => ReactNode
    ): Promise<T | undefined> => {
      return new Promise((resolve) => {
        const id = generateId()

        const handleClose = (result?: T) => {
          close(id, result)
        }

        setResolvers(
          (prev) => new Map(prev).set(id, resolve as (value: unknown) => void)
        )
        setOverlays((prev) => [
          ...prev,
          {
            id,
            element: render({ close: handleClose, isOpen: true }),
          },
        ])
      })
    },
    [generateId, close]
  )

  const contextValue: OverlayContextType = {
    open,
    close,
    closeAll,
  }

  const canUseDOM = typeof window !== 'undefined'

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
      {canUseDOM &&
        overlays.length > 0 &&
        createPortal(
          <>
            {overlays.map((overlay) => (
              <div key={overlay.id} data-overlay-id={overlay.id}>
                {overlay.element}
              </div>
            ))}
          </>,
          document.body
        )}
    </OverlayContext.Provider>
  )
}

export { OverlayProvider }
