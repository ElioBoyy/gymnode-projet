import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { DeactivateUserUseCase } from '../application/use_cases/user/deactivate_user.js'
import { CreateBadgeUseCase } from '../application/use_cases/badge/create_badge.js'
import { CreateExerciseTypeUseCase } from '../application/use_cases/exercise_type/create_exercise_type.js'
import { ApproveGymUseCase } from '../application/use_cases/gym/approve_gym.js'
import { GetPendingGymsUseCase } from '../application/use_cases/gym/get_pending_gyms.js'
import { BadgeRule } from '../domain/entities/badge.js'
import { UserRole } from '../domain/entities/user.js'
import { MongoDBUserRepository } from '../infrastructure/repositories/mongodb_user_repository.js'
import { MongoDBBadgeRepository } from '../infrastructure/repositories/mongodb_badge_repository.js'
import { MongoDBExerciseTypeRepository } from '../infrastructure/repositories/mongodb_exercise_type_repository.js'
import { MongoDBGymRepository } from '../infrastructure/repositories/mongodb_gym_repository.js'
import { MongoDBChallengeRepository } from '../infrastructure/repositories/mongodb_challenge_repository.js'
import { MongoDBChallengeParticipationRepository } from '../infrastructure/repositories/mongodb_challenge_participation_repository.js'
import { ConsoleNotificationService } from '../infrastructure/services/console_notification_service.js'
import { requireAdmin } from '../helpers/auth_helper.js'

export default class AdminController {
  private userRepository = new MongoDBUserRepository()
  private badgeRepository = new MongoDBBadgeRepository()
  private exerciseTypeRepository = new MongoDBExerciseTypeRepository()
  private gymRepository = new MongoDBGymRepository()
  private challengeRepository = new MongoDBChallengeRepository()
  private participationRepository = new MongoDBChallengeParticipationRepository()
  private notificationService = new ConsoleNotificationService()

  private deactivateUserUseCase = new DeactivateUserUseCase(this.userRepository)
  private createBadgeUseCase = new CreateBadgeUseCase(this.badgeRepository, this.userRepository)
  private createExerciseTypeUseCase = new CreateExerciseTypeUseCase(
    this.exerciseTypeRepository,
    this.userRepository
  )
  private approveGymUseCase = new ApproveGymUseCase(
    this.gymRepository,
    this.userRepository,
    this.notificationService
  )
  private getPendingGymsUseCase = new GetPendingGymsUseCase(this.gymRepository, this.userRepository)

