import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { isTest, env } from '../env.ts'

import authRouter from './Router/Auth_Routes.ts'
import resumeRouter from './Router/resume_Routes.ts'
import jobsRouter from './Router/jobs_Routes.ts'
import interviewRouter from './Router/interview_Routes.ts'
import { errorHandler, notFound } from './Middleware/errorHandler.ts'

const app = express()

// Regular middleware
app.use(helmet())
app.use(
  morgan('dev', {
    skip: () => isTest(),
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(
  cors({
    origin: env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Basic route to check server status
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Resume Parser & Job Matcher API is running',
    version: '1.0.0',
  })
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/resume', resumeRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/interview', interviewRouter)

// 404 handler - MUST come after all valid routes
app.use(notFound)

// Global error handler - MUST be last
app.use(errorHandler)

export default app
