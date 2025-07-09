import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    auth: {
      user: {
        id: string
        email: string
        role: string
        isActive: boolean
      }
    }
  }
}

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const authHeader = ctx.request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.response.status(401).json({
        status: 'error',
        message: 'Authorization token required',
      })
    }

    const token = authHeader.substring(7)

    try {
      const secretKey = process.env.JWT_SECRET as string
      const payload = jwt.verify(token, secretKey) as any

      ctx.auth = {
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          isActive: true,
        },
      }

      await next()
    } catch (error) {
      return ctx.response.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
      })
    }
  }
}
