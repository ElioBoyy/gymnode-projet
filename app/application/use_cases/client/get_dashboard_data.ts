import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserBadgeRepository } from '../../../domain/repositories/user_badge_repository.js'
import { ParticipationStatus } from '../../../domain/entities/challenge_participation.js'

export interface GetDashboardDataRequest {
  userId: string
}

export interface DashboardStats {
  activeChallenges: number
  totalBadges: number
  totalWorkouts: number
  totalCalories: number
  totalDuration: number
}

export interface GetDashboardDataResponse {
  stats: DashboardStats
  activeChallenges: any[]
  recentBadges: any[]
  recentWorkouts: any[]
}

export class GetDashboardDataUseCase {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private userBadgeRepository: UserBadgeRepository
  ) {}

  async execute(request: GetDashboardDataRequest): Promise<GetDashboardDataResponse> {
    // Get user's participations
    const participations = await this.participationRepository.findByUserId(request.userId)
    const activeParticipations = participations.filter(
      (p) => p.status === ParticipationStatus.ACTIVE
    )

    // Get user's badges
    const userBadges = await this.userBadgeRepository.findByUserId(request.userId)

    // Get recent workout sessions
    const recentWorkouts = participations
      .flatMap((p) =>
        p.workoutSessions.map((session) => ({ ...session, challengeId: p.challengeId }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)

    // Calculate total stats
    const totalWorkouts = participations.reduce((sum, p) => sum + p.workoutSessions.length, 0)
    const totalCalories = participations.reduce(
      (sum, p) =>
        sum + p.workoutSessions.reduce((sessionSum, s) => sessionSum + s.caloriesBurned, 0),
      0
    )
    const totalDuration = participations.reduce(
      (sum, p) => sum + p.workoutSessions.reduce((sessionSum, s) => sessionSum + s.duration, 0),
      0
    )

    return {
      stats: {
        activeChallenges: activeParticipations.length,
        totalBadges: userBadges.length,
        totalWorkouts,
        totalCalories,
        totalDuration,
      },
      activeChallenges: activeParticipations.slice(0, 3),
      recentBadges: userBadges.slice(-3),
      recentWorkouts,
    }
  }
}
