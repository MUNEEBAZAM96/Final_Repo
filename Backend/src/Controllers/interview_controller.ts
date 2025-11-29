import type { Request, Response } from 'express'
import { ParsedResume, InterviewPrep, JobMatch } from '../db/models/index.ts'
import { generateInterviewPrep } from '../services/interviewResearcher.ts'

/**
 * Generate interview preparation
 * POST /api/interview/generate
 */
export const generateInterview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { company, role, technologies, jobMatchId, experienceLevel } = req.body

    if (!company || !role || !technologies || !Array.isArray(technologies)) {
      return res.status(400).json({
        error: 'Missing required fields: company, role, technologies',
      })
    }

    // Create initial prep document in 'generating' status
    const prepDoc = await InterviewPrep.create({
      userId,
      jobMatchId: jobMatchId || null,
      company,
      role,
      technologies,
      experienceLevel,
      status: 'generating',
    })

    // Get user's skills for better question generation
    const resumeData = await ParsedResume.findOne({ 
      userId, 
      isActive: true 
    }).lean()
    const userSkills = resumeData?.skills || []

    // Generate interview prep
    const interviewPrepData = await generateInterviewPrep(
      company,
      role,
      technologies,
      userSkills
    )

    // Update the document with generated data
    prepDoc.questionsJson = interviewPrepData.questions.map(q => ({
      ...q,
      practiced: false,
      practicedCount: 0,
    }))
    prepDoc.companyInfo = {
      overview: interviewPrepData.companyInfo,
    }
    prepDoc.roleRequirements = interviewPrepData.roleRequirements
    prepDoc.status = 'generated'
    prepDoc.generatedAt = new Date()
    prepDoc.aiModel = 'gpt-4o'
    
    // Calculate question stats
    const questions = prepDoc.questionsJson
    prepDoc.questionStats = {
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
    
    prepDoc.progress = {
      questionsCompleted: 0,
      totalQuestions: questions.length,
      percentComplete: 0,
      totalPracticeTime: 0,
      averageConfidence: 0,
    }

    await prepDoc.save()

    res.status(200).json({
      message: 'Interview preparation generated successfully',
      interviewPrep: {
        id: prepDoc._id,
        company: prepDoc.company,
        role: prepDoc.role,
        technologies: prepDoc.technologies,
        questions: prepDoc.questionsJson,
        questionStats: prepDoc.questionStats,
        companyInfo: prepDoc.companyInfo,
        roleRequirements: prepDoc.roleRequirements,
        status: prepDoc.status,
        createdAt: prepDoc.createdAt,
      },
    })
  } catch (error) {
    console.error('Error generating interview prep:', error)
    res.status(500).json({
      error: 'Failed to generate interview preparation',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get user's interview preparations
 * GET /api/interview
 */
export const getInterviewPreps = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { status } = req.query

    const query: any = { userId }
    if (status && status !== 'all') {
      query.status = status
    }

    const preps = await InterviewPrep.find(query)
      .sort({ createdAt: -1 })
      .select('-questionsJson -generationPrompt') // Exclude large fields for list
      .lean()

    // Transform for frontend compatibility
    const transformedPreps = preps.map(prep => ({
      id: prep._id,
      company: prep.company,
      role: prep.role,
      technologies: prep.technologies,
      status: prep.status,
      question_count: prep.questionStats?.total || 0,
      question_stats: prep.questionStats,
      progress: prep.progress,
      created_at: prep.createdAt,
      generated_at: prep.generatedAt,
    }))

    res.status(200).json({ interviewPreps: transformedPreps })
  } catch (error) {
    console.error('Error fetching interview preps:', error)
    res.status(500).json({ error: 'Failed to fetch interview preps' })
  }
}

/**
 * Get specific interview preparation
 * GET /api/interview/:id
 */
export const getInterviewPrep = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    const prep = await InterviewPrep.findOne({ _id: id, userId }).lean()

    if (!prep) {
      return res.status(404).json({ error: 'Interview prep not found' })
    }

    res.status(200).json({
      interviewPrep: {
        id: prep._id,
        company: prep.company,
        role: prep.role,
        technologies: prep.technologies,
        status: prep.status,
        questions_json: prep.questionsJson,
        question_stats: prep.questionStats,
        company_info: prep.companyInfo,
        role_requirements: prep.roleRequirements,
        progress: prep.progress,
        practice_sessions: prep.practiceSessions,
        target_date: prep.targetDate,
        user_notes: prep.userNotes,
        created_at: prep.createdAt,
        generated_at: prep.generatedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching interview prep:', error)
    res.status(500).json({ error: 'Failed to fetch interview prep' })
  }
}

/**
 * Update question practice status
 * PATCH /api/interview/:id/question/:questionId
 */
export const updateQuestionProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id, questionId } = req.params
    const { practiced, confidenceLevel, userNotes } = req.body

    const prep = await InterviewPrep.findOne({ _id: id, userId })
    if (!prep) {
      return res.status(404).json({ error: 'Interview prep not found' })
    }

    // Find the question
    const question = prep.questionsJson.find(
      (q: any) => q._id?.toString() === questionId
    )
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' })
    }

    // Update question
    if (practiced !== undefined) {
      question.practiced = practiced
      if (practiced) {
        question.practicedCount = (question.practicedCount || 0) + 1
      }
    }
    if (confidenceLevel) {
      question.confidenceLevel = confidenceLevel
    }
    if (userNotes !== undefined) {
      question.userNotes = userNotes
    }

    // Update progress
    const completedCount = prep.questionsJson.filter(q => q.practiced).length
    prep.progress.questionsCompleted = completedCount
    prep.progress.percentComplete = Math.round(
      (completedCount / prep.questionsJson.length) * 100
    )
    prep.progress.lastPracticedAt = new Date()

    // Update status if all questions completed
    if (prep.progress.percentComplete === 100) {
      prep.status = 'completed'
      prep.completedAt = new Date()
    } else if (prep.progress.percentComplete > 0 && prep.status === 'generated') {
      prep.status = 'in_progress'
    }

    await prep.save()

    res.status(200).json({
      message: 'Question progress updated',
      progress: prep.progress,
      status: prep.status,
    })
  } catch (error) {
    console.error('Error updating question progress:', error)
    res.status(500).json({ error: 'Failed to update question progress' })
  }
}

