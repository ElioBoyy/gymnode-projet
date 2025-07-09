import { ObjectId } from 'mongodb'
import { Badge } from '../../domain/entities/badge.js'
import { ChallengeParticipation } from '../../domain/entities/challenge_participation.js'
import { UserBadge } from '../../domain/entities/user_badge.js'
import { BadgeService } from '../../domain/services/badge_service.js'
import { BadgeRepository } from '../../domain/repositories/badge_repository.js'
import { UserBadgeRepository } from '../../domain/repositories/user_badge_repository.js'
import { ChallengeParticipationRepository } from '../../domain/repositories/challenge_participation_repository.js'
import { NotificationService } from '../../domain/services/notification_service.js'

export class BadgeEvaluationService implements BadgeService {
  constructor(
    private badgeRepository: BadgeRepository,
    private userBadgeRepository: UserBadgeRepository,
    private participationRepository: ChallengeParticipationRepository,
    private notificationService: NotificationService
  ) {}

  async evaluateBadgeEligibility(
    userId: string,
    participation: ChallengeParticipation
  ): Promise<Badge[]> {
    const activeBadges = await this.badgeRepository.findActive()
    const userBadges = await this.userBadgeRepository.findByUserId(userId)
    const userBadgeIds = userBadges.map((ub) => ub.badgeId)
    const eligibleBadges: Badge[] = []

    for (const badge of activeBadges) {
      if (userBadgeIds.includes(badge.id)) {
        continue
      }

      const isEligible = await this.checkBadgeEligibility(badge, userId, participation)
      if (isEligible) {
        eligibleBadges.push(badge)
      }
    }

    return eligibleBadges
  }

  async awardBadge(
    userId: string,
    badgeId: string,
    metadata?: Record<string, any>
  ): Promise<UserBadge> {
    const existingUserBadge = await this.userBadgeRepository.findByUserAndBadge(userId, badgeId)
    if (existingUserBadge) {
      throw new Error('User already has this badge')
    }

    const badge = await this.badgeRepository.findById(badgeId)
    if (!badge) {
      throw new Error('Badge not found')
    }

    const userBadge = new UserBadge({
      id: new ObjectId().toString(),
      userId,
      badgeId,
      metadata,
    })

    await this.userBadgeRepository.save(userBadge)
    await this.notificationService.sendBadgeEarnedNotification(userId, badge.name)

    return userBadge
  }

  async checkUserBadges(userId: string): Promise<UserBadge[]> {
    return this.userBadgeRepository.findByUserId(userId)
  }

  private async checkBadgeEligibility(
    badge: Badge,
    userId: string,
    participation: ChallengeParticipation
  ): Promise<boolean> {
    for (const rule of badge.rules) {
      switch (rule.type) {
        case 'challenge_completion':
          if (participation.isCompleted()) {
            return true
          }
          break
        case 'streak':
          const userParticipations = await this.participationRepository.findByUserId(userId)
          const completedParticipations = userParticipations.filter((p) => p.isCompleted())
          if (completedParticipations.length >= rule.value) {
            return true
          }
          break
        case 'participation':
          const totalParticipations = await this.participationRepository.findByUserId(userId)
          if (totalParticipations.length >= rule.value) {
            return true
          }
          break
        case 'custom':
          return this.evaluateCustomRule(rule, participation)
      }
    }
    return false
  }

  private async evaluateCustomRule(
    rule: any,
    participation: ChallengeParticipation
  ): Promise<boolean> {
    switch (rule.condition) {
      case 'total_calories_burned':
        return participation.getTotalCaloriesBurned() >= rule.value
      case 'total_workout_time':
        return participation.getTotalWorkoutTime() >= rule.value
      default:
        return false
    }
  }
}
