import { ObjectId } from 'mongodb'
import { Challenge } from '../../../domain/entities/challenge.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface CreateChallengeRequest {
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  creatorId: string
  gymId?: string
  maxParticipants?: number
}

export interface CreateChallengeResponse {
  id: string
  title: string
  difficulty: string
  createdAt: Date
}

export class CreateChallengeUseCase {
  constructor(
    private challengeRepository: ChallengeRepository,
    private userRepository: UserRepository,
    private gymRepository: GymRepository
  ) {}

  async execute(request: CreateChallengeRequest): Promise<CreateChallengeResponse> {
    const creator = await this.userRepository.findById(request.creatorId)
    if (!creator) {
      throw new Error('Creator not found')
    }

    if (request.gymId) {
      const gym = await this.gymRepository.findById(request.gymId)
      if (!gym) {
        throw new Error('Gym not found')
      }

      if (!gym.isApproved()) {
        throw new Error('Gym is not approved')
      }

      if (creator.role === UserRole.GYM_OWNER && gym.ownerId !== creator.id) {
        throw new Error('Gym owners can only create challenges for their own gyms')
      }
    }

    const challenge = new Challenge({
      id: new ObjectId().toString(),
      title: request.title,
      description: request.description,
      objectives: request.objectives,
      exerciseTypes: request.exerciseTypes,
      duration: request.duration,
      difficulty: request.difficulty,
      creatorId: request.creatorId,
      gymId: request.gymId,
      maxParticipants: request.maxParticipants,
    })

    await this.challengeRepository.save(challenge)

    return {
      id: challenge.id,
      title: challenge.title,
      difficulty: challenge.difficulty,
      createdAt: challenge.createdAt,
    }
  }
}
