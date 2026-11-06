import { FC, ReactNode, ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-teal-500 text-slate-900 hover:bg-teal-400 font-semibold',
  secondary: 'border border-slate-600 text-slate-200 hover:bg-slate-800 hover:border-slate-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 font-semibold',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-medium'
  const combined = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <button disabled={disabled} className={combined} {...props}>
      {children}
    </button>
  )
}
