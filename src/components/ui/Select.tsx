import { FC, SelectHTMLAttributes } from 'react'

export interface SelectOption {
  label: string
  value: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  error?: string
  label?: string
  placeholder?: string
}

export const Select: FC<SelectProps> = ({
  options,
  error,
  label,
  placeholder,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="block text-sm font-medium text-slate-200">{label}</label>}
      <select
        className={`w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-teal-500 focus:outline-none transition-colors ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  )
}
