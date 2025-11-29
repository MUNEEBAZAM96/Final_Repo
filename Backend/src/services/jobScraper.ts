import axios from 'axios'
import { env } from '../../env.ts'

export interface JobListing {
  title: string
  company: string
  location: string
  description: string
  url: string
  postedDate?: string
  salary?: string
}

/**
 * Scrape jobs using SerpAPI Google Jobs
 */
export const scrapeJobsWithSerpAPI = async (skills: string[]): Promise<JobListing[]> => {
  if (!env.SERPAPI_KEY) {
    throw new Error('SERPAPI_KEY not configured')
  }

  const query = `${skills.join(' ')} job OR internship OR SDE OR "software engineer" India 2025 OR 2026`
  
  try {
    const response = await axios.get('https://serpapi.com/search.json', {
      params: {
        q: query,
        engine: 'google_jobs',
        api_key: env.SERPAPI_KEY,
        location: 'India',
        num: 20,
      },
    })

    const jobs = response.data?.jobs_results || []
    
    return jobs.map((job: any) => ({
      title: job.title || 'Unknown',
      company: job.company_name || 'Unknown',
      location: job.location || 'Unknown',
      description: job.description || '',
      url: job.apply_options?.[0]?.link || job.related_links?.[0]?.link || '#',
      postedDate: job.detected_extensions?.posted_at,
      salary: job.detected_extensions?.salary,
    }))
  } catch (error) {
    console.error('Error scraping jobs with SerpAPI:', error)
    throw new Error(`Failed to scrape jobs: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Fallback: Scrape jobs using Puppeteer (for LinkedIn, Indeed, etc.)
 */
export const scrapeJobsWithPuppeteer = async (skills: string[]): Promise<JobListing[]> => {
  // This would require Puppeteer setup
  // For now, return empty array - can be implemented later
  console.warn('Puppeteer scraping not implemented yet')
  return []
}

/**
 * Main job scraping function - tries SerpAPI first, falls back to Puppeteer
 */
export const scrapeJobs = async (skills: string[]): Promise<JobListing[]> => {
  try {
    if (env.SERPAPI_KEY) {
      return await scrapeJobsWithSerpAPI(skills)
    } else {
      return await scrapeJobsWithPuppeteer(skills)
    }
  } catch (error) {
    console.error('Error in scrapeJobs:', error)
    // Return empty array instead of throwing to allow app to continue
    return []
  }
}

