import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (data: {
    email: string
    password: string
    fullName?: string
  }) => {
    const response = await api.post('/auth/register', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Resume API
export const resumeAPI = {
  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('resume', file)
    
    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  get: async () => {
    const response = await api.get('/resume')
    return response.data
  },
}

// Jobs API
export const jobsAPI = {
  discover: async () => {
    const response = await api.post('/jobs/discover')
    return response.data
  },

  getMatches: async () => {
    const response = await api.get('/jobs/matches')
    return response.data
  },

  getSuggestions: async (params?: {
    role?: string
    location?: string
    technologies?: string
    limit?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.role) queryParams.append('role', params.role)
    if (params?.location) queryParams.append('location', params.location)
    if (params?.technologies) queryParams.append('technologies', params.technologies)
    if (params?.limit) queryParams.append('limit', params.limit)
    
    const queryString = queryParams.toString()
    const url = `/jobs/suggestions${queryString ? `?${queryString}` : ''}`
    const response = await api.get(url)
    return response.data
  },

  markAsApplied: async (id: string) => {
    const response = await api.patch(`/jobs/${id}/apply`)
    return response.data
  },
}

// Interview API
export const interviewAPI = {
  generate: async (data: {
    company: string
    role: string
    technologies: string[]
  }) => {
    const response = await api.post('/interview/generate', data)
    return response.data
  },

  generateRandom: async (data: {
    companyName?: string
    role?: string
    technologies?: string[]
    count?: number
  }) => {
    const response = await api.post('/interview/generate-random', data)
    return response.data
  },

  getAll: async () => {
    const response = await api.get('/interview')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/interview/${id}`)
    return response.data
  },
}

export default api
