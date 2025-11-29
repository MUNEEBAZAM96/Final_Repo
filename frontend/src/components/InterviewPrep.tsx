import { useState, useEffect } from 'react'
import { interviewAPI } from '../services/api'
import { 
  MessageSquare, Building2, Briefcase, Code2, Plus, ArrowLeft,
  Loader2, AlertCircle, Sparkles, ChevronDown, ChevronUp,
  Lightbulb, Target, Brain, BookOpen, Filter
} from 'lucide-react'

interface InterviewQuestion {
  question: string
  type: 'technical' | 'behavioral' | 'system design'
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  modelAnswer: string
  hints: string[]
}

interface InterviewPrep {
  id: string
  company: string
  role: string
  technologies: string[]
  questions_json: InterviewQuestion[]
  created_at: string
}

export default function InterviewPrepPage() {
  const [preps, setPreps] = useState<InterviewPrep[]>([])
  const [selectedPrep, setSelectedPrep] = useState<InterviewPrep | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    technologies: '',
  })
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [showHints, setShowHints] = useState<Set<number>>(new Set())

  const fetchPreps = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await interviewAPI.getAll()
      setPreps(response.interviewPreps || [])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch interview preps')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setError(null)

    const technologies = formData.technologies
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    if (!formData.company || !formData.role || technologies.length === 0) {
      setError('Please fill in all fields')
      setGenerating(false)
      return
    }

    try {
      // Use random questions from database instead of generating new ones
      const response = await interviewAPI.generateRandom({
        companyName: formData.company,
        role: formData.role,
        technologies,
        count: 15, // Generate 15 random questions
      })

      // Always show questions - response will always have questions (from DB or default)
      if (response && response.questions && response.questions.length > 0) {
        // Transform the response to match the InterviewPrep interface
        const transformedPrep: InterviewPrep = {
          id: `random-${Date.now()}`,
          company: formData.company,
          role: formData.role,
          technologies,
          questions_json: response.questions.map((q: any) => ({
            question: q.question || 'Question not available',
            type: q.category?.toLowerCase().includes('technical') ? 'technical' :
                  q.category?.toLowerCase().includes('behavioral') ? 'behavioral' :
                  q.category?.toLowerCase().includes('system') ? 'system design' : 'technical',
            difficulty: 'medium' as const, // Default difficulty
            topic: q.category || 'General',
            modelAnswer: q.answer || 'Answer not available',
            hints: q.reason ? [q.reason] : ['Relevant for this role'],
          })),
          created_at: new Date().toISOString(),
        }

        setFormData({ company: '', role: '', technologies: '' })
        setShowForm(false)
        setSelectedPrep(transformedPrep)
        setError(null) // Clear any previous errors
      } else {
        // Fallback: create questions from response data even if structure is different
        const questions = response?.questions || []
        if (questions.length === 0) {
          // Last resort: create a single default question
          const defaultPrep: InterviewPrep = {
            id: `default-${Date.now()}`,
            company: formData.company,
            role: formData.role,
            technologies,
            questions_json: [{
              question: `Tell me about your experience with ${technologies.join(', ')}.`,
              type: 'technical',
              difficulty: 'medium',
              topic: 'Technical',
              modelAnswer: `I have experience working with ${technologies.join(', ')}. I've used these technologies to build various applications and solve complex problems.`,
              hints: ['Focus on specific projects and achievements'],
            }],
            created_at: new Date().toISOString(),
          }
          setSelectedPrep(defaultPrep)
        } else {
          // Use the questions we got
          const transformedPrep: InterviewPrep = {
            id: `random-${Date.now()}`,
            company: formData.company,
            role: formData.role,
            technologies,
            questions_json: questions.map((q: any) => ({
              question: q.question || 'Question not available',
              type: 'technical',
              difficulty: 'medium' as const,
              topic: q.category || 'General',
              modelAnswer: q.answer || 'Answer not available',
              hints: q.reason ? [q.reason] : ['Relevant for this role'],
            })),
            created_at: new Date().toISOString(),
          }
          setSelectedPrep(transformedPrep)
        }
        setFormData({ company: '', role: '', technologies: '' })
        setShowForm(false)
      }
    } catch (err: any) {
      console.error('Error generating questions:', err)
      // Even on error, show a default question set
      const errorPrep: InterviewPrep = {
        id: `error-${Date.now()}`,
        company: formData.company,
        role: formData.role,
        technologies,
        questions_json: [
          {
            question: `Tell me about your experience with ${technologies.join(', ') || 'software development'}.`,
            type: 'technical',
            difficulty: 'medium',
            topic: 'Technical',
            modelAnswer: `I have experience working with ${technologies.join(', ') || 'various technologies'}. I've used these to build applications and solve problems.`,
            hints: ['Focus on specific projects and achievements'],
          },
          {
            question: 'Why are you interested in this role?',
            type: 'behavioral',
            difficulty: 'easy',
            topic: 'Behavioral',
            modelAnswer: 'I am interested in this role because it aligns with my skills and career goals. I am excited about the opportunity to contribute to the team.',
            hints: ['Be genuine and specific about your interest'],
          },
        ],
        created_at: new Date().toISOString(),
      }
      setSelectedPrep(errorPrep)
      setFormData({ company: '', role: '', technologies: '' })
      setShowForm(false)
      setError(null) // Don't show error, just show the questions
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    fetchPreps()
  }, [])

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedQuestions(newExpanded)
  }

  const toggleHints = (index: number) => {
    const newHints = new Set(showHints)
    if (newHints.has(index)) {
      newHints.delete(index)
    } else {
      newHints.add(index)
    }
    setShowHints(newHints)
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'technical':
        return { 
          class: 'type-technical', 
          icon: Code2, 
          label: 'Technical',
          bgClass: 'bg-electric-500/20',
          textClass: 'text-electric-400'
        }
      case 'behavioral':
        return { 
          class: 'type-behavioral', 
          icon: Brain, 
          label: 'Behavioral',
          bgClass: 'bg-purple-500/20',
          textClass: 'text-purple-400'
        }
      case 'system design':
        return { 
          class: 'type-system-design', 
          icon: Target, 
          label: 'System Design',
          bgClass: 'bg-orange-500/20',
          textClass: 'text-orange-400'
        }
      default:
        return { 
          class: '', 
          icon: MessageSquare, 
          label: type,
          bgClass: 'bg-surface-500/20',
          textClass: 'text-surface-400'
        }
    }
  }

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { class: 'difficulty-easy', label: 'Easy', color: '#4caf50' }
      case 'medium':
        return { class: 'difficulty-medium', label: 'Medium', color: '#ff9800' }
      case 'hard':
        return { class: 'difficulty-hard', label: 'Hard', color: '#ff5f3b' }
      default:
        return { class: '', label: difficulty, color: '#7a869a' }
    }
  }

  // Filter questions
  const filteredQuestions = selectedPrep?.questions_json?.filter(q => {
    if (filterType !== 'all' && q.type !== filterType) return false
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false
    return true
  }) || []

  // Stats for selected prep
  const questionStats = selectedPrep?.questions_json ? {
    total: selectedPrep.questions_json.length,
    technical: selectedPrep.questions_json.filter(q => q.type === 'technical').length,
    behavioral: selectedPrep.questions_json.filter(q => q.type === 'behavioral').length,
    systemDesign: selectedPrep.questions_json.filter(q => q.type === 'system design').length,
  } : null

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-electric-400 animate-spin mx-auto mb-4" />
          <p className="text-surface-400">Loading interview preparations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-up">
          <div>
            {selectedPrep ? (
              <button
                onClick={() => {
                  setSelectedPrep(null)
                  setExpandedQuestions(new Set())
                  setShowHints(new Set())
                  setFilterType('all')
                  setFilterDifficulty('all')
                }}
                className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to list
              </button>
            ) : null}
            <h1 className="text-3xl font-bold text-white mb-2">
              {selectedPrep ? `${selectedPrep.company} - ${selectedPrep.role}` : 'Interview Preparation'}
            </h1>
            <p className="text-surface-400">
              {selectedPrep 
                ? `${selectedPrep.questions_json?.length || 0} AI-generated questions`
                : 'Generate personalized interview questions with AI'}
            </p>
          </div>
          {!selectedPrep && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`${showForm ? 'btn-secondary' : 'btn-coral'} flex items-center gap-2`}
            >
              {showForm ? (
                <>Cancel</>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Generate New Prep
                </>
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-coral-500/10 border border-coral-500/30 flex items-center gap-3 text-coral-400 animate-scale-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Generate Form */}
        {showForm && !selectedPrep && (
          <div className="glass-card p-6 mb-8 animate-scale-in">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-coral-400" />
              <h2 className="text-xl font-semibold text-white">Generate Interview Prep</h2>
            </div>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="mb-4 p-3 rounded-xl bg-electric-500/10 border border-electric-500/20">
                <p className="text-sm text-electric-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>This will generate random questions from existing interview preps in the database</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Google, Amazon, Microsoft"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Software Engineer, SDE Intern"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">
                  <Code2 className="w-4 h-4 inline mr-2" />
                  Technologies (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="input-field"
                  placeholder="e.g., React, Node.js, System Design, DSA"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={generating}
                className="btn-coral w-full flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Random Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Random Questions from Database
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Selected Prep View */}
        {selectedPrep ? (
          <div className="space-y-6 animate-fade-up">
            {/* Technologies & Stats */}
            <div className="glass-card p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-surface-400">Technologies:</span>
                {selectedPrep.technologies.map((tech, i) => (
                  <span key={i} className="skill-tag">{tech}</span>
                ))}
              </div>
              
              {questionStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-2xl font-bold text-white">{questionStats.total}</p>
                    <p className="text-xs text-surface-400">Total Questions</p>
                  </div>
                  <div className="p-3 rounded-xl bg-electric-500/10">
                    <p className="text-2xl font-bold text-electric-400">{questionStats.technical}</p>
                    <p className="text-xs text-surface-400">Technical</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10">
                    <p className="text-2xl font-bold text-purple-400">{questionStats.behavioral}</p>
                    <p className="text-xs text-surface-400">Behavioral</p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/10">
                    <p className="text-2xl font-bold text-orange-400">{questionStats.systemDesign}</p>
                    <p className="text-xs text-surface-400">System Design</p>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-surface-400" />
                  <span className="text-sm text-surface-400">Type:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-electric-400/50"
                  >
                    <option value="all">All Types</option>
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="system design">System Design</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-surface-400">Difficulty:</span>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-electric-400/50"
                  >
                    <option value="all">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <span className="text-sm text-surface-500 ml-auto">
                  Showing {filteredQuestions.length} of {selectedPrep.questions_json?.length || 0} questions
                </span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => {
                const typeConfig = getTypeConfig(question.type)
                const diffConfig = getDifficultyConfig(question.difficulty)
                const TypeIcon = typeConfig.icon
                const isExpanded = expandedQuestions.has(index)
                const hintsVisible = showHints.has(index)

                return (
                  <div
                    key={index}
                    className="question-card animate-fade-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Question Header */}
                    <div
                      className="cursor-pointer"
                      onClick={() => toggleQuestion(index)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl ${typeConfig.bgClass} flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className={`w-5 h-5 ${typeConfig.textClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeConfig.class}`}>
                              {typeConfig.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${diffConfig.class}`}>
                              {diffConfig.label}
                            </span>
                            <span className="text-xs text-surface-500">
                              {question.topic}
                            </span>
                          </div>
                          <h3 className="text-white font-medium pr-8">
                            {question.question}
                          </h3>
                        </div>
                        <button className="flex-shrink-0 p-2 rounded-lg hover:bg-white/5 transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-surface-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-surface-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                        {/* Model Answer */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-mint-400" />
                            <h4 className="text-sm font-semibold text-mint-400">Model Answer</h4>
                          </div>
                          <div className="p-4 rounded-xl bg-mint-500/5 border border-mint-500/20">
                            <p className="text-surface-300 text-sm leading-relaxed whitespace-pre-wrap">
                              {question.modelAnswer}
                            </p>
                          </div>
                        </div>

                        {/* Hints */}
                        {question.hints && question.hints.length > 0 && (
                          <div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleHints(index)
                              }}
                              className="flex items-center gap-2 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              <Lightbulb className="w-4 h-4" />
                              {hintsVisible ? 'Hide Hints' : `Show ${question.hints.length} Hints`}
                            </button>
                            {hintsVisible && (
                              <ul className="mt-3 space-y-2 animate-fade-in">
                                {question.hints.map((hint, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-surface-300">
                                    <span className="text-yellow-400 font-bold">{i + 1}.</span>
                                    {hint}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : preps.length === 0 && !showForm ? (
          <div className="glass-card p-12 text-center animate-fade-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-surface-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Interview Preps Yet</h3>
            <p className="text-surface-400 max-w-sm mx-auto mb-6">
              Generate your first interview preparation with AI-powered questions tailored to your target company and role.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-coral inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Generate Interview Prep
            </button>
          </div>
        ) : !selectedPrep ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up">
            {preps.map((prep, index) => (
              <div
                key={prep.id}
                onClick={() => setSelectedPrep(prep)}
                className="glass-card-hover p-6 cursor-pointer animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral-500/20 to-electric-500/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-coral-400" />
                  </div>
                  <span className="text-xs text-surface-500">
                    {new Date(prep.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1">{prep.company}</h3>
                <p className="text-electric-400 text-sm mb-3">{prep.role}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {prep.technologies.slice(0, 3).map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-xs text-surface-400">
                      {tech}
                    </span>
                  ))}
                  {prep.technologies.length > 3 && (
                    <span className="px-2 py-0.5 rounded bg-white/5 text-xs text-surface-500">
                      +{prep.technologies.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-sm text-surface-400">
                    {prep.questions_json?.length || 0} questions
                  </span>
                  <span className="text-electric-400 text-sm font-medium">
                    View →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Generating Animation */}
        {generating && (
          <div className="fixed inset-0 bg-midnight-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="glass-card p-8 text-center max-w-md mx-4 animate-scale-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-coral-500 to-electric-500 flex items-center justify-center">
                <Brain className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI is Generating Questions
              </h3>
              <p className="text-surface-400 mb-4">
                Researching {formData.company} and creating personalized interview questions...
              </p>
              <div className="flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-coral-400 animate-bounce"
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
