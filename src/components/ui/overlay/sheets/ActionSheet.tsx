import { Sheet } from '../Sheet'

interface ActionSheetOption<T> {
  label: string
  value: T
  destructive?: boolean
}

interface ActionSheetProps<T> {
  close: (result?: T) => void
  title?: string
  options: ActionSheetOption<T>[]
}

function ActionSheet<T>({ close, title, options }: ActionSheetProps<T>) {
  return (
    <Sheet close={close} title={title}>
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <button
            key={index}
            className={`
              w-full px-4 py-3 rounded-lg text-left
              transition-colors cursor-pointer border-none bg-transparent
              ${
                option.destructive
                  ? 'text-red-500 hover:bg-red-50'
                  : 'text-gray-900 hover:bg-gray-100'
              }
            `}
            onClick={() => close(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </Sheet>
  )
}

export { ActionSheet }
