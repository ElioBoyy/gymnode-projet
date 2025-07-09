import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ParticipationStatus } from '../../../domain/entities/challenge_participation.js'

export interface GetUserParticipationsRequest {
  userId: string
  status?: ParticipationStatus
  page?: number
  limit?: number
}

export interface ParticipationSummary {
  id: string
  challengeId: string
  challengeTitle: string
  challengeDifficulty: string
  status: ParticipationStatus
  progress: number
  joinedAt: Date
  completedAt?: Date
  workoutSessions: number
  totalCalories: number
  totalDuration: number
}

export interface GetUserParticipationsResponse {
  participations: ParticipationSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class GetUserParticipationsUseCase {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private challengeRepository: ChallengeRepository
  ) {}

  async execute(request: GetUserParticipationsRequest): Promise<GetUserParticipationsResponse> {
    let participations = await this.participationRepository.findByUserId(request.userId)

    if (request.status) {
      participations = participations.filter((p) => p.status === request.status)
    }

    const participationsWithDetails = await Promise.all(
      participations.map(async (participation) => {
        const challenge = await this.challengeRepository.findById(participation.challengeId)

        const totalCalories = participation.workoutSessions.reduce(
          (sum, session) => sum + session.caloriesBurned,
          0
        )
        const totalDuration = participation.workoutSessions.reduce(
          (sum, session) => sum + session.duration,
          0
        )

        return {
          id: participation.id,
          challengeId: participation.challengeId,
          challengeTitle: challenge?.title || 'Unknown Challenge',
          challengeDifficulty: challenge?.difficulty || 'unknown',
          status: participation.status,
          progress: participation.getProgress(),
          joinedAt: participation.joinedAt,
          completedAt: participation.completedAt,
          workoutSessions: participation.workoutSessions.length,
          totalCalories,
          totalDuration,
        }
      })
    )

    participationsWithDetails.sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime())

    const page = request.page || 1
    const limit = request.limit || 20
    const skip = (page - 1) * limit
    const paginatedParticipations = participationsWithDetails.slice(skip, skip + limit)
    const total = participationsWithDetails.length

    return {
      participations: paginatedParticipations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
