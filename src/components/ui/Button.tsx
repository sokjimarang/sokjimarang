import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  children: ReactNode
}

function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2'

  const variantClasses = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    secondary:
      'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2',
    danger:
      'bg-danger-500 text-white hover:bg-danger-600 hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2',
    ghost:
      'bg-transparent text-primary-600 hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3.5 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const disabledClasses =
    'disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none'

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }
