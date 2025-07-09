import { inject } from '@adonisjs/core'
import { MongoDBUserRepository } from '../../../infrastructure/repositories/mongodb_user_repository.js'
import { AdonisPasswordService } from '../../../infrastructure/services/adonis_password_service.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface AuthenticateUserRequest {
  email: string
  password: string
}

export interface AuthenticateUserResponse {
  id: string
  email: string
  role: UserRole
  isActive: boolean
}

@inject()
export class AuthenticateUserUseCase {
  constructor(
    private userRepository: MongoDBUserRepository,
    private passwordService: AdonisPasswordService
  ) {}

  async execute(request: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const user = await this.userRepository.findByEmail(request.email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated')
    }

    const isPasswordValid = await this.passwordService.verify(request.password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    }
  }
}
