import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { MongoDBChallengeParticipationRepository } from '../infrastructure/repositories/mongodb_challenge_participation_repository.js'
import { AddWorkoutSessionUseCase } from '../application/use_cases/challenge/add_workout_session.js'
import { BadgeEvaluationService } from '../infrastructure/services/badge_evaluation_service.js'
import { MongoDBBadgeRepository } from '../infrastructure/repositories/mongodb_badge_repository.js'
import { MongoDBUserBadgeRepository } from '../infrastructure/repositories/mongodb_user_badge_repository.js'
import { ConsoleNotificationService } from '../infrastructure/services/console_notification_service.js'
import { inject } from '@adonisjs/core'
import { requireAuth } from '../helpers/auth_helper.js'

@inject()
export default class ParticipationsController {
  private participationRepository = new MongoDBChallengeParticipationRepository()
  private badgeRepository = new MongoDBBadgeRepository()
  private userBadgeRepository = new MongoDBUserBadgeRepository()
  private notificationService = new ConsoleNotificationService()
  private badgeService = new BadgeEvaluationService(
    this.badgeRepository,
    this.userBadgeRepository,
    this.participationRepository,
    this.notificationService
  )
  private addWorkoutSessionUseCase = new AddWorkoutSessionUseCase(
    this.participationRepository,
    this.badgeService
  )

  async index(ctx: HttpContext) {
    try {
      const user = requireAuth(ctx)
      const participations = await this.participationRepository.findByUserId(user.id)

      return ctx.response.json({
        status: 'success',
        data: participations.map((participation) => ({
          id: participation.id,
          challengeId: participation.challengeId,
          userId: participation.userId,
          status: participation.status,
          joinedAt: participation.joinedAt,
          completedAt: participation.completedAt,
          workoutSessions: participation.workoutSessions,
        })),
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      console.error('Error in participations index:', error)
      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch participations',
      })
    }
  }

  async show(ctx: HttpContext) {
    try {
      const user = requireAuth(ctx)
      const participation = await this.participationRepository.findById(ctx.params.id)

      if (!participation) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'Participation not found',
        })
      }

      if (participation.userId !== user.id) {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Access denied',
        })
      }

      return ctx.response.json({
        status: 'success',
        data: {
          id: participation.id,
          challengeId: participation.challengeId,
          userId: participation.userId,
          status: participation.status,
          joinedAt: participation.joinedAt,
          completedAt: participation.completedAt,
          workoutSessions: participation.workoutSessions,
        },
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch participation',
      })
    }
  }

  async addWorkoutSession(ctx: HttpContext) {
    try {
      const addWorkoutValidator = vine.compile(
        vine.object({
          duration: vine.number().min(1),
          caloriesBurned: vine.number().min(0),
          exercisesCompleted: vine.array(vine.string()),
          notes: vine.string().optional(),
        })
      )

      const data = await ctx.request.validateUsing(addWorkoutValidator)
      const participationId = ctx.params.id

      const result = await this.addWorkoutSessionUseCase.execute({
        ...data,
        participationId,
      })

      return ctx.response.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      return ctx.response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async getWorkoutSessions(ctx: HttpContext) {
    try {
      const user = requireAuth(ctx)
      const participation = await this.participationRepository.findById(ctx.params.id)

      if (!participation) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'Participation not found',
        })
      }

      if (participation.userId !== user.id) {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Access denied',
        })
      }

      return ctx.response.json({
        status: 'success',
        data: participation.workoutSessions,
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch workout sessions',
      })
    }
  }

  async updateWorkoutSession(ctx: HttpContext) {
    try {
      const user = requireAuth(ctx)
      const participation = await this.participationRepository.findById(ctx.params.id)

      if (!participation) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'Participation not found',
        })
      }

      if (participation.userId !== user.id) {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Access denied',
        })
      }

      const sessionId = ctx.params.sessionId
      const updateData = ctx.request.only([
        'duration',
        'caloriesBurned',
        'exercisesCompleted',
        'notes',
      ])

      const sessionIndex = participation.workoutSessions.findIndex(
        (session) => session.id === sessionId
      )

      if (sessionIndex === -1) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'Workout session not found',
        })
      }

      const existingSession = participation.workoutSessions[sessionIndex]
      participation.workoutSessions[sessionIndex] = {
        ...existingSession,
        ...updateData,
        updatedAt: new Date(),
      }

      await this.participationRepository.save(participation)

      return ctx.response.json({
        status: 'success',
        data: participation.workoutSessions[sessionIndex],
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to update workout session',
      })
    }
  }

  async deleteWorkoutSession(ctx: HttpContext) {
    try {
      const user = requireAuth(ctx)
      const participation = await this.participationRepository.findById(ctx.params.id)

      if (!participation) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'Participation not found',
        })
      }

      if (participation.userId !== user.id) {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Access denied',
        })
      }

      const sessionId = ctx.params.sessionId

      const sessionIndex = participation.workoutSessions.findIndex(
        (session) => session.id === sessionId
      )

      if (sessionIndex === -1) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'Workout session not found',
        })
      }

      participation.workoutSessions.splice(sessionIndex, 1)
      await this.participationRepository.save(participation)

      return ctx.response.json({
        status: 'success',
        message: 'Workout session deleted successfully',
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to delete workout session',
      })
    }
  }
}
