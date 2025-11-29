import mongoose, { Document, Schema, Types } from 'mongoose'

/**
 * ============================================
 * PARSED RESUME SCHEMA - Resume_Builder_Schema.parsed_resumes
 * ============================================
 * 
 * Stores both raw text and AI-structured resume data.
 * The original PDF is stored in GridFS (resumes.files/chunks).
 * This schema stores the parsed/analyzed content.
 * 
 * Features:
 * - Raw text extraction from PDF
 * - AI-structured JSON with comprehensive fields
 * - Skills categorization
 * - Experience with detailed job info
 * - Education history
 * - Projects portfolio
 * - GridFS reference for original PDF
 */

// ===== Sub-Document Interfaces =====

export interface IContactInfo {
  email?: string
  phone?: string
  location?: string
  linkedIn?: string
  github?: string
  portfolio?: string
}

export interface IExperience {
  company: string
  role: string
  location?: string
  startDate?: string
  endDate?: string
  duration?: string
  description?: string
  highlights?: string[]
  technologies?: string[]
  isCurrentRole?: boolean
}

export interface IEducation {
  institution: string
  degree?: string
  field?: string
  location?: string
  startDate?: string
  endDate?: string
  duration?: string
  gpa?: string
  honors?: string[]
  relevantCourses?: string[]
}

export interface IProject {
  name: string
  description?: string
  url?: string
  technologies?: string[]
  highlights?: string[]
  startDate?: string
  endDate?: string
}

export interface ICertification {
  name: string
  issuer: string
  issueDate?: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
}

export interface ISkillCategory {
  category: string
  skills: string[]
}

export interface IStructuredResume {
  // Personal Information
  name: string
  email?: string
  phone?: string
  location?: string
  contact?: IContactInfo

  // Professional Summary
  summary?: string
  headline?: string

  // Skills (flat list + categorized)
  skills: string[]
  skillsByCategory?: ISkillCategory[]

  // Experience
  experience: IExperience[]
  totalYearsOfExperience?: number

  // Education
  education: IEducation[]

  // Projects
  projects?: IProject[]

  // Certifications
  certifications?: ICertification[]

  // Additional
  languages?: string[]
  achievements?: string[]
  interests?: string[]
}

// ===== Main Document Interface =====
export interface IParsedResume extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId

  // Original PDF reference (GridFS file ID)
  gridFSFileId?: Types.ObjectId
  originalFileName?: string
  fileSize?: number
  mimeType?: string

  // Raw extracted text
  rawText: string
  pageCount?: number

  // AI-Structured Data
  structuredJson: IStructuredResume

  // Quick access fields (denormalized for queries)
  skills: string[]
  experience: IExperience[]
  education: IEducation[]

  // Parsing metadata
  parsingVersion: string
  aiModel?: string
  parsingConfidence?: number

  // Status
  isActive: boolean

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ===== Sub-Schemas =====

const contactInfoSchema = new Schema<IContactInfo>(
  {
    email: { type: String },
    phone: { type: String },
    location: { type: String },
    linkedIn: { type: String },
    github: { type: String },
    portfolio: { type: String },
  },
  { _id: false }
)

const experienceSchema = new Schema<IExperience>(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    duration: { type: String },
    description: { type: String },
    highlights: [{ type: String }],
    technologies: [{ type: String }],
    isCurrentRole: { type: Boolean, default: false },
  },
  { _id: false }
)

const educationSchema = new Schema<IEducation>(
  {
    institution: { type: String, required: true },
    degree: { type: String },
    field: { type: String },
    location: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    duration: { type: String },
    gpa: { type: String },
    honors: [{ type: String }],
    relevantCourses: [{ type: String }],
  },
  { _id: false }
)

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    url: { type: String },
    technologies: [{ type: String }],
    highlights: [{ type: String }],
    startDate: { type: String },
    endDate: { type: String },
  },
  { _id: false }
)

const certificationSchema = new Schema<ICertification>(
  {
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String },
    expiryDate: { type: String },
    credentialId: { type: String },
    credentialUrl: { type: String },
  },
  { _id: false }
)

const skillCategorySchema = new Schema<ISkillCategory>(
  {
    category: { type: String, required: true },
    skills: [{ type: String }],
  },
  { _id: false }
)

const structuredResumeSchema = new Schema<IStructuredResume>(
  {
    // Personal Information
    name: { type: String, required: false, default: 'Unknown' },
    email: { type: String },
    phone: { type: String },
    location: { type: String },
    contact: { type: contactInfoSchema },

    // Professional Summary
    summary: { type: String },
    headline: { type: String },

    // Skills
    skills: [{ type: String }],
    skillsByCategory: [skillCategorySchema],

    // Experience
    experience: [experienceSchema],
    totalYearsOfExperience: { type: Number },

    // Education
    education: [educationSchema],

    // Projects
    projects: [projectSchema],

    // Certifications
    certifications: [certificationSchema],

    // Additional
    languages: [{ type: String }],
    achievements: [{ type: String }],
    interests: [{ type: String }],
  },
  { _id: false }
)

// ===== Main Schema =====
const parsedResumeSchema = new Schema<IParsedResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // GridFS Reference
    gridFSFileId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    originalFileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String, default: 'application/pdf' },

    // Raw Text
    rawText: {
      type: String,
      required: [true, 'Raw text is required'],
    },
    pageCount: { type: Number },

    // Structured Data (Optional if AI analysis is skipped)
    structuredJson: {
      type: structuredResumeSchema,
      required: false, // Changed from true to false
    },

    // Quick Access Fields (Denormalized)
    skills: [{ type: String, index: true }],
    experience: [experienceSchema],
    education: [educationSchema],

    // Parsing Metadata
    parsingVersion: {
      type: String,
      default: '1.0.0',
    },
    aiModel: {
      type: String,
      default: 'gpt-4o',
    },
    parsingConfidence: {
      type: Number,
      min: 0,
      max: 100,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'parsed_resumes',
  }
)

// ===== Indexes =====
parsedResumeSchema.index({ userId: 1, createdAt: -1 })
parsedResumeSchema.index({ userId: 1, isActive: 1 })
parsedResumeSchema.index({ skills: 1 })
parsedResumeSchema.index({ 'structuredJson.skills': 1 })

// ===== Virtuals =====
parsedResumeSchema.virtual('skillCount').get(function () {
  return this.skills?.length || 0
})

parsedResumeSchema.virtual('experienceCount').get(function () {
  return this.experience?.length || 0
})

export const ParsedResume = mongoose.model<IParsedResume>('ParsedResume', parsedResumeSchema)
export default ParsedResume
