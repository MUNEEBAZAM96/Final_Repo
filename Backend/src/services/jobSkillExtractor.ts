import { geminiModel } from '../utils/geminiClient.ts'

export interface ExtractedSkills {
  requiredSkills: string[]
  preferredSkills: string[]
  technologies: string[]
  frameworks: string[]
  tools: string[]
  languages: string[]
  certifications?: string[]
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  yearsOfExperience?: number
}

/**
 * Extract skills from job description using Gemini API
 */
export const extractSkillsFromJob = async (
  jobTitle: string,
  company: string,
  jobDescription: string
): Promise<ExtractedSkills> => {
  try {
    const prompt = `You are an expert job analyzer. Extract all skills, technologies, and requirements from the following job posting.

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDescription.substring(0, 4000)}

Extract and categorize:
1. Required Skills (must-have technical and soft skills)
2. Preferred Skills (nice-to-have skills)
3. Technologies (programming languages, databases, etc.)
4. Frameworks (React, Express, Django, etc.)
5. Tools (Docker, AWS, Git, etc.)
6. Programming Languages (JavaScript, Python, Java, etc.)
7. Certifications (if mentioned)
8. Experience Level (entry, mid, senior, lead, executive)
9. Years of Experience (if specified)

Your output MUST be valid JSON only:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "technologies": ["tech1", "tech2"],
  "frameworks": ["framework1", "framework2"],
  "tools": ["tool1", "tool2"],
  "languages": ["language1", "language2"],
  "certifications": ["cert1", "cert2"],
  "experienceLevel": "mid",
  "yearsOfExperience": 3
}

Rules:
- Extract ALL mentioned skills, technologies, and tools
- Be comprehensive - include everything mentioned
- Categorize accurately
- If experience level is not clear, infer from job title and description
- Return empty arrays if category has no items
- DO NOT include extra text outside JSON`

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()
    text = text.trim()

    // Parse JSON response
    let parsedData: ExtractedSkills
    try {
      parsedData = JSON.parse(text) as ExtractedSkills
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]) as ExtractedSkills
      } else {
        throw new Error('Invalid JSON response from Gemini API')
      }
    }

    // Validate and sanitize response
    return {
      requiredSkills: Array.isArray(parsedData.requiredSkills) ? parsedData.requiredSkills : [],
      preferredSkills: Array.isArray(parsedData.preferredSkills) ? parsedData.preferredSkills : [],
      technologies: Array.isArray(parsedData.technologies) ? parsedData.technologies : [],
      frameworks: Array.isArray(parsedData.frameworks) ? parsedData.frameworks : [],
      tools: Array.isArray(parsedData.tools) ? parsedData.tools : [],
      languages: Array.isArray(parsedData.languages) ? parsedData.languages : [],
      certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
      experienceLevel: parsedData.experienceLevel || undefined,
      yearsOfExperience: parsedData.yearsOfExperience || undefined,
    }
  } catch (error) {
    console.error('Error extracting skills from job description:', error)
    
    // Return default structure on error
    return {
      requiredSkills: [],
      preferredSkills: [],
      technologies: [],
      frameworks: [],
      tools: [],
      languages: [],
      certifications: [],
    }
  }
}

/**
 * Extract skills from multiple jobs in batch
 */
export const extractSkillsFromMultipleJobs = async (
  jobs: Array<{ title: string; company: string; description: string }>
): Promise<Map<string, ExtractedSkills>> => {
  const skillsMap = new Map<string, ExtractedSkills>()
  
  // Process jobs in parallel (with rate limiting consideration)
  const results = await Promise.allSettled(
    jobs.map(async (job) => {
      const skills = await extractSkillsFromJob(job.title, job.company, job.description)
      return { jobId: `${job.company}-${job.title}`, skills }
    })
  )

  // Collect successful results
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      skillsMap.set(result.value.jobId, result.value.skills)
    }
  })

  return skillsMap
}

