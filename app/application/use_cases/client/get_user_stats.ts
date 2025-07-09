import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserBadgeRepository } from '../../../domain/repositories/user_badge_repository.js'
import { ParticipationStatus } from '../../../domain/entities/challenge_participation.js'

export interface GetUserStatsRequest {
  userId: string
}

export interface UserStats {
  challenges: {
    completed: number
    active: number
    total: number
  }
  workouts: {
    total: number
    thisMonth: number
    totalDuration: number
    totalCalories: number
  }
  badges: {
    total: number
    recent: any[]
  }
  monthlyProgress: {
    workouts: number
    calories: number
    duration: number
  }
}

export interface GetUserStatsResponse {
  stats: UserStats
}

export class GetUserStatsUseCase {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private userBadgeRepository: UserBadgeRepository
  ) {}

  async execute(request: GetUserStatsRequest): Promise<GetUserStatsResponse> {
    const participations = await this.participationRepository.findByUserId(request.userId)
    const userBadges = await this.userBadgeRepository.findByUserId(request.userId)

    const completedChallenges = participations.filter(
      (p) => p.status === ParticipationStatus.COMPLETED
    ).length
    const activeChallenges = participations.filter(
      (p) => p.status === ParticipationStatus.ACTIVE
    ).length

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

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const monthlyWorkouts = participations
      .flatMap((p) => p.workoutSessions)
      .filter((session) => {
        const sessionDate = new Date(session.date)
        return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear
      })

    const stats: UserStats = {
      challenges: {
        completed: completedChallenges,
        active: activeChallenges,
        total: participations.length,
      },
      workouts: {
        total: totalWorkouts,
        thisMonth: monthlyWorkouts.length,
        totalDuration,
        totalCalories,
      },
      badges: {
        total: userBadges.length,
        recent: userBadges.slice(-5),
      },
      monthlyProgress: {
        workouts: monthlyWorkouts.length,
        calories: monthlyWorkouts.reduce((sum, s) => sum + s.caloriesBurned, 0),
        duration: monthlyWorkouts.reduce((sum, s) => sum + s.duration, 0),
      },
    }

    return { stats }
  }
}
