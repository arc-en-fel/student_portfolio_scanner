import { FC, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export const Card: FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`rounded-xl border border-slate-700 bg-slate-900 p-6 ${hover ? 'hover:border-slate-600 hover:bg-slate-800 transition-colors cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
