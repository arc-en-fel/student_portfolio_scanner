import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-primary-bg">
          <div className="panel max-w-md w-full">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h1 className="text-xl font-bold text-red-300">Something went wrong</h1>
                <p className="muted text-sm mt-2">
                  We encountered an unexpected error. Please try again.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs muted hover:text-secondary-text">
                      Error details
                    </summary>
                    <pre className="mt-2 p-2 bg-surface rounded text-xs text-red-300 overflow-auto max-h-64 whitespace-pre-wrap break-words">
                      {this.state.error.toString()}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}

                <div className="flex gap-3 mt-4">
                  <button onClick={this.resetError} className="btn flex-1">
                    Try Again
                  </button>
                  <button onClick={() => (window.location.href = '/')} className="btn-secondary flex-1">
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
