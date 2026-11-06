import { FC, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input: FC<InputProps> = ({
  error,
  label,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="block text-sm font-medium text-slate-200">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none transition-colors ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  )
}