/**
 * Record a practice session
 * POST /api/interview/:id/practice
 */
export const recordPracticeSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { questionsAttempted, duration, averageConfidence, notes } = req.body

    if (!questionsAttempted || !duration) {
      return res.status(400).json({
        error: 'Missing required fields: questionsAttempted, duration',
      })
    }

    const prep = await InterviewPrep.findOne({ _id: id, userId })
    if (!prep) {
      return res.status(404).json({ error: 'Interview prep not found' })
    }

    // Add practice session
    prep.practiceSessions.push({
      sessionDate: new Date(),
      questionsAttempted,
      duration,
      averageConfidence: averageConfidence || 0,
      notes,
    })

    // Update progress
    prep.progress.lastPracticedAt = new Date()
    prep.progress.totalPracticeTime += duration

    // Calculate average confidence
    const totalSessions = prep.practiceSessions.length
    const totalConfidence = prep.practiceSessions.reduce(
      (sum, s) => sum + (s.averageConfidence || 0),
      0
    )
    prep.progress.averageConfidence = Math.round(totalConfidence / totalSessions)

    await prep.save()

    res.status(200).json({
      message: 'Practice session recorded',
      progress: prep.progress,
      sessionCount: prep.practiceSessions.length,
    })
  } catch (error) {
    console.error('Error recording practice session:', error)
    res.status(500).json({ error: 'Failed to record practice session' })
  }
}

/**
 * Delete interview preparation
 * DELETE /api/interview/:id
 */
export const deleteInterviewPrep = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    const result = await InterviewPrep.deleteOne({ _id: id, userId })

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Interview prep not found' })
    }

    res.status(200).json({ message: 'Interview prep deleted successfully' })
  } catch (error) {
    console.error('Error deleting interview prep:', error)
    res.status(500).json({ error: 'Failed to delete interview prep' })
  }
}
