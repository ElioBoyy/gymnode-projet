export enum ParticipationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export interface WorkoutSession {
  id: string
  date: Date
  duration: number
  caloriesBurned: number
  exercisesCompleted: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export class ChallengeParticipation {
  public readonly id: string
  public readonly challengeId: string
  public readonly userId: string
  public status: ParticipationStatus
  public progress: number
  public workoutSessions: WorkoutSession[]
  public readonly joinedAt: Date
  public completedAt?: Date
  public updatedAt: Date

  constructor(props: {
    id: string
    challengeId: string
    userId: string
    status?: ParticipationStatus
    progress?: number
    workoutSessions?: WorkoutSession[]
    joinedAt?: Date
    completedAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.challengeId = props.challengeId
    this.userId = props.userId
    this.status = props.status ?? ParticipationStatus.ACTIVE
    this.progress = props.progress ?? 0
    this.workoutSessions = props.workoutSessions ?? []
    this.joinedAt = props.joinedAt ?? new Date()
    this.completedAt = props.completedAt
    this.updatedAt = props.updatedAt ?? new Date()
  }

  public addWorkoutSession(
    sessionData: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>
  ): ChallengeParticipation {
    const session: WorkoutSession = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return new ChallengeParticipation({
      id: this.id,
      challengeId: this.challengeId,
      userId: this.userId,
      status: this.status,
      progress: this.progress,
      workoutSessions: [...this.workoutSessions, session],
      joinedAt: this.joinedAt,
      completedAt: this.completedAt,
      updatedAt: new Date(),
    })
  }

  public updateProgress(progress: number): ChallengeParticipation {
    const newStatus = progress >= 100 ? ParticipationStatus.COMPLETED : this.status
    const completedAt = progress >= 100 ? new Date() : this.completedAt

    return new ChallengeParticipation({
      id: this.id,
      challengeId: this.challengeId,
      userId: this.userId,
      status: newStatus,
      progress,
      workoutSessions: this.workoutSessions,
      joinedAt: this.joinedAt,
      completedAt,
      updatedAt: new Date(),
    })
  }

  public abandon(): ChallengeParticipation {
    return new ChallengeParticipation({
      id: this.id,
      challengeId: this.challengeId,
      userId: this.userId,
      status: ParticipationStatus.ABANDONED,
      progress: this.progress,
      workoutSessions: this.workoutSessions,
      joinedAt: this.joinedAt,
      completedAt: this.completedAt,
      updatedAt: new Date(),
    })
  }

  public getTotalCaloriesBurned(): number {
    return this.workoutSessions.reduce((total, session) => total + session.caloriesBurned, 0)
  }

  public getTotalWorkoutTime(): number {
    return this.workoutSessions.reduce((total, session) => total + session.duration, 0)
  }

  public isCompleted(): boolean {
    return this.status === ParticipationStatus.COMPLETED
  }

  public getProgress(): number {
    return this.progress
  }
}
