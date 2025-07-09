import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { CreateUserUseCase } from '../application/use_cases/user/create_user.js'
import { AuthenticateUserUseCase } from '../application/use_cases/user/authenticate_user.js'
import { UserRole } from '../domain/entities/user.js'
import { JwtService } from '../infrastructure/services/jwt_service.js'
import { MongoDBUserRepository } from '../infrastructure/repositories/mongodb_user_repository.js'
import { AdonisPasswordService } from '../infrastructure/services/adonis_password_service.js'

export default class AuthController {
  private userRepository = new MongoDBUserRepository()
  private passwordService = new AdonisPasswordService()
  private createUserUseCase = new CreateUserUseCase(this.userRepository, this.passwordService)
  private authenticateUserUseCase = new AuthenticateUserUseCase(
    this.userRepository,
    this.passwordService
  )
  private jwtService = new JwtService()

  async register({ request, response }: HttpContext) {
    try {
      const registerValidator = vine.compile(
        vine.object({
          email: vine.string().email(),
          password: vine.string().minLength(6),
          role: vine.enum(Object.values(UserRole)),
        })
      )

      const data = await request.validateUsing(registerValidator)

      const result = await this.createUserUseCase.execute(data)

      const token = this.jwtService.generateToken({
        userId: result.id,
        email: result.email,
        role: result.role,
      })

      return response.status(201).json({
        status: 'success',
        data: {
          user: {
            id: result.id,
            email: result.email,
            role: result.role,
            isActive: result.isActive,
            createdAt: result.createdAt,
          },
          token,
        },
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async login({ request, response }: HttpContext) {
    try {
      const loginValidator = vine.compile(
        vine.object({
          email: vine.string().email(),
          password: vine.string(),
        })
      )

      const data = await request.validateUsing(loginValidator)

      const result = await this.authenticateUserUseCase.execute(data)

      const token = this.jwtService.generateToken({
        userId: result.id,
        email: result.email,
        role: result.role,
      })

      return response.json({
        status: 'success',
        data: {
          user: {
            id: result.id,
            email: result.email,
            role: result.role,
          },
          token,
        },
      })
    } catch (error) {
      return response.status(401).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async logout({ response }: HttpContext) {
    try {
      return response.json({
        status: 'success',
        message: 'Successfully logged out',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Failed to logout',
      })
    }
  }

  async me({ request, response }: HttpContext) {
    try {
      const authHeader = request.header('authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      const token = authHeader.substring(7)

      try {
        const payload = this.jwtService.verifyToken(token)

        return response.json({
          status: 'success',
          data: {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
          },
        })
      } catch (error) {
        return response.status(401).json({
          status: 'error',
          message: 'Invalid or expired token',
        })
      }
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Failed to get user info',
      })
    }
  }
}
