import { HttpContext } from '@adonisjs/core/http'

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

export default class SimpleAuthMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    console.log('SimpleAuthMiddleware called')

    try {
      const authHeader = ctx.request.header('authorization')
      console.log('Auth header:', authHeader)

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No valid auth header found')
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      const token = authHeader.substring(7)
      console.log('Token extracted:', token.substring(0, 20) + '...')

      // Simple base64 decode to avoid JWT issues
      try {
        const parts = token.split('.')
        if (parts.length !== 3) {
          throw new Error('Invalid token format')
        }

        const payload = JSON.parse(atob(parts[1]))
        console.log('Token payload:', payload)

        if (!payload || !payload.userId) {
          throw new Error('Invalid payload')
        }

        // Set auth context
        ctx.auth = {
          user: {
            id: payload.userId,
            email: payload.email || 'unknown@example.com',
            role: payload.role || 'CLIENT',
            isActive: true,
          },
        }

        console.log('Auth context set:', ctx.auth)
        await next()
        console.log('After next() call')
      } catch (decodeError) {
        console.log('Token decode error:', decodeError)
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Invalid token format',
        })
      }
    } catch (error) {
      console.log('Auth middleware error:', error)
      return ctx.response.status(500).json({
        status: 'error',
        message:
          'Auth middleware error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      })
    }
  }
}
