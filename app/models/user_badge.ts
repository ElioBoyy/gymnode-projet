import { MongoDBUserBadgeRepository } from '../infrastructure/repositories/mongodb_user_badge_repository.js'

export default class UserBadge {
  declare id: string
  declare userId: string
  declare badgeId: string
  declare earnedAt: Date
  declare relatedChallengeId?: string
  declare metadata?: Record<string, any>

  constructor(data: {
    id: string
    userId: string
    badgeId: string
    earnedAt: Date
    relatedChallengeId?: string
    metadata?: Record<string, any>
  }) {
    this.id = data.id
    this.userId = data.userId
    this.badgeId = data.badgeId
    this.earnedAt = data.earnedAt
    this.relatedChallengeId = data.relatedChallengeId
    this.metadata = data.metadata
  }

  static async find(id: string): Promise<UserBadge | null> {
    const repository = new MongoDBUserBadgeRepository()
    const domainUserBadge = await repository.findById(id)

    if (!domainUserBadge) {
      return null
    }

    return new UserBadge({
      id: domainUserBadge.id,
      userId: domainUserBadge.userId,
      badgeId: domainUserBadge.badgeId,
      earnedAt: domainUserBadge.earnedAt,
      relatedChallengeId: domainUserBadge.relatedChallengeId,
      metadata: domainUserBadge.metadata,
    })
  }

  static async findBy(field: string, value: any): Promise<UserBadge[]> {
    const repository = new MongoDBUserBadgeRepository()
    let domainUserBadges: any[] = []

    if (field === 'userId') {
      domainUserBadges = await repository.findByUserId(value)
    } else if (field === 'badgeId') {
      domainUserBadges = await repository.findByBadgeId(value)
    }

    return domainUserBadges.map(
      (domainUserBadge) =>
        new UserBadge({
          id: domainUserBadge.id,
          userId: domainUserBadge.userId,
          badgeId: domainUserBadge.badgeId,
          earnedAt: domainUserBadge.earnedAt,
          relatedChallengeId: domainUserBadge.relatedChallengeId,
          metadata: domainUserBadge.metadata,
        })
    )
  }

  static async findByUserId(userId: string): Promise<UserBadge[]> {
    return this.findBy('userId', userId)
  }

  static async findByBadgeId(badgeId: string): Promise<UserBadge[]> {
    return this.findBy('badgeId', badgeId)
  }
}
