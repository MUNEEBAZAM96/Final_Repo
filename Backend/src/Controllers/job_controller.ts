import type { Request, Response } from 'express'
import { ParsedResume, JobMatch, User } from '../db/models/index.ts'
import { scrapeJobs } from '../services/jobScraper.ts'
import { matchMultipleJobs } from '../services/jobMatcher.ts'
import { extractSkillsFromJob, extractSkillsFromMultipleJobs } from '../services/jobSkillExtractor.ts'

/**
 * Discover and match jobs for user
 * POST /api/jobs/discover
 */
export const discoverJobs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user's active resume
    const resumeData = await ParsedResume.findOne({ 
      userId, 
      isActive: true 
    }).lean()

    if (!resumeData) {
      return res.status(404).json({
        error: 'No resume found. Please upload your resume first.',
      })
    }

    const skills = resumeData.skills || []
    if (skills.length === 0) {
      return res.status(400).json({
        error: 'No skills found in resume',
      })
    }

    // Scrape jobs based on skills
    const jobs = await scrapeJobs(skills)

    if (jobs.length === 0) {
      return res.status(200).json({
        message: 'No jobs found',
        matches: [],
      })
    }

    // Match jobs with user's profile
    const structuredResume = resumeData.structuredJson
    const userExperience = structuredResume?.summary || 
      structuredResume?.experience?.map((e: any) => e.description).filter(Boolean).join(' ') || ''

    const matches = await matchMultipleJobs(jobs, skills, userExperience)

    // Save top matches to database
    const matchesToSave = matches.slice(0, 20).map((match) => ({
      userId,
      resumeId: resumeData._id,
      
      // Job Details
      jobTitle: match.job.title,
      company: match.job.company,
      location: match.job.location,
      description: match.job.description || '',
      
      // Source
      url: match.job.url,
      source: 'SerpAPI',
      
      // Match Analysis
      matchScore: match.matchScore,
      whyThisJobFits: match.whyMatch,
      matchAnalysis: {
        matchingSkills: match.matchingSkills || [],
        missingSkills: match.skillGaps || [],
        strengthAreas: [],
        improvementAreas: [],
        overallFit: match.matchScore >= 80 ? 'excellent' : 
                    match.matchScore >= 60 ? 'good' : 
                    match.matchScore >= 40 ? 'moderate' : 'low',
      },
      
      // Requirements
      requirements: [],
      
      // Status
      applied: false,
      isSaved: false,
      isHidden: false,
    }))

    if (matchesToSave.length > 0) {
      await JobMatch.insertMany(matchesToSave)
    }

    // Update user analytics
    await User.findByIdAndUpdate(userId, {
      $inc: { 'analytics.totalJobsDiscovered': matches.length },
      'analytics.lastUpdated': new Date(),
    })

    res.status(200).json({
      message: `Found ${matches.length} job matches`,
      matches: matches.slice(0, 10).map(m => ({
        job_title: m.job.title,
        company: m.job.company,
        location: m.job.location,
        url: m.job.url,
        match_score: m.matchScore,
        why_match: m.whyMatch,
        matching_skills: m.matchingSkills || [],
        skill_gaps: m.skillGaps || [],
        applied: false,
      })),
      totalFound: matches.length,
    })
  } catch (error) {
    console.error('Error discovering jobs:', error)
    res.status(500).json({
      error: 'Failed to discover jobs',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get user's job matches
 * GET /api/jobs/matches
 */
export const getJobMatches = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { status, saved, hidden, minScore } = req.query

    // Build query
    const query: any = { userId }
    
    if (status && status !== 'all') {
      query.applicationStatus = status
    }
    if (saved === 'true') {
      query.isSaved = true
    }
    if (hidden !== 'true') {
      query.isHidden = false // By default, hide hidden jobs
    }
    if (minScore) {
      query.matchScore = { $gte: Number(minScore) }
    }

    const matches = await JobMatch.find(query)
      .sort({ matchScore: -1, createdAt: -1 })
      .lean()

    // Transform for frontend compatibility
    const transformedMatches = matches.map(m => ({
      id: m._id,
      job_title: m.jobTitle,
      company: m.company,
      location: m.location,
      url: m.url,
      description: m.description,
      match_score: m.matchScore,
      why_match: m.whyThisJobFits,
      matching_skills: m.matchAnalysis?.matchingSkills || [],
      skill_gaps: m.matchAnalysis?.missingSkills || [],
      overall_fit: m.matchAnalysis?.overallFit || 'moderate',
      applied: m.applied,
      application_status: m.applicationStatus,
      is_saved: m.isSaved,
      created_at: m.createdAt,
    }))

    res.status(200).json({ matches: transformedMatches })
  } catch (error) {
    console.error('Error fetching job matches:', error)
    res.status(500).json({ error: 'Failed to fetch job matches' })
  }
}

/**
 * Mark job as applied
 * PATCH /api/jobs/:id/apply
 */
export const markAsApplied = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { notes } = req.body

    const match = await JobMatch.findOneAndUpdate(
      { _id: id, userId },
      { 
        applied: true,
        appliedDate: new Date(),
        applicationStatus: 'applied',
        applicationNotes: notes,
      },
      { new: true }
    ).lean()

    if (!match) {
      return res.status(404).json({ error: 'Job match not found' })
    }

    // Update user analytics
    await User.findByIdAndUpdate(userId, {
      $inc: { 'analytics.totalJobsApplied': 1 },
      'analytics.lastUpdated': new Date(),
    })

    res.status(200).json({
      match: {
        id: match._id,
        job_title: match.jobTitle,
        company: match.company,
        applied: match.applied,
        application_status: match.applicationStatus,
      },
    })
  } catch (error) {
    console.error('Error marking job as applied:', error)
    res.status(500).json({ error: 'Failed to update job status' })
  }
}

