import { Router } from 'express'
import {
  generateInterview,
  generateRandomQuestions,
  getInterviewPreps,
  getInterviewPrep,
  updateQuestionProgress,
  recordPracticeSession,
  deleteInterviewPrep,
} from '../Controllers/interview_controller.ts'
import { authenticateToken, optionalAuthenticate } from '../Middleware/auth.ts'

const router = Router()

// Generate interview preparation (authentication optional - can use userId from body)
router.post('/generate', optionalAuthenticate, generateInterview)

// Generate random questions from database
router.post('/generate-random', authenticateToken, generateRandomQuestions)

// All other routes require authentication
router.use(authenticateToken)

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
