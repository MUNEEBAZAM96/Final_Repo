import { Router } from 'express'
import {
  generateInterview,
  getInterviewPreps,
  getInterviewPrep,
  updateQuestionProgress,
  recordPracticeSession,
  deleteInterviewPrep,
} from '../Controllers/interview_controller.ts'
import { authenticateToken } from '../Middleware/auth.ts'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Generate interview preparation
router.post('/generate', generateInterview)

// Get all interview preparations
router.get('/', getInterviewPreps)

// Get specific interview preparation
router.get('/:id', getInterviewPrep)

// Update question practice status
router.patch('/:id/question/:questionId', updateQuestionProgress)

// Record a practice session
router.post('/:id/practice', recordPracticeSession)

// Delete interview preparation
router.delete('/:id', deleteInterviewPrep)

export default router
