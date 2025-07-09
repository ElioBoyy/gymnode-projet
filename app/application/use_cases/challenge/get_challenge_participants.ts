import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'

export interface GetChallengeParticipantsRequest {
  challengeId: string
  status?: string
  page?: number
  limit?: number
}

export interface ParticipantDetails {
  userId: string
  userEmail: string
  participationId: string
  status: string
  progress: number
  joinedAt: Date
  completedAt?: Date
  workoutSessions: number
  totalCalories: number
  totalDuration: number
}

export interface GetChallengeParticipantsResponse {
  challenge: {
    id: string
    title: string
    status: string
  }
  participants: ParticipantDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class GetChallengeParticipantsUseCase {
  constructor(
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository,
    private userRepository: UserRepository
  ) {}

  async execute(
    request: GetChallengeParticipantsRequest
  ): Promise<GetChallengeParticipantsResponse> {
    const challenge = await this.challengeRepository.findById(request.challengeId)

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    let participations = await this.participationRepository.findByChallengeId(challenge.id)

    if (request.status) {
      participations = participations.filter((p) => p.status === request.status)
    }

    const participantsWithDetails = await Promise.all(
      participations.map(async (participation) => {
        const user = await this.userRepository.findById(participation.userId)

        const totalCalories = participation.workoutSessions.reduce(
          (sum, session) => sum + session.caloriesBurned,
          0
        )
        const totalDuration = participation.workoutSessions.reduce(
          (sum, session) => sum + session.duration,
          0
        )

        return {
          userId: participation.userId,
          userEmail: user?.email || 'Unknown',
          participationId: participation.id,
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

    participantsWithDetails.sort((a, b) => b.progress - a.progress)

    const page = request.page || 1
    const limit = request.limit || 20
    const skip = (page - 1) * limit
    const paginatedParticipants = participantsWithDetails.slice(skip, skip + limit)
    const total = participantsWithDetails.length

    return {
      challenge: {
        id: challenge.id,
        title: challenge.title,
        status: challenge.status,
      },
      participants: paginatedParticipants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
