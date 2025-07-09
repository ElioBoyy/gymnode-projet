import { ChallengeParticipation, ParticipationStatus } from '../entities/challenge_participation.js'

export interface ChallengeParticipationRepository {
  findById(id: string): Promise<ChallengeParticipation | null>
  findByUserId(userId: string): Promise<ChallengeParticipation[]>
  findByChallengeId(challengeId: string): Promise<ChallengeParticipation[]>
  findByUserAndChallenge(
    userId: string,
    challengeId: string
  ): Promise<ChallengeParticipation | null>
  findByStatus(status: ParticipationStatus): Promise<ChallengeParticipation[]>
  findActiveByUserId(userId: string): Promise<ChallengeParticipation[]>
  findCompletedByUserId(userId: string): Promise<ChallengeParticipation[]>
  getLeaderboard(challengeId: string, limit?: number): Promise<ChallengeParticipation[]>
  save(participation: ChallengeParticipation): Promise<void>
  update(participation: ChallengeParticipation): Promise<void>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}
