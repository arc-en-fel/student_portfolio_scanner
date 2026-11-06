import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WizardStep } from '../WizardStep'
import { Input } from '../../ui/Input'
import { FormField } from '../../form/FormField'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../AuthProvider'
import { Certification } from '../../../types'
import { Trash2, Award } from 'lucide-react'

const certSchema = z.object({
  title: z.string().min(2, 'Certificate title required'),
  issuer: z.string().min(2, 'Issuer required'),
  issueDate: z.string().min(1, 'Issue date required'),
  expirationDate: z.string().optional().or(z.literal('')),
  credentialId: z.string().optional().default(''),
  credentialUrl: z.string().url('Valid URL required').optional().or(z.literal('')),
}).refine((data) => {
  if (!data.expirationDate) return true
  return new Date(data.issueDate) <= new Date(data.expirationDate)
}, {
  message: 'Expiration date must be after issue date',
  path: ['expirationDate'],
})

type CertFormData = z.infer<typeof certSchema>

interface StepCertificationsProps {
  onComplete: () => void
}

export const StepCertifications: FC<StepCertificationsProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [certs, setCerts] = useState<Certification[]>([])
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CertFormData>({
    resolver: zodResolver(certSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!user) return

    const loadCerts = async () => {
      try {
        const { data, error } = await supabase
          .from('certifications')
          .select('*')
          .eq('profile_id', user.id)
          .order('issue_date', { ascending: false })

        if (error) throw error
        setCerts(data || [])
      } catch (err: any) {
        toast.error('Failed to load certifications: ' + err.message)
      }
    }

    loadCerts()
  }, [user])

  const onSubmit = async (data: CertFormData) => {
    if (!user) return

    try {
      const payload = {
        title: data.title,
        issuer: data.issuer,
        issue_date: data.issueDate,
        expiration_date: data.expirationDate || null,
        credential_id: data.credentialId || '',
        credential_url: data.credentialUrl || '',
        profile_id: user.id,
      }

      const { data: newCert, error } = await supabase
        .from('certifications')
        .insert([payload])
        .select()
        .single()

      if (error) throw error
      setCerts([newCert, ...certs])
      toast.success('Certification added')
      reset()
      setShowForm(false)
      onComplete()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const deleteCert = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id)

      if (error) throw error
      setCerts(certs.filter((c) => c.id !== id))
      toast.success('Certification removed')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const isExpired = (cert: Certification): boolean => {
    if (!cert.expirationDate) return false
    return new Date(cert.expirationDate) < new Date()
  }

  return (
    <WizardStep number={4} title="Certifications">
      <div className="space-y-6">
        {/* Certifications List */}
        <div className="space-y-3">
          {certs.map((cert) => (
            <Card
              key={cert.id}
              className={isExpired(cert) ? 'opacity-60' : ''}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 flex gap-3">
                  <Award className="text-teal-400 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-slate-100">{cert.title}</h4>
                    <p className="text-slate-300 text-sm">{cert.issuer}</p>
                    <div className="mt-2 flex gap-4 text-xs text-slate-400">
                      <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                      {cert.expirationDate && (
                        <span className={isExpired(cert) ? 'text-red-400' : ''}>
                          Expires: {new Date(cert.expirationDate).toLocaleDateString()}
                          {isExpired(cert) && ' (Expired)'}
                        </span>
                      )}
                    </div>
                    {cert.credentialId && (
                      <p className="text-xs text-slate-400 mt-1">ID: {cert.credentialId}</p>
                    )}
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-400 hover:text-teal-300 mt-1 inline-block"
                      >
                        View credential →
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteCert(cert.id!)}
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
              <FormField label="Certificate Title" error={errors.title?.message} required>
                <Input
                  {...register('title')}
                  placeholder="e.g., AWS Certified Developer"
                />
              </FormField>

              <FormField label="Issuing Organization" error={errors.issuer?.message} required>
                <Input
                  {...register('issuer')}
                  placeholder="e.g., Amazon Web Services"
                />
              </FormField>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Issue Date" error={errors.issueDate?.message} required>
                  <Input
                    {...register('issueDate')}
                    type="date"
                  />
                </FormField>

                <FormField label="Expiration Date (optional)" error={errors.expirationDate?.message}>
                  <Input
                    {...register('expirationDate')}
                    type="date"
                  />
                </FormField>
              </div>

              <FormField label="Credential ID" error={errors.credentialId?.message}>
                <Input
                  {...register('credentialId')}
                  placeholder="e.g., AWS-2024-12345"
                />
              </FormField>

              <FormField label="Credential Verification URL" error={errors.credentialUrl?.message}>
                <Input
                  {...register('credentialUrl')}
                  type="url"
                  placeholder="https://verify.credential.com/..."
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
            + Add Certification
          </Button>
        )}
      </div>
    </WizardStep>
  )
}
