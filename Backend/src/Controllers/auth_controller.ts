import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthenticatedRequest } from '../Middleware/auth.ts'
import type { CustomError } from '../Middleware/errorHandler.ts'
import { User } from '../db/models/index.ts'
import { env } from '../../env.ts'

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

// ---------------------------
// REGISTER CONTROLLER
// ---------------------------
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, fullName } = req.body

    if (!email || !password) {
      const error = new Error('Email and password are required') as CustomError
      error.status = 400
      error.name = 'ValidationError'
      return next(error)
    }

    if (password.length < 6) {
      const error = new Error('Password must be at least 6 characters') as CustomError
      error.status = 400
      error.name = 'ValidationError'
      return next(error)
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      const error = new Error('User with this email already exists') as CustomError
      error.status = 400
      error.name = 'ValidationError'
      return next(error)
    }

    // Create new user
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName || email.split('@')[0],
    })

    // Generate token
    const token = generateToken(user._id.toString())

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    })
  } catch (error: any) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const customError = new Error('User with this email already exists') as CustomError
      customError.status = 400
      customError.name = 'ValidationError'
      return next(customError)
    }
    next(error)
  }
}

// ---------------------------
// LOGIN CONTROLLER
// ---------------------------
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      const error = new Error('Email and password are required') as CustomError
      error.status = 400
      error.name = 'ValidationError'
      return next(error)
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')

    if (!user) {
      const error = new Error('Invalid credentials') as CustomError
      error.status = 401
      error.name = 'UnauthorizedError'
      return next(error)
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      const error = new Error('Invalid credentials') as CustomError
      error.status = 401
      error.name = 'UnauthorizedError'
      return next(error)
    }

    // Generate token
    const token = generateToken(user._id.toString())

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        hasResume: !!user.activeResumeId,
      },
      token,
    })
  } catch (error) {
    next(error)
  }
}

// ---------------------------
// GET CURRENT USER
// ---------------------------
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id

    const user = await User.findById(userId)

    if (!user) {
      const error = new Error('User not found') as CustomError
      error.status = 404
      return next(error)
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        hasResume: !!user.activeResumeId,
        analytics: user.analytics,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
}
