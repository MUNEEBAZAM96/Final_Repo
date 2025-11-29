import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  LogOut, 
  Sparkles,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/interview', label: 'Interview', icon: MessageSquare },
]

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-midnight-950/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-500 to-electric-600 flex items-center justify-center shadow-glow-sm transition-transform group-hover:scale-105">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">
                CareerPrep AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-surface-400">
                  {user?.email}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-500/20 to-coral-600/20 border border-coral-500/30 flex items-center justify-center text-coral-400 font-bold">
                {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-surface-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/5 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-electric-500/10 text-electric-400' 
                        : 'text-surface-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