  async deactivateUser(ctx: HttpContext) {
    try {
      const user = requireAdmin(ctx)
      const userId = ctx.request.param('id')

      const result = await this.deactivateUserUseCase.execute({
        userId,
        adminId: user.id,
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

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(403).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async createBadge(ctx: HttpContext) {
    try {
      const user = requireAdmin(ctx)
      const createBadgeValidator = vine.compile(
        vine.object({
          name: vine.string(),
          description: vine.string(),
          iconUrl: vine.string().url(),
          rules: vine.array(
            vine.object({
              type: vine.enum(['challenge_completion', 'streak', 'participation', 'custom']),
              condition: vine.string(),
              value: vine.number().min(1),
            })
          ),
        })
      )

      const data = await ctx.request.validateUsing(createBadgeValidator)

      const result = await this.createBadgeUseCase.execute({
        ...data,
        rules: data.rules as BadgeRule[],
        adminId: user.id,
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

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async createExerciseType(ctx: HttpContext) {
    try {
      const user = requireAdmin(ctx)
      const createExerciseTypeValidator = vine.compile(
        vine.object({
          name: vine.string(),
          description: vine.string(),
          targetMuscles: vine.array(vine.string()),
          difficulty: vine.enum(['beginner', 'intermediate', 'advanced']),
        })
      )

      const data = await ctx.request.validateUsing(createExerciseTypeValidator)

      const result = await this.createExerciseTypeUseCase.execute({
        ...data,
        adminId: user.id,
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

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async listUsers(ctx: HttpContext) {
    try {
      const page = Number.parseInt(ctx.request.input('page', '1'))
      const limit = Number.parseInt(ctx.request.input('limit', '20'))
      const role = ctx.request.input('role')
      const isActive = ctx.request.input('isActive')

      let users = await this.userRepository.findAll()

      if (role) {
        users = users.filter((user) => user.role === role)
      }

      if (isActive !== undefined) {
        const activeFilter = isActive === 'true'
        users = users.filter((user) => user.isActive === activeFilter)
      }

      const skip = (page - 1) * limit
      const paginatedUsers = users.slice(skip, skip + limit)

      return ctx.response.json({
        status: 'success',
        data: {
          users: paginatedUsers.map((user) => ({
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })),
          pagination: {
            page,
            limit,
            total: users.length,
            totalPages: Math.ceil(users.length / limit),
          },
        },
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch users',
      })
    }
  }

  async showUser(ctx: HttpContext) {
    try {
      const user = await this.userRepository.findById(ctx.params.id)

      if (!user) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'User not found',
        })
      }

      return ctx.response.json({
        status: 'success',
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch user',
      })
    }
  }

  async activateUser(ctx: HttpContext) {
    try {
      const user = await this.userRepository.findById(ctx.params.id)

      if (!user) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'User not found',
        })
      }

      const activatedUser = user.activate()
      await this.userRepository.update(activatedUser)

      return ctx.response.json({
        status: 'success',
        message: 'User activated successfully',
        data: {
          id: activatedUser.id,
          email: activatedUser.email,
          role: activatedUser.role,
          isActive: activatedUser.isActive,
        },
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      console.error('Activation error:', error)
      return ctx.response.status(500).json({
        status: 'error',
        message: `Failed to activate user: ${error.message}`,
      })
    }
  }

  async pendingGyms(ctx: HttpContext) {
    try {
      const user = requireAdmin(ctx)
      const result = await this.getPendingGymsUseCase.execute({
        adminId: user.id,
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

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(403).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async approveGym(ctx: HttpContext) {
    try {
      const user = requireAdmin(ctx)
      const approveGymValidator = vine.compile(
        vine.object({
          approved: vine.boolean(),
        })
      )

      const data = await ctx.request.validateUsing(approveGymValidator)
      const gymId = ctx.params.id

      const result = await this.approveGymUseCase.execute({
        gymId,
        adminId: user.id,
        approved: data.approved,
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

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async listBadges(ctx: HttpContext) {
    try {
      const page = Number.parseInt(ctx.request.input('page', '1'))
      const limit = Number.parseInt(ctx.request.input('limit', '20'))
      const isActive = ctx.request.input('isActive')

      let badges = await this.badgeRepository.findAll()

      if (isActive !== undefined) {
        const activeFilter = isActive === 'true'
        badges = badges.filter((badge) => badge.isActive === activeFilter)
      }

      const skip = (page - 1) * limit
      const paginatedBadges = badges.slice(skip, skip + limit)

      return ctx.response.json({
        status: 'success',
        data: {
          badges: paginatedBadges,
          pagination: {
            page,
            limit,
            total: badges.length,
            totalPages: Math.ceil(badges.length / limit),
          },
        },
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch badges',
      })
    }
  }

  async updateBadge(ctx: HttpContext) {
    try {
      const badge = await this.badgeRepository.findById(ctx.params.id)

      if (!badge) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'Badge not found',
        })
      }

      const updateBadgeValidator = vine.compile(
        vine.object({
          name: vine.string().optional(),
          description: vine.string().optional(),
          iconUrl: vine.string().url().optional(),
          isActive: vine.boolean().optional(),
          rules: vine
            .array(
              vine.object({
                type: vine.enum(['challenge_completion', 'streak', 'participation', 'custom']),
                condition: vine.string(),
                value: vine.number().min(1),
              })
            )
            .optional(),
        })
      )

      const data = await ctx.request.validateUsing(updateBadgeValidator)

      Object.assign(badge, {
        ...data,
        updatedAt: new Date(),
      })

      await this.badgeRepository.update(badge)

      return ctx.response.json({
        status: 'success',
        data: badge,
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async deleteBadge(ctx: HttpContext) {
    try {
      const badge = await this.badgeRepository.findById(ctx.params.id)

      if (!badge) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'Badge not found',
        })
      }

      await this.badgeRepository.delete(badge.id)

      return ctx.response.json({
        status: 'success',
        message: 'Badge deleted successfully',
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to delete badge',
      })
    }
  }

  async listExerciseTypes(ctx: HttpContext) {
    try {
      const page = Number.parseInt(ctx.request.input('page', '1'))
      const limit = Number.parseInt(ctx.request.input('limit', '20'))
      const difficulty = ctx.request.input('difficulty')

      let exerciseTypes = await this.exerciseTypeRepository.findAll()

      if (difficulty) {
        exerciseTypes = exerciseTypes.filter((et) => et.difficulty === difficulty)
      }

      const skip = (page - 1) * limit
      const paginatedExerciseTypes = exerciseTypes.slice(skip, skip + limit)

      return ctx.response.json({
        status: 'success',
        data: {
          exerciseTypes: paginatedExerciseTypes,
          pagination: {
            page,
            limit,
            total: exerciseTypes.length,
            totalPages: Math.ceil(exerciseTypes.length / limit),
          },
        },
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch exercise types',
      })
    }
  }

  async updateExerciseType(ctx: HttpContext) {
    try {
      const exerciseType = await this.exerciseTypeRepository.findById(ctx.params.id)

      if (!exerciseType) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'Exercise type not found',
        })
      }

      const updateExerciseTypeValidator = vine.compile(
        vine.object({
          name: vine.string().optional(),
          description: vine.string().optional(),
          targetMuscles: vine.array(vine.string()).optional(),
          difficulty: vine.enum(['beginner', 'intermediate', 'advanced']).optional(),
        })
      )

      const data = await ctx.request.validateUsing(updateExerciseTypeValidator)

      Object.assign(exerciseType, {
        ...data,
        updatedAt: new Date(),
      })

      await this.exerciseTypeRepository.update(exerciseType)

      return ctx.response.json({
        status: 'success',
        data: exerciseType,
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async deleteExerciseType(ctx: HttpContext) {
    try {
      const exerciseType = await this.exerciseTypeRepository.findById(ctx.params.id)

      if (!exerciseType) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'Exercise type not found',
        })
      }

      await this.exerciseTypeRepository.delete(exerciseType.id)

      return ctx.response.json({
        status: 'success',
        message: 'Exercise type deleted successfully',
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to delete exercise type',
      })
    }
  }

  async getStats(ctx: HttpContext) {
    try {
      const users = await this.userRepository.findAll()
      const gyms = await this.gymRepository.findAll()
      const badges = await this.badgeRepository.findAll()
      const challenges = await this.challengeRepository.findAll()
      const exerciseTypes = await this.exerciseTypeRepository.findAll()

      const allParticipations = []
      for (const challenge of challenges) {
        const participations = await this.participationRepository.findByChallengeId(challenge.id)
        allParticipations.push(...participations)
      }

      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      const monthlyUsers = users.filter((u) => {
        const createdDate = new Date(u.createdAt)
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
      })

      const monthlyGyms = gyms.filter((gym) => {
        const createdDate = new Date(gym.createdAt)
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
      })

      const monthlyWorkouts = allParticipations
        .flatMap((p) => p.workoutSessions)
        .filter((session) => {
          const sessionDate = new Date(session.date)
          return (
            sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear
          )
        })

      return ctx.response.json({
        status: 'success',
        data: {
          overview: {
            totalUsers: users.length,
            activeUsers: users.filter((u) => u.isActive).length,
            totalGyms: gyms.length,
            approvedGyms: gyms.filter((g) => g.status === 'approved').length,
            pendingGyms: gyms.filter((g) => g.status === 'pending').length,
            totalChallenges: challenges.length,
            activeChallenges: challenges.filter((c) => c.status === 'active').length,
            totalBadges: badges.length,
            activeBadges: badges.filter((b) => b.isActive).length,
            totalExerciseTypes: exerciseTypes.length,
          },
          usersByRole: {
            superAdmins: users.filter((u) => u.role === UserRole.SUPER_ADMIN).length,
            gymOwners: users.filter((u) => u.role === UserRole.GYM_OWNER).length,
            clients: users.filter((u) => u.role === UserRole.CLIENT).length,
          },
          monthlyStats: {
            newUsers: monthlyUsers.length,
            newGyms: monthlyGyms.length,
            workoutSessions: monthlyWorkouts.length,
            totalCalories: monthlyWorkouts.reduce((sum, s) => sum + s.caloriesBurned, 0),
            totalDuration: monthlyWorkouts.reduce((sum, s) => sum + s.duration, 0),
          },
          participationStats: {
            totalParticipations: allParticipations.length,
            activeParticipations: allParticipations.filter((p) => p.status === 'active').length,
            completedParticipations: allParticipations.filter((p) => p.status === 'completed')
              .length,
            totalWorkouts: allParticipations.reduce((sum, p) => sum + p.workoutSessions.length, 0),
          },
        },
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authorization token required',
        })
      }

      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Admin access required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch statistics',
      })
    }
  }
}
