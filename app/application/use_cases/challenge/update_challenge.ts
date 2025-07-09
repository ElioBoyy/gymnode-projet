import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { Challenge } from '../../../domain/entities/challenge.js'

export interface UpdateChallengeRequest {
  challengeId: string
  updatedBy: string
  title?: string
  description?: string
  objectives?: string[]
  exerciseTypes?: string[]
  duration?: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  maxParticipants?: number
}

export interface UpdateChallengeResponse {
  success: boolean
  challenge: {
    id: string
    title: string
    description: string
    objectives: string[]
    exerciseTypes: string[]
    duration: number
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    maxParticipants?: number
    updatedAt: Date
  }
}

export class UpdateChallengeUseCase {
  constructor(private challengeRepository: ChallengeRepository) {}

  async execute(request: UpdateChallengeRequest): Promise<UpdateChallengeResponse> {
    const challenge = await this.challengeRepository.findById(request.challengeId)

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    if (challenge.creatorId !== request.updatedBy) {
      throw new Error('Only the creator can update this challenge')
    }

    if (!challenge.isActive()) {
      throw new Error('Cannot update a completed or cancelled challenge')
    }

    const updatedChallenge = new Challenge({
      id: challenge.id,
      title: request.title || challenge.title,
      description: request.description || challenge.description,
      objectives: request.objectives || challenge.objectives,
      exerciseTypes: request.exerciseTypes || challenge.exerciseTypes,
      duration: request.duration || challenge.duration,
      difficulty: request.difficulty || challenge.difficulty,
      creatorId: challenge.creatorId,
      gymId: challenge.gymId,
      status: challenge.status,
      maxParticipants:
        request.maxParticipants !== undefined ? request.maxParticipants : challenge.maxParticipants,
      createdAt: challenge.createdAt,
      updatedAt: new Date(),
    })

    await this.challengeRepository.save(updatedChallenge)

    return {
      success: true,
      challenge: {
        id: updatedChallenge.id,
        title: updatedChallenge.title,
        description: updatedChallenge.description,
        objectives: updatedChallenge.objectives,
        exerciseTypes: updatedChallenge.exerciseTypes,
        duration: updatedChallenge.duration,
        difficulty: updatedChallenge.difficulty,
        maxParticipants: updatedChallenge.maxParticipants,
        updatedAt: updatedChallenge.updatedAt,
      },
    }
  }
}
