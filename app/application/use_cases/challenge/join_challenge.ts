import { ObjectId } from 'mongodb'
import { ChallengeParticipation } from '../../../domain/entities/challenge_participation.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface JoinChallengeRequest {
  challengeId: string
  userId: string
}

export interface JoinChallengeResponse {
  participationId: string
  challengeTitle: string
  joinedAt: Date
}

export class JoinChallengeUseCase {
  constructor(
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: JoinChallengeRequest): Promise<JoinChallengeResponse> {
    const user = await this.userRepository.findById(request.userId)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.role !== UserRole.CLIENT) {
      throw new Error('Only clients can join challenges')
    }

    const challenge = await this.challengeRepository.findById(request.challengeId)
    if (!challenge) {
      throw new Error('Challenge not found')
    }

    if (!challenge.isActive()) {
      throw new Error('Challenge is not active')
    }

    const existingParticipation = await this.participationRepository.findByUserAndChallenge(
      request.userId,
      request.challengeId
    )

    if (existingParticipation) {
      throw new Error('User already participating in this challenge')
    }

    if (challenge.maxParticipants) {
      const currentParticipants = await this.participationRepository.findByChallengeId(
        request.challengeId
      )
      if (currentParticipants.length >= challenge.maxParticipants) {
        throw new Error('Challenge is full')
      }
    }

    const participation = new ChallengeParticipation({
      id: new ObjectId().toString(),
      challengeId: request.challengeId,
      userId: request.userId,
    })

    await this.participationRepository.save(participation)

    return {
      participationId: participation.id,
      challengeTitle: challenge.title,
      joinedAt: participation.joinedAt,
    }
  }
}
