import { FC } from 'react'
import { Link } from 'react-router'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface Template {
  name: string
  description: string
  preview: string
}

const templates: Template[] = [
  {
    name: 'Minimal Professional',
    description: 'Clean, elegant, and distraction-free. Perfect for corporate professionals.',
    preview: 'minimal',
  },
  {
    name: 'Modern Developer',
    description: 'Tech-focused with a contemporary edge. Ideal for engineers and developers.',
    preview: 'modern',
  },
  {
    name: 'Creative Portfolio',
    description: 'Bold and vibrant. Showcase your creativity and personality.',
    preview: 'creative',
  },
]

export const TemplateGallery: FC = () => {
  return (
    <section className="py-20 md:py-32 px-4 bg-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Choose Your Template</h2>
          <p className="text-lg text-slate-300">Start with a design that matches your style and customize it</p>
        </div>

        {/* Template Cards Grid: 1 col mobile, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.preview} className="flex flex-col">
              {/* Preview Placeholder */}
              <div className="w-full h-64 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg mb-4 flex items-center justify-center border border-slate-600">
                <span className="text-slate-400 text-sm">{template.name} Preview</span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-slate-50 mb-2">{template.name}</h3>
              <p className="text-slate-400 text-sm mb-4 flex-grow">{template.description}</p>

              {/* CTA Button */}
              <Link to="/register">
                <Button variant="primary" size="md" className="w-full">
                  Use Template
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
