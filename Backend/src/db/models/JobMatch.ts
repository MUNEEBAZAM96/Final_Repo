import mongoose, { Document, Schema, Types } from 'mongoose'

/**
 * ============================================
 * JOB MATCH SCHEMA - Resume_Builder_Schema.job_matches
 * ============================================
 * 
 * Stores discovered job opportunities matched against user resumes.
 * Each job includes AI-generated match analysis and application tracking.
 * 
 * Features:
 * - Comprehensive job details
 * - AI match scoring (0-100)
 * - Detailed "Why This Job Fits" explanation
 * - Skill matching analysis
 * - Application status tracking
 * - Source tracking (LinkedIn, Indeed, etc.)
 */

// ===== Sub-Document Interfaces =====

export interface IJobRequirement {
  requirement: string
  isMet: boolean
  matchedSkill?: string
}

export interface ISalaryRange {
  min?: number
  max?: number
  currency?: string
  period?: 'hourly' | 'monthly' | 'yearly'
  isEstimate?: boolean
}

export interface IMatchAnalysis {
  matchingSkills: string[]
  missingSkills: string[]
  strengthAreas: string[]
  improvementAreas: string[]
  overallFit: 'excellent' | 'good' | 'moderate' | 'low'
}

// ===== Main Document Interface =====
export interface IJobMatch extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  resumeId?: Types.ObjectId
  
  // Job Details
  jobTitle: string
  company: string
  location: string
  locationType?: 'remote' | 'hybrid' | 'onsite'
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  
  // Job Description
  description: string
  shortDescription?: string
  requirements: IJobRequirement[]
  responsibilities?: string[]
  benefits?: string[]
  
  // Compensation
  salary?: ISalaryRange
  
  // Source & Links
  url: string
  source?: string // LinkedIn, Indeed, Company Website, etc.
  postedDate?: Date
  expiresDate?: Date
  
  // AI Match Analysis
  matchScore: number // 0-100
  whyThisJobFits: string // AI-generated explanation
  matchAnalysis: IMatchAnalysis
  
  // Application Tracking
  applied: boolean
  appliedDate?: Date
  applicationStatus?: 'not_applied' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn'
  applicationNotes?: string
  
  // User Interaction
  isSaved: boolean
  isHidden: boolean
  userRating?: number // 1-5 stars
  userNotes?: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ===== Sub-Schemas =====

const jobRequirementSchema = new Schema<IJobRequirement>(
  {
    requirement: { type: String, required: true },
    isMet: { type: Boolean, default: false },
    matchedSkill: { type: String },
  },
  { _id: false }
)

const salaryRangeSchema = new Schema<ISalaryRange>(
  {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly',
    },
    isEstimate: { type: Boolean, default: false },
  },
  { _id: false }
)

const matchAnalysisSchema = new Schema<IMatchAnalysis>(
  {
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    strengthAreas: [{ type: String }],
    improvementAreas: [{ type: String }],
    overallFit: {
      type: String,
      enum: ['excellent', 'good', 'moderate', 'low'],
      default: 'moderate',
    },
  },
  { _id: false }
)

// ===== Main Schema =====
const jobMatchSchema = new Schema<IJobMatch>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'ParsedResume',
    },
    
    // ===== Job Details =====
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    },
    
    // ===== Job Description =====
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: { type: String },
    requirements: [jobRequirementSchema],
    responsibilities: [{ type: String }],
    benefits: [{ type: String }],
    
    // ===== Compensation =====
    salary: { type: salaryRangeSchema },
    
    // ===== Source & Links =====
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    source: {
      type: String,
      default: 'Unknown',
    },
    postedDate: { type: Date },
    expiresDate: { type: Date },
    
    // ===== AI Match Analysis =====
    matchScore: {
      type: Number,
      required: [true, 'Match score is required'],
      min: 0,
      max: 100,
      index: true,
    },
    whyThisJobFits: {
      type: String,
      required: [true, 'Match explanation is required'],
    },
    matchAnalysis: {
      type: matchAnalysisSchema,
      default: () => ({
        matchingSkills: [],
        missingSkills: [],
        strengthAreas: [],
        improvementAreas: [],
        overallFit: 'moderate',
      }),
    },
    
    // ===== Application Tracking =====
    applied: {
      type: Boolean,
      default: false,
      index: true,
    },
    appliedDate: { type: Date },
    applicationStatus: {
      type: String,
      enum: ['not_applied', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn'],
      default: 'not_applied',
    },
    applicationNotes: { type: String },
    
    // ===== User Interaction =====
    isSaved: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    userRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    userNotes: { type: String },
  },
  {
    timestamps: true,
    collection: 'job_matches',
  }
)

// ===== Indexes for Performance =====
jobMatchSchema.index({ userId: 1, matchScore: -1 })
jobMatchSchema.index({ userId: 1, createdAt: -1 })
jobMatchSchema.index({ userId: 1, applied: 1 })
jobMatchSchema.index({ userId: 1, isSaved: 1 })
jobMatchSchema.index({ userId: 1, isHidden: 1 })
jobMatchSchema.index({ userId: 1, applicationStatus: 1 })
jobMatchSchema.index({ company: 1, jobTitle: 1 })
jobMatchSchema.index({ 'matchAnalysis.overallFit': 1 })

// ===== Virtuals =====
jobMatchSchema.virtual('matchLevel').get(function () {
  if (this.matchScore >= 80) return 'excellent'
  if (this.matchScore >= 60) return 'good'
  if (this.matchScore >= 40) return 'moderate'
  return 'low'
})

jobMatchSchema.virtual('isExpired').get(function () {
  if (!this.expiresDate) return false
  return new Date() > this.expiresDate
})

// ===== Pre-save Middleware =====
jobMatchSchema.pre('save', function (next) {
  // Update appliedDate when applied changes to true
  if (this.isModified('applied') && this.applied && !this.appliedDate) {
    this.appliedDate = new Date()
    this.applicationStatus = 'applied'
  }
  next()
})

export const JobMatch = mongoose.model<IJobMatch>('JobMatch', jobMatchSchema)
export default JobMatch
