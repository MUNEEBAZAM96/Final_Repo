import { Router } from 'express'
import {
  discoverJobs,
  getJobMatches,
  getJobSuggestions,
  markAsApplied,
  updateApplicationStatus,
  toggleSaveJob,
  hideJob,
} from '../Controllers/job_controller.ts'
import { authenticateToken } from '../Middleware/auth.ts'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Discover and match jobs
router.post('/discover', discoverJobs)

// Get job suggestions with extracted skills
router.get('/suggestions', getJobSuggestions)

// Get user's job matches
router.get('/matches', getJobMatches)

// Mark job as applied
router.patch('/:id/apply', markAsApplied)

// Update application status
router.patch('/:id/status', updateApplicationStatus)

// Toggle save/unsave a job
router.patch('/:id/save', toggleSaveJob)

// Hide a job
router.patch('/:id/hide', hideJob)

export default router
