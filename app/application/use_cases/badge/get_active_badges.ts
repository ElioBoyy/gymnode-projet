import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { BadgeRule } from '../../../domain/entities/badge.js'

export interface BadgeSummary {
  id: string
  name: string
  description: string
  iconUrl: string
  rules: BadgeRule[]
}

export interface GetActiveBadgesResponse {
  badges: BadgeSummary[]
}

export class GetActiveBadgesUseCase {
  constructor(private badgeRepository: BadgeRepository) {}

  async execute(): Promise<GetActiveBadgesResponse> {
    const badges = await this.badgeRepository.findActive()

    const badgeSummaries: BadgeSummary[] = badges.map((badge) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      rules: badge.rules,
    }))

    return {
      badges: badgeSummaries,
    }
  }
}
