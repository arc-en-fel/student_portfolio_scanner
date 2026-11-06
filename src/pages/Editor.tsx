import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/AuthProvider'
import { Profile } from '../types'
import { Wizard } from '../components/wizard/Wizard'
import { StepPersonalInfo } from '../components/wizard/steps/StepPersonalInfo'
import { StepEducation } from '../components/wizard/steps/StepEducation'
import { StepSkills } from '../components/wizard/steps/StepSkills'
import { StepProjects } from '../components/wizard/steps/StepProjects'
import { StepCertifications } from '../components/wizard/steps/StepCertifications'
import { StepExperience } from '../components/wizard/steps/StepExperience'
import { StepAchievements } from '../components/wizard/steps/StepAchievements'
import { StepSocialLinks } from '../components/wizard/steps/StepSocialLinks'
import { StepResume } from '../components/wizard/steps/StepResume'
import { StepDesignSettings } from '../components/wizard/steps/StepDesignSettings'
import { toast } from 'sonner'

const TOTAL_STEPS = 10

interface StepCompletion {
  [key: number]: boolean
}

const Editor: FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stepCompletion, setStepCompletion] = useState<StepCompletion>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || authLoading) return

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setProfile(data)
        } else {
          // Create new profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, full_name: '' }])
            .select()
            .single()

          if (createError) throw createError
          setProfile(newProfile)
        }

        // Initialize step completion (all steps incomplete by default)
        setStepCompletion({
          0: !!data?.full_name,
          1: false,
          2: false,
          3: false,
          4: false,
          5: false,
          6: false,
          7: false,
          8: false,
          9: false,
        })
      } catch (err: any) {
        toast.error('Failed to load profile: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, authLoading])

  const navigate = useNavigate()

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading portfolio editor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    navigate('/auth', { replace: true })
    return null
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-400">Error loading profile</p>
        </div>
      </div>
    )
  }

  const markStepComplete = (step: number) => {
    setStepCompletion((prev) => ({ ...prev, [step]: true }))
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isStepComplete = (step: number): boolean => {
    if (step === 0) {
      return !!profile.full_name
    }
    return stepCompletion[step] || false
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Wizard
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        isStepComplete={isStepComplete}
        totalSteps={TOTAL_STEPS}
      >
        <StepPersonalInfo
          onComplete={() => markStepComplete(0)}
          initialData={{
            full_name: profile.full_name,
            headline: profile.headline || '',
            bio: profile.bio || '',
            professional_email: profile.professional_email || '',
            personal_website: profile.personal_website || '',
            city: profile.city || '',
            state: profile.state || '',
            country: profile.country || '',
          }}
        />
        <StepEducation onComplete={() => markStepComplete(1)} />
        <StepSkills onComplete={() => markStepComplete(2)} />
        <StepProjects onComplete={() => markStepComplete(3)} />
        <StepCertifications onComplete={() => markStepComplete(4)} />
        <StepExperience onComplete={() => markStepComplete(5)} />
        <StepAchievements onComplete={() => markStepComplete(6)} />
        <StepSocialLinks onComplete={() => markStepComplete(7)} />
        <StepResume onComplete={() => markStepComplete(8)} />
        <StepDesignSettings
          onComplete={() => markStepComplete(9)}
          profile={profile}
        />
      </Wizard>
    </div>
  )
}

export default Editor
