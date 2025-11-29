/**
 * ============================================
 * DATABASE MODELS - Resume_Builder_Schema
 * ============================================
 * 
 * MongoDB Collections:
 * - users              → User authentication & profiles
 * - parsed_resumes     → Parsed resume data (PDF stored in GridFS)
 * - job_matches        → Discovered and matched jobs
 * - interview_preps    → Interview preparation sessions
 * - resumes.files      → GridFS file metadata
 * - resumes.chunks     → GridFS file chunks
 */

// User Model & Types
export { User } from './User.ts'
export type { IUser, IDashboardAnalytics } from './User.ts'

// ParsedResume Model & Types
export { ParsedResume } from './ParsedResume.ts'
export type { 
  IParsedResume, 
  IStructuredResume, 
  IExperience, 
  IEducation, 
  IProject,
  ICertification,
  ISkillCategory,
  IContactInfo 
} from './ParsedResume.ts'

// JobMatch Model & Types
export { JobMatch } from './JobMatch.ts'
export type { 
  IJobMatch, 
  IJobRequirement, 
  ISalaryRange, 
  IMatchAnalysis 
} from './JobMatch.ts'

// InterviewPrep Model & Types
export { InterviewPrep } from './InterviewPrep.ts'
export type { 
  IInterviewPrep, 
  IInterviewQuestion, 
  ICompanyResearch, 
  IPracticeSession 
} from './InterviewPrep.ts'
