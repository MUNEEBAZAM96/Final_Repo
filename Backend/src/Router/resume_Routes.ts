import { Router } from 'express'
import { 
  uploadResume, 
  getResume, 
  getResumeHistory, 
  deleteResume,
  reanalyzeResume
} from '../Controllers/resume_controller.ts'
import { authenticateToken } from '../Middleware/auth.ts'
import { resumeUpload } from '../Middleware/gridfsUpload.ts'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Upload and parse resume (with GridFS storage)
router.post('/upload', resumeUpload.single('resume'), uploadResume)

// Get user's active resume
router.get('/', getResume)

// Get resume history
router.get('/history', getResumeHistory)

// Re-analyze a resume with AI
router.post('/:id/reanalyze', reanalyzeResume)

// Delete a resume
router.delete('/:id', deleteResume)

export default router
