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
import { Achievement, AchievementCategory } from '../../../types'
import { Trash2 } from 'lucide-react'

const achievementCategories: SelectOption[] = Object.values(AchievementCategory).map(cat => ({
  label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' '),
  value: cat,
}))

const achievementSchema = z.object({
  title: z.string().min(2, 'Achievement title required'),
  category: z.string().min(1, 'Category required'),
  date: z.string().min(1, 'Date required'),
  description: z.string().optional().default(''),
  organizationName: z.string().optional().default(''),
  url: z.string().url('Valid URL required').optional().or(z.literal('')),
})

type AchievementFormData = z.infer<typeof achievementSchema>

interface StepAchievementsProps {
  onComplete: () => void
}

export const StepAchievements: FC<StepAchievementsProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!user) return

    const loadAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('profile_id', user.id)
          .order('date', { ascending: false })

        if (error) throw error
        setAchievements(data || [])
      } catch (err: any) {
        toast.error('Failed to load achievements: ' + err.message)
      }
    }

    loadAchievements()
  }, [user])

  const onSubmit = async (data: AchievementFormData) => {
    if (!user) return

    try {
      const payload = {
        title: data.title,
        category: data.category,
        date: data.date,
        description: data.description || '',
        organization_name: data.organizationName || '',
        url: data.url || '',
        profile_id: user.id,
      }

      const { data: newAch, error } = await supabase
        .from('achievements')
        .insert([payload])
        .select()
        .single()

      if (error) throw error
      setAchievements([newAch, ...achievements])
      toast.success('Achievement added')
      reset()
      setShowForm(false)
      onComplete()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const deleteAchievement = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id)

      if (error) throw error
      setAchievements(achievements.filter((a) => a.id !== id))
      toast.success('Achievement removed')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case AchievementCategory.AWARD:
        return '🏆'
      case AchievementCategory.PUBLICATION:
        return '📝'
      case AchievementCategory.SPEAKING:
        return '🎤'
      case AchievementCategory.HACKATHON:
        return '💻'
      case AchievementCategory.COMPETITION:
        return '🥇'
      default:
        return '⭐'
    }
  }

  return (
    <WizardStep number={6} title="Achievements & Awards">
      <div className="space-y-6">
        {/* Achievements List */}
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <Card key={achievement.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1 flex gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {getCategoryIcon(achievement.category)}
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-100">{achievement.title}</h4>
                    <p className="text-slate-300 text-sm capitalize">
                      {achievement.category.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(achievement.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    {achievement.organizationName && (
                      <p className="text-xs text-slate-400">{achievement.organizationName}</p>
                    )}
                    {achievement.description && (
                      <p className="text-sm text-slate-400 mt-2">{achievement.description}</p>
                    )}
                    {achievement.url && (
                      <a
                        href={achievement.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-400 hover:text-teal-300 mt-1 inline-block"
                      >
                        Learn more →
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteAchievement(achievement.id!)}
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
              <FormField label="Achievement Title" error={errors.title?.message} required>
                <Input
                  {...register('title')}
                  placeholder="e.g., Best Mobile App Award"
                />
              </FormField>

              <FormField label="Category" error={errors.category?.message} required>
                <Select
                  {...register('category')}
                  options={achievementCategories}
                  placeholder="Select category"
                />
              </FormField>

              <FormField label="Date" error={errors.date?.message} required>
                <Input
                  {...register('date')}
                  type="date"
                />
              </FormField>

              <FormField label="Organization (optional)" error={errors.organizationName?.message}>
                <Input
                  {...register('organizationName')}
                  placeholder="e.g., TechCrunch, HackerRank"
                />
              </FormField>

              <FormField label="Description (optional)" error={errors.description?.message}>
                <Textarea
                  {...register('description')}
                  placeholder="Describe the achievement..."
                  rows={3}
                />
              </FormField>

              <FormField label="URL (optional)" error={errors.url?.message}>
                <Input
                  {...register('url')}
                  type="url"
                  placeholder="https://..."
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
            + Add Achievement
          </Button>
        )}
      </div>
    </WizardStep>
  )
}
