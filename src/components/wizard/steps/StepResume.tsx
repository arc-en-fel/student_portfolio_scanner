import { FC, useEffect, useState } from 'react'
import { WizardStep } from '../WizardStep'
import { FormField } from '../../form/FormField'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../AuthProvider'
import { ResumePrivacy } from '../../../types'
import { FileText, Trash2, Download } from 'lucide-react'

interface StepResumeProps {
  onComplete: () => void
}

export const StepResume: FC<StepResumeProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [resumePrivacy, setResumePrivacy] = useState<ResumePrivacy>(ResumePrivacy.PRIVATE)
  const [uploading, setUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadResume = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('resume_url, resume_privacy')
          .eq('id', user.id)
          .single()

        if (error) throw error
        if (data?.resume_url) {
          setResumeUrl(data.resume_url)
        }
        if (data?.resume_privacy) {
          setResumePrivacy(data.resume_privacy)
        }
      } catch (err: any) {
        toast.error('Failed to load resume: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadResume()
  }, [user])

  const handleResumeUpload = async (file: File | null | undefined) => {
    if (!file || !user) return

    try {
      setUploading(true)

      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are accepted')
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Resume must be under 10 MB')
      }

      const path = `${user.id}/resume-${Date.now()}.pdf`
      const { error } = await supabase.storage
        .from('resumes')
        .upload(path, file, { upsert: false })

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from('resumes').getPublicUrl(path)

      setResumeUrl(publicUrl)
      toast.success('Resume uploaded')

      // Save to profile
      await supabase
        .from('profiles')
        .update({ resume_url: publicUrl })
        .eq('id', user.id)

      onComplete()
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handlePrivacyChange = async (privacy: ResumePrivacy) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ resume_privacy: privacy })
        .eq('id', user.id)

      if (error) throw error
      setResumePrivacy(privacy)
      toast.success('Privacy setting updated')
    } catch (err: any) {
      toast.error('Failed to update privacy: ' + err.message)
    }
  }

  const deleteResume = async () => {
    if (!user || !resumeUrl) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ resume_url: null, resume_privacy: ResumePrivacy.PRIVATE })
        .eq('id', user.id)

      if (error) throw error
      setResumeUrl(null)
      setResumePrivacy(ResumePrivacy.PRIVATE)
      toast.success('Resume removed')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <WizardStep number={8} title="Resume">
      <div className="space-y-6">
        {resumeUrl ? (
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-teal-400" size={24} />
                <div>
                  <p className="font-semibold text-slate-100">Resume uploaded</p>
                  <p className="text-sm text-slate-400">
                    {resumeUrl.split('/').pop()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download size={20} className="text-slate-400" />
                </a>
                <button
                  onClick={deleteResume}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-red-400"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-8">
              <FileText className="mx-auto text-slate-600 mb-3" size={40} />
              <p className="text-slate-300 mb-4">No resume uploaded yet</p>
              <label className="inline-block cursor-pointer">
                <span className="px-6 py-2 bg-teal-500 text-slate-900 rounded-lg font-semibold hover:bg-teal-400 transition-colors inline-block">
                  Upload Resume (PDF)
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleResumeUpload(e.target.files?.[0])}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </Card>
        )}

        {resumeUrl && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-100 mb-3">Resume Privacy</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                  style={{
                    backgroundColor: resumePrivacy === ResumePrivacy.PUBLIC ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                    borderColor: resumePrivacy === ResumePrivacy.PUBLIC ? '#14b8a6' : undefined,
                  }}
                >
                  <input
                    type="radio"
                    name="privacy"
                    checked={resumePrivacy === ResumePrivacy.PUBLIC}
                    onChange={() => handlePrivacyChange(ResumePrivacy.PUBLIC)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-slate-100">Public</p>
                    <p className="text-xs text-slate-400">Anyone can download your resume</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                  style={{
                    backgroundColor: resumePrivacy === ResumePrivacy.LINK_ONLY ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                    borderColor: resumePrivacy === ResumePrivacy.LINK_ONLY ? '#14b8a6' : undefined,
                  }}
                >
                  <input
                    type="radio"
                    name="privacy"
                    checked={resumePrivacy === ResumePrivacy.LINK_ONLY}
                    onChange={() => handlePrivacyChange(ResumePrivacy.LINK_ONLY)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-slate-100">Link Only</p>
                    <p className="text-xs text-slate-400">Only those with the link can access it</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                  style={{
                    backgroundColor: resumePrivacy === ResumePrivacy.PRIVATE ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                    borderColor: resumePrivacy === ResumePrivacy.PRIVATE ? '#14b8a6' : undefined,
                  }}
                >
                  <input
                    type="radio"
                    name="privacy"
                    checked={resumePrivacy === ResumePrivacy.PRIVATE}
                    onChange={() => handlePrivacyChange(ResumePrivacy.PRIVATE)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-slate-100">Private</p>
                    <p className="text-xs text-slate-400">Your resume is not shared publicly</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {!resumeUrl && (
          <Card className="bg-blue-500/10 border-blue-500/50">
            <p className="text-sm text-slate-300">
              💡 <strong>Tip:</strong> Upload a PDF resume to showcase your qualifications. You can choose who can download it.
            </p>
          </Card>
        )}
      </div>
    </WizardStep>
  )
}
