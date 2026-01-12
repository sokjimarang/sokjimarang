import { useState, useEffect, type ReactNode } from 'react'

interface BackdropProps {
  isOpen: boolean
  onClick?: () => void
  closeOnClick?: boolean
  alignBottom?: boolean
  children: ReactNode
}

const ANIMATION_DURATION = 200

function Backdrop({
  isOpen,
  onClick,
  closeOnClick = true,
  alignBottom = false,
  children,
}: BackdropProps) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsExiting(false)
    } else if (shouldRender) {
      setIsExiting(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
        setIsExiting(false)
      }, ANIMATION_DURATION)
      return () => clearTimeout(timer)
    }
  }, [isOpen, shouldRender])

  if (!shouldRender) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnClick && onClick) {
      onClick()
    }
  }

  return (
    <div
      className={`
        fixed inset-0 z-[1000] flex
        ${alignBottom ? 'items-end' : 'items-center'}
        justify-center bg-black/50
        ${isExiting ? 'animate-fade-out' : 'animate-fade-in'}
      `}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}

export { Backdrop }
