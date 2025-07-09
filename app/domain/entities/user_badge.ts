export class UserBadge {
  public readonly id: string
  public readonly userId: string
  public readonly badgeId: string
  public readonly earnedAt: Date
  public readonly relatedChallengeId?: string
  public readonly metadata?: Record<string, any>

  constructor(props: {
    id: string
    userId: string
    badgeId: string
    earnedAt?: Date
    relatedChallengeId?: string
    metadata?: Record<string, any>
  }) {
    this.id = props.id
    this.userId = props.userId
    this.badgeId = props.badgeId
    this.earnedAt = props.earnedAt ?? new Date()
    this.relatedChallengeId = props.relatedChallengeId
    this.metadata = props.metadata
  }

  public isRelatedToChallenge(): boolean {
    return this.relatedChallengeId !== undefined
  }

  public hasMetadata(): boolean {
    return this.metadata !== undefined && Object.keys(this.metadata).length > 0
  }
}
