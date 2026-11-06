import { FC } from 'react'
import { Hero } from '../components/landing/Hero'
import { HowItWorks } from '../components/landing/HowItWorks'
import { Features } from '../components/landing/Features'
import { TemplateGallery } from '../components/landing/TemplateGallery'
import { FAQ } from '../components/landing/FAQ'
import { Footer } from '../components/landing/Footer'

const Home: FC = () => {
  return (
    <div className="w-full">
      <Hero />
      <HowItWorks />
      <Features />
      <TemplateGallery />
      <FAQ />
      <Footer />
    </div>
  )
}

export default Home
