import { useState, useEffect } from 'react'
import { jobsAPI } from '../services/api'
import { 
  Briefcase, MapPin, ExternalLink, Search, Loader2, 
  AlertCircle, Sparkles, Building2, Code2, Filter,
  ChevronDown, Tag, TrendingUp, Star
} from 'lucide-react'

interface JobSuggestion {
  id: string
  job_title: string
  company: string
  location: string
  description: string
  full_description: string
  url: string
  posted_date?: string
  salary?: string
  skills: {
    required: string[]
    preferred: string[]
    technologies: string[]
    frameworks: string[]
    tools: string[]
    languages: string[]
    certifications: string[]
    all: string[]
  }
  experience_level?: string
  years_of_experience?: number
}

export default function JobSuggestions() {
  const [suggestions, setSuggestions] = useState<JobSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState({
    role: '',
    location: '',
    technologies: '',
    limit: '10',
  })
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [skillFilter, setSkillFilter] = useState<string>('all')

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (searchParams.role) params.role = searchParams.role
      if (searchParams.location) params.location = searchParams.location
      if (searchParams.technologies) params.technologies = searchParams.technologies
      if (searchParams.limit) params.limit = searchParams.limit

      const response = await jobsAPI.getSuggestions(params)
      setSuggestions(response.suggestions || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch job suggestions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-load on mount
    handleSearch()
  }, [])

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  const getAllSkills = (job: JobSuggestion) => {
    const all = [
      ...job.skills.required,
      ...job.skills.preferred,
      ...job.skills.technologies,
      ...job.skills.frameworks,
      ...job.skills.tools,
      ...job.skills.languages,
    ]
    return Array.from(new Set(all))
  }

  const filteredSuggestions = suggestions.filter(job => {
    if (skillFilter === 'all') return true
    const allSkills = getAllSkills(job)
    return allSkills.some(skill => 
      skill.toLowerCase().includes(skillFilter.toLowerCase())
    )
  })

  return (
    <div className="flex-1 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-white mb-2">Job Suggestions</h1>
          <p className="text-surface-400">
            Discover jobs with AI-extracted skills and requirements
          </p>
        </div>

        {/* Search Form */}
        <div className="glass-card p-6 mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-electric-400" />
            <h2 className="text-xl font-semibold text-white">Search Jobs</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Role
              </label>
              <input
                type="text"
                value={searchParams.role}
                onChange={(e) => setSearchParams({ ...searchParams, role: e.target.value })}
                className="input-field"
                placeholder="e.g., Backend Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                className="input-field"
                placeholder="e.g., Remote, India"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                <Code2 className="w-4 h-4 inline mr-2" />
                Technologies
              </label>
              <input
                type="text"
                value={searchParams.technologies}
                onChange={(e) => setSearchParams({ ...searchParams, technologies: e.target.value })}
                className="input-field"
                placeholder="e.g., Node.js, MongoDB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Limit
              </label>
              <input
                type="number"
                value={searchParams.limit}
                onChange={(e) => setSearchParams({ ...searchParams, limit: e.target.value })}
                className="input-field"
                min="1"
                max="50"
              />
            </div>
          </div>
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Jobs
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-coral-500/10 border border-coral-500/30 flex items-center gap-3 text-coral-400 animate-scale-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Stats */}
        {suggestions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-500/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-electric-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{suggestions.length}</p>
                  <p className="text-sm text-surface-400">Jobs Found</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mint-500/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-mint-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {new Set(suggestions.flatMap(j => getAllSkills(j))).size}
                  </p>
                  <p className="text-sm text-surface-400">Unique Skills</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-coral-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-coral-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {new Set(suggestions.map(j => j.company)).size}
                  </p>
                  <p className="text-sm text-surface-400">Companies</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {suggestions.filter(j => j.experience_level).length}
                  </p>
                  <p className="text-sm text-surface-400">With Level</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skill Filter */}
        {suggestions.length > 0 && (
          <div className="glass-card p-4 mb-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-400">Filter by Skill:</span>
            </div>
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="input-field"
              placeholder="Type a skill to filter (e.g., React, Node.js)"
            />
            {skillFilter !== 'all' && (
              <button
                onClick={() => setSkillFilter('all')}
                className="mt-2 text-sm text-electric-400 hover:text-electric-300"
              >
                Clear filter
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && suggestions.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-electric-400 animate-spin mx-auto mb-4" />
              <p className="text-surface-400">Searching for jobs...</p>
            </div>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="glass-card p-12 text-center animate-fade-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
              <Search className="w-10 h-10 text-surface-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {suggestions.length === 0 ? 'No Jobs Found' : 'No jobs match this filter'}
            </h3>
            <p className="text-surface-400 max-w-sm mx-auto mb-6">
              {suggestions.length === 0 
                ? 'Try adjusting your search criteria or click "Search Jobs" to find positions.'
                : 'Try changing your skill filter.'}
            </p>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuggestions.map((job, index) => {
              const allSkills = getAllSkills(job)
              const isExpanded = expandedCard === job.id

              return (
                <div
                  key={job.id}
                  className="job-card animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col gap-4">
                    {/* Job Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            {job.job_title}
                          </h3>
                          {job.experience_level && (
                            <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                              {job.experience_level}
                            </span>
                          )}
                          {job.years_of_experience && (
                            <span className="px-2 py-1 rounded-full bg-electric-500/20 text-electric-400 text-xs font-medium">
                              {job.years_of_experience}+ years
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-surface-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          {job.salary && (
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {job.salary}
                            </span>
                          )}
                        </div>

                        {/* Description Preview */}
                        <p className="text-surface-300 text-sm mb-3 line-clamp-2">
                          {job.description}
                        </p>
                      </div>

                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Apply
                      </a>
                    </div>

                    {/* Skills Section */}
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-electric-400" />
                          <h4 className="text-sm font-semibold text-white">
                            Required Skills ({job.skills.required.length})
                          </h4>
                        </div>
                        <button
                          onClick={() => toggleCard(job.id)}
                          className="text-electric-400 text-sm hover:text-electric-300 transition-colors"
                        >
                          {isExpanded ? 'Show Less' : 'Show More'}
                          <ChevronDown className={`w-4 h-4 inline ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.skills.required.slice(0, isExpanded ? undefined : 5).map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-electric-500/20 text-electric-400 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {!isExpanded && job.skills.required.length > 5 && (
                          <span className="px-3 py-1 rounded-full bg-white/5 text-surface-400 text-xs">
                            +{job.skills.required.length - 5} more
                          </span>
                        )}
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="space-y-4 mt-4 pt-4 border-t border-white/10 animate-fade-in">
                          {/* Preferred Skills */}
                          {job.skills.preferred.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-surface-300 mb-2">
                                Preferred Skills ({job.skills.preferred.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {job.skills.preferred.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Technologies */}
                          {job.skills.technologies.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-surface-300 mb-2">
                                Technologies ({job.skills.technologies.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {job.skills.technologies.map((tech, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-mint-500/20 text-mint-400 text-xs"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Frameworks */}
                          {job.skills.frameworks.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-surface-300 mb-2">
                                Frameworks ({job.skills.frameworks.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {job.skills.frameworks.map((fw, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-coral-500/20 text-coral-400 text-xs"
                                  >
                                    {fw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tools */}
                          {job.skills.tools.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-surface-300 mb-2">
                                Tools ({job.skills.tools.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {job.skills.tools.map((tool, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Full Description */}
                          <div>
                            <h4 className="text-sm font-semibold text-surface-300 mb-2">
                              Full Description
                            </h4>
                            <p className="text-surface-400 text-sm leading-relaxed">
                              {job.full_description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

