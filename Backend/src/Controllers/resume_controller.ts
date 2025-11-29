import type { Request, Response } from 'express'
import { ParsedResume, User } from '../db/models/index.ts'
import { parsePDF } from '../services/pdfParser.ts'
import { analyzeResume } from '../services/resumeAnalyzer.ts'
import { uploadToGridFS, deleteFromGridFS } from '../Middleware/gridfsUpload.ts'

/**
 * ============================================
 * RESUME CONTROLLER
 * ============================================
 * 
 * Handles resume upload, parsing, and retrieval.
 * Flow: Upload PDF → Store in GridFS → Parse Text → AI Analysis → Save to MongoDB
 */

/**
 * Upload and parse resume
 * POST /api/resume/upload
 */
export const uploadResume = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log(`📄 Processing resume upload: ${file.originalname} (${file.size} bytes)`)

    // 1. Upload original PDF to GridFS
    console.log('📦 Uploading to GridFS...')
    const gridFSFileId = await uploadToGridFS(file.buffer, file.originalname, {
      userId,
      originalName: file.originalname,
      size: file.size,
    })
    console.log(`✅ GridFS upload complete: ${gridFSFileId}`)

    // 2. Parse PDF to extract text
    console.log('📝 Parsing PDF text...')
    const parsedPDF = await parsePDF(file.buffer)
    console.log(`✅ PDF parsed: ${parsedPDF.numPages} pages, ${parsedPDF.text.length} characters`)

    // 3. Analyze resume with AI (or fallback parser)
    console.log('🤖 Analyzing resume...')
    const structuredResume = await analyzeResume(parsedPDF.text)
    console.log(`✅ Analysis complete: ${structuredResume.name}, ${structuredResume.skills.length} skills`)

    // 4. Deactivate previous resumes for this user
    await ParsedResume.updateMany(
      { userId, isActive: true },
      { isActive: false }
    )

    // 5. Save to ParsedResume collection
    const resumeDoc = await ParsedResume.create({
      userId,
      
      // GridFS reference
      gridFSFileId,
      originalFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      
      // Raw text
      rawText: parsedPDF.text,
      pageCount: parsedPDF.numPages,
      
      // AI-structured data
      structuredJson: {
        name: structuredResume.name,
        email: structuredResume.email,
        phone: structuredResume.phone,
        location: structuredResume.location,
        summary: structuredResume.summary,
        headline: structuredResume.headline,
        skills: structuredResume.skills,
        experience: structuredResume.experience,
        education: structuredResume.education,
        projects: structuredResume.projects,
        certifications: structuredResume.certifications,
        languages: structuredResume.languages,
      },
      
      // Quick access fields (denormalized for queries)
      skills: structuredResume.skills || [],
      experience: structuredResume.experience || [],
      education: structuredResume.education || [],
      
      // Metadata
      parsingVersion: '1.0.0',
      aiModel: 'gpt-4o',
      isActive: true,
    })

    console.log(`💾 Resume saved to MongoDB: ${resumeDoc._id}`)

    // 6. Update user's active resume reference
    await User.findByIdAndUpdate(userId, {
      activeResumeId: resumeDoc._id,
    })

    // Return success with parsed data
    res.status(200).json({
      message: 'Resume uploaded and parsed successfully',
      resume: {
        id: resumeDoc._id,
        fileName: file.originalname,
        pageCount: parsedPDF.numPages,
        structuredData: structuredResume,
        skills: structuredResume.skills,
        experienceCount: structuredResume.experience?.length || 0,
        educationCount: structuredResume.education?.length || 0,
        projectCount: structuredResume.projects?.length || 0,
      },
    })

  } catch (error) {
    console.error('❌ Error uploading resume:', error)
    res.status(500).json({
      error: 'Failed to process resume',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get user's active parsed resume
 * GET /api/resume
 */
export const getResume = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const resume = await ParsedResume.findOne({ 
      userId, 
      isActive: true 
    }).lean()

    if (!resume) {
      return res.status(404).json({ error: 'No resume found' })
    }

    // Transform for frontend compatibility
    res.status(200).json({
      resume: {
        id: resume._id,
        user_id: resume.userId,
        file_name: resume.originalFileName,
        file_size: resume.fileSize,
        page_count: resume.pageCount,
        raw_text: resume.rawText,
        structured_json: resume.structuredJson,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        is_active: resume.isActive,
        ai_model: resume.aiModel,
        created_at: resume.createdAt,
        updated_at: resume.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching resume:', error)
    res.status(500).json({ error: 'Failed to fetch resume' })
  }
}

/**
 * Get all user's resumes (history)
 * GET /api/resume/history
 */
export const getResumeHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const resumes = await ParsedResume.find({ userId })
      .sort({ createdAt: -1 })
      .select('_id originalFileName structuredJson.name skills isActive createdAt fileSize')
      .lean()

    res.status(200).json({
      resumes: resumes.map(r => ({
        id: r._id,
        fileName: r.originalFileName,
        name: (r.structuredJson as any)?.name || 'Unknown',
        skillCount: r.skills?.length || 0,
        isActive: r.isActive,
        fileSize: r.fileSize,
        createdAt: r.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching resume history:', error)
    res.status(500).json({ error: 'Failed to fetch resume history' })
  }
}

/**
 * Delete a resume
 * DELETE /api/resume/:id
 */
export const deleteResume = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    const resume = await ParsedResume.findOne({ _id: id, userId })
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }

    // Delete from GridFS if exists
    if (resume.gridFSFileId) {
      try {
        await deleteFromGridFS(resume.gridFSFileId)
        console.log(`🗑️ Deleted GridFS file: ${resume.gridFSFileId}`)
      } catch (err) {
        console.error('Error deleting GridFS file:', err)
      }
    }

    // Delete the resume document
    await ParsedResume.deleteOne({ _id: id })

    // If this was the active resume, clear user's activeResumeId
    if (resume.isActive) {
      await User.findByIdAndUpdate(userId, { activeResumeId: null })
    }

    res.status(200).json({ message: 'Resume deleted successfully' })
  } catch (error) {
    console.error('Error deleting resume:', error)
    res.status(500).json({ error: 'Failed to delete resume' })
  }
}

/**
 * Re-analyze an existing resume with AI
 * POST /api/resume/:id/reanalyze
 */
export const reanalyzeResume = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    const resume = await ParsedResume.findOne({ _id: id, userId })
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' })
    }

    // Re-analyze with AI
    console.log(`🔄 Re-analyzing resume: ${resume._id}`)
    const structuredResume = await analyzeResume(resume.rawText)

    // Update the resume document
    resume.structuredJson = {
      name: structuredResume.name,
      email: structuredResume.email,
      phone: structuredResume.phone,
      location: structuredResume.location,
      summary: structuredResume.summary,
      headline: structuredResume.headline,
      skills: structuredResume.skills,
      experience: structuredResume.experience,
      education: structuredResume.education,
      projects: structuredResume.projects,
      certifications: structuredResume.certifications,
      languages: structuredResume.languages,
    } as any
    resume.skills = structuredResume.skills || []
    resume.experience = structuredResume.experience as any || []
    resume.education = structuredResume.education as any || []
    
    await resume.save()

    res.status(200).json({
      message: 'Resume re-analyzed successfully',
      resume: {
        id: resume._id,
        structuredData: structuredResume,
        skills: structuredResume.skills,
      },
    })
  } catch (error) {
    console.error('Error re-analyzing resume:', error)
    res.status(500).json({ error: 'Failed to re-analyze resume' })
  }
}
