import { geminiModel } from '../utils/geminiClient.ts'

/**
 * ============================================
 * RESUME ANALYZER SERVICE
 * ============================================
 * 
 * Uses Google Gemini to extract structured data from resume text.
 * Falls back to basic text extraction if AI fails.
 */

export interface StructuredResume {
  name: string
  email?: string
  phone?: string
  location?: string
  summary?: string
  headline?: string
  skills: string[]
  experience: Array<{
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
  }>
  education: Array<{
    institution: string
    degree?: string
    field?: string
    location?: string
    startDate?: string
    endDate?: string
    duration?: string
    gpa?: string
  }>
  projects?: Array<{
    name: string
    description?: string
    url?: string
    technologies?: string[]
    highlights?: string[]
  }>
  certifications?: Array<{
    name: string
    issuer: string
    issueDate?: string
    credentialId?: string
  }>
  languages?: string[]
}

/**
 * Extract structured data from resume text using Google Gemini
 */
export const analyzeResume = async (rawText: string): Promise<StructuredResume> => {
  try {
    console.log('🤖 Analyzing resume with Gemini...')

    const prompt = `
    You are an expert resume parser. Extract structured information from the resume text provided below.
    
    Resume Text:
    """
    ${rawText}
    """
    
    Extract the following fields in JSON format:
    - name (string): Full name
    - email (string): Email address
    - phone (string): Phone number
    - location (string): City, State/Country
    - summary (string): Professional summary
    - headline (string): Professional headline
    - skills (string[]): List of all technical and soft skills
    - experience (object[]): List of work experience with:
      - company, role, location, startDate, endDate, description, highlights (string[]), technologies (string[])
    - education (object[]): List of education with:
      - institution, degree, field, location, startDate, endDate, gpa
    - projects (object[]): List of projects with:
      - name, description, url, technologies (string[]), highlights (string[])
    - certifications (object[]): List of certifications with:
      - name, issuer, issueDate, credentialId
    - languages (string[]): List of languages spoken

    Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
    If information is missing, use null or empty arrays/strings as appropriate.
    `

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const structuredData = JSON.parse(text) as StructuredResume

    // Validate and ensure required fields
    if (!structuredData.name) {
      structuredData.name = extractName(rawText) || 'Unknown'
    }
    if (!structuredData.skills || structuredData.skills.length === 0) {
      structuredData.skills = extractSkills(rawText)
    }
    if (!structuredData.experience) {
      structuredData.experience = []
    }
    if (!structuredData.education) {
      structuredData.education = []
    }

    console.log(`✅ Resume parsed: ${structuredData.name}, ${structuredData.skills.length} skills found`)
    return structuredData

  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error)
    console.log('Using fallback parser...')
    return fallbackParser(rawText)
  }
}

/**
 * Fallback parser when AI is not available
 * Extracts basic information using regex patterns
 */
function fallbackParser(rawText: string): StructuredResume {
  console.log('📝 Using fallback resume parser...')

  return {
    name: extractName(rawText) || 'Unknown',
    email: extractEmail(rawText),
    phone: extractPhone(rawText),
    summary: extractSummary(rawText),
    skills: extractSkills(rawText),
    experience: extractExperience(rawText),
    education: extractEducation(rawText),
    projects: [],
  }
}

// Helper extraction functions
function extractName(text: string): string | undefined {
  // Usually the name is at the very beginning
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    // If first line looks like a name (no special characters, reasonable length)
    if (firstLine.length < 50 && /^[A-Za-z\s.'-]+$/.test(firstLine)) {
      return firstLine
    }
  }
  return undefined
}

function extractEmail(text: string): string | undefined {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const matches = text.match(emailRegex)
  return matches?.[0]
}

function extractPhone(text: string): string | undefined {
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g
  const matches = text.match(phoneRegex)
  return matches?.[0]
}

function extractSummary(text: string): string | undefined {
  const summaryMatch = text.match(/(?:summary|objective|about|profile)[:\s]*\n?([\s\S]{50,500}?)(?:\n\n|experience|education|skills)/i)
  return summaryMatch?.[1]?.trim()
}

function extractSkills(text: string): string[] {
  const skills: Set<string> = new Set()

  // Common technical skills to look for
  const techSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST', 'API',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP',
    'Agile', 'Scrum', 'JIRA', 'Figma', 'Adobe',
  ]

  const textLower = text.toLowerCase()
  for (const skill of techSkills) {
    if (textLower.includes(skill.toLowerCase())) {
      skills.add(skill)
    }
  }

  // Look for skills section and extract items
  const skillsSection = text.match(/skills[:\s]*\n?([\s\S]*?)(?:\n\n|experience|education|projects)/i)
  if (skillsSection) {
    const skillText = skillsSection[1]
    // Split by common delimiters
    const items = skillText.split(/[,•|\n]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30)
    items.forEach(item => skills.add(item))
  }

  return Array.from(skills)
}

function extractExperience(text: string): StructuredResume['experience'] {
  const experience: StructuredResume['experience'] = []

  // Look for experience section
  const expSection = text.match(/(?:experience|work history|employment)[:\s]*\n?([\s\S]*?)(?:education|skills|projects|$)/i)
  if (expSection) {
    // Try to find company/role patterns
    const expText = expSection[1]
    const entries = expText.split(/\n{2,}/).filter(e => e.trim().length > 20)

    for (const entry of entries.slice(0, 5)) { // Limit to 5 entries
      const lines = entry.split('\n').filter(l => l.trim())
      if (lines.length >= 2) {
        experience.push({
          company: lines[0]?.trim() || 'Unknown Company',
          role: lines[1]?.trim() || 'Unknown Role',
          description: lines.slice(2).join(' ').trim(),
        })
      }
    }
  }

  return experience
}

function extractEducation(text: string): StructuredResume['education'] {
  const education: StructuredResume['education'] = []

  // Look for education section
  const eduSection = text.match(/education[:\s]*\n?([\s\S]*?)(?:experience|skills|projects|certifications|$)/i)
  if (eduSection) {
    const eduText = eduSection[1]
    const entries = eduText.split(/\n{2,}/).filter(e => e.trim().length > 10)

    for (const entry of entries.slice(0, 3)) { // Limit to 3 entries
      const lines = entry.split('\n').filter(l => l.trim())
      if (lines.length >= 1) {
        education.push({
          institution: lines[0]?.trim() || 'Unknown Institution',
          degree: lines[1]?.trim(),
          field: lines[2]?.trim(),
        })
      }
    }
  }

  return education
}

export default analyzeResume
