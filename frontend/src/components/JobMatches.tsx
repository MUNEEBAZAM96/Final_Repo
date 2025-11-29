import { useState, useEffect } from 'react'
import { jobsAPI } from '../services/api'
import { 
  Briefcase, MapPin, ExternalLink, CheckCircle, Search, 
  Loader2, AlertCircle, Sparkles, TrendingUp, Filter,
  ChevronDown, Building2, Target
} from 'lucide-react'

interface JobMatch {
  id?: string
  job_title: string
  company: string
  location: string
  url: string
  match_score: number
  why_match: string
  applied: boolean
  created_at?: string
}

export default function JobMatches() {
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [discovering, setDiscovering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'applied' | 'not-applied'>('all')
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await jobsAPI.getMatches()
      setMatches(response.matches || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch job matches')
    } finally {
      setLoading(false)
    }
  }

  const handleDiscover = async () => {
    setDiscovering(true)
    setError(null)
    try {
      await jobsAPI.discover()
      await fetchMatches()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to discover jobs. Make sure you have uploaded a resume first.')
    } finally {
      setDiscovering(false)
    }
  }

  const handleMarkApplied = async (id: string) => {
    try {
      await jobsAPI.markAsApplied(id)
      setMatches(matches.map(m => m.id === id ? { ...m, applied: true } : m))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark as applied')
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-mint-500 to-mint-600'
    if (score >= 60) return 'from-electric-500 to-electric-600'
    if (score >= 40) return 'from-yellow-500 to-yellow-600'
    return 'from-coral-500 to-coral-600'
  }

  // Filter and sort matches
  const filteredMatches = matches
    .filter(m => {
      if (filter === 'applied') return m.applied
      if (filter === 'not-applied') return !m.applied
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.match_score - a.match_score
      if (sortBy === 'date' && a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return 0
    })

  // Stats
  const stats = {
    total: matches.length,
    applied: matches.filter(m => m.applied).length,
    excellent: matches.filter(m => m.match_score >= 80).length,
    avgScore: matches.length > 0 
      ? Math.round(matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length)
      : 0
  }

  return (
    <div className="flex-1 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Job Matches</h1>
            <p className="text-surface-400">
              AI-powered job matching based on your resume
            </p>
          </div>
          <button
            onClick={handleDiscover}
            disabled={discovering}
            className="btn-coral flex items-center justify-center gap-2 group"
          >
            {discovering ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Discovering...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Discover Jobs
                <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
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

        {/* Stats Cards */}
        {matches.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-500/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-electric-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-sm text-surface-400">Total Matches</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mint-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-mint-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.applied}</p>
                  <p className="text-sm text-surface-400">Applied</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-coral-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-coral-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.excellent}</p>
                  <p className="text-sm text-surface-400">Excellent (80%+)</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.avgScore}%</p>
                  <p className="text-sm text-surface-400">Avg Score</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {matches.length > 0 && (
          <div className="glass-card p-4 mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-surface-400" />
                <span className="text-sm text-surface-400">Filter:</span>
                <div className="flex gap-1">
                  {['all', 'not-applied', 'applied'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filter === f
                          ? 'bg-electric-500/20 text-electric-400 border border-electric-500/30'
                          : 'text-surface-400 hover:bg-white/5'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'applied' ? 'Applied' : 'Not Applied'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-surface-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-electric-400/50"
                >
                  <option value="score">Match Score</option>
                  <option value="date">Date Added</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-electric-400 animate-spin mx-auto mb-4" />
              <p className="text-surface-400">Loading job matches...</p>
            </div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="glass-card p-12 text-center animate-fade-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
              <Search className="w-10 h-10 text-surface-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {matches.length === 0 ? 'No Job Matches Yet' : 'No jobs match this filter'}
            </h3>
            <p className="text-surface-400 max-w-sm mx-auto mb-6">
              {matches.length === 0 
                ? 'Click "Discover Jobs" to find positions that match your skills and experience.'
                : 'Try changing your filter settings.'}
            </p>
            {matches.length === 0 && (
              <button
                onClick={handleDiscover}
                disabled={discovering}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Discover Jobs Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match, index) => (
              <div
                key={match.id || index}
                className="job-card animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Score Badge */}
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getScoreGradient(match.match_score)} flex flex-col items-center justify-center`}>
                      <span className="text-2xl font-bold text-white">{match.match_score}</span>
                      <span className="text-xs text-white/80">Match</span>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {match.job_title}
                      </h3>
                      {match.applied && (
                        <span className="px-2 py-1 rounded-full bg-mint-500/20 text-mint-400 text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Applied
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-surface-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {match.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {match.location}
                      </span>
                    </div>

                    {/* Why Match Section */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ${
                        expandedCard === match.id ? 'max-h-40' : 'max-h-12'
                      }`}
                    >
                      <p className="text-surface-300 text-sm leading-relaxed">
                        {match.why_match}
                      </p>
                    </div>
                    
                    {match.why_match.length > 150 && (
                      <button
                        onClick={() => setExpandedCard(expandedCard === match.id ? null : match.id || null)}
                        className="text-electric-400 text-sm font-medium mt-2 flex items-center gap-1 hover:text-electric-300 transition-colors"
                      >
                        {expandedCard === match.id ? 'Show less' : 'Read more'}
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedCard === match.id ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 mt-2 md:mt-0">
                    <a
                      href={match.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Job
                    </a>
                    {!match.applied && match.id && (
                      <button
                        onClick={() => handleMarkApplied(match.id!)}
                        className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Applied
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discovering Animation */}
        {discovering && (
          <div className="fixed inset-0 bg-midnight-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="glass-card p-8 text-center max-w-md mx-4 animate-scale-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-electric-500 to-coral-500 flex items-center justify-center animate-pulse">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI is Discovering Jobs
              </h3>
              <p className="text-surface-400 mb-4">
                Searching for positions that match your skills and experience...
              </p>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-electric-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
