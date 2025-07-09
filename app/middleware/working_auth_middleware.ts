import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

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

export default class WorkingAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    console.log('WorkingAuthMiddleware called')

    const authHeader = ctx.request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.response.status(401).json({
        status: 'error',
        message: 'Authorization token required',
      })
    }

    const token = authHeader.substring(7)

    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid token format')
      }

      const payload = JSON.parse(atob(parts[1]))

      if (!payload || !payload.userId) {
        throw new Error('Invalid payload')
      }

      ctx.auth = {
        user: {
          id: payload.userId,
          email: payload.email || 'unknown@example.com',
          role: payload.role || 'CLIENT',
          isActive: true,
        },
      }

      console.log('Auth context set successfully')
      await next()
    } catch (error) {
      console.log('Auth error:', error)
      return ctx.response.status(401).json({
        status: 'error',
        message: 'Invalid token',
      })
    }
  }
}
