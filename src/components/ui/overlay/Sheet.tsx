import { useState, type ReactNode } from 'react'
import { Backdrop } from './Backdrop'

interface SheetProps<T = unknown> {
  isOpen?: boolean
  close: (result?: T) => void
  title?: string
  children: ReactNode
  closeOnBackdropClick?: boolean
}

const ANIMATION_DURATION = 300

function Sheet<T = unknown>({
  isOpen = true,
  close,
  title,
  children,
  closeOnBackdropClick = true,
}: SheetProps<T>) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = (result?: T) => {
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
      alignBottom
    >
      <div
        className={`
          bg-white rounded-t-2xl
          w-full max-w-lg
          max-h-[85vh] overflow-y-auto
          shadow-xl
          ${isExiting ? 'animate-slide-down' : 'animate-slide-up'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {title && (
          <h2 className="px-6 pb-4 text-lg font-semibold text-gray-900 border-b border-gray-100">
            {title}
          </h2>
        )}

        <div className="p-6">{children}</div>
      </div>
    </Backdrop>
  )
}

export { Sheet }
