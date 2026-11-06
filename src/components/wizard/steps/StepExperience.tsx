import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WizardStep } from '../WizardStep'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { Select, SelectOption } from '../../ui/Select'
import { FormField } from '../../form/FormField'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../AuthProvider'
import { Experience, EmploymentType } from '../../../types'
import { Trash2, Briefcase } from 'lucide-react'

const employmentTypes: SelectOption[] = Object.values(EmploymentType).map(type => ({
  label: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
  value: type,
}))

const expSchema = z.object({
  job_title: z.string().min(2, 'Job title required'),
  company_name: z.string().min(2, 'Company name required'),
  employment_type: z.string().min(1, 'Employment type required'),
  location: z.string().optional().default(''),
  start_date: z.string().min(1, 'Start date required'),
  end_date: z.string().optional().or(z.literal('')),
  is_current_role: z.boolean().default(false),
  description: z.string().optional().default(''),
}).refine((data) => {
  if (data.is_current_role || !data.end_date) return true
  return new Date(data.start_date) <= new Date(data.end_date)
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
})

type ExpFormData = z.infer<typeof expSchema>

interface StepExperienceProps {
  onComplete: () => void
}

export const StepExperience: FC<StepExperienceProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<ExpFormData>({
    resolver: zodResolver(expSchema),
    mode: 'onBlur',
  })

  const isCurrentRole = watch('is_current_role')

  useEffect(() => {
    if (!user) return

    const loadExperience = async () => {
      try {
        const { data, error } = await supabase
          .from('experience')
          .select('*')
          .eq('profile_id', user.id)
          .order('start_date', { ascending: false })

        if (error) throw error
        setExperiences(data || [])
      } catch (err: any) {
        toast.error('Failed to load experience: ' + err.message)
      }
    }

    loadExperience()
  }, [user])

  const onSubmit = async (data: ExpFormData) => {
    if (!user) return

    try {
      const { data: newExp, error } = await supabase
        .from('experience')
        .insert([{ ...data, profile_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setExperiences([newExp, ...experiences])
      toast.success('Experience added')
      reset()
      setShowForm(false)
      onComplete()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const deleteExp = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id)

      if (error) throw error
      setExperiences(experiences.filter((e) => e.id !== id))
      toast.success('Experience removed')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const formatDateRange = (start: string, end?: string | null, isCurrent?: boolean) => {
    const startDate = new Date(start).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
    if (isCurrent) return `${startDate} - Present`
    if (!end) return startDate
    const endDate = new Date(end).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    })
    return `${startDate} - ${endDate}`
  }

  return (
    <WizardStep number={5} title="Work Experience">
      <div className="space-y-6">
        {/* Experiences List */}
        <div className="space-y-3">
          {experiences.map((exp) => (
            <Card key={exp.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1 flex gap-3">
                  <Briefcase className="text-teal-400 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-slate-100">{exp.jobTitle}</h4>
                    <p className="text-slate-300 text-sm">{exp.company}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDateRange(exp.startDate, exp.endDate, exp.isCurrentRole)}
                    </p>
                    {exp.location && (
                      <p className="text-xs text-slate-400">{exp.location}</p>
                    )}
                    <p className="text-xs text-slate-500 capitalize mt-1">
                      {exp.employmentType.replace('-', ' ')}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-slate-400 mt-2">{exp.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteExp(exp.id!)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="border-teal-500">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Job Title" error={errors.job_title?.message} required>
                <Input
                  {...register('job_title')}
                  placeholder="e.g., Senior React Developer"
                />
              </FormField>

              <FormField label="Company Name" error={errors.company_name?.message} required>
                <Input
                  {...register('company_name')}
                  placeholder="e.g., Google"
                />
              </FormField>

              <FormField label="Employment Type" error={errors.employment_type?.message} required>
                <Select
                  {...register('employment_type')}
                  options={employmentTypes}
                  placeholder="Select employment type"
                />
              </FormField>

              <FormField label="Location" error={errors.location?.message}>
                <Input
                  {...register('location')}
                  placeholder="e.g., San Francisco, CA"
                />
              </FormField>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Start Date" error={errors.start_date?.message} required>
                  <Input
                    {...register('start_date')}
                    type="date"
                  />
                </FormField>

                {!isCurrentRole && (
                  <FormField label="End Date" error={errors.end_date?.message}>
                    <Input
                      {...register('end_date')}
                      type="date"
                    />
                  </FormField>
                )}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_current_role')}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900"
                />
                <span className="text-slate-200">I currently work here</span>
              </label>

              <FormField label="Description (optional)" error={errors.description?.message}>
                <Textarea
                  {...register('description')}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={3}
                />
              </FormField>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!isValid}
                >
                  Save Entry
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    reset()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {!showForm && (
          <Button variant="secondary" onClick={() => setShowForm(true)}>
            + Add Experience
          </Button>
        )}
      </div>
    </WizardStep>
  )
}
