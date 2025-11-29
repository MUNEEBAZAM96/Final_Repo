# AI-Powered Resume Parser, Job Matcher & Interview Prep

A comprehensive career preparation platform that uses AI to parse resumes, match jobs, and generate personalized interview questions.

## 🚀 Features

- **Resume Parsing**: Upload PDF resumes and extract structured data using GPT-4o
- **Job Discovery**: Automatically discover and match jobs based on your skills
- **AI-Powered Matching**: Get match scores and explanations for each job
- **Interview Preparation**: Generate personalized interview questions based on company, role, and technologies
- **Dashboard Analytics**: View your skills, job matches, and preparation progress

## 🛠️ Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Recharts (for analytics)
- React Router

### Backend
- Node.js + Express
- TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- OpenAI GPT-4o
- pdf-parse (for PDF parsing)
- Puppeteer (for web scraping - optional)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI API key
- (Optional) SerpAPI key for job scraping

## 🔧 Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the SQL from `Backend/SUPABASE_SETUP.sql`
3. Go to Storage and create a bucket named `resumes` (public: true)
4. Get your Supabase URL and keys from Settings > API

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
APP_STAGE=dev
PORT=3000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Optional: SerpAPI for job scraping
SERPAPI_KEY=your_serpapi_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

Run the frontend:

```bash
npm run dev
```

## 📁 Project Structure

```
├── Backend/
│   ├── src/
│   │   ├── Controllers/      # Route controllers
│   │   ├── services/         # Business logic (AI, parsing, etc.)
│   │   ├── Router/           # Express routes
│   │   ├── Middleware/      # Auth, validation, etc.
│   │   └── utils/            # Utilities (Supabase client, etc.)
│   └── SUPABASE_SETUP.sql    # Database setup SQL
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts (Auth)
│   │   └── services/         # API service layer
│   └── ...
└── README.md
```

## 🎯 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Resume
- `POST /api/resume/upload` - Upload and parse resume (PDF)
- `GET /api/resume` - Get user's parsed resume

### Jobs
- `POST /api/jobs/discover` - Discover and match jobs
- `GET /api/jobs/matches` - Get user's job matches
- `PATCH /api/jobs/:id/apply` - Mark job as applied

### Interview
- `POST /api/interview/generate` - Generate interview prep
- `GET /api/interview` - Get all interview preps
- `GET /api/interview/:id` - Get specific interview prep

## 🔐 Authentication

The app uses Supabase Auth with JWT tokens. Tokens are stored in localStorage and sent with each request via the `Authorization: Bearer <token>` header.

## 📝 Environment Variables

### Backend (.env)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - Your OpenAI API key
- `SERPAPI_KEY` - (Optional) SerpAPI key for job scraping
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## 🚢 Deployment

### Backend
Deploy to Render, Railway, or any Node.js hosting:
1. Set environment variables
2. Run `npm start`

### Frontend
Deploy to Vercel:
1. Connect your GitHub repo
2. Set `VITE_API_URL` environment variable
3. Deploy

### Supabase
Already hosted - no deployment needed!

## 📊 Database Schema

- `profiles` - User profiles
- `parsed_resumes` - Parsed resume data
- `job_matches` - Job matches with scores
- `interview_preps` - Generated interview preparations

See `Backend/SUPABASE_SETUP.sql` for full schema.

## 🎨 Features in Detail

### Resume Parsing
- Upload PDF resume
- Extract text using pdf-parse
- Use GPT-4o with function calling to structure data
- Store skills, experience, education, etc.

### Job Matching
- Scrape jobs using SerpAPI (or Puppeteer fallback)
- Match jobs with user's skills using GPT-4o
- Calculate match scores (0-100)
- Provide explanations for matches

### Interview Prep
- Research company and role
- Generate technical, behavioral, and system design questions
- Provide model answers and hints
- Tailored to specific technologies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC

## 🙏 Acknowledgments

- OpenAI for GPT-4o
- Supabase for backend infrastructure
- The open-source community






frontend/.env 

VITE_API_URL=http://localhost:3000/api



Backend/.env

# MongoDB Configuration
MONGODB_URI=mongodb+srv://Muneeb:BT05LlGZPPvzTbl9@cluster0.jhtmzqx.mongodb.net/Resume_Builder_Schema?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET= KAJSDFBKJBASASLKDNF
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Bcrypt Configuration
BCRYPT_ROUNDS=12

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dibgebv9u
CLOUDINARY_API_KEY=887232855367279
CLOUDINARY_API_SECRET=xZy36_ZEzqgUnJ2PaS5PcqL4bUM


GEMINI_API_KEY = AIzaSyAnXS9jqn0oksw3WUgWm0dc6UEmayTjzeQ