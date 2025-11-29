import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { resumeAPI, jobsAPI, interviewAPI } from '../services/api'
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, PieChart, Pie, Cell
} from 'recharts'
import { 
  FileText, Briefcase, CheckCircle, Target, TrendingUp, 
  Zap, ArrowRight, Sparkles, Upload, Loader2, MessageSquare
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    resumeUploaded: false,
    skills: [] as string[],
    jobMatches: 0,
    appliedJobs: 0,
    interviewPreps: 0,
    avgMatchScore: 0,
    matchScoreDistribution: [] as { name: string; value: number; color: string }[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch resume
        const resumeRes = await resumeAPI.get().catch(() => null)
        const resumeData = resumeRes?.resume
        const skills = resumeData?.skills || []

        // Fetch job matches
        const jobsRes = await jobsAPI.getMatches()
        const matches = jobsRes?.matches || []
        const appliedCount = matches.filter((m: any) => m.applied).length
        const avgScore = matches.length > 0
          ? matches.reduce((sum: number, m: any) => sum + (m.match_score || 0), 0) / matches.length
          : 0

        // Calculate match score distribution
        const distribution = [
          { name: 'Excellent (80-100)', value: 0, color: '#4caf50' },
          { name: 'Good (60-79)', value: 0, color: '#00bcd4' },
          { name: 'Moderate (40-59)', value: 0, color: '#ff9800' },
          { name: 'Low (0-39)', value: 0, color: '#ff5f3b' },
        ]
        matches.forEach((m: any) => {
          const score = m.match_score || 0
          if (score >= 80) distribution[0].value++
          else if (score >= 60) distribution[1].value++
          else if (score >= 40) distribution[2].value++
          else distribution[3].value++
        })

        // Fetch interview preps
        const interviewRes = await interviewAPI.getAll()
        const preps = interviewRes?.interviewPreps || []

        setStats({
          resumeUploaded: !!resumeData,
          skills,
          jobMatches: matches.length,
          appliedJobs: appliedCount,
          interviewPreps: preps.length,
          avgMatchScore: Math.round(avgScore),
          matchScoreDistribution: distribution.filter(d => d.value > 0),
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-electric-400 animate-spin mx-auto mb-4" />
          <p className="text-surface-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Prepare data for radar chart
  const skillData = stats.skills.slice(0, 8).map(skill => ({
    skill: skill.length > 12 ? skill.substring(0, 12) + '...' : skill,
    value: 85 + Math.random() * 15, // Simulated proficiency
    fullMark: 100,
  }))

  const statCards = [
    {
      label: 'Resume Status',
      value: stats.resumeUploaded ? 'Uploaded' : 'Not Uploaded',
      icon: FileText,
      color: stats.resumeUploaded ? 'from-mint-500 to-mint-600' : 'from-surface-600 to-surface-700',
      iconBg: stats.resumeUploaded ? 'bg-mint-500/20 text-mint-400' : 'bg-surface-500/20 text-surface-400',
      link: '/resume',
    },
    {
      label: 'Job Matches',
      value: stats.jobMatches.toString(),
      icon: Briefcase,
      color: 'from-electric-500 to-electric-600',
      iconBg: 'bg-electric-500/20 text-electric-400',
      link: '/jobs',
    },
    {
      label: 'Applied Jobs',
      value: stats.appliedJobs.toString(),
      icon: CheckCircle,
      color: 'from-mint-500 to-mint-600',
      iconBg: 'bg-mint-500/20 text-mint-400',
      link: '/jobs',
    },
    {
      label: 'Interview Preps',
      value: stats.interviewPreps.toString(),
      icon: Target,
      color: 'from-coral-500 to-coral-600',
      iconBg: 'bg-coral-500/20 text-coral-400',
      link: '/interview',
    },
  ]

  return (
    <div className="flex-1 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-surface-400">
            Track your career preparation progress and discover opportunities
          </p>
        </div>

        {/* Alert for no resume */}
        {!stats.resumeUploaded && (
          <div className="mb-8 glass-card p-6 border-l-4 border-electric-500 animate-fade-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-electric-500/20 flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-electric-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Get Started with Your Resume
                </h3>
                <p className="text-surface-400 mb-4">
                  Upload your resume to unlock AI-powered job matching and personalized interview preparation.
                </p>
                <Link to="/resume" className="btn-primary inline-flex items-center gap-2">
                  Upload Resume
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="stat-card group animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-surface-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1" />
                </div>
                <p className="text-surface-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </Link>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Match Score Card */}
          <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-electric-400" />
              <h2 className="text-xl font-semibold text-white">Average Match Score</h2>
            </div>
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-8 border-midnight-800 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-5xl font-bold gradient-text">
                      {stats.avgMatchScore}
                    </span>
                    <span className="text-2xl text-surface-400">%</span>
                  </div>
                </div>
                <svg className="absolute inset-0 w-40 h-40 -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${stats.avgMatchScore * 4.52} 452`}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00bcd4" />
                      <stop offset="100%" stopColor="#4dd0e1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-surface-400">
                {stats.avgMatchScore >= 80 && 'Excellent! You\'re highly qualified for matched jobs.'}
                {stats.avgMatchScore >= 60 && stats.avgMatchScore < 80 && 'Good matches! Consider skill improvements.'}
                {stats.avgMatchScore < 60 && stats.avgMatchScore > 0 && 'Room for improvement. Update your skills!'}
                {stats.avgMatchScore === 0 && 'Discover jobs to see your match scores.'}
              </p>
            </div>
          </div>

          {/* Match Score Distribution */}
          {stats.matchScoreDistribution.length > 0 && (
            <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-coral-400" />
                <h2 className="text-xl font-semibold text-white">Match Distribution</h2>
              </div>
              <div className="flex items-center justify-center py-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.matchScoreDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.matchScoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#182b62',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'white',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {stats.matchScoreDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-surface-400">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Radar Chart */}
          {stats.skills.length > 0 && (
            <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-electric-400" />
                <h2 className="text-xl font-semibold text-white">Your Skills Profile</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={skillData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis 
                    dataKey="skill" 
                    tick={{ fill: '#a5adba', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: '#7a869a' }}
                  />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="#00bcd4"
                    fill="#00bcd4"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Skills Tags */}
          {stats.skills.length > 0 && (
            <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '500ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-mint-400" />
                  <h2 className="text-xl font-semibold text-white">Extracted Skills</h2>
                </div>
                <span className="text-sm text-surface-400">
                  {stats.skills.length} skills found
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="skill-tag animate-scale-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 animate-fade-up" style={{ animationDelay: '600ms' }}>
          <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/resume"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-electric-400/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-electric-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-electric-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-electric-400 transition-colors">
                  {stats.resumeUploaded ? 'Update Resume' : 'Upload Resume'}
                </h3>
                <p className="text-sm text-surface-400">AI-powered parsing</p>
              </div>
              <ArrowRight className="w-5 h-5 text-surface-500 group-hover:text-electric-400 transition-all transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/jobs"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-coral-400/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-coral-500/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-coral-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-coral-400 transition-colors">
                  Job Matches
                </h3>
                <p className="text-sm text-surface-400">AI-matched positions</p>
              </div>
              <ArrowRight className="w-5 h-5 text-surface-500 group-hover:text-coral-400 transition-all transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/jobs/suggestions"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-electric-400/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-electric-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-electric-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-electric-400 transition-colors">
                  Job Suggestions
                </h3>
                <p className="text-sm text-surface-400">Jobs with extracted skills</p>
              </div>
              <ArrowRight className="w-5 h-5 text-surface-500 group-hover:text-electric-400 transition-all transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/interview"
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-mint-400/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-mint-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-mint-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-mint-400 transition-colors">
                  Interview Prep
                </h3>
                <p className="text-sm text-surface-400">AI-generated questions</p>
              </div>
              <ArrowRight className="w-5 h-5 text-surface-500 group-hover:text-mint-400 transition-all transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

