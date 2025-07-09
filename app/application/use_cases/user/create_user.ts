import { ObjectId } from 'mongodb'
import { inject } from '@adonisjs/core'
import { User, UserRole } from '../../../domain/entities/user.js'
import { MongoDBUserRepository } from '../../../infrastructure/repositories/mongodb_user_repository.js'
import { AdonisPasswordService } from '../../../infrastructure/services/adonis_password_service.js'

export interface CreateUserRequest {
  email: string
  password: string
  role: UserRole
}

export interface CreateUserResponse {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
}

@inject()
export class CreateUserUseCase {
  constructor(
    private userRepository: MongoDBUserRepository,
    private passwordService: AdonisPasswordService
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const existingUser = await this.userRepository.findByEmail(request.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    const hashedPassword = await this.passwordService.hash(request.password)

    const user = new User({
      id: new ObjectId().toString(),
      email: request.email,
      password: hashedPassword,
      role: request.role,
    })

    await this.userRepository.save(user)

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    }
  }
}
