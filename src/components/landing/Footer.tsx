import { FC } from 'react'
import { Link } from 'react-router'
import { Github, Linkedin, Twitter } from 'lucide-react'
import { Button } from '../ui/Button'

export const Footer: FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 border-t border-slate-700 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-slate-50 mb-2">StudentFolio</h3>
            <p className="text-slate-400 text-sm">
              Build your professional portfolio in minutes. Share your story with a QR code.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-50 mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-slate-50 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-teal-400 transition-colors text-sm"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Social & CTA */}
          <div>
            <h4 className="font-semibold text-slate-50 mb-4">Connect</h4>
            <div className="flex gap-3 mb-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-teal-400 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-teal-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-teal-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border-t border-slate-700 pt-12 mb-8 text-center">
          <h3 className="text-2xl font-bold text-slate-50 mb-4">Ready to build your portfolio?</h3>
          <Link to="/register">
            <Button size="lg" variant="primary">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} StudentFolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
