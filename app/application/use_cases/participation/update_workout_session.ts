import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { WorkoutSession } from '../../../domain/entities/challenge_participation.js'

export interface UpdateWorkoutSessionRequest {
  participationId: string
  sessionId: string
  userId: string
  duration?: number
  caloriesBurned?: number
  exercisesCompleted?: string[]
  notes?: string
}

export interface UpdateWorkoutSessionResponse {
  success: boolean
  session: WorkoutSession
  newProgress: number
}

export class UpdateWorkoutSessionUseCase {
  constructor(private participationRepository: ChallengeParticipationRepository) {}

  async execute(request: UpdateWorkoutSessionRequest): Promise<UpdateWorkoutSessionResponse> {
    const participation = await this.participationRepository.findById(request.participationId)

    if (!participation) {
      throw new Error('Participation not found')
    }

    if (participation.userId !== request.userId) {
      throw new Error('Not authorized to update this workout session')
    }

    if (participation.isCompleted()) {
      throw new Error('Cannot update workout session for completed participation')
    }

    const sessionIndex = participation.workoutSessions.findIndex(
      (session) => session.id === request.sessionId
    )

    if (sessionIndex === -1) {
      throw new Error('Workout session not found')
    }

    const existingSession = participation.workoutSessions[sessionIndex]

    const updatedSession: WorkoutSession = {
      ...existingSession,
      duration: request.duration !== undefined ? request.duration : existingSession.duration,
      caloriesBurned:
        request.caloriesBurned !== undefined
          ? request.caloriesBurned
          : existingSession.caloriesBurned,
      exercisesCompleted: request.exercisesCompleted || existingSession.exercisesCompleted,
      notes: request.notes !== undefined ? request.notes : existingSession.notes,
      updatedAt: new Date(),
    }

    const updatedSessions = [...participation.workoutSessions]
    updatedSessions[sessionIndex] = updatedSession

    const totalDuration = updatedSessions.reduce((sum, session) => sum + session.duration, 0)
    const newProgress = Math.min((totalDuration / 60) * 5, 100)

    const updatedParticipation = participation.updateProgress(newProgress)
    updatedParticipation.workoutSessions = updatedSessions

    await this.participationRepository.update(updatedParticipation)

    return {
      success: true,
      session: updatedSession,
      newProgress,
    }
  }
}
