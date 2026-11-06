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
import { Skill, SkillCategory } from '../../../types'
import { Trash2, Badge } from 'lucide-react'

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name required'),
  category: z.string().min(1, 'Category required'),
})

type SkillFormData = z.infer<typeof skillSchema>

const skillCategories: SelectOption[] = Object.values(SkillCategory).map(cat => ({
  label: cat,
  value: cat,
}))

const MAX_SKILLS = 50

interface StepSkillsProps {
  onComplete: () => void
}

export const StepSkills: FC<StepSkillsProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!user) return

    const loadSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .eq('profile_id', user.id)
          .order('category', { ascending: true })

        if (error) throw error
        setSkills(data || [])
      } catch (err: any) {
        toast.error('Failed to load skills: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadSkills()
  }, [user])

  const onSubmit = async (data: SkillFormData) => {
    if (!user || skills.length >= MAX_SKILLS) return

    try {
      const { data: newSkill, error } = await supabase
        .from('skills')
        .insert([{ ...data, profile_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setSkills([...skills, newSkill])
      toast.success('Skill added')
      reset()
      setShowForm(false)
      onComplete()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const deleteSkill = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id)

      if (error) throw error
      setSkills(skills.filter(s => s.id !== id))
      toast.success('Skill removed')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Group skills by category
  const groupedSkills = Object.values(SkillCategory).reduce((acc, category) => {
    acc[category] = skills.filter(s => s.category === category)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <WizardStep number={2} title="Technical and Professional Skills">
      <div className="space-y-6">
        {/* Skills Count */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex justify-between items-center">
          <span className="text-slate-300">
            Skills: <span className="font-semibold text-slate-100">{skills.length}</span> / {MAX_SKILLS}
          </span>
          {skills.length >= MAX_SKILLS && (
            <span className="text-sm text-red-400">Maximum reached</span>
          )}
        </div>

        {/* Skills by Category */}
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          categorySkills.length > 0 && (
            <div key={category}>
              <h4 className="font-semibold text-slate-300 mb-3">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="bg-teal-500/20 border border-teal-500 rounded-lg px-3 py-2 flex items-center gap-2 text-slate-200"
                  >
                    <Badge size={16} className="text-teal-400" />
                    {skill.name}
                    <button
                      onClick={() => deleteSkill(skill.id!)}
                      className="text-red-400 hover:text-red-300 ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}

        {/* Add Form */}
        {showForm && (
          <Card className="border-teal-500">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Skill Name" error={errors.name?.message} required>
                <Input
                  {...register('name')}
                  placeholder="e.g., React, Python, UI Design"
                />
              </FormField>

              <FormField label="Category" error={errors.category?.message} required>
                <Select
                  {...register('category')}
                  options={skillCategories}
                  placeholder="Select a category"
                />
              </FormField>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!isValid || skills.length >= MAX_SKILLS}
                >
                  Save Skill
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
          <Button
            variant="secondary"
            onClick={() => setShowForm(true)}
            disabled={skills.length >= MAX_SKILLS}
          >
            + Add Skill
          </Button>
        )}
      </div>
    </WizardStep>
  )
}
