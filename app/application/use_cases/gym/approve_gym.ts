import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { NotificationService } from '../../../domain/services/notification_service.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface ApproveGymRequest {
  gymId: string
  adminId: string
  approved: boolean
}

export interface ApproveGymResponse {
  success: boolean
  message: string
}

export class ApproveGymUseCase {
  constructor(
    private gymRepository: GymRepository,
    private userRepository: UserRepository,
    private notificationService: NotificationService
  ) {}

  async execute(request: ApproveGymRequest): Promise<ApproveGymResponse> {
    const admin = await this.userRepository.findById(request.adminId)
    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only super admins can approve gyms')
    }

    const gym = await this.gymRepository.findById(request.gymId)
    if (!gym) {
      throw new Error('Gym not found')
    }

    if (!gym.isPending()) {
      throw new Error('Gym is not pending approval')
    }

    const updatedGym = request.approved ? gym.approve() : gym.reject()
    await this.gymRepository.update(updatedGym)

    await this.notificationService.sendGymApprovalNotification(
      gym.ownerId,
      gym.name,
      request.approved
    )

    return {
      success: true,
      message: request.approved ? 'Gym approved successfully' : 'Gym rejected successfully',
    }
  }
}
