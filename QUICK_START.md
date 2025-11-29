# Quick Start Guide

Get your AI-powered resume parser and job matcher running in 10 minutes!

## Step 1: Supabase Setup (5 minutes)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Wait for the project to initialize
4. Go to **SQL Editor** → **New Query**
5. Copy and paste the contents of `Backend/SUPABASE_SETUP.sql`
6. Click **Run**
7. Go to **Storage** → **Create Bucket**
   - Name: `resumes`
   - Public: ✅ Yes
   - Click **Create**
8. Go to **Settings** → **API**
   - Copy your **Project URL** (SUPABASE_URL)
   - Copy your **anon public** key (SUPABASE_ANON_KEY)
   - Copy your **service_role** key (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

## Step 2: OpenAI Setup (2 minutes)

1. Go to https://platform.openai.com
2. Sign up or log in
3. Go to **API Keys**
4. Click **Create new secret key**
5. Copy the key (you won't see it again!)

## Step 3: Backend Setup (2 minutes)

```bash
cd Backend
npm install
```

Create `.env` file:

```env
APP_STAGE=dev
PORT=3000
SUPABASE_URL=your_supabase_url_from_step_1
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_step_1
SUPABASE_ANON_KEY=your_anon_key_from_step_1
OPENAI_API_KEY=your_openai_key_from_step_2
FRONTEND_URL=http://localhost:5173
```

Start backend:

```bash
npm run dev
```

You should see: `✅ Supabase connected successfully` and `🚀 Server is running on port 3000`

## Step 4: Frontend Setup (1 minute)

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

Start frontend:

```bash
npm run dev
```

Open http://localhost:5173 in your browser!

## Step 5: Test It Out!

1. **Register** a new account
2. **Upload** a PDF resume
3. **Discover Jobs** - Click "Discover Jobs" button
4. **Generate Interview Prep** - Fill in company, role, and technologies

## Troubleshooting

### "Supabase connection error"
- Check your SUPABASE_URL and keys in `.env`
- Make sure you ran the SQL setup script

### "OpenAI API error"
- Check your OPENAI_API_KEY in `.env`
- Make sure you have credits in your OpenAI account

### "No jobs found"
- This is normal if SERPAPI_KEY is not set
- Jobs will be empty but the app will still work
- To enable job scraping, get a free SerpAPI key from https://serpapi.com

### "Resume upload fails"
- Make sure the Storage bucket `resumes` exists in Supabase
- Check that it's set to public

## Next Steps

- Add your SerpAPI key for real job scraping
- Customize the UI with your branding
- Deploy to production (Vercel + Render)

Happy coding! 🚀

