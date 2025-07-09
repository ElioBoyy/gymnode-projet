import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import {
  ParticipationStatus,
  WorkoutSession,
} from '../../../domain/entities/challenge_participation.js'

export interface GetParticipationByIdRequest {
  participationId: string
  userId: string
}

export interface ParticipationDetails {
  id: string
  challengeId: string
  challengeTitle: string
  challengeDescription: string
  challengeDifficulty: string
  status: ParticipationStatus
  progress: number
  joinedAt: Date
  completedAt?: Date
  workoutSessions: WorkoutSession[]
  totalCalories: number
  totalDuration: number
  updatedAt: Date
}

export interface GetParticipationByIdResponse {
  participation: ParticipationDetails
}

export class GetParticipationByIdUseCase {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private challengeRepository: ChallengeRepository
  ) {}

  async execute(request: GetParticipationByIdRequest): Promise<GetParticipationByIdResponse> {
    const participation = await this.participationRepository.findById(request.participationId)

    if (!participation) {
      throw new Error('Participation not found')
    }

    if (participation.userId !== request.userId) {
      throw new Error('Not authorized to view this participation')
    }

    const challenge = await this.challengeRepository.findById(participation.challengeId)

    if (!challenge) {
      throw new Error('Associated challenge not found')
    }

    const totalCalories = participation.workoutSessions.reduce(
      (sum, session) => sum + session.caloriesBurned,
      0
    )
    const totalDuration = participation.workoutSessions.reduce(
      (sum, session) => sum + session.duration,
      0
    )

    const participationDetails: ParticipationDetails = {
      id: participation.id,
      challengeId: participation.challengeId,
      challengeTitle: challenge.title,
      challengeDescription: challenge.description,
      challengeDifficulty: challenge.difficulty,
      status: participation.status,
      progress: participation.getProgress(),
      joinedAt: participation.joinedAt,
      completedAt: participation.completedAt,
      workoutSessions: participation.workoutSessions,
      totalCalories,
      totalDuration,
      updatedAt: participation.updatedAt,
    }

    return {
      participation: participationDetails,
    }
  }
}
