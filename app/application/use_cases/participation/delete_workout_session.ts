import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'

export interface DeleteWorkoutSessionRequest {
  participationId: string
  sessionId: string
  userId: string
}

export interface DeleteWorkoutSessionResponse {
  success: boolean
  newProgress: number
  message: string
}

export class DeleteWorkoutSessionUseCase {
  constructor(private participationRepository: ChallengeParticipationRepository) {}

  async execute(request: DeleteWorkoutSessionRequest): Promise<DeleteWorkoutSessionResponse> {
    const participation = await this.participationRepository.findById(request.participationId)

    if (!participation) {
      throw new Error('Participation not found')
    }

    if (participation.userId !== request.userId) {
      throw new Error('Not authorized to delete this workout session')
    }

    if (participation.isCompleted()) {
      throw new Error('Cannot delete workout session from completed participation')
    }

    const sessionIndex = participation.workoutSessions.findIndex(
      (session) => session.id === request.sessionId
    )

    if (sessionIndex === -1) {
      throw new Error('Workout session not found')
    }

    const updatedSessions = participation.workoutSessions.filter(
      (session) => session.id !== request.sessionId
    )

    const totalDuration = updatedSessions.reduce((sum, session) => sum + session.duration, 0)
    const newProgress = Math.min((totalDuration / 60) * 5, 100)

    const updatedParticipation = participation.updateProgress(newProgress)
    updatedParticipation.workoutSessions = updatedSessions

    await this.participationRepository.update(updatedParticipation)

    return {
      success: true,
      newProgress,
      message: 'Workout session deleted successfully',
    }
  }
}
