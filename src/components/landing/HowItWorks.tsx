import { FC } from 'react'
import { Mail, FileText, Palette, Share2 } from 'lucide-react'

interface Step {
  number: number
  icon: React.ReactNode
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: 1,
    icon: <Mail className="w-8 h-8" />,
    title: 'Sign Up with Email',
    description: 'Create your account in seconds with just your email and password.',
  },
  {
    number: 2,
    icon: <FileText className="w-8 h-8" />,
    title: 'Fill Portfolio Info',
    description: 'Add your education, skills, projects, and achievements step by step.',
  },
  {
    number: 3,
    icon: <Palette className="w-8 h-8" />,
    title: 'Choose & Customize',
    description: 'Select from professional templates and customize to match your style.',
  },
  {
    number: 4,
    icon: <Share2 className="w-8 h-8" />,
    title: 'Publish & Share QR',
    description: 'Go live instantly and download your unique QR code to share anywhere.',
  },
]

export const HowItWorks: FC = () => {
  return (
    <section className="py-20 md:py-32 px-4 bg-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">How It Works</h2>
          <p className="text-lg text-slate-300">Get your portfolio online in four simple steps</p>
        </div>

        {/* Mobile: Vertical Layout, Desktop: Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col">
              {/* Step Card */}
              <div className="flex flex-col items-start md:items-center text-left md:text-center">
                {/* Icon with Number Badge */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-400">
                    {step.icon}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-teal-500 text-slate-900 flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-50 mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.description}</p>
              </div>

              {/* Connector Line (hidden on last item, only on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex justify-center mt-4">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-teal-400 to-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
