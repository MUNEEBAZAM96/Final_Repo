import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authAPI } from '../services/api'

interface User {
  id: string
  email: string
  fullName?: string
  resumeUrl?: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    fullName?: string
  }) => Promise<void>
  logout: () => void
  refreshUser: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load auth state from localStorage
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authAPI.login({ email, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  const register = async (data: {
    email: string
    password: string
    fullName?: string
  }) => {
    const response = await authAPI.register(data)
    if (response.token) {
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }
  }

  const logout = () => {
    authAPI.logout()
    setToken(null)
    setUser(null)
  }

  const refreshUser = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error refreshing user data:', error)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


