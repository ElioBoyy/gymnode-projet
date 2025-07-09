import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { ParticipationStatus } from '../../../domain/entities/challenge_participation.js'

export interface LeaveChallengeRequest {
  userId: string
  challengeId: string
}

export interface LeaveChallengeResponse {
  success: boolean
  message: string
}

export class LeaveChallengeUseCase {
  constructor(private participationRepository: ChallengeParticipationRepository) {}

  async execute(request: LeaveChallengeRequest): Promise<LeaveChallengeResponse> {
    const participation = await this.participationRepository.findByUserAndChallenge(
      request.userId,
      request.challengeId
    )

    if (!participation) {
      throw new Error('Participation not found')
    }

    if (participation.status !== ParticipationStatus.ACTIVE) {
      throw new Error('Can only leave active participations')
    }

    if (participation.workoutSessions.length > 0) {
      const abandonedParticipation = participation.abandon()
      await this.participationRepository.update(abandonedParticipation)
    } else {
      await this.participationRepository.delete(participation.id)
    }

    return {
      success: true,
      message: 'Successfully left the challenge',
    }
  }
}
