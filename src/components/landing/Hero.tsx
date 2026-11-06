import { FC } from 'react'
import { Link } from 'react-router'
import { Button } from '../ui/Button'

export const Hero: FC = () => {
  return (
    <section className="py-20 md:py-32 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <p className="uppercase tracking-widest text-teal-400 text-sm font-semibold mb-4">
          Your work deserves to be seen
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-50">
          Build Your Professional Portfolio in Minutes
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Create a stunning digital portfolio, publish with a permanent URL, and share via QR code. No coding skills required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" variant="primary" className="w-full sm:w-auto">
              Create Your Portfolio
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Explore Examples
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
