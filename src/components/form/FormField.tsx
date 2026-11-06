import { FC, ReactNode } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

export const FormField: FC<FormFieldProps> = ({ label, error, required = false, children }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
