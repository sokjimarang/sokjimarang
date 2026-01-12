import { Modal } from '../Modal'

interface ConfirmModalProps {
  close: (result?: boolean) => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmDestructive?: boolean
}

function ConfirmModal({
  close,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmDestructive = false,
}: ConfirmModalProps) {
  return (
    <Modal close={close} title={title}>
      <p className="m-0 text-gray-600 leading-relaxed">{message}</p>
      <div className="flex gap-3 mt-6 justify-end">
        <button
          className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer border-none"
          onClick={() => close(false)}
        >
          {cancelText}
        </button>
        <button
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
            confirmDestructive
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          onClick={() => close(true)}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

export { ConfirmModal }
