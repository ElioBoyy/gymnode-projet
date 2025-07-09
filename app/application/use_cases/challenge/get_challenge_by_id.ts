import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'

export interface GetChallengeByIdRequest {
  challengeId: string
}

export interface ChallengeDetails {
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
  canJoin: boolean
}

export interface GetChallengeByIdResponse {
  challenge: ChallengeDetails
}

export class GetChallengeByIdUseCase {
  constructor(
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository
  ) {}

  async execute(request: GetChallengeByIdRequest): Promise<GetChallengeByIdResponse> {
    const challenge = await this.challengeRepository.findById(request.challengeId)

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    const participations = await this.participationRepository.findByChallengeId(challenge.id)
    const activeParticipants = participations.filter((p) => p.status === 'active').length
    const completedParticipants = participations.filter((p) => p.status === 'completed').length

    const canJoin =
      challenge.isActive() &&
      (!challenge.maxParticipants || participations.length < challenge.maxParticipants)

    const challengeDetails: ChallengeDetails = {
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
      canJoin,
    }

    return {
      challenge: challengeDetails,
    }
  }
}
