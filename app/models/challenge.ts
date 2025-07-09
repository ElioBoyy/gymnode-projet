import { ChallengeStatus } from '../domain/entities/challenge.js'
import { MongoDBChallengeRepository } from '../infrastructure/repositories/mongodb_challenge_repository.js'

export default class Challenge {
  declare id: string
  declare title: string
  declare description: string
  declare objectives: string[]
  declare exerciseTypes: string[]
  declare duration: number
  declare difficulty: 'beginner' | 'intermediate' | 'advanced'
  declare creatorId: string
  declare gymId?: string
  declare status: ChallengeStatus
  declare maxParticipants?: number
  declare createdAt: Date
  declare updatedAt: Date

  constructor(data: {
    id: string
    title: string
    description: string
    objectives: string[]
    exerciseTypes: string[]
    duration: number
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    creatorId: string
    gymId?: string
    status: ChallengeStatus
    maxParticipants?: number
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = data.id
    this.title = data.title
    this.description = data.description
    this.objectives = data.objectives
    this.exerciseTypes = data.exerciseTypes
    this.duration = data.duration
    this.difficulty = data.difficulty
    this.creatorId = data.creatorId
    this.gymId = data.gymId
    this.status = data.status
    this.maxParticipants = data.maxParticipants
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  static async find(id: string): Promise<Challenge | null> {
    const repository = new MongoDBChallengeRepository()
    const domainChallenge = await repository.findById(id)

    if (!domainChallenge) {
      return null
    }

    return new Challenge({
      id: domainChallenge.id,
      title: domainChallenge.title,
      description: domainChallenge.description,
      objectives: domainChallenge.objectives,
      exerciseTypes: domainChallenge.exerciseTypes,
      duration: domainChallenge.duration,
      difficulty: domainChallenge.difficulty,
      creatorId: domainChallenge.creatorId,
      gymId: domainChallenge.gymId,
      status: domainChallenge.status,
      maxParticipants: domainChallenge.maxParticipants,
      createdAt: domainChallenge.createdAt,
      updatedAt: domainChallenge.updatedAt,
    })
  }

  static async findBy(field: string, value: any): Promise<Challenge[]> {
    const repository = new MongoDBChallengeRepository()
    let domainChallenges: any[] = []

    if (field === 'creatorId') {
      domainChallenges = await repository.findByCreatorId(value)
    } else if (field === 'gymId') {
      domainChallenges = await repository.findByGymId(value)
    } else if (field === 'status') {
      domainChallenges = await repository.findByStatus(value)
    }

    return domainChallenges.map(
      (domainChallenge) =>
        new Challenge({
          id: domainChallenge.id,
          title: domainChallenge.title,
          description: domainChallenge.description,
          objectives: domainChallenge.objectives,
          exerciseTypes: domainChallenge.exerciseTypes,
          duration: domainChallenge.duration,
          difficulty: domainChallenge.difficulty,
          creatorId: domainChallenge.creatorId,
          gymId: domainChallenge.gymId,
          status: domainChallenge.status,
          maxParticipants: domainChallenge.maxParticipants,
          createdAt: domainChallenge.createdAt,
          updatedAt: domainChallenge.updatedAt,
        })
    )
  }

  static async findActive(): Promise<Challenge[]> {
    return this.findBy('status', ChallengeStatus.ACTIVE)
  }

  static async findByCreatorId(creatorId: string): Promise<Challenge[]> {
    return this.findBy('creatorId', creatorId)
  }

  static async findByGymId(gymId: string): Promise<Challenge[]> {
    return this.findBy('gymId', gymId)
  }

  static async all(): Promise<Challenge[]> {
    const repository = new MongoDBChallengeRepository()
    const domainChallenges = await repository.findAll()

    return domainChallenges.map(
      (domainChallenge) =>
        new Challenge({
          id: domainChallenge.id,
          title: domainChallenge.title,
          description: domainChallenge.description,
          objectives: domainChallenge.objectives,
          exerciseTypes: domainChallenge.exerciseTypes,
          duration: domainChallenge.duration,
          difficulty: domainChallenge.difficulty,
          creatorId: domainChallenge.creatorId,
          gymId: domainChallenge.gymId,
          status: domainChallenge.status,
          maxParticipants: domainChallenge.maxParticipants,
          createdAt: domainChallenge.createdAt,
          updatedAt: domainChallenge.updatedAt,
        })
    )
  }
}
