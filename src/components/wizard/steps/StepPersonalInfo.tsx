import { FC, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WizardStep } from '../WizardStep'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { FormField } from '../../form/FormField'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../AuthProvider'

const schema = z.object({
  full_name: z.string().min(2, 'Full name required'),
  headline: z.string().optional().default(''),
  bio: z.string().optional().default(''),
  professional_email: z.string().email('Valid email required').optional().or(z.literal('')),
  personal_website: z.string().url('Valid URL required').optional().or(z.literal('')),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  country: z.string().optional().default(''),
})

type FormData = z.infer<typeof schema>

interface StepPersonalInfoProps {
  onComplete: (data: FormData) => void
  initialData?: Partial<FormData>
}

export const StepPersonalInfo: FC<StepPersonalInfoProps> = ({ onComplete, initialData }) => {
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: initialData,
  })

  const formData = watch()

  // Auto-save on blur
  const handleBlur = useCallback(async () => {
    if (!user || !isValid) return

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: formData.full_name,
            headline: formData.headline,
            bio: formData.bio,
            professional_email: formData.professional_email,
            personal_website: formData.personal_website,
            city: formData.city,
            state: formData.state,
            country: formData.country,
          },
          { onConflict: 'id' }
        )
        .select()
        .single()

      if (error) {
        toast.error('Failed to save: ' + error.message)
        return
      }

      toast.success('Saved')
      onComplete(formData)
    } catch (err: any) {
      toast.error(err.message)
    }
  }, [user, isValid, formData, onComplete])

  const onSubmit = (data: FormData) => {
    onComplete(data)
  }

  return (
    <WizardStep number={0} title="Personal Information">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField label="Full Name" error={errors.full_name?.message} required>
          <Input
            {...register('full_name')}
            placeholder="John Doe"
            onBlur={handleBlur}
          />
        </FormField>

        <FormField label="Professional Headline" error={errors.headline?.message}>
          <Input
            {...register('headline')}
            placeholder="e.g., Full-stack Developer | React Enthusiast"
            onBlur={handleBlur}
          />
        </FormField>

        <FormField label="Bio" error={errors.bio?.message}>
          <Textarea
            {...register('bio')}
            placeholder="Tell us about yourself..."
            rows={4}
            onBlur={handleBlur}
          />
        </FormField>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Professional Email" error={errors.professional_email?.message}>
            <Input
              {...register('professional_email')}
              type="email"
              placeholder="your.email@example.com"
              onBlur={handleBlur}
            />
          </FormField>

          <FormField label="Personal Website" error={errors.personal_website?.message}>
            <Input
              {...register('personal_website')}
              type="url"
              placeholder="https://yourwebsite.com"
              onBlur={handleBlur}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="City" error={errors.city?.message}>
            <Input
              {...register('city')}
              placeholder="San Francisco"
              onBlur={handleBlur}
            />
          </FormField>

          <FormField label="State" error={errors.state?.message}>
            <Input
              {...register('state')}
              placeholder="CA"
              onBlur={handleBlur}
            />
          </FormField>

          <FormField label="Country" error={errors.country?.message}>
            <Input
              {...register('country')}
              placeholder="USA"
              onBlur={handleBlur}
            />
          </FormField>
        </div>

        <div className="text-sm text-slate-400">
          Information is saved automatically as you fill out the form.
        </div>
      </form>
    </WizardStep>
  )
}
