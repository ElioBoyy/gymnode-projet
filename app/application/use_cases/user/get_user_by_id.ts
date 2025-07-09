import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface GetUserByIdRequest {
  userId: string
}

export interface UserDetails {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GetUserByIdResponse {
  user: UserDetails
}

export class GetUserByIdUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    const user = await this.userRepository.findById(request.userId)

    if (!user) {
      throw new Error('User not found')
    }

    const userDetails: UserDetails = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return {
      user: userDetails,
    }
  }
}
