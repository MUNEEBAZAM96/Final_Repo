# Habit Tracker Frontend

React frontend application for testing the Habit Tracker API.

## Features

- User authentication (Login/Register)
- Habit CRUD operations
- Modern, responsive UI
- Protected routes
- Error handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API URL (optional):
Create a `.env` file or update `VITE_API_URL` in `.env`:
```
VITE_API_URL=http://localhost:3000/api
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Usage

1. Start the backend API server first (port 3000)
2. Start this frontend (default port 5173)
3. Register a new account or login
4. Create and manage your habits

## Project Structure

```
src/
  components/     # React components
  contexts/       # React contexts (Auth)
  services/      # API service layer
  App.tsx        # Main app component with routing
```
