import { geminiModel } from '../utils/geminiClient.ts'
import type { JobListing } from './jobScraper.ts'

export interface JobMatch {
  job: JobListing
  matchScore: number
  whyMatch: string
  skillGaps?: string[]
  matchingSkills?: string[]
}

/**
 * Match a job listing with user's resume skills using Gemini
 */
export const matchJob = async (
  job: JobListing,
  userSkills: string[],
  userExperience?: string
): Promise<JobMatch> => {
  try {
    const prompt = `
    You are an expert job matching AI. Analyze job-resume compatibility.

    Resume skills: ${userSkills.join(', ')}
    ${userExperience ? `User experience summary: ${userExperience}` : ''}

    Job Title: ${job.title}
    Company: ${job.company}
    Job Description: ${job.description.substring(0, 3000)}

    Analyze how well this job matches the candidate's profile. Provide:
    1. A match score from 0-100
    2. A brief explanation (2-3 sentences) of why this job fits or doesn't fit
    3. List of matching skills
    4. List of skill gaps (skills required but not in resume)

    Respond in JSON format:
    {
      "matchScore": <number 0-100>,
      "whyMatch": "<explanation>",
      "matchingSkills": ["skill1", "skill2"],
      "skillGaps": ["skill1", "skill2"]
    }
    
    Return ONLY valid JSON.
    `

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const matchData = JSON.parse(text) as {
      matchScore: number
      whyMatch: string
      matchingSkills?: string[]
      skillGaps?: string[]
    }

    return {
      job,
      matchScore: Math.max(0, Math.min(100, matchData.matchScore || 0)),
      whyMatch: matchData.whyMatch || 'No explanation provided',
      matchingSkills: matchData.matchingSkills || [],
      skillGaps: matchData.skillGaps || [],
    }
  } catch (error) {
    console.error('Error matching job with Gemini:', error)
    // Return a default match with low score
    return {
      job,
      matchScore: 0,
      whyMatch: 'Unable to analyze match',
      matchingSkills: [],
      skillGaps: [],
    }
  }
}

/**
 * Match multiple jobs and return sorted by match score
 */
export const matchMultipleJobs = async (
  jobs: JobListing[],
  userSkills: string[],
  userExperience?: string
): Promise<JobMatch[]> => {
  const matches = await Promise.all(
    jobs.map((job) => matchJob(job, userSkills, userExperience))
  )

  // Sort by match score (highest first)
  return matches.sort((a, b) => b.matchScore - a.matchScore)
}
