import mongoose, { Document, Schema, Types } from 'mongoose'
import bcrypt from 'bcryptjs'

/**
 * ============================================
 * USER SCHEMA - Resume_Builder_Schema.Users
 * ============================================
 * 
 * Core user authentication and profile model.
 * Each user can have one active resume, multiple job matches,
 * and multiple interview preparation sessions.
 * 
 * Features:
 * - Secure password hashing with bcrypt
 * - Profile information with avatar support
 * - Dashboard analytics tracking
 * - References to resume, jobs, and interview preps
 */

// Dashboard Analytics Interface
export interface IDashboardAnalytics {
  totalJobsDiscovered: number
  totalJobsApplied: number
  averageMatchScore: number
  topStrengths: string[]
  skillGaps: string[]
  lastUpdated: Date
}

// User Interface
export interface IUser extends Document {
  _id: Types.ObjectId
  
  // Authentication
  email: string
  password: string
  
  // Profile Information
  fullName: string
  phone?: string
  location?: string
  linkedInUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  avatarUrl?: string
  
  // Resume Reference (GridFS file ID)
  activeResumeId?: Types.ObjectId
  
  // Dashboard Analytics (embedded for quick access)
  analytics: IDashboardAnalytics
  
  // Account Status
  isActive: boolean
  lastLoginAt?: Date
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>
  updateAnalytics(analytics: Partial<IDashboardAnalytics>): Promise<void>
}

// Dashboard Analytics Sub-Schema
const dashboardAnalyticsSchema = new Schema<IDashboardAnalytics>(
  {
    totalJobsDiscovered: { type: Number, default: 0 },
    totalJobsApplied: { type: Number, default: 0 },
    averageMatchScore: { type: Number, default: 0, min: 0, max: 100 },
    topStrengths: [{ type: String }],
    skillGaps: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
)

// Main User Schema
const userSchema = new Schema<IUser>(
  {
    // ===== Authentication =====
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },

    // ===== Profile Information =====
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\d\s\-+()]*$/, 'Invalid phone number format'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    linkedInUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Invalid LinkedIn URL'],
    },
    githubUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?github\.com\/.*$/, 'Invalid GitHub URL'],
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },

    // ===== Resume Reference =====
    activeResumeId: {
      type: Schema.Types.ObjectId,
      ref: 'ParsedResume',
      default: null,
    },

    // ===== Analytics =====
    analytics: {
      type: dashboardAnalyticsSchema,
      default: () => ({}),
    },

    // ===== Account Status =====
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'users', // Explicit collection name
  }
)

// ===== Indexes for Performance =====
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ createdAt: -1 })
userSchema.index({ isActive: 1 })

// ===== Pre-save Middleware: Hash Password =====
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// ===== Instance Methods =====

/**
 * Compare password for authentication
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

/**
 * Update dashboard analytics
 */
userSchema.methods.updateAnalytics = async function (
  analytics: Partial<IDashboardAnalytics>
): Promise<void> {
  Object.assign(this.analytics, analytics)
  this.analytics.lastUpdated = new Date()
  await this.save()
}

// ===== Static Methods =====

/**
 * Find user by email with password (for login)
 */
userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password')
}

export const User = mongoose.model<IUser>('User', userSchema)
export default User
