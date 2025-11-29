import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'
import { env } from '../../env.ts'

// GridFS bucket instance for file storage
let gridFSBucket: GridFSBucket | null = null

/**
 * Connect to MongoDB and initialize GridFS
 * Database: Resume_Builder_Schema
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: 'Resume_Builder_Schema', // Explicit database name
    })
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📦 Database: Resume_Builder_Schema`)

    // Initialize GridFS bucket for resume PDFs
    const db = conn.connection.db
    if (db) {
      gridFSBucket = new GridFSBucket(db, {
        bucketName: 'resumes', // Collection prefix: resumes.files, resumes.chunks
      })
      console.log('📁 GridFS initialized for resume storage')
    }

  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

/**
 * Get GridFS bucket instance
 * Use this for uploading/downloading PDF resumes
 */
export const getGridFSBucket = (): GridFSBucket => {
  if (!gridFSBucket) {
    throw new Error('GridFS not initialized. Call connectDB() first.')
  }
  return gridFSBucket
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected')
  gridFSBucket = null
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err)
})

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected')
  const db = mongoose.connection.db
  if (db) {
    gridFSBucket = new GridFSBucket(db, {
      bucketName: 'resumes',
    })
  }
})

export default connectDB
