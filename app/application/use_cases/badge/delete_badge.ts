import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserBadgeRepository } from '../../../domain/repositories/user_badge_repository.js'

export interface DeleteBadgeRequest {
  badgeId: string
  deletedBy: string
}

export interface DeleteBadgeResponse {
  success: boolean
  message: string
}

export class DeleteBadgeUseCase {
  constructor(
    private badgeRepository: BadgeRepository,
    private userRepository: UserRepository,
    private userBadgeRepository: UserBadgeRepository
  ) {}

  async execute(request: DeleteBadgeRequest): Promise<DeleteBadgeResponse> {
    const user = await this.userRepository.findById(request.deletedBy)
    if (!user || !user.isSuperAdmin()) {
      throw new Error('Only super administrators can delete badges')
    }

    const badge = await this.badgeRepository.findById(request.badgeId)

    if (!badge) {
      throw new Error('Badge not found')
    }

    const userBadges = await this.userBadgeRepository.findByBadgeId(request.badgeId)

    if (userBadges.length > 0) {
      throw new Error('Cannot delete badge that has been awarded to users')
    }

    await this.badgeRepository.delete(request.badgeId)

    return {
      success: true,
      message: 'Badge deleted successfully',
    }
  }
}
