import { FC, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../components/AuthProvider'
import { supabase } from '../lib/supabase'
import { publicUrl } from '../lib/portfolio'

interface ProfileData {
  slug: string
  is_published: boolean
  full_name: string
}

const QRPage: FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [message, setMessage] = useState<string>('')
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    supabase
      .from('profiles')
      .select('slug,is_published,full_name')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        setProfile(data)
        if (error) setMessage(error.message)
      })
  }, [user])

  const download = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const xml = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'studentfolio-qr.svg'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="max-w-xl mt-10">
      <h1 className="text-3xl font-bold">Your Portfolio QR Code</h1>
      {message && <p className="flash mt-4">{message}</p>}
      {profile && (profile.is_published ? (
        <div className="panel mt-6 grid gap-5 justify-items-center">
          <div ref={qrRef} className="bg-white rounded-xl p-5">
            <QRCodeSVG
              value={publicUrl(profile.slug)}
              size={240}
              bgColor="#ffffff"
              fgColor="#000000"
              includeMargin
              level="H"
            />
          </div>
          <p className="muted text-sm break-all text-center">
            {publicUrl(profile.slug)}
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="btn" onClick={download}>
              Download QR (SVG)
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigator.clipboard.writeText(publicUrl(profile.slug))}
            >
              Copy link
            </button>
          </div>
          <p className="muted text-sm">
            The QR code stays the same when you edit your portfolio.
          </p>
        </div>
      ) : (
        <div className="panel mt-6">
          <p>Publish your portfolio before sharing a QR code.</p>
          <Link className="btn mt-4" to="/dashboard">
            Go to dashboard
          </Link>
        </div>
      ))}
    </section>
  )
}

export default QRPage
