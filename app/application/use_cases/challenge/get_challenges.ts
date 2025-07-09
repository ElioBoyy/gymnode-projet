import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'

export interface GetChallengesRequest {
  status?: string
  difficulty?: string
  gymId?: string
  page?: number
  limit?: number
}

export interface ChallengeWithStats {
  id: string
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  creatorId: string
  gymId?: string
  status: string
  maxParticipants?: number
  createdAt: Date
  updatedAt: Date
  participantCount: number
  activeParticipants: number
  completedParticipants: number
}

export interface GetChallengesResponse {
  challenges: ChallengeWithStats[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class GetChallengesUseCase {
  constructor(
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository
  ) {}

  async execute(request: GetChallengesRequest): Promise<GetChallengesResponse> {
    const page = request.page || 1
    const limit = request.limit || 20

    let challenges = await this.challengeRepository.findAll()

    if (request.status) {
      challenges = challenges.filter((challenge) => challenge.status === request.status)
    }

    if (request.difficulty) {
      challenges = challenges.filter((challenge) => challenge.difficulty === request.difficulty)
    }

    if (request.gymId) {
      challenges = challenges.filter((challenge) => challenge.gymId === request.gymId)
    }

    const challengesWithStats = await Promise.all(
      challenges.map(async (challenge) => {
        const participations = await this.participationRepository.findByChallengeId(challenge.id)
        const activeParticipants = participations.filter((p) => p.status === 'active').length
        const completedParticipants = participations.filter((p) => p.status === 'completed').length

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          objectives: challenge.objectives,
          exerciseTypes: challenge.exerciseTypes,
          duration: challenge.duration,
          difficulty: challenge.difficulty,
          creatorId: challenge.creatorId,
          gymId: challenge.gymId,
          status: challenge.status,
          maxParticipants: challenge.maxParticipants,
          createdAt: challenge.createdAt,
          updatedAt: challenge.updatedAt,
          participantCount: participations.length,
          activeParticipants,
          completedParticipants,
        }
      })
    )

    const skip = (page - 1) * limit
    const paginatedChallenges = challengesWithStats.slice(skip, skip + limit)
    const total = challengesWithStats.length

    return {
      challenges: paginatedChallenges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
