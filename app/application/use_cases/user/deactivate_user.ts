import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface DeactivateUserRequest {
  userId: string
  adminId: string
}

export interface DeactivateUserResponse {
  success: boolean
  message: string
}

export class DeactivateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: DeactivateUserRequest): Promise<DeactivateUserResponse> {
    const admin = await this.userRepository.findById(request.adminId)
    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only super admins can deactivate users')
    }

    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    if (!user.isActive) {
      return {
        success: false,
        message: 'User is already deactivated',
      }
    }

    const deactivatedUser = user.deactivate()
    await this.userRepository.update(deactivatedUser)

    return {
      success: true,
      message: 'User deactivated successfully',
    }
  }
}
