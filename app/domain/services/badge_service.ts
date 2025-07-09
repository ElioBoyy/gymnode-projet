import { Badge } from '../entities/badge.js'
import { ChallengeParticipation } from '../entities/challenge_participation.js'
import { UserBadge } from '../entities/user_badge.js'

export interface BadgeService {
  evaluateBadgeEligibility(userId: string, participation: ChallengeParticipation): Promise<Badge[]>
  awardBadge(userId: string, badgeId: string, metadata?: Record<string, any>): Promise<UserBadge>
  checkUserBadges(userId: string): Promise<UserBadge[]>
}
