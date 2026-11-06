import { FC } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../components/AuthProvider'

const Home: FC = () => {
  const { user } = useAuth()

  return (
    <section className="py-20 max-w-3xl">
      <p className="uppercase tracking-widest text-teal-300 text-sm">
        Your work deserves to be seen
      </p>
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mt-5">
        Build your student portfolio. Share it with one scan.
      </h1>
      <p className="muted text-lg mt-6">
        Showcase your education, skills, projects and achievements, then generate a permanent QR code for your profile.
      </p>
      <Link className="btn mt-8" to={user ? '/dashboard' : '/register'}>
        {user ? 'Open dashboard' : 'Create free portfolio'}
      </Link>
    </section>
  )
}

export default Home
