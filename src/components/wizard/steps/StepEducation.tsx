import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WizardStep } from '../WizardStep'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { FormField } from '../../form/FormField'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../AuthProvider'
import { Education } from '../../../types'
import { Trash2 } from 'lucide-react'

const schema = z.object({
  institution: z.string().min(2, 'Institution name required'),
  degree: z.string().min(2, 'Degree required'),
  department: z.string().optional().default(''),
  specialization: z.string().optional().default(''),
  start_year: z.number().int().min(1900).max(2100, 'Valid year required'),
  end_year: z.number().int().min(1900).max(2100, 'Valid year required'),
  cgpa: z.number().optional().refine((val) => !val || (val >= 0 && val <= 4), 'CGPA must be between 0 and 4'),
  description: z.string().optional().default(''),
}).refine((data) => data.end_year >= data.start_year, {
  message: 'End year must be after start year',
  path: ['end_year'],
})

type FormData = z.infer<typeof schema>

interface StepEducationProps {
  onComplete: () => void
}

export const StepEducation: FC<StepEducationProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [entries, setEntries] = useState<Education[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!user) return

    const loadEducation = async () => {
      try {
        const { data, error } = await supabase
          .from('education')
          .select('*')
          .eq('profile_id', user.id)
          .order('start_year', { ascending: false })

        if (error) throw error
        setEntries(data || [])
      } catch (err: any) {
        toast.error('Failed to load education: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadEducation()
  }, [user])

  const onSubmit = async (data: FormData) => {
    if (!user) return

    try {
      if (editingId) {
        const { error } = await supabase
          .from('education')
          .update({ ...data, profile_id: user.id })
          .eq('id', editingId)
          .eq('profile_id', user.id)

        if (error) throw error
        setEntries(entries.map(e => e.id === editingId ? { ...data, id: editingId, profile_id: user.id } as Education : e))
        toast.success('Education updated')
        setEditingId(null)
      } else {
        const { data: newEntry, error } = await supabase
          .from('education')
          .insert([{ ...data, profile_id: user.id }])
          .select()
          .single()

        if (error) throw error
        setEntries([newEntry, ...entries])
        toast.success('Education added')
      }

      reset()
      setShowForm(false)
      onComplete()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id)

      if (error) throw error
      setEntries(entries.filter(e => e.id !== id))
      toast.success('Education entry removed')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <WizardStep number={1} title="Education">
      <div className="space-y-6">
        {/* Entries List */}
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-slate-100">{entry.degree}</h4>
                <p className="text-slate-300">{entry.institution}</p>
                <p className="text-sm text-slate-400">{entry.start_year} - {entry.end_year}</p>
                {entry.cgpa && <p className="text-sm text-slate-400">CGPA: {entry.cgpa}</p>}
                {entry.description && <p className="text-sm text-slate-400 mt-2">{entry.description}</p>}
              </div>
              <button
                onClick={() => deleteEntry(entry.id!)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </Card>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="border-teal-500">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Institution" error={errors.institution?.message} required>
                <Input
                  {...register('institution')}
                  placeholder="e.g., Stanford University"
                />
              </FormField>

              <FormField label="Degree" error={errors.degree?.message} required>
                <Input
                  {...register('degree')}
                  placeholder="e.g., Bachelor of Science"
                />
              </FormField>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Department" error={errors.department?.message}>
                  <Input
                    {...register('department')}
                    placeholder="e.g., Computer Science"
                  />
                </FormField>

                <FormField label="Specialization" error={errors.specialization?.message}>
                  <Input
                    {...register('specialization')}
                    placeholder="e.g., AI/ML"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="Start Year" error={errors.start_year?.message} required>
                  <Input
                    {...register('start_year', { valueAsNumber: true })}
                    type="number"
                    min="1900"
                    max="2100"
                  />
                </FormField>

                <FormField label="End Year" error={errors.end_year?.message} required>
                  <Input
                    {...register('end_year', { valueAsNumber: true })}
                    type="number"
                    min="1900"
                    max="2100"
                  />
                </FormField>

                <FormField label="CGPA" error={errors.cgpa?.message}>
                  <Input
                    {...register('cgpa', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    placeholder="3.8"
                  />
                </FormField>
              </div>

              <FormField label="Description" error={errors.description?.message}>
                <Textarea
                  {...register('description')}
                  placeholder="Additional details about your education..."
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
                    setEditingId(null)
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
            onClick={() => {
              setShowForm(true)
              reset()
            }}
          >
            + Add Education
          </Button>
        )}
      </div>
    </WizardStep>
  )
}
