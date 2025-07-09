import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { MongoDBGymRepository } from '../infrastructure/repositories/mongodb_gym_repository.js'
import { MongoDBChallengeRepository } from '../infrastructure/repositories/mongodb_challenge_repository.js'
import { MongoDBChallengeParticipationRepository } from '../infrastructure/repositories/mongodb_challenge_participation_repository.js'
import { requireGymOwner } from '../helpers/auth_helper.js'

export default class GymOwnerController {
  private gymRepository = new MongoDBGymRepository()
  private challengeRepository = new MongoDBChallengeRepository()
  private participationRepository = new MongoDBChallengeParticipationRepository()

  async myGym(ctx: HttpContext) {
    try {
      const user = requireGymOwner(ctx)
      const gyms = await this.gymRepository.findByOwnerId(user.id)

      if (!gyms || gyms.length === 0) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'No gym found for this owner',
        })
      }

      const gym = gyms[0]

      return ctx.response.json({
        status: 'success',
        data: {
          id: gym.id,
          name: gym.name,
          address: gym.address,
          contact: gym.contact,
          description: gym.description,
          capacity: gym.capacity,
          equipment: gym.equipment,
          activities: gym.activities,
          status: gym.status,
          createdAt: gym.createdAt,
          updatedAt: gym.updatedAt,
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
          message: 'Gym owner access required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch gym information',
      })
    }
  }

  async updateMyGym(ctx: HttpContext) {
    try {
      const user = requireGymOwner(ctx)
      const ownerId = user.id
      const gyms = await this.gymRepository.findByOwnerId(ownerId)

      if (!gyms || gyms.length === 0) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'No gym found for this owner',
        })
      }

      const gym = gyms[0]

      const updateGymValidator = vine.compile(
        vine.object({
          name: vine.string().optional(),
          address: vine.string().optional(),
          contact: vine.string().optional(),
          description: vine.string().optional(),
          capacity: vine.number().min(1).optional(),
          equipment: vine.array(vine.string()).optional(),
          activities: vine.array(vine.string()).optional(),
        })
      )

      const data = await ctx.request.validateUsing(updateGymValidator)

      Object.assign(gym, {
        ...data,
        updatedAt: new Date(),
      })

      await this.gymRepository.save(gym)

      return ctx.response.json({
        status: 'success',
        data: {
          id: gym.id,
          name: gym.name,
          address: gym.address,
          contact: gym.contact,
          description: gym.description,
          capacity: gym.capacity,
          equipment: gym.equipment,
          activities: gym.activities,
          status: gym.status,
          updatedAt: gym.updatedAt,
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
          message: 'Gym owner access required',
        })
      }

      return ctx.response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async myGymChallenges(ctx: HttpContext) {
    try {
      const user = requireGymOwner(ctx)
      const ownerId = user.id
      const gyms = await this.gymRepository.findByOwnerId(ownerId)

      if (!gyms || gyms.length === 0) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'No gym found for this owner',
        })
      }

      const challenges = await this.challengeRepository.findByCreatorId(ownerId)

      const challengesWithStats = await Promise.all(
        challenges.map(async (challenge) => {
          const participations = await this.participationRepository.findByChallengeId(challenge.id)
          const activeParticipations = participations.filter((p) => p.status === 'active')
          const completedParticipations = participations.filter((p) => p.status === 'completed')

          return {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            difficulty: challenge.difficulty,
            duration: challenge.duration,
            status: challenge.status,
            createdAt: challenge.createdAt,
            stats: {
              totalParticipants: participations.length,
              activeParticipants: activeParticipations.length,
              completedParticipants: completedParticipations.length,
            },
          }
        })
      )

      return ctx.response.json({
        status: 'success',
        data: challengesWithStats,
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
          message: 'Gym owner access required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch gym challenges',
      })
    }
  }

  async getStats(ctx: HttpContext) {
    try {
      const user = requireGymOwner(ctx)
      const ownerId = user.id
      const gyms = await this.gymRepository.findByOwnerId(ownerId)

      if (!gyms || gyms.length === 0) {
        return ctx.response.status(404).json({
          status: 'error',
          message: 'No gym found for this owner',
        })
      }

      const gym = gyms[0]

      const challenges = await this.challengeRepository.findByCreatorId(ownerId)

      const allParticipations = []
      for (const challenge of challenges) {
        const participations = await this.participationRepository.findByChallengeId(challenge.id)
        allParticipations.push(...participations)
      }

      const totalChallenges = challenges.length
      const activeChallenges = challenges.filter((c) => c.status === 'active').length
      const completedChallenges = challenges.filter((c) => c.status === 'completed').length

      const totalParticipants = new Set(allParticipations.map((p) => p.userId)).size
      const activeParticipations = allParticipations.filter((p) => p.status === 'active').length
      const completedParticipations = allParticipations.filter(
        (p) => p.status === 'completed'
      ).length

      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      const monthlyParticipations = allParticipations.filter((p) => {
        const joinDate = new Date(p.joinedAt)
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear
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
          gym: {
            id: gym.id,
            name: gym.name,
            status: gym.status,
            capacity: gym.capacity,
          },
          challenges: {
            total: totalChallenges,
            active: activeChallenges,
            completed: completedChallenges,
          },
          participants: {
            total: totalParticipants,
            active: activeParticipations,
            completed: completedParticipations,
          },
          monthlyStats: {
            newParticipants: monthlyParticipations.length,
            workoutSessions: monthlyWorkouts.length,
            totalCalories: monthlyWorkouts.reduce((sum, s) => sum + s.caloriesBurned, 0),
            totalDuration: monthlyWorkouts.reduce((sum, s) => sum + s.duration, 0),
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
          message: 'Gym owner access required',
        })
      }

      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch gym statistics',
      })
    }
  }
}
