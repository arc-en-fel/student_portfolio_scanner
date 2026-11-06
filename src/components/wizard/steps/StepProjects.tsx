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
import { Project } from '../../../types'
import { Trash2, Star } from 'lucide-react'

const projectSchema = z.object({
  title: z.string().min(2, 'Project title required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  techStack: z.string().min(1, 'At least one technology required'),
  category: z.string().optional().default(''),
  githubUrl: z.string().url('Valid URL required').optional().or(z.literal('')),
  liveUrl: z.string().url('Valid URL required').optional().or(z.literal('')),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  featured: z.boolean().default(false),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface StepProjectsProps {
  onComplete: () => void
}

export const StepProjects: FC<StepProjectsProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    mode: 'onBlur',
  })

  const featured = watch('featured')

  useEffect(() => {
    if (!user) return

    const loadProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('profile_id', user.id)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) throw error
        setProjects(data || [])
      } catch (err: any) {
        toast.error('Failed to load projects: ' + err.message)
      }
    }

    loadProjects()
  }, [user])

  const handleImageUpload = async (file: File) => {
    if (!user) return

    try {
      setUploadingImage(true)

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be under 5 MB')
      }

      const path = `${user.id}/project-${Date.now()}`
      const { error } = await supabase.storage
        .from('projects')
        .upload(path, file, { upsert: false })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from('projects').getPublicUrl(path)

      setImagePreview(publicUrl)
      toast.success('Image uploaded')
    } catch (err: any) {
      toast.error('Image upload failed: ' + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) return

    try {
      const techStackArray = data.techStack
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean)

      const { data: newProject, error } = await supabase
        .from('projects')
        .insert([
          {
            ...data,
            profile_id: user.id,
            tech_stack: techStackArray,
            image_url: imagePreview,
          },
        ])
        .select()
        .single()

      if (error) throw error
      setProjects([newProject, ...projects])
      toast.success('Project added')
      reset()
      setImagePreview(null)
      setShowForm(false)
      onComplete()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('projects')
        .update({ featured: !currentFeatured })
        .eq('id', id)
        .eq('profile_id', user.id)

      if (error) throw error
      setProjects(
        projects.map((p) => (p.id === id ? { ...p, featured: !currentFeatured } : p))
      )
      toast.success(currentFeatured ? 'Unfeatured' : 'Featured')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const deleteProject = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id)

      if (error) throw error
      setProjects(projects.filter((p) => p.id !== id))
      toast.success('Project removed')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <WizardStep number={3} title="Projects">
      <div className="space-y-6">
        {/* Projects List */}
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={featured ? 'border-teal-500 bg-teal-500/5' : ''}
            >
              <div className="flex gap-6">
                {project.imageUrl && (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                        {project.title}
                        {project.featured && (
                          <Star
                            size={16}
                            className="fill-yellow-400 text-yellow-400"
                          />
                        )}
                      </h4>
                      <p className="text-slate-400 text-sm">{project.description}</p>
                    </div>
                    <button
                      onClick={() => deleteProject(project.id!)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(project.techStack || []).map((tech: string) => (
                      <span
                        key={tech}
                        className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-3">
                    <Button
                      size="sm"
                      variant={project.featured ? 'primary' : 'secondary'}
                      onClick={() => toggleFeatured(project.id!, project.featured)}
                    >
                      {project.featured ? '★ Featured' : '☆ Feature'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="border-teal-500">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-lg p-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              <FormField label="Project Image">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                  disabled={uploadingImage}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-500 file:text-slate-900 hover:file:bg-teal-400"
                />
              </FormField>

              <FormField label="Project Title" error={errors.title?.message} required>
                <Input
                  {...register('title')}
                  placeholder="e.g., E-commerce Platform"
                />
              </FormField>

              <FormField label="Description" error={errors.description?.message} required>
                <Textarea
                  {...register('description')}
                  placeholder="Describe your project..."
                  rows={4}
                />
              </FormField>

              <FormField
                label="Technology Stack (comma-separated)"
                error={errors.techStack?.message}
                required
              >
                <Input
                  {...register('techStack')}
                  placeholder="React, Node.js, PostgreSQL"
                />
              </FormField>

              <FormField label="Category" error={errors.category?.message}>
                <Input
                  {...register('category')}
                  placeholder="e.g., Web Development, Mobile"
                />
              </FormField>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="GitHub URL" error={errors.githubUrl?.message}>
                  <Input
                    {...register('githubUrl')}
                    type="url"
                    placeholder="https://github.com/username/repo"
                  />
                </FormField>

                <FormField label="Live URL" error={errors.liveUrl?.message}>
                  <Input
                    {...register('liveUrl')}
                    type="url"
                    placeholder="https://yourproject.com"
                  />
                </FormField>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Start Date" error={errors.startDate?.message}>
                  <Input
                    {...register('startDate')}
                    type="date"
                  />
                </FormField>

                <FormField label="End Date" error={errors.endDate?.message}>
                  <Input
                    {...register('endDate')}
                    type="date"
                  />
                </FormField>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900"
                />
                <span className="text-slate-200">Mark as featured project</span>
              </label>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!isValid}
                >
                  Save Project
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setImagePreview(null)
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
            + Add Project
          </Button>
        )}
      </div>
    </WizardStep>
  )
}
