import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'

export interface GetGymStatsRequest {
  ownerId: string
}

export interface GymStatsResponse {
  gym: {
    id: string
    name: string
    status: string
    capacity: number
  }
  challenges: {
    total: number
    active: number
    completed: number
  }
  participants: {
    total: number
    active: number
    completed: number
  }
  monthlyStats: {
    newParticipants: number
    workoutSessions: number
    totalCalories: number
    totalDuration: number
  }
}

export class GetGymStatsUseCase {
  constructor(
    private gymRepository: GymRepository,
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository
  ) {}

  async execute(request: GetGymStatsRequest): Promise<GymStatsResponse> {
    const gyms = await this.gymRepository.findByOwnerId(request.ownerId)

    if (!gyms || gyms.length === 0) {
      throw new Error('No gym found for this owner')
    }

    const gym = gyms[0]

    const challenges = await this.challengeRepository.findByCreatorId(request.ownerId)

    const allParticipations = []
    for (const challenge of challenges) {
      const participations = await this.participationRepository.findByChallengeId(challenge.id)
      allParticipations.push(...participations)
    }

    const totalChallenges = challenges.length
    const activeChallenges = challenges.filter((c) => c.status === 'active').length
    const completedChallenges = challenges.filter((c) => c.status === 'completed').length

    const totalParticipants = new Set(allParticipations.map((p) => p.userId)).size
    const activeParticipations = allParticipations.filter((p) => p.status === 'active').length
    const completedParticipations = allParticipations.filter((p) => p.status === 'completed').length

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const monthlyParticipations = allParticipations.filter((p) => {
      const joinDate = new Date(p.joinedAt)
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear
    })

    const monthlyWorkouts = allParticipations
      .flatMap((p) => p.workoutSessions)
      .filter((session) => {
        const sessionDate = new Date(session.date)
        return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear
      })

    return {
      gym: {
        id: gym.id,
        name: gym.name,
        status: gym.status,
        capacity: gym.capacity,
      },
      challenges: {
        total: totalChallenges,
        active: activeChallenges,
        completed: completedChallenges,
      },
      participants: {
        total: totalParticipants,
        active: activeParticipations,
        completed: completedParticipations,
      },
      monthlyStats: {
        newParticipants: monthlyParticipations.length,
        workoutSessions: monthlyWorkouts.length,
        totalCalories: monthlyWorkouts.reduce((sum, s) => sum + s.caloriesBurned, 0),
        totalDuration: monthlyWorkouts.reduce((sum, s) => sum + s.duration, 0),
      },
    }
  }
}
