import { Router } from 'express'
import { register, login, getCurrentUser } from '../Controllers/auth_controller.ts'
import { validateBody } from '../Middleware/Validation.ts'
import { authenticateToken } from '../Middleware/auth.ts'
import { z } from 'zod'

const router = Router()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().max(100).optional(),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

// Routes
router.post('/register', validateBody(registerSchema), register)
router.post('/login', validateBody(loginSchema), login)
router.get('/me', authenticateToken, getCurrentUser)

export default router
