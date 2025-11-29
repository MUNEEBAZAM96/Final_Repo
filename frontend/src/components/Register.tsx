import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      await register({ email, password, fullName })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    'AI-Powered Resume Analysis',
    'Automated Job Matching',
    'Personalized Interview Prep',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="floating-bg" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-electric-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-coral-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-coral-500 to-coral-600 shadow-glow-coral mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
          <p className="text-surface-400">Start your journey to your dream job</p>
        </div>

        {/* Register Form Card */}
        <div className="glass-card p-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          {/* Features List */}
          <div className="mb-6 space-y-2">
            {features.map((feature, index) => (
              <div 
                key={feature}
                className="flex items-center gap-2 text-sm text-surface-300 animate-fade-up"
                style={{ animationDelay: `${150 + index * 50}ms` }}
              >
                <CheckCircle2 className="w-4 h-4 text-mint-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 my-6" />

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-coral-500/10 border border-coral-500/30 flex items-center gap-3 text-coral-400 animate-scale-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-surface-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-surface-500" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className="input-field pl-12"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-surface-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-surface-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input-field pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <p className="mt-2 text-xs text-surface-500">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-coral w-full flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-surface-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-electric-400 hover:text-electric-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-surface-500 animate-fade-up" style={{ animationDelay: '300ms' }}>
          Join thousands of professionals finding their dream jobs
        </p>
      </div>
    </div>
  )
}
