import app from './server.ts'
import { env } from '../env.ts'
import { connectDB } from './db/connection.ts'

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB()

    // Start Express server
    app.listen(env.PORT, () => {
      console.log(`🚀 Server is running on port ${env.PORT}`)
      console.log(`📍 API: http://localhost:${env.PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
