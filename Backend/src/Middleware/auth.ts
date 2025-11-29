import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../db/models/index.ts'
import { env } from '../../env.ts'

// AuthenticatedRequest type - user is guaranteed to exist
export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email?: string
    fullName?: string
  }
}

interface JwtPayload {
  userId: string
  iat: number
  exp: number
}

// Middleware function - verifies JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    // Verify token
    let decoded: JwtPayload
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Find user
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Attach user info to request
    ;(req as any).user = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

// Alias for backward compatibility
export const authenticate = authenticateToken
