import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { WorkoutSession } from '../../../domain/entities/challenge_participation.js'
import { BadgeService } from '../../../domain/services/badge_service.js'

export interface AddWorkoutSessionRequest {
  participationId: string
  duration: number
  caloriesBurned: number
  exercisesCompleted: string[]
  notes?: string
}

export interface AddWorkoutSessionResponse {
  success: boolean
  newProgress: number
  badgesEarned: string[]
}

export class AddWorkoutSessionUseCase {
  constructor(
    private participationRepository: ChallengeParticipationRepository,
    private badgeService: BadgeService
  ) {}

  async execute(request: AddWorkoutSessionRequest): Promise<AddWorkoutSessionResponse> {
    const participation = await this.participationRepository.findById(request.participationId)
    if (!participation) {
      throw new Error('Participation not found')
    }

    if (participation.isCompleted()) {
      throw new Error('Cannot add workout session to completed participation')
    }

    const workoutSession: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'> = {
      date: new Date(),
      duration: request.duration,
      caloriesBurned: request.caloriesBurned,
      exercisesCompleted: request.exercisesCompleted,
      notes: request.notes,
    }

    const updatedParticipation = participation.addWorkoutSession(workoutSession)

    const newProgress = Math.min(participation.progress + (request.duration / 60) * 5, 100)

    const participationWithProgress = updatedParticipation.updateProgress(newProgress)

    await this.participationRepository.update(participationWithProgress)

    const eligibleBadges = await this.badgeService.evaluateBadgeEligibility(
      participation.userId,
      participationWithProgress
    )

    const badgesEarned: string[] = []
    for (const badge of eligibleBadges) {
      await this.badgeService.awardBadge(participation.userId, badge.id)
      badgesEarned.push(badge.name)
    }

    return {
      success: true,
      newProgress,
      badgesEarned,
    }
  }
}
