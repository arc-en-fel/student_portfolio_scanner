import { FC, ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export interface ModalAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ModalAction[]
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children, actions = [] }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-md w-full mx-4 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-3 p-6 border-t border-slate-700">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
