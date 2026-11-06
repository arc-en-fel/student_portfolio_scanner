import { FC } from 'react'
import { Grid2X2, Zap, QrCode, Smartphone, Lock, RefreshCw } from 'lucide-react'
import { Card } from '../ui/Card'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <Grid2X2 className="w-6 h-6" />,
    title: 'Multi-Section Portfolio Builder',
    description: 'Build comprehensive portfolios with personal info, education, skills, projects, certifications, and more.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Three Professional Templates',
    description: 'Choose from Minimal Professional, Modern Developer, or Creative Portfolio to match your style.',
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: 'QR Code Generation',
    description: 'Generate unique, permanent QR codes to share your portfolio anywhere—business cards, resumes, social media.',
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Mobile-Responsive Design',
    description: 'Your portfolio looks stunning on phones, tablets, and desktops. No coding skills required.',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Private & Published Control',
    description: 'Keep your portfolio draft-mode until ready, then publish with a permanent URL that never changes.',
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: 'Easy Updates',
    description: 'Update your portfolio anytime. Your QR code remains the same, so links stay active forever.',
  },
]

export const Features: FC = () => {
  return (
    <section className="py-20 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Powerful Features</h2>
          <p className="text-lg text-slate-300">Everything you need to build and share your professional portfolio</p>
        </div>

        {/* Feature Grid: 1 col mobile, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} hover>
              <div className="flex flex-col gap-4">
                <div className="text-teal-400">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-50">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
