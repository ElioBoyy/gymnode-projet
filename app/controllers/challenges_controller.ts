import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { CreateChallengeUseCase } from '../application/use_cases/challenge/create_challenge.js'
import { JoinChallengeUseCase } from '../application/use_cases/challenge/join_challenge.js'
import { AddWorkoutSessionUseCase } from '../application/use_cases/challenge/add_workout_session.js'
import { GetChallengeByIdUseCase } from '../application/use_cases/challenge/get_challenge_by_id.js'
import { UpdateChallengeUseCase } from '../application/use_cases/challenge/update_challenge.js'
import { DeleteChallengeUseCase } from '../application/use_cases/challenge/delete_challenge.js'
import { LeaveChallengeUseCase } from '../application/use_cases/challenge/leave_challenge.js'
import { GetChallengeParticipantsUseCase } from '../application/use_cases/challenge/get_challenge_participants.js'
import { MongoDBChallengeRepository } from '../infrastructure/repositories/mongodb_challenge_repository.js'
import { MongoDBChallengeParticipationRepository } from '../infrastructure/repositories/mongodb_challenge_participation_repository.js'
import { MongoDBUserRepository } from '../infrastructure/repositories/mongodb_user_repository.js'
import { MongoDBGymRepository } from '../infrastructure/repositories/mongodb_gym_repository.js'
import { BadgeEvaluationService } from '../infrastructure/services/badge_evaluation_service.js'
import { MongoDBBadgeRepository } from '../infrastructure/repositories/mongodb_badge_repository.js'
import { MongoDBUserBadgeRepository } from '../infrastructure/repositories/mongodb_user_badge_repository.js'
import { ConsoleNotificationService } from '../infrastructure/services/console_notification_service.js'
import { requireAuth } from '../helpers/auth_helper.js'

export default class ChallengesController {
  private challengeRepository = new MongoDBChallengeRepository()
  private participationRepository = new MongoDBChallengeParticipationRepository()
  private userRepository = new MongoDBUserRepository()
  private gymRepository = new MongoDBGymRepository()
  private badgeRepository = new MongoDBBadgeRepository()
  private userBadgeRepository = new MongoDBUserBadgeRepository()
  private notificationService = new ConsoleNotificationService()
  private badgeService = new BadgeEvaluationService(
    this.badgeRepository,
    this.userBadgeRepository,
    this.participationRepository,
    this.notificationService
  )

  private createChallengeUseCase = new CreateChallengeUseCase(
    this.challengeRepository,
    this.userRepository,
    this.gymRepository
  )
  private joinChallengeUseCase = new JoinChallengeUseCase(
    this.challengeRepository,
    this.participationRepository,
    this.userRepository
  )
  private addWorkoutSessionUseCase = new AddWorkoutSessionUseCase(
    this.participationRepository,
    this.badgeService
  )
  private getChallengeByIdUseCase = new GetChallengeByIdUseCase(
    this.challengeRepository,
    this.participationRepository
  )
  private updateChallengeUseCase = new UpdateChallengeUseCase(this.challengeRepository)
  private deleteChallengeUseCase = new DeleteChallengeUseCase(
    this.challengeRepository,
    this.participationRepository
  )
  private leaveChallengeUseCase = new LeaveChallengeUseCase(this.participationRepository)
  private getChallengeParticipantsUseCase = new GetChallengeParticipantsUseCase(
    this.challengeRepository,
    this.participationRepository,
    this.userRepository
  )

  async create(ctx: HttpContext) {
    try {
      const user = requireAuth(ctx)
      const createChallengeValidator = vine.compile(
        vine.object({
          title: vine.string(),
          description: vine.string(),
          objectives: vine.array(vine.string()),
          exerciseTypes: vine.array(vine.string()),
          duration: vine.number().min(1),
          difficulty: vine.enum(['beginner', 'intermediate', 'advanced']),
          gymId: vine.string().optional(),
          maxParticipants: vine.number().min(1).optional(),
        })
      )

      const data = await ctx.request.validateUsing(createChallengeValidator)

      const result = await this.createChallengeUseCase.execute({
        ...data,
        creatorId: user.id,
      })

      return ctx.response.status(201).json({
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

  async join(ctx: HttpContext) {
    try {
      const user = requireAuth(ctx)
      const challengeId = ctx.request.param('id')

      const result = await this.joinChallengeUseCase.execute({
        challengeId,
        userId: user.id,
      })

      return ctx.response.status(201).json({
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
      const participationId = ctx.request.param('participationId')

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

  async index(ctx: HttpContext) {
    try {
      const challenges = await this.challengeRepository.findAll()

      return ctx.response.json({
        status: 'success',
        data: {
          challenges: challenges.map((challenge) => ({
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            difficulty: challenge.difficulty,
            duration: challenge.duration,
            createdAt: challenge.createdAt,
          })),
          pagination: {
            page: 1,
            limit: 20,
            total: challenges.length,
            totalPages: Math.ceil(challenges.length / 20),
          },
        },
      })
    } catch (error) {
      console.error('Error in challenges index:', error)
      return ctx.response.status(500).json({
        status: 'error',
        message: `Failed to fetch challenges: ${error.message}`,
      })
    }
  }

  async show(ctx: HttpContext) {
    try {
      const result = await this.getChallengeByIdUseCase.execute({
        challengeId: ctx.params.id,
      })

      return ctx.response.ok(result)
    } catch (error) {
      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch challenge',
      })
    }
  }

  async update(ctx: HttpContext) {
    try {
      const user = requireAuth(ctx)
      const updateChallengeValidator = vine.compile(
        vine.object({
          title: vine.string().optional(),
          description: vine.string().optional(),
          objectives: vine.array(vine.string()).optional(),
          exerciseTypes: vine.array(vine.string()).optional(),
          duration: vine.number().min(1).optional(),
          difficulty: vine.enum(['beginner', 'intermediate', 'advanced']).optional(),
          maxParticipants: vine.number().min(1).optional(),
        })
      )

      const data = await ctx.request.validateUsing(updateChallengeValidator)

      const result = await this.updateChallengeUseCase.execute({
        challengeId: ctx.params.id,
        updatedBy: user.id,
        ...data,
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

  async delete(ctx: HttpContext) {
    try {
      const user = requireAuth(ctx)
      await this.deleteChallengeUseCase.execute({
        challengeId: ctx.params.id,
        deletedBy: user.id,
      })

      return ctx.response.json({
        status: 'success',
        message: 'Challenge deleted successfully',
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
        message: 'Failed to delete challenge',
      })
    }
  }

  async leave(ctx: HttpContext) {
    try {
      const user = requireAuth(ctx)
      const challengeId = ctx.params.id
      const userId = user.id

      await this.leaveChallengeUseCase.execute({
        challengeId,
        userId,
      })

      return ctx.response.json({
        status: 'success',
        message: 'Successfully left the challenge',
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
        message: 'Failed to leave challenge',
      })
    }
  }

  async participants(ctx: HttpContext) {
    try {
      const challengeId = ctx.params.id
      const result = await this.getChallengeParticipantsUseCase.execute({
        challengeId,
      })

      return ctx.response.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch participants',
      })
    }
  }
}
