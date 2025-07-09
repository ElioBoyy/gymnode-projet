import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { WorkoutSession } from '../../../domain/entities/challenge_participation.js'

export interface GetWorkoutHistoryRequest {
  userId: string
  page?: number
  limit?: number
}

export interface WorkoutWithChallenge extends WorkoutSession {
  challengeTitle?: string
  participationId: string
}

export interface GetWorkoutHistoryResponse {
  workouts: WorkoutWithChallenge[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class GetWorkoutHistoryUseCase {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private challengeRepository: ChallengeRepository
  ) {}

  async execute(request: GetWorkoutHistoryRequest): Promise<GetWorkoutHistoryResponse> {
    const participations = await this.participationRepository.findByUserId(request.userId)

    const page = request.page || 1
    const limit = request.limit || 20
    const skip = (page - 1) * limit

    const allWorkouts: WorkoutWithChallenge[] = []

    for (const participation of participations) {
      const challenge = await this.challengeRepository.findById(participation.challengeId)

      for (const session of participation.workoutSessions) {
        allWorkouts.push({
          ...session,
          challengeTitle: challenge?.title,
          participationId: participation.id,
        })
      }
    }

    const sortedWorkouts = allWorkouts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const paginatedWorkouts = sortedWorkouts.slice(skip, skip + limit)
    const total = sortedWorkouts.length

    return {
      workouts: paginatedWorkouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
