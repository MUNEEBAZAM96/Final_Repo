import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { resumeAPI } from '../services/api'
import { 
  Upload, FileText, CheckCircle, AlertCircle, Loader2, 
  User, Mail, Phone, Briefcase, GraduationCap, Wrench,
  Sparkles, Eye, Trash2, MapPin, FolderGit2, Award
} from 'lucide-react'

interface Experience {
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
}

interface Education {
  institution: string
  degree?: string
  field?: string
  location?: string
  startDate?: string
  endDate?: string
  duration?: string
  gpa?: string
}

interface Project {
  name: string
  description?: string
  url?: string
  technologies?: string[]
  highlights?: string[]
}

interface ParsedResume {
  name?: string
  email?: string
  phone?: string
  location?: string
  summary?: string
  headline?: string
  skills?: string[]
  experience?: Experience[]
  education?: Education[]
  projects?: Project[]
  certifications?: Array<{
    name: string
    issuer: string
    issueDate?: string
  }>
  languages?: string[]
}

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resumeData, setResumeData] = useState<{ structuredData: ParsedResume; fileName?: string } | null>(null)
  const [existingResume, setExistingResume] = useState<any>(null)
  const [loadingExisting, setLoadingExisting] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('overview')

  // Fetch existing resume on mount
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const response = await resumeAPI.get()
        if (response?.resume) {
          setExistingResume(response.resume)
        }
      } catch (err) {
        // No existing resume, that's fine
      } finally {
        setLoadingExisting(false)
      }
    }
    fetchExisting()
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setFile(selectedFile)
      setError(null)
      setSuccess(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await resumeAPI.upload(file)
      setSuccess(true)
      setResumeData({
        structuredData: response.resume.structuredData,
        fileName: response.resume.fileName,
      })
      setExistingResume(null) // Clear existing to show new data
      setFile(null)
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to upload resume. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
  }

  // Get display data from either new upload or existing resume
  const displayData: ParsedResume | null = resumeData?.structuredData || existingResume?.structured_json

  if (loadingExisting) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-electric-400 animate-spin mx-auto mb-4" />
          <p className="text-surface-400">Loading your resume...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold text-white mb-2">Resume Upload</h1>
          <p className="text-surface-400">
            Upload your resume and let AI extract structured information for job matching
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6 animate-fade-up">
            {/* Upload Card */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Upload className="w-5 h-5 text-electric-400" />
                <h2 className="text-xl font-semibold text-white">Upload Resume</h2>
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${file ? 'active' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  {file ? (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-electric-500/20 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-electric-400" />
                      </div>
                      <p className="text-white font-medium mb-1">{file.name}</p>
                      <p className="text-sm text-surface-400 mb-4">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          clearFile()
                        }}
                        className="text-coral-400 hover:text-coral-300 text-sm font-medium flex items-center gap-1 mx-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                        <Upload className={`w-8 h-8 ${isDragActive ? 'text-electric-400' : 'text-surface-500'}`} />
                      </div>
                      <p className="text-white font-medium mb-1">
                        {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                      </p>
                      <p className="text-sm text-surface-400 mb-4">
                        or click to browse files
                      </p>
                      <p className="text-xs text-surface-500">
                        PDF format only, up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-coral-500/10 border border-coral-500/30 flex items-center gap-3 text-coral-400 animate-scale-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mt-4 p-4 rounded-xl bg-mint-500/10 border border-mint-500/30 flex items-center gap-3 text-mint-400 animate-scale-in">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">Resume uploaded and parsed successfully!</span>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Resume with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Upload & Analyze
                  </>
                )}
              </button>

              {uploading && (
                <div className="mt-4">
                  <div className="progress-bar">
                    <div className="progress-bar-fill animate-pulse" style={{ width: '70%' }} />
                  </div>
                  <p className="text-sm text-surface-400 text-center mt-2">
                    AI is extracting information from your resume...
                  </p>
                </div>
              )}
            </div>

            {/* Features Card */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">What AI Extracts</h3>
              <div className="space-y-3">
                {[
                  { icon: User, label: 'Personal Information', desc: 'Name, email, phone, location' },
                  { icon: Wrench, label: 'Technical Skills', desc: 'Programming languages, frameworks, tools' },
                  { icon: Briefcase, label: 'Work Experience', desc: 'Companies, roles, descriptions' },
                  { icon: GraduationCap, label: 'Education', desc: 'Degrees, institutions, GPA' },
                  { icon: FolderGit2, label: 'Projects', desc: 'Personal and professional projects' },
                  { icon: Award, label: 'Certifications', desc: 'Professional certifications' },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-electric-500/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-electric-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{feature.label}</p>
                      <p className="text-surface-400 text-xs">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parsed Resume Preview */}
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            {displayData ? (
              <div className="glass-card overflow-hidden">
                {/* Preview Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-mint-400" />
                      <h2 className="text-xl font-semibold text-white">Parsed Resume</h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-mint-500/20 text-mint-400 text-sm font-medium">
                      AI Analyzed
                    </span>
                  </div>
                </div>

                {/* Section Tabs */}
                <div className="flex border-b border-white/10 overflow-x-auto">
                  {['overview', 'experience', 'education', 'skills', 'projects'].map((section) => (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        activeSection === section
                          ? 'text-electric-400 border-b-2 border-electric-400'
                          : 'text-surface-400 hover:text-white'
                      }`}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Section Content */}
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  {activeSection === 'overview' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-500/20 to-coral-500/20 border border-white/10 flex items-center justify-center text-2xl font-bold text-white">
                          {(displayData.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{displayData.name || 'Unknown'}</h3>
                          {displayData.headline && (
                            <p className="text-electric-400 text-sm">{displayData.headline}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-1">
                            {displayData.email && (
                              <p className="text-surface-400 flex items-center gap-1 text-sm">
                                <Mail className="w-3 h-3" /> {displayData.email}
                              </p>
                            )}
                            {displayData.phone && (
                              <p className="text-surface-400 flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" /> {displayData.phone}
                              </p>
                            )}
                            {displayData.location && (
                              <p className="text-surface-400 flex items-center gap-1 text-sm">
                                <MapPin className="w-3 h-3" /> {displayData.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {displayData.summary && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-surface-400 mb-2">Summary</h4>
                          <p className="text-white text-sm leading-relaxed">{displayData.summary}</p>
            </div>
          )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <p className="text-2xl font-bold text-electric-400">
                            {displayData.skills?.length || 0}
                          </p>
                          <p className="text-sm text-surface-400">Skills</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <p className="text-2xl font-bold text-coral-400">
                            {displayData.experience?.length || 0}
                          </p>
                          <p className="text-sm text-surface-400">Experience</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <p className="text-2xl font-bold text-mint-400">
                            {displayData.education?.length || 0}
                          </p>
                          <p className="text-sm text-surface-400">Education</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                          <p className="text-2xl font-bold text-purple-400">
                            {displayData.projects?.length || 0}
                          </p>
                          <p className="text-sm text-surface-400">Projects</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'experience' && (
                    <div className="space-y-4 animate-fade-in">
                      {displayData.experience && displayData.experience.length > 0 ? (
                        displayData.experience.map((exp, index) => (
                          <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-white">{exp.role}</h4>
                                <p className="text-electric-400 text-sm">{exp.company}</p>
                                {exp.location && (
                                  <p className="text-surface-500 text-xs flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" /> {exp.location}
                                  </p>
                                )}
                              </div>
                              {(exp.duration || exp.startDate) && (
                                <span className="text-xs text-surface-400 bg-white/5 px-2 py-1 rounded">
                                  {exp.duration || `${exp.startDate} - ${exp.endDate || 'Present'}`}
                                </span>
                              )}
                            </div>
                            {exp.description && (
                              <p className="text-surface-300 text-sm mt-2">{exp.description}</p>
                            )}
                            {exp.highlights && exp.highlights.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {exp.highlights.map((h, i) => (
                                  <li key={i} className="text-surface-400 text-sm flex items-start gap-2">
                                    <span className="text-electric-400 mt-1">•</span> {h}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {exp.technologies && exp.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {exp.technologies.map((tech, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded bg-electric-500/10 text-electric-400 text-xs">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-surface-400 text-center py-8">No experience data found</p>
                      )}
                    </div>
                  )}

                  {activeSection === 'education' && (
                    <div className="space-y-4 animate-fade-in">
                      {displayData.education && displayData.education.length > 0 ? (
                        displayData.education.map((edu, index) => (
                          <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-white">{edu.institution}</h4>
                                {edu.degree && (
                                  <p className="text-electric-400 text-sm">
                                    {edu.degree} {edu.field && `in ${edu.field}`}
                                  </p>
                                )}
                                {edu.location && (
                                  <p className="text-surface-500 text-xs flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" /> {edu.location}
                                  </p>
                                )}
                              </div>
                              {(edu.duration || edu.startDate) && (
                                <span className="text-xs text-surface-400 bg-white/5 px-2 py-1 rounded">
                                  {edu.duration || `${edu.startDate} - ${edu.endDate || 'Present'}`}
                                </span>
                              )}
                            </div>
                            {edu.gpa && (
                              <p className="text-surface-400 text-sm mt-1">GPA: {edu.gpa}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-surface-400 text-center py-8">No education data found</p>
                      )}
                    </div>
                  )}

                  {activeSection === 'skills' && (
                    <div className="animate-fade-in">
                      {displayData.skills && displayData.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {displayData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="skill-tag"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-surface-400 text-center py-8">No skills data found</p>
                      )}
                      
                      {displayData.languages && displayData.languages.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <h4 className="text-sm font-semibold text-surface-400 mb-3">Languages</h4>
                          <div className="flex flex-wrap gap-2">
                            {displayData.languages.map((lang, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
            </div>
          )}

                  {activeSection === 'projects' && (
                    <div className="space-y-4 animate-fade-in">
                      {displayData.projects && displayData.projects.length > 0 ? (
                        displayData.projects.map((project, index) => (
                          <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-white">{project.name}</h4>
                              {project.url && (
                                <a 
                                  href={project.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-electric-400 text-sm hover:underline"
                                >
                                  View →
                                </a>
                              )}
                            </div>
                            {project.description && (
                              <p className="text-surface-300 text-sm">{project.description}</p>
                            )}
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {project.technologies.map((tech, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded bg-electric-500/10 text-electric-400 text-xs">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-surface-400 text-center py-8">No projects data found</p>
                      )}
                      
                      {displayData.certifications && displayData.certifications.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <h4 className="text-sm font-semibold text-surface-400 mb-3">Certifications</h4>
                          <div className="space-y-2">
                            {displayData.certifications.map((cert, index) => (
                              <div key={index} className="p-3 rounded-lg bg-white/5">
                                <p className="text-white font-medium text-sm">{cert.name}</p>
                                <p className="text-surface-400 text-xs">{cert.issuer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                  <Eye className="w-10 h-10 text-surface-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Resume Preview</h3>
                <p className="text-surface-400 max-w-sm mx-auto">
                  Upload your resume to see AI-extracted information and get ready for job matching
                </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
