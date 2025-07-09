export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class Challenge {
  public readonly id: string
  public readonly title: string
  public readonly description: string
  public readonly objectives: string[]
  public readonly exerciseTypes: string[]
  public readonly duration: number
  public readonly difficulty: 'beginner' | 'intermediate' | 'advanced'
  public readonly creatorId: string
  public readonly gymId?: string
  public readonly status: ChallengeStatus
  public readonly maxParticipants?: number
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: {
    id: string
    title: string
    description: string
    objectives: string[]
    exerciseTypes: string[]
    duration: number
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    creatorId: string
    gymId?: string
    status?: ChallengeStatus
    maxParticipants?: number
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.objectives = props.objectives
    this.exerciseTypes = props.exerciseTypes
    this.duration = props.duration
    this.difficulty = props.difficulty
    this.creatorId = props.creatorId
    this.gymId = props.gymId
    this.status = props.status ?? ChallengeStatus.ACTIVE
    this.maxParticipants = props.maxParticipants
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  public complete(): Challenge {
    return new Challenge({
      id: this.id,
      title: this.title,
      description: this.description,
      objectives: this.objectives,
      exerciseTypes: this.exerciseTypes,
      duration: this.duration,
      difficulty: this.difficulty,
      creatorId: this.creatorId,
      gymId: this.gymId,
      status: ChallengeStatus.COMPLETED,
      maxParticipants: this.maxParticipants,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  public cancel(): Challenge {
    return new Challenge({
      id: this.id,
      title: this.title,
      description: this.description,
      objectives: this.objectives,
      exerciseTypes: this.exerciseTypes,
      duration: this.duration,
      difficulty: this.difficulty,
      creatorId: this.creatorId,
      gymId: this.gymId,
      status: ChallengeStatus.CANCELLED,
      maxParticipants: this.maxParticipants,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  public isActive(): boolean {
    return this.status === ChallengeStatus.ACTIVE
  }

  public isGymSpecific(): boolean {
    return this.gymId !== undefined
  }
}
