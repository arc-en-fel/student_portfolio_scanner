import { FC } from 'react'
import { AlertCircle } from 'lucide-react'

interface FormErrorProps {
  message: string
}

export const FormError: FC<FormErrorProps> = ({ message }) => {
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  )
}
