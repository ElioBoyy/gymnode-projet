import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { UserRole } from '../domain/entities/user.js'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { roles: UserRole[] }) {
    const userRole = ctx.auth.user?.role

    if (!userRole) {
      return ctx.response.status(401).json({
        status: 'error',
        message: 'Authentication required',
      })
    }

    if (!options.roles.includes(userRole as UserRole)) {
      return ctx.response.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      })
    }

    await next()
  }
}
