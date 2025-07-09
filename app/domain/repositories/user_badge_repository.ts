import { UserBadge } from '../entities/user_badge.js'

export interface UserBadgeRepository {
  findById(id: string): Promise<UserBadge | null>
  findByUserId(userId: string): Promise<UserBadge[]>
  findByBadgeId(badgeId: string): Promise<UserBadge[]>
  findByUserAndBadge(userId: string, badgeId: string): Promise<UserBadge | null>
  findByChallengeId(challengeId: string): Promise<UserBadge[]>
  save(userBadge: UserBadge): Promise<void>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}
