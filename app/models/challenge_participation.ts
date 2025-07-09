import { ParticipationStatus, WorkoutSession } from '../domain/entities/challenge_participation.js'
import { MongoDBChallengeParticipationRepository } from '../infrastructure/repositories/mongodb_challenge_participation_repository.js'

export default class ChallengeParticipation {
  declare id: string
  declare challengeId: string
  declare userId: string
  declare status: ParticipationStatus
  declare progress: number
  declare workoutSessions: WorkoutSession[]
  declare joinedAt: Date
  declare completedAt?: Date
  declare updatedAt: Date

  constructor(data: {
    id: string
    challengeId: string
    userId: string
    status: ParticipationStatus
    progress: number
    workoutSessions: WorkoutSession[]
    joinedAt: Date
    completedAt?: Date
    updatedAt: Date
  }) {
    this.id = data.id
    this.challengeId = data.challengeId
    this.userId = data.userId
    this.status = data.status
    this.progress = data.progress
    this.workoutSessions = data.workoutSessions
    this.joinedAt = data.joinedAt
    this.completedAt = data.completedAt
    this.updatedAt = data.updatedAt
  }

  static async find(id: string): Promise<ChallengeParticipation | null> {
    const repository = new MongoDBChallengeParticipationRepository()
    const domainParticipation = await repository.findById(id)

    if (!domainParticipation) {
      return null
    }

    return new ChallengeParticipation({
      id: domainParticipation.id,
      challengeId: domainParticipation.challengeId,
      userId: domainParticipation.userId,
      status: domainParticipation.status,
      progress: domainParticipation.progress,
      workoutSessions: domainParticipation.workoutSessions,
      joinedAt: domainParticipation.joinedAt,
      completedAt: domainParticipation.completedAt,
      updatedAt: domainParticipation.updatedAt,
    })
  }

  static async findBy(field: string, value: any): Promise<ChallengeParticipation[]> {
    const repository = new MongoDBChallengeParticipationRepository()
    let domainParticipations: any[] = []

    if (field === 'userId') {
      domainParticipations = await repository.findByUserId(value)
    } else if (field === 'challengeId') {
      domainParticipations = await repository.findByChallengeId(value)
    }

    return domainParticipations.map(
      (domainParticipation) =>
        new ChallengeParticipation({
          id: domainParticipation.id,
          challengeId: domainParticipation.challengeId,
          userId: domainParticipation.userId,
          status: domainParticipation.status,
          progress: domainParticipation.progress,
          workoutSessions: domainParticipation.workoutSessions,
          joinedAt: domainParticipation.joinedAt,
          completedAt: domainParticipation.completedAt,
          updatedAt: domainParticipation.updatedAt,
        })
    )
  }

  static async findByUserId(userId: string): Promise<ChallengeParticipation[]> {
    return this.findBy('userId', userId)
  }

  static async findByChallengeId(challengeId: string): Promise<ChallengeParticipation[]> {
    return this.findBy('challengeId', challengeId)
  }

  static async findByStatus(status: ParticipationStatus): Promise<ChallengeParticipation[]> {
    const repository = new MongoDBChallengeParticipationRepository()
    const domainParticipations = await repository.findByStatus(status)

    return domainParticipations.map(
      (domainParticipation) =>
        new ChallengeParticipation({
          id: domainParticipation.id,
          challengeId: domainParticipation.challengeId,
          userId: domainParticipation.userId,
          status: domainParticipation.status,
          progress: domainParticipation.progress,
          workoutSessions: domainParticipation.workoutSessions,
          joinedAt: domainParticipation.joinedAt,
          completedAt: domainParticipation.completedAt,
          updatedAt: domainParticipation.updatedAt,
        })
    )
  }

  static async findActiveByUserId(userId: string): Promise<ChallengeParticipation[]> {
    const repository = new MongoDBChallengeParticipationRepository()
    const domainParticipations = await repository.findActiveByUserId(userId)

    return domainParticipations.map(
      (domainParticipation) =>
        new ChallengeParticipation({
          id: domainParticipation.id,
          challengeId: domainParticipation.challengeId,
          userId: domainParticipation.userId,
          status: domainParticipation.status,
          progress: domainParticipation.progress,
          workoutSessions: domainParticipation.workoutSessions,
          joinedAt: domainParticipation.joinedAt,
          completedAt: domainParticipation.completedAt,
          updatedAt: domainParticipation.updatedAt,
        })
    )
  }

  static async findCompletedByUserId(userId: string): Promise<ChallengeParticipation[]> {
    const repository = new MongoDBChallengeParticipationRepository()
    const domainParticipations = await repository.findCompletedByUserId(userId)

    return domainParticipations.map(
      (domainParticipation) =>
        new ChallengeParticipation({
          id: domainParticipation.id,
          challengeId: domainParticipation.challengeId,
          userId: domainParticipation.userId,
          status: domainParticipation.status,
          progress: domainParticipation.progress,
          workoutSessions: domainParticipation.workoutSessions,
          joinedAt: domainParticipation.joinedAt,
          completedAt: domainParticipation.completedAt,
          updatedAt: domainParticipation.updatedAt,
        })
    )
  }

  static async getLeaderboard(
    challengeId: string,
    limit: number = 10
  ): Promise<ChallengeParticipation[]> {
    const repository = new MongoDBChallengeParticipationRepository()
    const domainParticipations = await repository.getLeaderboard(challengeId, limit)

    return domainParticipations.map(
      (domainParticipation) =>
        new ChallengeParticipation({
          id: domainParticipation.id,
          challengeId: domainParticipation.challengeId,
          userId: domainParticipation.userId,
          status: domainParticipation.status,
          progress: domainParticipation.progress,
          workoutSessions: domainParticipation.workoutSessions,
          joinedAt: domainParticipation.joinedAt,
          completedAt: domainParticipation.completedAt,
          updatedAt: domainParticipation.updatedAt,
        })
    )
  }

  getProgress(): number {
    return this.progress
  }

  isCompleted(): boolean {
    return this.status === ParticipationStatus.COMPLETED
  }
}
