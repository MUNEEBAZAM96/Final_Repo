import mongoose, { Document, Schema, Types } from 'mongoose'

/**
 * ============================================
 * INTERVIEW PREP SCHEMA - Resume_Builder_Schema.interview_preps
 * ============================================
 * 
 * Stores AI-generated interview preparation sessions.
 * Each session is tailored to a specific company/role combination.
 * 
 * Features:
 * - Company-specific preparation
 * - Role-targeted questions
 * - Technology-focused content
 * - Comprehensive question bank with answers
 * - Progress tracking
 * - Practice session history
 */

// ===== Sub-Document Interfaces =====

export interface IInterviewQuestion {
  question: string
  type: 'technical' | 'behavioral' | 'system design' | 'situational' | 'coding'
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  subtopic?: string
  modelAnswer: string
  hints: string[]
  keyPoints?: string[]
  followUpQuestions?: string[]
  timeEstimate?: number // minutes
  
  // Practice tracking (per question)
  practiced?: boolean
  practicedCount?: number
  userNotes?: string
  confidenceLevel?: 'low' | 'medium' | 'high'
}

export interface ICompanyResearch {
  overview?: string
  culture?: string
  recentNews?: string[]
  products?: string[]
  competitors?: string[]
  interviewProcess?: string
  glassdoorRating?: number
  commonQuestionThemes?: string[]
}

export interface IPracticeSession {
  sessionDate: Date
  questionsAttempted: number
  duration: number // minutes
  averageConfidence: number // 1-100
  notes?: string
}

// ===== Main Document Interface =====
export interface IInterviewPrep extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  jobMatchId?: Types.ObjectId
  
  // Target Information
  company: string
  role: string
  technologies: string[]
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  
  // Company Research
  companyInfo?: ICompanyResearch
  roleRequirements?: string
  
  // Question Bank
  questionsJson: IInterviewQuestion[]
  
  // Question Statistics
  questionStats: {
    total: number
    technical: number
    behavioral: number
    systemDesign: number
    situational: number
    coding: number
    easy: number
    medium: number
    hard: number
  }
  
  // Session Status
  status: 'draft' | 'generating' | 'generated' | 'in_progress' | 'completed'
  generatedAt?: Date
  completedAt?: Date
  
  // Progress Tracking
  progress: {
    questionsCompleted: number
    totalQuestions: number
    percentComplete: number
    lastPracticedAt?: Date
    totalPracticeTime: number // minutes
    averageConfidence: number // 1-100
  }
  
  // Practice History
  practiceSessions: IPracticeSession[]
  
  // User Customization
  customQuestions?: IInterviewQuestion[]
  userNotes?: string
  targetDate?: Date // Interview date
  
  // AI Generation Metadata
  aiModel?: string
  generationPrompt?: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ===== Sub-Schemas =====

