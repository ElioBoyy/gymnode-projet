import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface ActivateUserRequest {
  userId: string
  activatedBy: string
  activate: boolean
}

export interface ActivateUserResponse {
  success: boolean
  user: {
    id: string
    email: string
    role: UserRole
    isActive: boolean
    updatedAt: Date
  }
  message: string
}

export class ActivateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: ActivateUserRequest): Promise<ActivateUserResponse> {
    const activatingUser = await this.userRepository.findById(request.activatedBy)

    if (!activatingUser) {
      throw new Error('Activating user not found')
    }

    if (!activatingUser.isSuperAdmin()) {
      throw new Error('Only super administrators can activate/deactivate users')
    }

    const targetUser = await this.userRepository.findById(request.userId)

    if (!targetUser) {
      throw new Error('User not found')
    }

    if (!request.activate && targetUser.isSuperAdmin() && targetUser.id !== activatingUser.id) {
      throw new Error('Cannot deactivate another super administrator')
    }

    const updatedUser = request.activate ? targetUser.activate() : targetUser.deactivate()

    await this.userRepository.save(updatedUser)

    const action = request.activate ? 'activated' : 'deactivated'

    return {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt,
      },
      message: `User ${action} successfully`,
    }
  }
}
