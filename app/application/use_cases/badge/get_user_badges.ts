import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { UserBadgeRepository } from '../../../domain/repositories/user_badge_repository.js'

export interface GetUserBadgesRequest {
  userId: string
}

export interface UserBadgeDetails {
  id: string
  name: string
  description: string
  iconUrl: string
  earnedAt: Date
  metadata?: Record<string, any>
}

export interface GetUserBadgesResponse {
  badges: UserBadgeDetails[]
}

export class GetUserBadgesUseCase {
  constructor(
    private badgeRepository: BadgeRepository,
    private userBadgeRepository: UserBadgeRepository
  ) {}

  async execute(request: GetUserBadgesRequest): Promise<GetUserBadgesResponse> {
    const userBadges = await this.userBadgeRepository.findByUserId(request.userId)

    const badgesWithDetails = await Promise.all(
      userBadges.map(async (userBadge) => {
        const badge = await this.badgeRepository.findById(userBadge.badgeId)

        if (!badge) {
          return null
        }

        return {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          iconUrl: badge.iconUrl,
          earnedAt: userBadge.earnedAt,
          ...(userBadge.metadata && { metadata: userBadge.metadata }),
        }
      })
    )

    const validBadges = badgesWithDetails.filter(
      (badge): badge is UserBadgeDetails => badge !== null
    )

    return {
      badges: validBadges,
    }
  }
}
