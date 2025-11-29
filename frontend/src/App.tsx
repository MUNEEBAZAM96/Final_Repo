import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import ResumeUpload from './components/ResumeUpload'
import JobMatches from './components/JobMatches'
import JobSuggestions from './components/JobSuggestions'
import InterviewPrep from './components/InterviewPrep'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative">
          {/* Background elements */}
          <div className="fixed inset-0 bg-hero-pattern opacity-20 pointer-events-none" />
          <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Main content */}
          <div className="relative z-10 flex flex-col flex-1">
            <Navbar />
            <main className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resume"
                  element={
                    <ProtectedRoute>
                      <ResumeUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs"
                  element={
                    <ProtectedRoute>
                      <JobMatches />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/suggestions"
                  element={
                    <ProtectedRoute>
                      <JobSuggestions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview"
                  element={
                    <ProtectedRoute>
                      <InterviewPrep />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            
            {/* Footer */}
            <footer className="py-6 border-t border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-surface-500">
                    © 2025 CareerPrep AI. AI-Powered Career Preparation Platform.
                  </p>
                  <div className="flex items-center gap-6 text-sm text-surface-500">
                    <span>Built with React + Tailwind + OpenAI</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
