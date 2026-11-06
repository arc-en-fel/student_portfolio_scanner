import { FC, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: 'Is StudentFolio free?',
    answer: 'Yes, StudentFolio is completely free to use. Create your account, build your portfolio, generate QR codes, and share with anyone at no cost.',
  },
  {
    question: 'Do I need coding knowledge?',
    answer: 'Not at all! StudentFolio is designed for everyone. We handle all the technical details—just fill in your information, choose a template, and you\'re done.',
  },
  {
    question: 'Can I update my portfolio after publishing?',
    answer: 'Absolutely. You can update your portfolio anytime. Your QR code remains the same, so all links stay active and point to your latest content.',
  },
  {
    question: 'Is my data private?',
    answer: 'Your account data is secure and private by default. Only the sections you choose to publish are visible publicly. You control what information is shared.',
  },
  {
    question: 'Can I delete my account?',
    answer: 'Yes, you can delete your account and all associated data anytime from your account settings. This action is permanent.',
  },
  {
    question: 'What if I don\'t have projects yet?',
    answer: 'You don\'t need projects to get started. You can list your skills, education, certifications, and experience. Add projects anytime you\'re ready.',
  },
  {
    question: 'Can I add sections later?',
    answer: 'Yes, you can add, skip, or modify any section of your portfolio at any time. Your portfolio can grow with your career.',
  },
  {
    question: 'What are the file size limits?',
    answer: 'Profile photos can be up to 5MB, and project images up to 10MB. Documents and certificates can be up to 20MB each. These limits ensure fast loading times.',
  },
  {
    question: 'Can I customize my portfolio appearance?',
    answer: 'Yes! Choose from multiple templates and customize colors, fonts, and layout based on your preferences. All templates are mobile-responsive.',
  },
  {
    question: 'How do I share my portfolio?',
    answer: 'You get a permanent public URL and a downloadable QR code. Share the URL on your resume, social media, or business cards. Anyone can scan the QR code to view your portfolio.',
  },
]

export const FAQ: FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <section className="py-20 md:py-32 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-300">Everything you need to know about StudentFolio</p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-slate-700 rounded-lg bg-slate-900 overflow-hidden hover:border-slate-600 transition-colors"
            >
              {/* Question Header */}
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800 transition-colors text-left"
              >
                <h3 className="font-semibold text-slate-50 text-lg">{item.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-teal-400 flex-shrink-0 transition-transform ${
                    expandedIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {/* Answer */}
              {expandedIndex === index && (
                <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
                  <p className="text-slate-300 text-base leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
