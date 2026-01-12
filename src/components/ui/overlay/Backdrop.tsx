import { useRef, useCallback, type ReactNode } from 'react'

interface BackdropProps {
  isOpen: boolean
  onClick?: () => void
  closeOnClick?: boolean
  alignBottom?: boolean
  children: ReactNode
}

function Backdrop({
  isOpen,
  onClick,
  closeOnClick = true,
  alignBottom = false,
  children,
}: BackdropProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  const handleAnimationEnd = useCallback(() => {
    if (!isOpen && backdropRef.current) {
      backdropRef.current.style.display = 'none'
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnClick && onClick) {
      onClick()
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={backdropRef}
      className={`
        fixed inset-0 z-[1000] flex
        ${alignBottom ? 'items-end' : 'items-center'}
        justify-center bg-black/50
        animate-fade-in
      `}
      onClick={handleBackdropClick}
      onAnimationEnd={handleAnimationEnd}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}

export { Backdrop }
