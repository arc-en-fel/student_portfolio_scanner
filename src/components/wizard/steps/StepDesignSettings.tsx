import { FC, useEffect, useState } from 'react'
import { WizardStep } from '../WizardStep'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { FormField } from '../../form/FormField'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../AuthProvider'
import { TemplateType, Profile } from '../../../types'
import { PortfolioRenderer } from '../../portfolio/PortfolioRenderer'
import { Palette } from 'lucide-react'

const predefinedColors = [
  { name: 'Teal', value: '#4FD1C5' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Indigo', value: '#6366F1' },
]

interface StepDesignSettingsProps {
  onComplete: () => void
  profile: Profile
}

export const StepDesignSettings: FC<StepDesignSettingsProps> = ({ onComplete, profile }) => {
  const { user } = useAuth()
  const [template, setTemplate] = useState<TemplateType>(TemplateType.MINIMAL_PROFESSIONAL)
  const [accentColor, setAccentColor] = useState('#4FD1C5')
  const [customColor, setCustomColor] = useState('#4FD1C5')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('template_name, accent_color')
          .eq('id', user.id)
          .single()

        if (error) throw error
        if (data?.template_name) {
          setTemplate(data.template_name)
        }
        if (data?.accent_color) {
          setAccentColor(data.accent_color)
          setCustomColor(data.accent_color)
        }
      } catch (err: any) {
        toast.error('Failed to load design settings: ' + err.message)
      }
    }

    loadSettings()
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          template_name: template,
          accent_color: accentColor,
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Design settings saved')
      onComplete()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const isValidColor = (color: string): boolean => {
    const s = new Option().style
    s.color = color
    return s.color !== ''
  }

  return (
    <WizardStep number={9} title="Design & Preview">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Settings */}
        <div className="space-y-8">
          {/* Template Selection */}
          <div>
            <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Palette size={20} />
              Portfolio Template
            </h3>
            <div className="space-y-3">
              {[
                {
                  id: TemplateType.MINIMAL_PROFESSIONAL,
                  name: 'Minimal Professional',
                  desc: 'Clean, text-heavy design with vertical sections',
                },
                {
                  id: TemplateType.MODERN_DEVELOPER,
                  name: 'Modern Developer',
                  desc: 'Card-based layout with sidebar and grid projects',
                },
                {
                  id: TemplateType.CREATIVE_PORTFOLIO,
                  name: 'Creative Portfolio',
                  desc: 'Masonry grid projects with bold typography',
                },
              ].map((t) => (
                <label
                  key={t.id}
                  className="flex items-start gap-3 p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                  style={{
                    backgroundColor: template === t.id ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                    borderColor: template === t.id ? '#14b8a6' : undefined,
                  }}
                >
                  <input
                    type="radio"
                    name="template"
                    value={t.id}
                    checked={template === t.id}
                    onChange={(e) => setTemplate(e.target.value as TemplateType)}
                    className="mt-1 w-4 h-4"
                  />
                  <div>
                    <p className="font-semibold text-slate-100">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <h3 className="font-semibold text-slate-100 mb-4">Accent Color</h3>

            {/* Preset Colors */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => { setAccentColor(color.value); setCustomColor(color.value) }}
                  className="w-full aspect-square rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color.value,
                    borderColor: accentColor === color.value ? '#fff' : 'transparent',
                  }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Custom Color */}
            <FormField label="Custom Hex Color">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value)
                      if (isValidColor(e.target.value)) {
                        setAccentColor(e.target.value)
                      }
                    }}
                    placeholder="#4FD1C5"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-sm"
                  />
                  <div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded border border-slate-600"
                    style={{
                      backgroundColor: isValidColor(customColor) ? customColor : '#666',
                    }}
                  />
                </div>
              </div>
            </FormField>
          </div>

          {/* Save Button */}
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Design Settings'}
          </Button>
        </div>

        {/* Live Preview */}
        <div>
          <h3 className="font-semibold text-slate-100 mb-4">Live Preview</h3>
          <Card className="overflow-hidden h-[600px] flex items-center justify-center bg-slate-950">
            <div className="w-full h-full overflow-y-auto">
              <PortfolioRenderer
                profile={profile}
                templateName={template}
                accentColor={accentColor}
                theme="dark"
              />
            </div>
          </Card>
        </div>
      </div>
    </WizardStep>
  )
}