/**
 * Update application status
 * PATCH /api/jobs/:id/status
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params
    const { status, notes } = req.body

    const validStatuses = ['not_applied', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const match = await JobMatch.findOneAndUpdate(
      { _id: id, userId },
      { 
        applicationStatus: status,
        ...(notes && { applicationNotes: notes }),
      },
      { new: true }
    ).lean()

    if (!match) {
      return res.status(404).json({ error: 'Job match not found' })
    }

    res.status(200).json({
      match: {
        id: match._id,
        job_title: match.jobTitle,
        company: match.company,
        application_status: match.applicationStatus,
      },
    })
  } catch (error) {
    console.error('Error updating application status:', error)
    res.status(500).json({ error: 'Failed to update application status' })
  }
}

/**
 * Toggle save/unsave a job
 * PATCH /api/jobs/:id/save
 */
export const toggleSaveJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    const match = await JobMatch.findOne({ _id: id, userId })
    if (!match) {
      return res.status(404).json({ error: 'Job match not found' })
    }

    match.isSaved = !match.isSaved
    await match.save()

    res.status(200).json({
      match: {
        id: match._id,
        is_saved: match.isSaved,
      },
    })
  } catch (error) {
    console.error('Error toggling save job:', error)
    res.status(500).json({ error: 'Failed to toggle save job' })
  }
}

/**
 * Hide a job
 * PATCH /api/jobs/:id/hide
 */
export const hideJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.params

    const match = await JobMatch.findOneAndUpdate(
      { _id: id, userId },
      { isHidden: true },
      { new: true }
    ).lean()

    if (!match) {
      return res.status(404).json({ error: 'Job match not found' })
    }

    res.status(200).json({ message: 'Job hidden successfully' })
  } catch (error) {
    console.error('Error hiding job:', error)
    res.status(500).json({ error: 'Failed to hide job' })
  }
}

/**
 * Get job suggestions with extracted skills
 * GET /api/jobs/suggestions
 * 
 * Query Parameters:
 * - role: Job role/title (e.g., "Backend Developer")
 * - location: Job location (e.g., "India", "Remote")
 * - technologies: Comma-separated technologies (e.g., "Node.js,MongoDB,Express")
 * - limit: Number of jobs to return (default: 10, max: 50)
 */
