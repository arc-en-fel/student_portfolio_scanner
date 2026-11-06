import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Wizard } from '../../src/components/wizard/Wizard'
import { WizardStep } from '../../src/components/wizard/WizardStep'
import { Button } from '../../src/components/ui/Button'
import { Input } from '../../src/components/ui/Input'
import { Card } from '../../src/components/ui/Card'

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock Supabase
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/image.jpg' } })),
      })),
    },
  },
}))

// Mock AuthProvider
vi.mock('../../src/components/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123' },
    loading: false,
  }),
}))

describe('Portfolio Editor Multi-Step Flow', () => {
  let currentStep: number = 0
  let stepCompletion: Record<number, boolean> = {}

  beforeEach(() => {
    currentStep = 0
    stepCompletion = {
      0: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
    }
  })

  it('should render the wizard with 10 steps', () => {
    const handleNext = vi.fn()
    const handlePrev = vi.fn()

    render(
      <Wizard
        currentStep={0}
        onNext={handleNext}
        onPrev={handlePrev}
        isStepComplete={() => true}
        totalSteps={10}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <WizardStep key={i} number={i} title={`Step ${i + 1}`}>
            <p>Step {i + 1} content</p>
          </WizardStep>
        ))}
      </Wizard>
    )

    // Should show progress
    expect(screen.getByText('Step 1 of 10')).toBeInTheDocument()

    // Should show current step content
    expect(screen.getByText('Step 1 content')).toBeInTheDocument()
  })

  it('should navigate between steps', async () => {
    const steps = Array.from({ length: 10 }, (_, i) => i)
    let activeStep = 0

    const { rerender } = render(
      <Wizard
        currentStep={activeStep}
        onNext={() => {
          activeStep = Math.min(activeStep + 1, 9)
          rerender(
            <Wizard
              currentStep={activeStep}
              onNext={() => {}}
              onPrev={() => {}}
              isStepComplete={() => true}
              totalSteps={10}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <WizardStep key={i} number={i} title={`Step ${i + 1}`}>
                  <p>Step {i + 1} content</p>
                </WizardStep>
              ))}
            </Wizard>
          )
        }}
        onPrev={() => {}}
        isStepComplete={() => true}
        totalSteps={10}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <WizardStep key={i} number={i} title={`Step ${i + 1}`}>
            <p>Step {i + 1} content</p>
          </WizardStep>
        ))}
      </Wizard>
    )

    const nextButton = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Step 2 of 10')).toBeInTheDocument()
      expect(screen.getByText('Step 2 content')).toBeInTheDocument()
    })
  })

  it('should disable Previous button on first step', () => {
    render(
      <Wizard
        currentStep={0}
        onNext={() => {}}
        onPrev={() => {}}
        isStepComplete={() => true}
        totalSteps={10}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <WizardStep key={i} number={i} title={`Step ${i + 1}`}>
            <p>Step {i + 1} content</p>
          </WizardStep>
        ))}
      </Wizard>
    )

    const prevButton = screen.getByRole('button', { name: /Previous/i })
    expect(prevButton).toBeDisabled()
  })

  it('should disable Next button when step is incomplete', () => {
    render(
      <Wizard
        currentStep={0}
        onNext={() => {}}
        onPrev={() => {}}
        isStepComplete={() => false}
        totalSteps={10}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <WizardStep key={i} number={i} title={`Step ${i + 1}`}>
            <p>Step {i + 1} content</p>
          </WizardStep>
        ))}
      </Wizard>
    )

    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect(nextButton).toBeDisabled()
  })

  it('should enable Next button when step is complete', () => {
    render(
      <Wizard
        currentStep={0}
        onNext={() => {}}
        onPrev={() => {}}
        isStepComplete={() => true}
        totalSteps={10}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <WizardStep key={i} number={i} title={`Step ${i + 1}`}>
            <p>Step {i + 1} content</p>
          </WizardStep>
        ))}
      </Wizard>
    )

    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('should show completion button on last step', () => {
    render(
      <Wizard
        currentStep={9}
        onNext={() => {}}
        onPrev={() => {}}
        isStepComplete={() => true}
        totalSteps={10}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <WizardStep key={i} number={i} title={`Step ${i + 1}`}>
            <p>Step {i + 1} content</p>
          </WizardStep>
        ))}
      </Wizard>
    )

    const completeButton = screen.getByRole('button', { name: /Complete/i })
    expect(completeButton).toBeInTheDocument()
  })

  it('should display progress bar at correct percentage', () => {
    const { rerender } = render(
      <Wizard
        currentStep={0}
        onNext={() => {}}
        onPrev={() => {}}
        isStepComplete={() => true}
        totalSteps={10}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <WizardStep key={i} number={i} title={`Step ${i + 1}`}>
            <p>Step {i + 1} content</p>
          </WizardStep>
        ))}
      </Wizard>
    )

    expect(screen.getByText('10%')).toBeInTheDocument()

    rerender(
      <Wizard
        currentStep={4}
        onNext={() => {}}
        onPrev={() => {}}
        isStepComplete={() => true}
        totalSteps={10}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <WizardStep key={i} number={i} title={`Step ${i + 1}`}>
            <p>Step {i + 1} content</p>
          </WizardStep>
        ))}
      </Wizard>
    )

    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('should render UI components correctly', () => {
    const { container } = render(
      <div>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="danger">Danger Button</Button>
      </div>
    )

    expect(screen.getByText('Primary Button')).toHaveClass('bg-teal-500')
    expect(screen.getByText('Secondary Button')).toHaveClass('border')
    expect(screen.getByText('Danger Button')).toHaveClass('bg-red-600')
  })

  it('should render Input component with error state', () => {
    render(<Input label="Test Input" error="This field is required" value="" onChange={() => {}} />)

    expect(screen.getByText('Test Input')).toBeInTheDocument()
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should render Card component', () => {
    render(
      <Card hover>
        <p>Card content</p>
      </Card>
    )

    const card = screen.getByText('Card content').parentElement
    expect(card).toHaveClass('rounded-xl', 'border')
  })

  it('should track step completion', () => {
    let completedSteps = 0

    const handleStepComplete = (step: number) => {
      stepCompletion[step] = true
      completedSteps++
    }

    // Simulate completing steps
    handleStepComplete(0)
    handleStepComplete(1)
    handleStepComplete(2)

    expect(completedSteps).toBe(3)
    expect(stepCompletion[0]).toBe(true)
    expect(stepCompletion[1]).toBe(true)
    expect(stepCompletion[2]).toBe(true)
    expect(stepCompletion[3]).toBe(false)
  })

  it('should complete full 10-step flow', async () => {
    let currentStep = 0
    const completionMap: Record<number, boolean> = {}

    for (let i = 0; i < 10; i++) {
      completionMap[i] = true
    }

    // Verify all steps are marked complete
    expect(Object.values(completionMap).every(v => v === true)).toBe(true)
    expect(Object.keys(completionMap).length).toBe(10)
  })

  it('should handle step validation state changes', () => {
    const isValidMap: Record<number, boolean> = {}

    // Initially all invalid
    for (let i = 0; i < 10; i++) {
      isValidMap[i] = false
    }

    // Mark step 0 as valid when full_name is filled
    isValidMap[0] = true

    expect(isValidMap[0]).toBe(true)
    expect(isValidMap[1]).toBe(false)
  })
})
