import { FC, ReactNode } from 'react'
import { useWizardContext } from './Wizard'

interface WizardStepProps {
  number: number
  title: string
  children: ReactNode
}

export const WizardStep: FC<WizardStepProps> = ({ number, title, children }) => {
  const { currentStep } = useWizardContext()

  // Only render if this is the current step
  if (number !== currentStep) {
    return null
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-slate-100 mb-6">{title}</h3>
      {children}
    </div>
  )
}
