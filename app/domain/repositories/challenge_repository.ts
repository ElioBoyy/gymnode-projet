import { Challenge, ChallengeStatus } from '../entities/challenge.js'

export interface ChallengeRepository {
  findById(id: string): Promise<Challenge | null>
  findByCreatorId(creatorId: string): Promise<Challenge[]>
  findByGymId(gymId: string): Promise<Challenge[]>
  findByStatus(status: ChallengeStatus): Promise<Challenge[]>
  findByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<Challenge[]>
  findActive(): Promise<Challenge[]>
  findAll(): Promise<Challenge[]>
  save(challenge: Challenge): Promise<void>
  update(challenge: Challenge): Promise<void>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}
