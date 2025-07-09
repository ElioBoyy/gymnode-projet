import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { BadgeRule } from '../../../domain/entities/badge.js'

export interface GetBadgeByIdRequest {
  badgeId: string
}

export interface BadgeDetails {
  id: string
  name: string
  description: string
  iconUrl: string
  rules: BadgeRule[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GetBadgeByIdResponse {
  badge: BadgeDetails
}

export class GetBadgeByIdUseCase {
  constructor(private badgeRepository: BadgeRepository) {}

  async execute(request: GetBadgeByIdRequest): Promise<GetBadgeByIdResponse> {
    const badge = await this.badgeRepository.findById(request.badgeId)

    if (!badge) {
      throw new Error('Badge not found')
    }

    const badgeDetails: BadgeDetails = {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      rules: badge.rules,
      isActive: badge.isActive,
      createdAt: badge.createdAt,
      updatedAt: badge.updatedAt,
    }

    return {
      badge: badgeDetails,
    }
  }
}
