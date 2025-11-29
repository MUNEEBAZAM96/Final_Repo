import { geminiModel } from '../utils/geminiClient.ts'

export interface InterviewQuestion {
  question: string
  type: 'technical' | 'behavioral' | 'system design'
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  modelAnswer: string
  hints: string[]
}

export interface InterviewPrep {
  company: string
  role: string
  technologies: string[]
  questions: InterviewQuestion[]
  companyInfo?: string
  roleRequirements?: string
}

/**
 * Research company and role information using Gemini
 */
const researchCompanyAndRole = async (
  company: string,
  role: string
): Promise<{ companyInfo: string; roleRequirements: string }> => {
  try {
    const prompt = `
    Research the following company and role:
    
    Company: ${company}
    Role: ${role}
    
    Provide:
    1. Brief company information (what they do, culture, recent news)
    2. Typical requirements and expectations for this role
    
    Keep responses concise (2-3 paragraphs each).
    
    Respond in JSON format:
    {
      "companyInfo": "...",
      "roleRequirements": "..."
    }
    `

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const data = JSON.parse(text) as { companyInfo: string; roleRequirements: string }

    return {
      companyInfo: data.companyInfo || 'Company information not available',
      roleRequirements: data.roleRequirements || 'Role requirements not available',
    }
  } catch (error) {
    console.error('Error researching company/role with Gemini:', error)
    return {
      companyInfo: 'Company information not available',
      roleRequirements: 'Role requirements not available',
    }
  }
}

/**
 * Generate interview questions using Gemini
 */
export const generateInterviewPrep = async (
  company: string,
  role: string,
  technologies: string[],
  userSkills?: string[]
): Promise<InterviewPrep> => {
  try {
    // Research company and role
    const research = await researchCompanyAndRole(company, role)

    // Generate questions
    const questionsPrompt = `
    Generate comprehensive interview questions for:
    
    Company: ${company}
    Role: ${role}
    Technologies: ${technologies.join(', ')}
    ${userSkills ? `Candidate Skills: ${userSkills.join(', ')}` : ''}
    
    Generate 15-20 questions covering:
    - Technical questions (coding, algorithms, system design)
    - Behavioral questions (teamwork, problem-solving, past experiences)
    - Role-specific questions
    
    For each question, provide:
    - The question text
    - Question type (technical, behavioral, or system design)
    - Difficulty level (easy, medium, hard)
    - Topic/category
    - A model answer (comprehensive)
    - 2-3 hints
    
    Respond in JSON format:
    {
      "questions": [
        {
          "question": "...",
          "type": "technical|behavioral|system design",
          "difficulty": "easy|medium|hard",
          "topic": "...",
          "modelAnswer": "...",
          "hints": ["hint1", "hint2"]
        }
      ]
    }
    
    Return ONLY valid JSON.
    `

    const result = await geminiModel.generateContent(questionsPrompt)
    const response = await result.response
    let text = response.text()

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const data = JSON.parse(text) as { questions: InterviewQuestion[] }

    return {
      company,
      role,
      technologies,
      questions: data.questions || [],
      companyInfo: research.companyInfo,
      roleRequirements: research.roleRequirements,
    }
  } catch (error) {
    console.error('Error generating interview prep with Gemini:', error)
    throw new Error(`Failed to generate interview prep: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
