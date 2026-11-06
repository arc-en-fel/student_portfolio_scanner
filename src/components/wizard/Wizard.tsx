import { FC, ReactNode, createContext, useContext } from 'react'
import { Button } from '../ui/Button'

interface WizardContextType {
  currentStep: number
}

const WizardContext = createContext<WizardContextType | null>(null)

export const useWizardContext = (): WizardContextType => {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizardContext must be used within a Wizard')
  }
  return context
}

interface WizardProps {
  children: ReactNode[]
  currentStep: number
  onNext: () => void
  onPrev: () => void
  isStepComplete: (step: number) => boolean
  totalSteps: number
}

export const Wizard: FC<WizardProps> = ({
  children,
  currentStep,
  onNext,
  onPrev,
  isStepComplete,
  totalSteps,
}) => {
  const isLastStep = currentStep === totalSteps - 1
  const canGoNext = isStepComplete(currentStep)

  return (
    <WizardContext.Provider value={{ currentStep }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-slate-100">
              Step {currentStep + 1} of {totalSteps}
            </h2>
            <span className="text-sm text-slate-400">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 mb-8">
          {children[currentStep]}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="secondary"
            onClick={onPrev}
            disabled={currentStep === 0}
          >
            ← Previous
          </Button>

          {isLastStep ? (
            <Button
              variant="primary"
              onClick={onNext}
              disabled={!canGoNext}
            >
              Complete
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={onNext}
              disabled={!canGoNext}
            >
              Next →
            </Button>
          )}
        </div>
      </div>
    </WizardContext.Provider>
  )
}
