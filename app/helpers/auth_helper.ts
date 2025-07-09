import { HttpContext } from '@adonisjs/core/http'

export interface AuthUser {
  id: string
  email: string
  role: string
}

export function authenticateRequest(ctx: HttpContext): AuthUser | null {
  const authHeader = ctx.request.header('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = JSON.parse(atob(parts[1]))

    // Support both 'id' and 'userId' fields in JWT payload
    const userId = payload.id || payload.userId
    if (!payload || !userId) {
      return null
    }

    return {
      id: userId,
      email: payload.email || 'unknown@example.com',
      role: payload.role || 'CLIENT',
    }
  } catch (error) {
    return null
  }
}

export function requireAuth(ctx: HttpContext): AuthUser {
  const user = authenticateRequest(ctx)

  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

export function requireRole(ctx: HttpContext, allowedRoles: string[]): AuthUser {
  const user = requireAuth(ctx)

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }

  return user
}

export function requireAdmin(ctx: HttpContext): AuthUser {
  return requireRole(ctx, ['super_admin', 'SUPER_ADMIN'])
}

export function requireGymOwner(ctx: HttpContext): AuthUser {
  return requireRole(ctx, ['gym_owner', 'GYM_OWNER'])
}

export function requireClient(ctx: HttpContext): AuthUser {
  return requireRole(ctx, ['client', 'CLIENT'])
}
