import type { Request, Response } from 'express'
import { ParsedResume, InterviewPrep, JobMatch } from '../db/models/index.ts'
import { generateInterviewPrep } from '../services/interviewResearcher.ts'

/**
 * Generate interview preparation
 * POST /api/interview/generate
 * 
 * Request Body:
 * {
 *   "userId": "123",
 *   "companyName": "Google",
 *   "role": "Backend Developer",
 *   "technologies": ["Node.js", "MongoDB", "Express"]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "companyResearchSummary": "summary...",
 *   "questions": [
 *     {
 *       "category": "Technical",
 *       "question": "Explain event loop in Node.js.",
 *       "answer": "A multi-step detailed explanation...",
 *       "reason": "Why relevant for backend roles."
 *     }
 *   ]
 * }
 */
export const generateInterview = async (req: Request, res: Response) => {
  try {
    // Get userId from request body or authenticated user
    const { userId: bodyUserId, companyName, role, technologies } = req.body
    const authUserId = (req as any).user?.id
    
    // Use userId from body if provided, otherwise use authenticated user
    const userId = bodyUserId || authUserId
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized: userId is required' 
      })
    }

    // Validate required fields
    if (!companyName || !role || !technologies) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: companyName, role, and technologies are required',
      })
    }

    // Validate technologies is an array
    if (!Array.isArray(technologies) || technologies.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'technologies must be a non-empty array',
      })
    }

    // Validate userId is a valid ObjectId format
    const mongoose = (await import('mongoose')).default
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid userId format',
      })
    }

    // Create initial prep document in 'generating' status
    let prepDoc
    try {
      prepDoc = await InterviewPrep.create({
        userId: new mongoose.Types.ObjectId(userId),
        company: companyName,
        role,
        technologies,
        status: 'generating',
      })
    } catch (dbError) {
      console.error('Error creating interview prep document:', dbError)
      return res.status(500).json({
        success: false,
        error: 'Failed to create interview preparation document',
        message: dbError instanceof Error ? dbError.message : 'Database error',
      })
    }

    // Generate interview prep using Gemini API
    let interviewPrepData
    try {
      interviewPrepData = await generateInterviewPrep(
        companyName,
        role,
        technologies
      )
    } catch (geminiError) {
      // Update document status to indicate failure
      prepDoc.status = 'draft'
      await prepDoc.save().catch(() => {}) // Ignore save errors here
      
      console.error('Error generating interview prep with Gemini:', geminiError)
      
      // Handle specific Gemini API errors
      if (geminiError instanceof Error) {
        if (geminiError.message.includes('API key')) {
          return res.status(500).json({
            success: false,
            error: 'Gemini API configuration error',
            message: 'Invalid or missing Gemini API key',
          })
        }
        
        if (geminiError.message.includes('JSON')) {
          return res.status(500).json({
            success: false,
            error: 'Invalid response from Gemini API',
            message: 'Failed to parse JSON response from AI service',
          })
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Failed to generate interview questions',
        message: geminiError instanceof Error ? geminiError.message : 'Unknown error from AI service',
      })
    }

    // Transform questions to match database schema format
    const transformedQuestions = interviewPrepData.questions.map((q, index) => ({
      question: q.question,
      type: q.category.toLowerCase().includes('technical') || q.category.toLowerCase().includes('tech')
        ? 'technical'
        : q.category.toLowerCase().includes('behavioral') || q.category.toLowerCase().includes('behavior')
        ? 'behavioral'
        : q.category.toLowerCase().includes('system') || q.category.toLowerCase().includes('design')
        ? 'system design'
        : 'technical', // default to technical
      difficulty: index < 3 ? 'easy' : index < 7 ? 'medium' : 'hard', // Distribute difficulty
      topic: q.category,
      modelAnswer: q.answer,
      hints: [q.reason], // Use reason as hint
      keyPoints: q.reason ? [q.reason] : [],
      practiced: false,
      practicedCount: 0,
    }))

    // Update the document with generated data
    try {
      prepDoc.questionsJson = transformedQuestions
      prepDoc.companyInfo = {
        overview: interviewPrepData.companyInfo || interviewPrepData.companyResearchSummary,
      }
      prepDoc.roleRequirements = interviewPrepData.roleRequirements
      prepDoc.status = 'generated'
      prepDoc.generatedAt = new Date()
      prepDoc.aiModel = 'gemini-1.5-flash'
      
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
    } catch (saveError) {
      console.error('Error saving interview prep to database:', saveError)
      return res.status(500).json({
        success: false,
        error: 'Failed to save interview preparation to database',
        message: saveError instanceof Error ? saveError.message : 'Database save error',
      })
    }

    // Return formatted response matching exact specification
    res.status(200).json({
      success: true,
      companyResearchSummary: interviewPrepData.companyInfo || interviewPrepData.companyResearchSummary || '',
      questions: interviewPrepData.questions.map(q => ({
        category: q.category,
        question: q.question,
        answer: q.answer,
        reason: q.reason,
      })),
    })
  } catch (error) {
    console.error('Unexpected error generating interview prep:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
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

/**
 * Generate default questions when database is empty
 */
const getDefaultQuestions = (companyName: string, role: string, technologies: string[]): any[] => {
  const techList = technologies.length > 0 ? technologies.join(', ') : 'your tech stack'
  
  return [
    {
      category: 'Technical',
      question: `Explain your experience with ${techList}.`,
      answer: `I have worked with ${techList} in various projects. I understand the core concepts, best practices, and common patterns. I've used these technologies to build scalable applications and solve complex problems.`,
      reason: `This question assesses your familiarity with the technologies mentioned in the job requirements.`,
    },
    {
      category: 'Technical',
      question: `What challenges have you faced while working with ${technologies[0] || 'your primary technology'}?`,
      answer: `Some challenges include performance optimization, handling large datasets, and ensuring code maintainability. I've learned to use debugging tools, profiling, and best practices to overcome these challenges.`,
      reason: `This evaluates your problem-solving skills and real-world experience with the technology stack.`,
    },
    {
      category: 'Behavioral',
      question: 'Tell me about a time when you had to work under pressure to meet a deadline.',
      answer: `In a previous project, we had a tight deadline for a critical feature. I prioritized tasks, communicated with the team, and worked efficiently. We delivered on time by breaking down the work into manageable chunks and staying focused.`,
      reason: `This behavioral question assesses your ability to handle stress and manage time effectively.`,
    },
    {
      category: 'Behavioral',
      question: 'Describe a situation where you had to learn a new technology quickly.',
      answer: `When I needed to learn ${technologies[0] || 'a new framework'}, I started with official documentation, built small projects, and practiced daily. I also joined online communities and asked questions when stuck. Within a few weeks, I was productive with it.`,
      reason: `This demonstrates your learning agility and adaptability, which are crucial in tech roles.`,
    },
    {
      category: 'Technical',
      question: `How would you design a system using ${techList}?`,
      answer: `I would start by understanding requirements, then design the architecture with scalability in mind. I'd use ${techList} for different components, implement proper error handling, add monitoring, and ensure security best practices.`,
      reason: `This system design question evaluates your architectural thinking and problem-solving approach.`,
    },
    {
      category: 'Behavioral',
      question: 'How do you handle disagreements with team members?',
      answer: `I believe in open communication and listening to different perspectives. I discuss the issue calmly, present data to support my view, and work together to find the best solution. I focus on what's best for the project.`,
      reason: `This evaluates your teamwork, communication skills, and conflict resolution abilities.`,
    },
    {
      category: 'Technical',
      question: `What are the key features and advantages of ${technologies[0] || 'your preferred technology'}?`,
      answer: `${technologies[0] || 'The technology'} offers features like performance, scalability, and a strong ecosystem. It has good documentation, active community support, and integrates well with other tools.`,
      reason: `This tests your deep understanding of the technology and its ecosystem.`,
    },
    {
      category: 'Behavioral',
      question: 'What motivates you in your work?',
      answer: `I'm motivated by solving complex problems, learning new technologies, and seeing my work make an impact. I enjoy collaborating with teams and continuously improving my skills.`,
      reason: `This helps understand your work values and what drives you professionally.`,
    },
    {
      category: 'Technical',
      question: `Explain a project where you used ${techList} and what you learned from it.`,
      answer: `I built a project using ${techList} where I learned about architecture patterns, performance optimization, and best practices. I also gained experience in debugging, testing, and deployment.`,
      reason: `This question allows you to showcase your practical experience and learning from real projects.`,
    },
    {
      category: 'Behavioral',
      question: 'Where do you see yourself in 5 years?',
      answer: `I see myself as a senior developer with deep expertise in ${techList}. I want to mentor junior developers, contribute to open source, and work on challenging projects that make a difference.`,
      reason: `This assesses your career goals and long-term commitment to growth.`,
    },
  ]
}

/**
 * Generate random questions from existing interview preps in database
 * POST /api/interview/generate-random
 * 
 * Request Body:
 * {
 *   "companyName": "Google",
 *   "role": "Backend Developer",
 *   "technologies": ["Node.js", "MongoDB"],
 *   "count": 10  // optional, default 10
 * }
 * 
 * ALWAYS returns questions - uses database if available, falls back to default questions
 */
export const generateRandomQuestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized: userId is required' 
      })
    }

    const { companyName = '', role = '', technologies = [], count = 15 } = req.body
    const techArray = Array.isArray(technologies) ? technologies : (technologies ? [technologies] : [])

    // Try to find matching interview preps (with flexible matching)
    let allQuestions: any[] = []
    let matchingPreps: any[] = []
    let companySummary = ''

    // First, try to find any preps (even partial matches)
    const allPreps = await InterviewPrep.find({})
      .select('questionsJson company role technologies')
      .lean()

    if (allPreps.length > 0) {
      // Collect all questions from all preps
      allPreps.forEach((prep: any) => {
        if (prep.questionsJson && Array.isArray(prep.questionsJson)) {
          prep.questionsJson.forEach((q: any) => {
            allQuestions.push({
              ...q,
              sourceCompany: prep.company,
              sourceRole: prep.role,
            })
          })
        }
      })

      // Try to find better matches if we have search criteria
      if (companyName || role || techArray.length > 0) {
        const query: any = {}
        
        if (companyName) {
          query.company = { $regex: companyName, $options: 'i' }
        }
        
        if (role) {
          query.role = { $regex: role, $options: 'i' }
        }
        
        if (techArray.length > 0) {
          query.technologies = { $in: techArray.map((t: string) => new RegExp(t, 'i')) }
        }

        matchingPreps = await InterviewPrep.find(query)
          .select('questionsJson company role technologies')
          .lean()

        if (matchingPreps.length > 0) {
          // Use matching preps questions
          allQuestions = []
          matchingPreps.forEach((prep: any) => {
            if (prep.questionsJson && Array.isArray(prep.questionsJson)) {
              prep.questionsJson.forEach((q: any) => {
                allQuestions.push({
                  ...q,
                  sourceCompany: prep.company,
                  sourceRole: prep.role,
                })
              })
            }
          })

          const companies = [...new Set(matchingPreps.map((p: any) => p.company))]
          const roles = [...new Set(matchingPreps.map((p: any) => p.role))]
          companySummary = `Questions compiled from ${companies.length} matching company${companies.length > 1 ? 'ies' : ''} (${companies.join(', ')}) for ${roles.length > 0 ? roles.join(', ') : 'various roles'}`
        } else {
          // No exact matches, use all questions but note it
          const companies = [...new Set(allPreps.map((p: any) => p.company))]
          companySummary = `Questions from various companies (${companies.slice(0, 5).join(', ')}${companies.length > 5 ? '...' : ''}) - general interview preparation`
        }
      } else {
        // No search criteria, use all questions
        const companies = [...new Set(allPreps.map((p: any) => p.company))]
        companySummary = `Questions from various companies (${companies.slice(0, 5).join(', ')}${companies.length > 5 ? '...' : ''}) - general interview preparation`
      }
    }

    // If no questions found in database, use default questions
    if (allQuestions.length === 0) {
      console.log('No questions in database, using default questions')
      const defaultQuestions = getDefaultQuestions(companyName, role, techArray)
      allQuestions = defaultQuestions.map(q => ({
        question: q.question,
        type: q.category.toLowerCase().includes('technical') ? 'technical' :
              q.category.toLowerCase().includes('behavioral') ? 'behavioral' :
              'technical',
        difficulty: 'medium',
        topic: q.category,
        modelAnswer: q.answer,
        answer: q.answer,
        hints: [q.reason],
        keyPoints: [q.reason],
        sourceCompany: companyName || 'General',
        sourceRole: role || 'General',
      }))
      companySummary = `Default interview questions for ${companyName || 'your target company'} - ${role || 'your role'} position`
    }

    // Shuffle and select random questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random())
    const selectedQuestions = shuffled.slice(0, Math.min(count, allQuestions.length))

    // Transform to response format
    const transformedQuestions = selectedQuestions.map(q => ({
      category: q.type === 'technical' ? 'Technical' : 
               q.type === 'behavioral' ? 'Behavioral' : 
               q.type === 'system design' ? 'System Design' : 'General',
      question: q.question,
      answer: q.modelAnswer || q.answer || 'Answer not available',
      reason: q.hints?.[0] || q.keyPoints?.[0] || `Relevant for ${q.sourceRole || role || 'this role'}`,
    }))

    res.status(200).json({
      success: true,
      message: `Generated ${transformedQuestions.length} questions${allQuestions.length === 0 ? ' (using default questions)' : ' from database'}`,
      companyResearchSummary: companySummary,
      questions: transformedQuestions,
      totalAvailable: allQuestions.length,
      matchedPreps: matchingPreps.length,
      source: allQuestions.length === 0 ? 'default' : 'database',
    })
  } catch (error) {
    console.error('Error generating random questions:', error)
    
    // Even on error, return default questions
    const { companyName = '', role = '', technologies = [], count = 15 } = req.body
    const techArray = Array.isArray(technologies) ? technologies : (technologies ? [technologies] : [])
    const defaultQuestions = getDefaultQuestions(companyName, role, techArray)
    const selectedDefaults = defaultQuestions.slice(0, Math.min(count, defaultQuestions.length))

    res.status(200).json({
      success: true,
      message: `Generated ${selectedDefaults.length} default questions`,
      companyResearchSummary: `Default interview questions for ${companyName || 'your target company'} - ${role || 'your role'} position`,
      questions: selectedDefaults,
      totalAvailable: defaultQuestions.length,
      matchedPreps: 0,
      source: 'default',
    })
  }
}
