# Frontend Setup Guide

## Quick Start

### 1. Start the Backend API
```bash
cd api-design-node-v5
npm run dev
```
The API should run on `http://localhost:3000`

### 2. Start the Frontend
```bash
cd frontend
npm install  # If not already done
npm run dev
```
The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

### 3. Test the Application

1. Open `http://localhost:5173` in your browser
2. You'll be redirected to `/login`
3. Click "Register" to create a new account
4. After registration/login, you'll see the Habits page
5. Create, edit, and delete habits

## Features

- ✅ User Registration & Login
- ✅ JWT Token Authentication
- ✅ Protected Routes
- ✅ Habit CRUD Operations
- ✅ Modern, Responsive UI
- ✅ Error Handling

## API Configuration

The frontend is configured to connect to `http://localhost:3000/api` by default.

To change this, edit `frontend/.env`:
```
VITE_API_URL=http://your-api-url/api
```

## Troubleshooting

### CORS Errors
Make sure the backend has CORS enabled (it should already be configured).

### Authentication Issues
- Check that the backend JWT_SECRET is set
- Verify tokens are being stored in localStorage
- Check browser console for errors

### API Connection Issues
- Verify the backend is running on port 3000
- Check the API URL in `.env` file
- Check browser network tab for failed requests

## Project Structure

```
frontend/
  src/
    components/      # React components
      Login.tsx      # Login page
      Register.tsx   # Registration page
      Habits.tsx     # Main habits management page
      ProtectedRoute.tsx  # Route protection
    contexts/        # React contexts
      AuthContext.tsx  # Authentication state management
    services/        # API services
      api.ts         # Axios configuration and API calls
    App.tsx         # Main app with routing
    main.tsx        # Entry point
```

## Development

- Frontend uses Vite for fast development
- Hot Module Replacement (HMR) enabled
- TypeScript for type safety
- React Router for navigation


