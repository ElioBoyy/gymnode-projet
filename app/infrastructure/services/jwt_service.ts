import jwt from 'jsonwebtoken'
import { inject } from '@adonisjs/core'

export interface JwtPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

@inject()
export class JwtService {
  private readonly secretKey: string =
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
  private readonly expiresIn: string = process.env.JWT_EXPIRES_IN || '24h'

  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn } as jwt.SignOptions)
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secretKey) as JwtPayload
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload
    } catch (error) {
      return null
    }
  }
}
