import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'

export interface GetGymChallengesRequest {
  ownerId: string
}

export interface ChallengeWithStats {
  id: string
  title: string
  description: string
  difficulty: string
  duration: number
  status: string
  createdAt: Date
  stats: {
    totalParticipants: number
    activeParticipants: number
    completedParticipants: number
  }
}

export interface GetGymChallengesResponse {
  challenges: ChallengeWithStats[]
}

export class GetGymChallengesUseCase {
  constructor(
    private gymRepository: GymRepository,
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository
  ) {}

  async execute(request: GetGymChallengesRequest): Promise<GetGymChallengesResponse> {
    const gyms = await this.gymRepository.findByOwnerId(request.ownerId)

    if (!gyms || gyms.length === 0) {
      throw new Error('No gym found for this owner')
    }

    const challenges = await this.challengeRepository.findByCreatorId(request.ownerId)

    const challengesWithStats = await Promise.all(
      challenges.map(async (challenge) => {
        const participations = await this.participationRepository.findByChallengeId(challenge.id)
        const activeParticipations = participations.filter((p) => p.status === 'active')
        const completedParticipations = participations.filter((p) => p.status === 'completed')

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          difficulty: challenge.difficulty,
          duration: challenge.duration,
          status: challenge.status,
          createdAt: challenge.createdAt,
          stats: {
            totalParticipants: participations.length,
            activeParticipants: activeParticipations.length,
            completedParticipants: completedParticipations.length,
          },
        }
      })
    )

    return {
      challenges: challengesWithStats,
    }
  }
}
