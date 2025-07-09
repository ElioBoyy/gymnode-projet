import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { Badge, BadgeRule } from '../../../domain/entities/badge.js'

export interface UpdateBadgeRequest {
  badgeId: string
  updatedBy: string
  name?: string
  description?: string
  iconUrl?: string
  rules?: BadgeRule[]
  isActive?: boolean
}

export interface UpdateBadgeResponse {
  success: boolean
  badge: {
    id: string
    name: string
    description: string
    iconUrl: string
    rules: BadgeRule[]
    isActive: boolean
    updatedAt: Date
  }
}

export class UpdateBadgeUseCase {
  constructor(
    private badgeRepository: BadgeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: UpdateBadgeRequest): Promise<UpdateBadgeResponse> {
    const user = await this.userRepository.findById(request.updatedBy)
    if (!user || !user.isSuperAdmin()) {
      throw new Error('Only super administrators can update badges')
    }

    const badge = await this.badgeRepository.findById(request.badgeId)

    if (!badge) {
      throw new Error('Badge not found')
    }

    const updatedBadge = new Badge({
      id: badge.id,
      name: request.name || badge.name,
      description: request.description || badge.description,
      iconUrl: request.iconUrl || badge.iconUrl,
      rules: request.rules || badge.rules,
      isActive: request.isActive !== undefined ? request.isActive : badge.isActive,
      createdAt: badge.createdAt,
      updatedAt: new Date(),
    })

    await this.badgeRepository.save(updatedBadge)

    return {
      success: true,
      badge: {
        id: updatedBadge.id,
        name: updatedBadge.name,
        description: updatedBadge.description,
        iconUrl: updatedBadge.iconUrl,
        rules: updatedBadge.rules,
        isActive: updatedBadge.isActive,
        updatedAt: updatedBadge.updatedAt,
      },
    }
  }
}
