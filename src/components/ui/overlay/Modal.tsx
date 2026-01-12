import { useState, type ReactNode } from 'react'
import { Backdrop } from './Backdrop'

interface ModalProps {
  isOpen?: boolean
  close: (result?: boolean) => void
  title?: string
  children: ReactNode
  closeOnBackdropClick?: boolean
}

const ANIMATION_DURATION = 200

function Modal({
  isOpen = true,
  close,
  title,
  children,
  closeOnBackdropClick = true,
}: ModalProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = (result?: boolean) => {
    setIsExiting(true)
    setTimeout(() => {
      close(result)
    }, ANIMATION_DURATION)
  }

  return (
    <Backdrop
      isOpen={isOpen}
      onClick={() => handleClose()}
      closeOnClick={closeOnBackdropClick}
    >
      <div
        className={`
          bg-white rounded-xl p-6
          min-w-[320px] max-w-[480px] max-h-[80vh]
          overflow-y-auto shadow-xl
          ${isExiting ? 'animate-scale-out' : 'animate-scale-in'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="m-0 mb-4 text-lg font-semibold text-gray-900">{title}</h2>
        )}
        {children}
      </div>
    </Backdrop>
  )
}

export { Modal }
