M Dawood Javed 23i-3038
Muneeb Ur Rehman 23i-0100
M Hashir 23i-3047
Uzair Majeed 23i-3063

AI-Powered Resume Parser, Job Matcher & Interview Preparation Platform
A complete full-stack AI-powered application that analyzes resumes, extracts structured information, matches them to jobs, and generates interview questions using Gemini Pro.

 Features
 1. AI Resume Parsing
Upload PDF resumes


Stored securely in Cloudinary


Extract text using pdf-parse


Send extracted text to Gemini Pro


Get structured fields:


Name


Skills


Experience


Education


Projects


Summary


Save parsed results in MongoDB



 3. Interview Preparation
Enter a job role + company + technologies


Gemini Pro generates:


Behavioral questions


Technical questions


System design questions


Suggested answers


Hints and tips


Stored in MongoDB for later review



 4. Dashboard Analytics
Skill visualization


Job match history


Interview prep library


Resume progress tracking



5. Authentication
JWT-based Auth


Password hashing using bcrypt


Protected routes (Bearer token)



Tech Stack
Frontend
React


Backend
Node.js + Express


TypeScript


MongoDB (Mongoose)


Cloudinary (file uploads)


Gemini Pro API


pdf-parse


bcrypt


jsonwebtoken



📁 Folder Structure
project-root/
│
├── Backend/
│   ├── src/
│   │   ├── Controllers/
│   │   ├── Router/
│   │   ├── services/
│   │   ├── Middleware/
│   │   └── utils/
│   └── server.ts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── services/
│   └── ...
│
└── README.md


 Backend Setup
1️⃣ Install dependencies
cd Backend
npm install

2️⃣ Create .env inside Backend/
# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=KAJSDFBKJBASASLKDNF
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Bcrypt
BCRYPT_ROUNDS=12

# Cloudinary
CLOUDINARY_CLOUD_NAME=dibgebv9u
CLOUDINARY_API_KEY=887232855367279
CLOUDINARY_API_SECRET=xZy36_ZEzqgUnJ2PaS5PcqL4bUM

# Gemini API
GEMINI_API_KEY=AIzaSyAn...

3️⃣ Run backend
npm run dev


 Frontend Setup
cd frontend
npm install

Create frontend/.env
VITE_API_URL=http://localhost:3000/api

Run the app:
npm run dev


 API Endpoints
Auth
Method
Route
Description
POST
/api/auth/register
Register user
POST
/api/auth/login
Login
GET
/api/auth/me
Get user info


Resume
Method
Route
Description
POST
/api/resume/upload
Upload PDF → parse → save
GET
/api/resume
Get user's parsed resume


Jobs
Method
Route
Description
POST
/api/jobs/match
AI job matching
GET
/api/jobs/matches
Get saved matches
PATCH
/api/jobs/:id/apply
Mark job as applied


Interview
Method
Route
Description
POST
/api/interview/generate
Get interview questions
GET
/api/interview
List saved interview preps
GET
/api/interview/:id
View one prep


Database (MongoDB)
Collections:
users


resumes


job_matches


interviews


Each user maintains their own resume, matches, and interview history.

Cloudinary Flow
User uploads PDF


File stored in Cloudinary


URL passed to backend


Backend downloads file → extracts text → sends to Gemini Pro


Parsed result saved in MongoDB



Gemini Pro Usage
Used for:
Resume parsing


Job matching


Interview question generation


Models:
gemini-1.5-pro recommended



Deployment
Backend
Deploy on:
Render


Railway


DigitalOcean


Frontend 
react
MongoDB
Use MongoDB Atlas (cloud-hosted).

