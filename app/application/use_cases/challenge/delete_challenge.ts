import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'

export interface DeleteChallengeRequest {
  challengeId: string
  deletedBy: string
}

export interface DeleteChallengeResponse {
  success: boolean
  message: string
}

export class DeleteChallengeUseCase {
  constructor(
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository
  ) {}

  async execute(request: DeleteChallengeRequest): Promise<DeleteChallengeResponse> {
    const challenge = await this.challengeRepository.findById(request.challengeId)

    if (!challenge) {
      throw new Error('Challenge not found')
    }

    if (challenge.creatorId !== request.deletedBy) {
      throw new Error('Only the creator can delete this challenge')
    }

    const participations = await this.participationRepository.findByChallengeId(challenge.id)
    const activeParticipations = participations.filter((p) => p.status === 'active')

    if (activeParticipations.length > 0) {
      throw new Error('Cannot delete challenge with active participants')
    }

    for (const participation of participations) {
      await this.participationRepository.delete(participation.id)
    }

    await this.challengeRepository.delete(challenge.id)

    return {
      success: true,
      message: 'Challenge deleted successfully',
    }
  }
}
