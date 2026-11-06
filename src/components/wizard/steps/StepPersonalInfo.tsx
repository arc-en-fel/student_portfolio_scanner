import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WizardStep } from '../WizardStep'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { FormField } from '../../form/FormField'

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: initialData,
  })

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
          />
        </FormField>

        <FormField label="Professional Headline" error={errors.headline?.message}>
          <Input
            {...register('headline')}
            placeholder="e.g., Full-stack Developer | React Enthusiast"
          />
        </FormField>

        <FormField label="Bio" error={errors.bio?.message}>
          <Textarea
            {...register('bio')}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </FormField>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Professional Email" error={errors.professional_email?.message}>
            <Input
              {...register('professional_email')}
              type="email"
              placeholder="your.email@example.com"
            />
          </FormField>

          <FormField label="Personal Website" error={errors.personal_website?.message}>
            <Input
              {...register('personal_website')}
              type="url"
              placeholder="https://yourwebsite.com"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="City" error={errors.city?.message}>
            <Input
              {...register('city')}
              placeholder="San Francisco"
            />
          </FormField>

          <FormField label="State" error={errors.state?.message}>
            <Input
              {...register('state')}
              placeholder="CA"
            />
          </FormField>

          <FormField label="Country" error={errors.country?.message}>
            <Input
              {...register('country')}
              placeholder="USA"
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
