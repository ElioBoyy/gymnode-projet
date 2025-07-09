import { HttpContext } from '@adonisjs/core/http'
import { MongoDBChallengeParticipationRepository } from '../infrastructure/repositories/mongodb_challenge_participation_repository.js'
import { MongoDBUserBadgeRepository } from '../infrastructure/repositories/mongodb_user_badge_repository.js'
import { MongoDBBadgeRepository } from '../infrastructure/repositories/mongodb_badge_repository.js'
import { MongoDBChallengeRepository } from '../infrastructure/repositories/mongodb_challenge_repository.js'
import { requireClient } from '../helpers/auth_helper.js'

export default class ClientController {
  private participationRepository = new MongoDBChallengeParticipationRepository()
  private userBadgeRepository = new MongoDBUserBadgeRepository()
  private badgeRepository = new MongoDBBadgeRepository()
  private challengeRepository = new MongoDBChallengeRepository()

  async dashboard(ctx: HttpContext) {
    try {
      const user = requireClient(ctx)
      const userId = user.id

      const participations = await this.participationRepository.findByUserId(userId)
      const activeParticipations = participations.filter((p) => p.status === 'active')

      const userBadges = await this.userBadgeRepository.findByUserId(userId)

      const recentWorkouts = participations
        .flatMap((p) => p.workoutSessions)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)

      const totalWorkouts = participations.reduce((sum, p) => sum + p.workoutSessions.length, 0)
      const totalCalories = participations.reduce(
        (sum, p) =>
          sum + p.workoutSessions.reduce((sessionSum, s) => sessionSum + s.caloriesBurned, 0),
        0
      )
      const totalDuration = participations.reduce(
        (sum, p) => sum + p.workoutSessions.reduce((sessionSum, s) => sessionSum + s.duration, 0),
        0
      )

      return ctx.response.json({
        status: 'success',
        data: {
          stats: {
            activeChallenges: activeParticipations.length,
            totalBadges: userBadges.length,
            totalWorkouts,
            totalCalories,
            totalDuration,
          },
          activeChallenges: activeParticipations.slice(0, 3),
          recentBadges: userBadges.slice(-3),
          recentWorkouts,
        },
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authentication required',
        })
      }
      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Insufficient permissions',
        })
      }
      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch dashboard data',
      })
    }
  }

  async myChallenges(ctx: HttpContext) {
    try {
      const user = requireClient(ctx)
      const userId = user.id
      const participations = await this.participationRepository.findByUserId(userId)

      const challengesWithDetails = await Promise.all(
        participations.map(async (participation) => {
          const challenge = await this.challengeRepository.findById(participation.challengeId)
          return {
            participation: {
              id: participation.id,
              status: participation.status,
              joinedAt: participation.joinedAt,
              completedAt: participation.completedAt,
              progress: participation.getProgress(),
            },
            challenge: challenge
              ? {
                  id: challenge.id,
                  title: challenge.title,
                  description: challenge.description,
                  difficulty: challenge.difficulty,
                  duration: challenge.duration,
                }
              : null,
          }
        })
      )

      return ctx.response.json({
        status: 'success',
        data: challengesWithDetails,
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authentication required',
        })
      }
      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Insufficient permissions',
        })
      }
      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch user challenges',
      })
    }
  }

  async myBadges(ctx: HttpContext) {
    try {
      const user = requireClient(ctx)
      const userId = user.id
      const userBadges = await this.userBadgeRepository.findByUserId(userId)

      const badgesWithDetails = await Promise.all(
        userBadges.map(async (userBadge) => {
          const badge = await this.badgeRepository.findById(userBadge.badgeId)
          return {
            id: badge?.id,
            name: badge?.name,
            description: badge?.description,
            iconUrl: badge?.iconUrl,
            earnedAt: userBadge.earnedAt,
            metadata: userBadge.metadata,
          }
        })
      )

      return ctx.response.json({
        status: 'success',
        data: badgesWithDetails,
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authentication required',
        })
      }
      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Insufficient permissions',
        })
      }
      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch user badges',
      })
    }
  }

  async getStats(ctx: HttpContext) {
    try {
      const user = requireClient(ctx)
      const userId = user.id
      const participations = await this.participationRepository.findByUserId(userId)
      const userBadges = await this.userBadgeRepository.findByUserId(userId)

      const completedChallenges = participations.filter((p) => p.status === 'completed').length
      const activeChallenges = participations.filter((p) => p.status === 'active').length

      const totalWorkouts = participations.reduce((sum, p) => sum + p.workoutSessions.length, 0)
      const totalCalories = participations.reduce(
        (sum, p) =>
          sum + p.workoutSessions.reduce((sessionSum, s) => sessionSum + s.caloriesBurned, 0),
        0
      )
      const totalDuration = participations.reduce(
        (sum, p) => sum + p.workoutSessions.reduce((sessionSum, s) => sessionSum + s.duration, 0),
        0
      )

      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      const monthlyWorkouts = participations
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
          challenges: {
            completed: completedChallenges,
            active: activeChallenges,
            total: participations.length,
          },
          workouts: {
            total: totalWorkouts,
            thisMonth: monthlyWorkouts.length,
            totalDuration,
            totalCalories,
          },
          badges: {
            total: userBadges.length,
            recent: userBadges.slice(-5),
          },
          monthlyProgress: {
            workouts: monthlyWorkouts.length,
            calories: monthlyWorkouts.reduce((sum, s) => sum + s.caloriesBurned, 0),
            duration: monthlyWorkouts.reduce((sum, s) => sum + s.duration, 0),
          },
        },
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authentication required',
        })
      }
      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Insufficient permissions',
        })
      }
      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch user stats',
      })
    }
  }

  async workoutHistory(ctx: HttpContext) {
    try {
      const user = requireClient(ctx)
      const userId = user.id
      const participations = await this.participationRepository.findByUserId(userId)

      const page = Number.parseInt(ctx.request.input('page', '1'))
      const limit = Number.parseInt(ctx.request.input('limit', '20'))
      const skip = (page - 1) * limit

      const allWorkouts = []
      for (const participation of participations) {
        const challenge = await this.challengeRepository.findById(participation.challengeId)
        for (const session of participation.workoutSessions) {
          allWorkouts.push({
            ...session,
            challengeTitle: challenge?.title,
            participationId: participation.id,
          })
        }
      }

      const sortedWorkouts = allWorkouts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      const paginatedWorkouts = sortedWorkouts.slice(skip, skip + limit)
      const total = sortedWorkouts.length

      return ctx.response.json({
        status: 'success',
        data: {
          workouts: paginatedWorkouts,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      })
    } catch (error) {
      if (error.message === 'Authentication required') {
        return ctx.response.status(401).json({
          status: 'error',
          message: 'Authentication required',
        })
      }
      if (error.message === 'Insufficient permissions') {
        return ctx.response.status(403).json({
          status: 'error',
          message: 'Insufficient permissions',
        })
      }
      return ctx.response.status(500).json({
        status: 'error',
        message: 'Failed to fetch workout history',
      })
    }
  }
}
