import multer from 'multer'
import { Readable } from 'stream'
import type { Request } from 'express'
import { getGridFSBucket } from '../db/connection.ts'
import type { GridFSBucket, ObjectId } from 'mongodb'

/**
 * ============================================
 * GRIDFS UPLOAD MIDDLEWARE
 * ============================================
 * 
 * Handles PDF resume uploads to MongoDB GridFS.
 * Files are stored in the 'resumes' bucket:
 * - resumes.files → File metadata
 * - resumes.chunks → File binary data
 * 
 * Features:
 * - Memory storage for processing
 * - PDF-only file filtering
 * - 10MB size limit
 * - GridFS upload helper
 */

// Memory storage for initial file handling
const storage = multer.memoryStorage()

// File filter - only allow PDFs
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['application/pdf']
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'))
  }
}

// Configure multer for resume uploads
export const resumeUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

/**
 * Upload a file buffer to GridFS
 * @param buffer - File buffer
 * @param filename - Original filename
 * @param metadata - Additional metadata to store
 * @returns GridFS file ID
 */
export const uploadToGridFS = async (
  buffer: Buffer,
  filename: string,
  metadata?: Record<string, any>
): Promise<ObjectId> => {
  const bucket = getGridFSBucket()
  
  // Create a readable stream from buffer
  const readableStream = Readable.from(buffer)
  
  // Create upload stream with metadata
  const uploadStream = bucket.openUploadStream(filename, {
    contentType: 'application/pdf',
    metadata: {
      uploadedAt: new Date(),
      ...metadata,
    },
  })
  
  // Return promise that resolves with file ID
  return new Promise((resolve, reject) => {
    readableStream
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id)
      })
  })
}

/**
 * Download a file from GridFS
 * @param fileId - GridFS file ID
 * @returns File buffer
 */
export const downloadFromGridFS = async (fileId: ObjectId): Promise<Buffer> => {
  const bucket = getGridFSBucket()
  const downloadStream = bucket.openDownloadStream(fileId)
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    
    downloadStream
      .on('data', (chunk: Buffer) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
  })
}

/**
 * Delete a file from GridFS
 * @param fileId - GridFS file ID
 */
export const deleteFromGridFS = async (fileId: ObjectId): Promise<void> => {
  const bucket = getGridFSBucket()
  await bucket.delete(fileId)
}

/**
 * Get file info from GridFS
 * @param fileId - GridFS file ID
 * @returns File metadata or null if not found
 */
export const getGridFSFileInfo = async (fileId: ObjectId) => {
  const bucket = getGridFSBucket()
  const cursor = bucket.find({ _id: fileId })
  const files = await cursor.toArray()
  return files[0] || null
}

export default resumeUpload

