import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WizardStep } from '../WizardStep'
import { Input } from '../../ui/Input'
import { Select, SelectOption } from '../../ui/Select'
import { FormField } from '../../form/FormField'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../AuthProvider'
import { SocialLink, SocialPlatform } from '../../../types'
import { Trash2, Github, Linkedin, Twitter, Globe } from 'lucide-react'

const socialPlatforms: SelectOption[] = Object.values(SocialPlatform).map(platform => ({
  label: platform.charAt(0).toUpperCase() + platform.slice(1).replace(/_/g, ' '),
  value: platform,
}))

const socialSchema = z.object({
  platform: z.string().min(1, 'Platform required'),
  url: z.string().url('Valid URL required'),
  display_name: z.string().optional().default(''),
})

type SocialFormData = z.infer<typeof socialSchema>

interface StepSocialLinksProps {
  onComplete: () => void
}

export const StepSocialLinks: FC<StepSocialLinksProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [links, setLinks] = useState<SocialLink[]>([])
  const [showForm, setShowForm] = useState(false)
  const [usedPlatforms, setUsedPlatforms] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<SocialFormData>({
    resolver: zodResolver(socialSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!user) return

    const loadLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('social_links')
          .select('*')
          .eq('profile_id', user.id)
          .order('platform', { ascending: true })

        if (error) throw error
        setLinks(data || [])
        setUsedPlatforms((data || []).map(l => l.platform))
      } catch (err: any) {
        toast.error('Failed to load social links: ' + err.message)
      }
    }

    loadLinks()
  }, [user])

  const onSubmit = async (data: SocialFormData) => {
    if (!user) return

    // Verify URL starts with http or https
    if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
      toast.error('URL must start with http:// or https://')
      return
    }

    try {
      const { data: newLink, error } = await supabase
        .from('social_links')
        .insert([{ ...data, profile_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setLinks([...links, newLink])
      setUsedPlatforms([...usedPlatforms, data.platform])
      toast.success('Social link added')
      reset()
      setShowForm(false)
      onComplete()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const deleteLink = async (id: string, platform: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id)

      if (error) throw error
      setLinks(links.filter((l) => l.id !== id))
      setUsedPlatforms(usedPlatforms.filter(p => p !== platform))
      toast.success('Social link removed')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case SocialPlatform.GITHUB:
        return <Github size={18} className="text-slate-400" />
      case SocialPlatform.LINKEDIN:
        return <Linkedin size={18} className="text-blue-400" />
      case SocialPlatform.TWITTER:
        return <Twitter size={18} className="text-sky-400" />
      default:
        return <Globe size={18} className="text-teal-400" />
    }
  }

  const availablePlatforms = socialPlatforms.filter(
    p => !usedPlatforms.includes(p.value)
  )

  return (
    <WizardStep number={7} title="Social Links">
      <div className="space-y-6">
        {/* Links List */}
        <div className="space-y-3">
          {links.map((link) => (
            <Card key={link.id}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {getSocialIcon(link.platform)}
                  <div>
                    <p className="font-semibold text-slate-100 capitalize">
                      {link.platform.replace(/_/g, ' ')}
                    </p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-teal-400 hover:text-teal-300 break-all"
                    >
                      {link.url}
                    </a>
                    {link.displayName && (
                      <p className="text-xs text-slate-400">{link.displayName}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteLink(link.id!, link.platform)}
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
              <FormField label="Platform" error={errors.platform?.message} required>
                <Select
                  {...register('platform')}
                  options={availablePlatforms}
                  placeholder={
                    availablePlatforms.length === 0
                      ? 'All platforms added'
                      : 'Select a platform'
                  }
                  disabled={availablePlatforms.length === 0}
                />
              </FormField>

              <FormField label="Profile URL" error={errors.url?.message} required>
                <Input
                  {...register('url')}
                  type="url"
                  placeholder="https://github.com/username"
                />
              </FormField>

              <FormField label="Display Name (optional)" error={errors.display_name?.message}>
                <Input
                  {...register('display_name')}
                  placeholder="e.g., @username"
                />
              </FormField>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!isValid}
                >
                  Save Link
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

        {!showForm && availablePlatforms.length > 0 && (
          <Button variant="secondary" onClick={() => setShowForm(true)}>
            + Add Social Link
          </Button>
        )}

        {availablePlatforms.length === 0 && !showForm && (
          <div className="p-4 bg-slate-800 rounded-lg text-slate-400 text-sm">
            All social platforms have been added.
          </div>
        )}
      </div>
    </WizardStep>
  )
}
