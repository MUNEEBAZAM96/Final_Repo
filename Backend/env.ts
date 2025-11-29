import { env as loadEnv } from 'custom-env'
import { z } from 'zod'

process.env.APP_STAGE = process.env.APP_STAGE || 'dev'

const isDevelopment = process.env.APP_STAGE === 'dev'
const isTesting = process.env.APP_STAGE === 'test'

if (isDevelopment) {
  loadEnv()
} else if (isTesting) {
  loadEnv('test')
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  APP_STAGE: z.enum(['dev', 'test', 'production']).default('dev'),

  PORT: z.coerce.number().positive().default(3000),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),

  // JWT Auth
  JWT_SECRET: z.string().min(1, 'JWT secret is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Google Gemini
  GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required'),

  // OpenAI (Optional)
  OPENAI_API_KEY: z.string().optional(),

  // Optional: SerpAPI for job scraping
  SERPAPI_KEY: z.string().optional(),

  // Frontend URL
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
})

export type Env = z.infer<typeof envSchema>
let env: Env

try {
  env = envSchema.parse(process.env)
} catch (e) {
  if (e instanceof z.ZodError) {
    console.log('❌ Invalid environment variables:')
    console.error(JSON.stringify(e.flatten().fieldErrors, null, 2))

    e.issues.forEach((err) => {
      const path = err.path.join('.')
      console.log(`  ${path}: ${err.message}`)
    })

    process.exit(1)
  }

  throw e
}

export const isProd = () => env.APP_STAGE === 'production'
export const isDev = () => env.APP_STAGE === 'dev'
export const isTest = () => env.APP_STAGE === 'test'

export { env }
export default env