const interviewQuestionSchema = new Schema<IInterviewQuestion>(
  {
    question: { type: String, required: true },
    type: {
      type: String,
      enum: ['technical', 'behavioral', 'system design', 'situational', 'coding'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    topic: { type: String, required: true },
    subtopic: { type: String },
    modelAnswer: { type: String, required: true },
    hints: [{ type: String }],
    keyPoints: [{ type: String }],
    followUpQuestions: [{ type: String }],
    timeEstimate: { type: Number },
    
    // Practice tracking
    practiced: { type: Boolean, default: false },
    practicedCount: { type: Number, default: 0 },
    userNotes: { type: String },
    confidenceLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
  },
  { _id: true } // Keep _id for individual question tracking
)

const companyResearchSchema = new Schema<ICompanyResearch>(
  {
    overview: { type: String },
    culture: { type: String },
    recentNews: [{ type: String }],
    products: [{ type: String }],
    competitors: [{ type: String }],
    interviewProcess: { type: String },
    glassdoorRating: { type: Number, min: 1, max: 5 },
    commonQuestionThemes: [{ type: String }],
  },
  { _id: false }
)

const practiceSessionSchema = new Schema<IPracticeSession>(
  {
    sessionDate: { type: Date, default: Date.now },
    questionsAttempted: { type: Number, required: true },
    duration: { type: Number, required: true },
    averageConfidence: { type: Number, min: 0, max: 100 },
    notes: { type: String },
  },
  { _id: true }
)

const questionStatsSchema = new Schema(
  {
    total: { type: Number, default: 0 },
    technical: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 },
    systemDesign: { type: Number, default: 0 },
    situational: { type: Number, default: 0 },
    coding: { type: Number, default: 0 },
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
  },
  { _id: false }
)

const progressSchema = new Schema(
  {
    questionsCompleted: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    percentComplete: { type: Number, default: 0, min: 0, max: 100 },
    lastPracticedAt: { type: Date },
    totalPracticeTime: { type: Number, default: 0 },
    averageConfidence: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
)

// ===== Main Schema =====
const interviewPrepSchema = new Schema<IInterviewPrep>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    jobMatchId: {
      type: Schema.Types.ObjectId,
      ref: 'JobMatch',
    },
    
    // ===== Target Information =====
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    technologies: {
      type: [String],
      required: [true, 'Technologies are required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one technology is required',
      },
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    },
    
    // ===== Company Research =====
    companyInfo: { type: companyResearchSchema },
    roleRequirements: { type: String },
    
    // ===== Question Bank =====
    questionsJson: {
      type: [interviewQuestionSchema],
      default: [],
    },
    
    // ===== Question Statistics =====
    questionStats: {
      type: questionStatsSchema,
      default: () => ({}),
    },
    
    // ===== Session Status =====
    status: {
      type: String,
      enum: ['draft', 'generating', 'generated', 'in_progress', 'completed'],
      default: 'draft',
      index: true,
    },
    generatedAt: { type: Date },
    completedAt: { type: Date },
    
    // ===== Progress Tracking =====
    progress: {
      type: progressSchema,
      default: () => ({}),
    },
    
    // ===== Practice History =====
    practiceSessions: {
      type: [practiceSessionSchema],
      default: [],
    },
    
    // ===== User Customization =====
    customQuestions: [interviewQuestionSchema],
    userNotes: { type: String },
    targetDate: { type: Date },
    
    // ===== AI Generation Metadata =====
    aiModel: {
      type: String,
      default: 'gpt-4o',
    },
    generationPrompt: { type: String },
  },
  {
    timestamps: true,
    collection: 'interview_preps',
  }
)

// ===== Indexes =====
interviewPrepSchema.index({ userId: 1, createdAt: -1 })
interviewPrepSchema.index({ userId: 1, status: 1 })
interviewPrepSchema.index({ userId: 1, company: 1, role: 1 })
interviewPrepSchema.index({ company: 1 })

// ===== Pre-save Middleware =====
interviewPrepSchema.pre('save', function (next) {
  // Calculate question statistics
  if (this.isModified('questionsJson')) {
    const questions = this.questionsJson
    this.questionStats = {
      total: questions.length,
      technical: questions.filter(q => q.type === 'technical').length,
      behavioral: questions.filter(q => q.type === 'behavioral').length,
      systemDesign: questions.filter(q => q.type === 'system design').length,
      situational: questions.filter(q => q.type === 'situational').length,
      coding: questions.filter(q => q.type === 'coding').length,
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    }
    
    // Update progress
    const completedCount = questions.filter(q => q.practiced).length
    this.progress.questionsCompleted = completedCount
    this.progress.totalQuestions = questions.length
    this.progress.percentComplete = questions.length > 0 
      ? Math.round((completedCount / questions.length) * 100)
      : 0
  }
  
  // Update status based on progress
  if (this.progress.percentComplete === 100 && this.status !== 'completed') {
    this.status = 'completed'
    this.completedAt = new Date()
  } else if (this.progress.percentComplete > 0 && this.status === 'generated') {
    this.status = 'in_progress'
  }
  
  next()
})

// ===== Instance Methods =====

/**
 * Record a practice session
 */
interviewPrepSchema.methods.recordPracticeSession = async function (
  questionsAttempted: number,
  duration: number,
  averageConfidence: number,
  notes?: string
) {
  this.practiceSessions.push({
    sessionDate: new Date(),
    questionsAttempted,
    duration,
    averageConfidence,
    notes,
  })
  
  this.progress.lastPracticedAt = new Date()
  this.progress.totalPracticeTime += duration
  
  // Recalculate average confidence across all sessions
  const totalSessions = this.practiceSessions.length
  const totalConfidence = this.practiceSessions.reduce(
    (sum, s) => sum + (s.averageConfidence || 0),
    0
  )
  this.progress.averageConfidence = Math.round(totalConfidence / totalSessions)
  
  await this.save()
}

export const InterviewPrep = mongoose.model<IInterviewPrep>('InterviewPrep', interviewPrepSchema)
export default InterviewPrep