export const getJobSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { role, location, technologies, limit = '10' } = req.query

    // Build search skills array
    let searchSkills: string[] = []

    // If technologies provided, use them
    if (technologies && typeof technologies === 'string') {
      searchSkills = technologies.split(',').map(t => t.trim()).filter(Boolean)
    }

    // If role provided, add it to search
    if (role && typeof role === 'string') {
      searchSkills.push(role)
    }

    // If no search criteria, try to get from user's resume
    if (searchSkills.length === 0) {
      const resumeData = await ParsedResume.findOne({ 
        userId, 
        isActive: true 
      }).lean()

      if (resumeData && resumeData.skills && resumeData.skills.length > 0) {
        searchSkills = resumeData.skills.slice(0, 5) // Use top 5 skills
      } else {
        // Default fallback
        searchSkills = ['software engineer', 'developer', 'programming']
      }
    }

    // Scrape jobs
    let jobs
    try {
      jobs = await scrapeJobs(searchSkills)
    } catch (scrapeError) {
      console.error('Error scraping jobs:', scrapeError)
      // Return empty results instead of error
      return res.status(200).json({
        success: true,
        message: 'No jobs found at the moment',
        suggestions: [],
        total: 0,
      })
    }

    if (jobs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No jobs found',
        suggestions: [],
        total: 0,
      })
    }

    // Limit number of jobs to process (to avoid too many API calls)
    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50)
    const jobsToProcess = jobs.slice(0, limitNum)

    // Extract skills from job descriptions
    const jobsWithSkills = await Promise.allSettled(
      jobsToProcess.map(async (job) => {
        try {
          const extractedSkills = await extractSkillsFromJob(
            job.title,
            job.company,
            job.description
          )

          // Combine all skills into a single array for easy display
          const allSkills = [
            ...extractedSkills.requiredSkills,
            ...extractedSkills.preferredSkills,
            ...extractedSkills.technologies,
            ...extractedSkills.frameworks,
            ...extractedSkills.tools,
            ...extractedSkills.languages,
          ]

          // Remove duplicates
          const uniqueSkills = Array.from(new Set(allSkills.map(s => s.toLowerCase())))

          return {
            id: `${job.company}-${job.title}-${Date.now()}`,
            job_title: job.title,
            company: job.company,
            location: job.location,
            description: job.description.substring(0, 500), // Truncate for response
            full_description: job.description,
            url: job.url,
            posted_date: job.postedDate,
            salary: job.salary,
            // Extracted skills
            skills: {
              required: extractedSkills.requiredSkills,
              preferred: extractedSkills.preferredSkills,
              technologies: extractedSkills.technologies,
              frameworks: extractedSkills.frameworks,
              tools: extractedSkills.tools,
              languages: extractedSkills.languages,
              certifications: extractedSkills.certifications || [],
              all: uniqueSkills, // All unique skills combined
            },
            experience_level: extractedSkills.experienceLevel,
            years_of_experience: extractedSkills.yearsOfExperience,
          }
        } catch (error) {
          console.error(`Error processing job ${job.title} at ${job.company}:`, error)
          // Return job without skills if extraction fails
          return {
            id: `${job.company}-${job.title}-${Date.now()}`,
            job_title: job.title,
            company: job.company,
            location: job.location,
            description: job.description.substring(0, 500),
            full_description: job.description,
            url: job.url,
            posted_date: job.postedDate,
            salary: job.salary,
            skills: {
              required: [],
              preferred: [],
              technologies: [],
              frameworks: [],
              tools: [],
              languages: [],
              certifications: [],
              all: [],
            },
            experience_level: undefined,
            years_of_experience: undefined,
          }
        }
      })
    )

    // Filter out failed promises and extract values
    const suggestions = jobsWithSkills
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<any>).value)

    res.status(200).json({
      success: true,
      message: `Found ${suggestions.length} job suggestions with skills`,
      suggestions,
      total: suggestions.length,
      search_criteria: {
        role: role || 'Not specified',
        location: location || 'Not specified',
        technologies: searchSkills,
      },
    })
  } catch (error) {
    console.error('Error getting job suggestions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get job suggestions',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
