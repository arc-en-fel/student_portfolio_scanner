import { FC, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { QRCodeSVG } from 'qrcode.react'
import QRCode from 'qrcode'
import { useAuth } from '../components/AuthProvider'
import { supabase } from '../lib/supabase'
import { publicUrl } from '../lib/portfolio'
import { Download } from 'lucide-react'

interface ProfileData {
  slug: string
  is_published: boolean
  full_name: string
}

const QRPage: FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [message, setMessage] = useState<string>('')
  const [downloading, setDownloading] = useState<boolean>(false)
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

  const downloadSVG = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const xml = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studentfolio-qr-${profile?.slug || 'portfolio'}.svg`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const downloadPNG = async () => {
    if (!profile) return
    setDownloading(true)

    try {
      const qrUrl = publicUrl(profile.slug)
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `studentfolio-qr-${profile.slug}.png`
      link.click()
    } catch (err) {
      setMessage('Failed to generate PNG')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section className="max-w-xl mt-10">
      <h1 className="text-3xl font-bold">Your Portfolio QR Code</h1>
      {message && <p className="flash mt-4">{message}</p>}
      {profile &&
        (profile.is_published ? (
          <div className="panel mt-6 grid gap-5 justify-items-center">
            <div className="flex gap-2 items-center">
              <span className="px-2 py-1 text-xs font-semibold rounded bg-emerald-900 text-emerald-200">
                Published
              </span>
            </div>

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

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={downloadPNG}
                disabled={downloading}
                className="btn inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Downloading…' : 'Download as PNG'}
              </button>

              <button onClick={downloadSVG} className="btn-secondary inline-flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download as SVG
              </button>

              <button
                className="btn-secondary inline-flex items-center gap-2"
                onClick={() => navigator.clipboard.writeText(publicUrl(profile.slug))}
              >
                Copy link
              </button>
            </div>

            <p className="muted text-sm text-center max-w-xs">
              The QR code stays the same when you edit your portfolio. Share it anywhere!
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
