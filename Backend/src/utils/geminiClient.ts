import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../../env.ts'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

// Get the model (using gemini-1.5-flash for speed and cost, or gemini-1.5-pro for quality)
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export default geminiModel
