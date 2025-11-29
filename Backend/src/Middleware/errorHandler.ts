import type { Request, Response, NextFunction } from 'express'
import { isDev } from '../../env.ts'

export interface CustomError extends Error {
  status?: number
  code?: string
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack)

  // Default error
  let status = err.status || 500
  let message = err.message || 'Internal Server Error'

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400
    message = err.message || 'Validation Error'
  }

  if (err.name === 'UnauthorizedError') {
    status = 401
    message = 'Unauthorized'
  }

  // Handle MongoDB duplicate key error
  if (err.name === 'MongoServerError' && err.code === '11000') {
    status = 400
    message = 'Duplicate entry. This record already exists.'
  }

  // Handle MongoDB CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    status = 400
    message = 'Invalid ID format'
  }

  res.status(status).json({
    error: message,
    ...(isDev() && {
      stack: err.stack,
      details: err.message,
    }),
  })
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`) as CustomError
  error.status = 404
  next(error)
}
